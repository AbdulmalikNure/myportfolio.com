require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // --- Admin User ---
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@portfolio.com';
    const adminPass  = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const adminName  = process.env.ADMIN_NAME || 'Abdulmalik Nure Jemal';
    const hashed     = await bcrypt.hash(adminPass, 12);

    await client.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, 'super_admin')
      ON CONFLICT (email) DO NOTHING
    `, [adminName, adminEmail, hashed]);
    logger.info(`Admin user seeded: ${adminEmail}`);

    // --- Settings ---
    const existing = await client.query('SELECT id FROM settings LIMIT 1');
    if (existing.rowCount === 0) {
      await client.query(`
        INSERT INTO settings (
          site_name, footer_text, seo_title, seo_desc, meta_keywords,
          hero_title, hero_subtitle, hero_desc, hero_cta_text, hero_professions,
          about_bio, about_age, about_location, about_years_exp, about_projects_count,
          email, phone
        ) VALUES (
          'Abdulmalik Portfolio',
          '© 2026 Abdulmalik Nure Jemal. All Rights Reserved.',
          'Abdulmalik Nure Jemal - Portfolio | Graphic Designer, Video Editor, Web Developer',
          'Professional portfolio of Abdulmalik Nure Jemal - Expert in Graphic Design, Video Editing, and Website Development.',
          'graphic design, video editing, web development, portfolio, Ethiopia',
          'Abdulmalik Nure Jemal',
          'Website Dev',
          'Passionate about creating exceptional digital experiences through design and code',
          'View My Work',
          ARRAY['Graphic Designer','Video Editor','Website Developer'],
          'My name is Abdulmalik Nure Jemal. I was born in East Arsi Zone, Robe Woreda in 1994. I am passionate about creating exceptional digital experiences through design and code.',
          32,
          'East Arsi Zone, Ethiopia',
          3,
          7,
          'nureabdulmalik8@gmail.com',
          '+251973409026'
        )
      `);
      logger.info('Settings seeded');
    }

    // --- Social Links ---
    const socialLinks = [
      { platform: 'telegram',  url: 'https://t.me/Abdulmalik_nure',          icon: 'Send',    order: 1 },
      { platform: 'youtube',   url: 'https://www.youtube.com/@AbdulmalikNure', icon: 'Youtube', order: 2 },
      { platform: 'github',    url: 'https://github.com/AbdulmalikNure',      icon: 'Github',  order: 3 },
      { platform: 'linkedin',  url: 'https://linkedin.com',                   icon: 'Linkedin',order: 4 },
    ];
    for (const link of socialLinks) {
      await client.query(`
        INSERT INTO social_links (platform, url, icon, display_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (platform) DO UPDATE SET url = EXCLUDED.url
      `, [link.platform, link.url, link.icon, link.order]);
    }
    logger.info('Social links seeded');

    // --- Skills ---
    const skills = [
      { name: 'Graphic Design',      category: 'core',     percentage: null, icon: 'Palette', color_from: 'from-pink-500',   color_to: 'to-rose-500',   order: 1 },
      { name: 'Video Editing',       category: 'core',     percentage: null, icon: 'Video',   color_from: 'from-purple-500', color_to: 'to-indigo-500', order: 2 },
      { name: 'Website Development', category: 'core',     percentage: null, icon: 'Code',    color_from: 'from-cyan-500',   color_to: 'to-blue-500',   order: 3 },
      { name: 'HTML',                category: 'frontend', percentage: 85,   icon: null,      color_from: null,              color_to: null,            order: 1 },
      { name: 'CSS',                 category: 'frontend', percentage: 80,   icon: null,      color_from: null,              color_to: null,            order: 2 },
      { name: 'JavaScript',          category: 'frontend', percentage: 70,   icon: null,      color_from: null,              color_to: null,            order: 3 },
      { name: 'Node.js',             category: 'backend',  percentage: 65,   icon: null,      color_from: null,              color_to: null,            order: 1 },
      { name: 'Express.js',          category: 'backend',  percentage: 70,   icon: null,      color_from: null,              color_to: null,            order: 2 },
      { name: 'React',               category: 'backend',  percentage: 65,   icon: null,      color_from: null,              color_to: null,            order: 3 },
      { name: 'Angular',             category: 'backend',  percentage: 70,   icon: null,      color_from: null,              color_to: null,            order: 4 },
    ];
    for (const s of skills) {
      await client.query(`
        INSERT INTO skills (name, category, percentage, icon, color_from, color_to, display_order)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT DO NOTHING
      `, [s.name, s.category, s.percentage, s.icon, s.color_from, s.color_to, s.order]);
    }
    logger.info('Skills seeded');

    // --- Services ---
    const services = [
      {
        title: 'Graphic Design',
        description: 'Creating logos, brand identities, social media graphics, and print materials that are visually stunning and communicate effectively.',
        icon: 'Palette',
        gradient: 'from-pink-500 to-rose-500',
        order: 1,
      },
      {
        title: 'Video Editing',
        description: 'Crafting engaging and dynamic video content, including commercials, social media clips, and promotional videos, with smooth transitions and effects.',
        icon: 'Video',
        gradient: 'from-purple-500 to-indigo-500',
        order: 2,
      },
      {
        title: 'Website Development',
        description: 'Building responsive, fast, and user-friendly websites and web applications using modern frontend and backend technologies.',
        icon: 'Globe',
        gradient: 'from-cyan-500 to-blue-500',
        order: 3,
      },
    ];
    for (const svc of services) {
      await client.query(`
        INSERT INTO services (title, description, icon, gradient, display_order)
        VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT DO NOTHING
      `, [svc.title, svc.description, svc.icon, svc.gradient, svc.order]);
    }
    logger.info('Services seeded');

    // --- Education ---
    await client.query(`
      INSERT INTO education (institution, degree, department, start_date, end_date, description, display_order)
      VALUES
        ('Habe Elementary School','Elementary','Grade 1-8','2002-09-01','2009-07-01','Completed elementary education',1),
        ('Habe Secondary School','Secondary','Grade 9-10','2009-09-01','2011-07-01','High school education',2),
        ('Robe Didea School','Preparatory','Grade 11-12','2012-09-01','2013-07-01','Preparatory school',3),
        ('Haramaya University','Bachelor''s Degree','Information Systems','2014-09-01','2023-07-01','Graduated with a degree in Information Systems',4)
      ON CONFLICT DO NOTHING
    `);
    logger.info('Education seeded');

    // --- Certificates ---
    await client.query(`
      INSERT INTO certificates (name, organization, issue_date, display_order)
      VALUES
        ('Programming Fundamentals','Udacity','2022-01-01',1),
        ('Full Stack (MERN)','Haramaya University','2023-06-01',2),
        ('Graphics Design','Amen Creative','2021-12-01',3),
        ('AI Fundamentals','Udacity','2023-01-01',4),
        ('Cursor Hackathon East Ethiopia 2026','Cursor','2026-01-01',5)
      ON CONFLICT DO NOTHING
    `);
    logger.info('Certificates seeded');

    await client.query('COMMIT');
    logger.info('✅ Database seeded successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
