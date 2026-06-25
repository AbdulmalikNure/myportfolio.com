const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../services/tokenService');
const logger = require('../utils/logger');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info(`Login attempt for email: ${email}`);
    logger.debug(`Password length: ${password ? password.length : 0}`);

    const result = await query(
      'SELECT id, name, email, password, role, is_active, avatar FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    const user = result.rows[0];

    if (!user || !user.is_active) {
      logger.warn(`User not found or inactive: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    logger.info(`Password match result: ${isMatch}`);
    if (!isMatch) {
      logger.warn(`Password mismatch for user: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token hash in DB
    await query('UPDATE users SET refresh_token = $1, last_login = NOW() WHERE id = $2', [refreshToken, user.id]);

    res.cookie('refresh_token', refreshToken, COOKIE_OPTS);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      },
    });
  } catch (err) {
    logger.error('Login error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refresh_token || req.body?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'Refresh token required' });

    const decoded = verifyRefreshToken(token);

    const result = await query(
      'SELECT id, name, email, role, is_active, refresh_token FROM users WHERE id = $1',
      [decoded.id]
    );
    const user = result.rows[0];

    if (!user || user.refresh_token !== token || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const accessToken      = generateAccessToken(user);
    const newRefreshToken  = generateRefreshToken(user);

    await query('UPDATE users SET refresh_token = $1 WHERE id = $2', [newRefreshToken, user.id]);
    res.cookie('refresh_token', newRefreshToken, COOKIE_OPTS);

    return res.json({ success: true, data: { accessToken } });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    if (req.user) {
      await query('UPDATE users SET refresh_token = NULL WHERE id = $1', [req.user.id]);
    }
    res.clearCookie('refresh_token');
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, avatar, last_login, two_fa_enabled, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password = $1, refresh_token = NULL WHERE id = $2', [hashed, req.user.id]);
    res.clearCookie('refresh_token');

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    logger.error('Change password error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { login, refreshToken, logout, getMe, changePassword };
