-- ============================================================
-- Portfolio Database Schema
-- PostgreSQL - Normalized, Indexed, Production-Ready
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- USERS / ADMIN
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(150)  NOT NULL,
  email        VARCHAR(255)  NOT NULL UNIQUE,
  password     VARCHAR(255)  NOT NULL,
  role         VARCHAR(20)   NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','super_admin')),
  avatar       VARCHAR(500),
  is_active    BOOLEAN       NOT NULL DEFAULT TRUE,
  two_fa_enabled BOOLEAN     NOT NULL DEFAULT FALSE,
  two_fa_secret  VARCHAR(255),
  refresh_token  TEXT,
  last_login   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
-- SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id           SERIAL PRIMARY KEY,
  site_name    VARCHAR(150)  NOT NULL DEFAULT 'Abdulmalik Portfolio',
  site_logo    VARCHAR(500),
  favicon      VARCHAR(500),
  footer_text  TEXT          DEFAULT '© 2026 All Rights Reserved',
  seo_title    VARCHAR(200),
  seo_desc     TEXT,
  meta_keywords TEXT,
  hero_title   VARCHAR(200)  DEFAULT 'Abdulmalik Nure Jemal',
  hero_subtitle VARCHAR(200) DEFAULT 'Website Dev',
  hero_desc    TEXT          DEFAULT 'Passionate about creating exceptional digital experiences through design and code',
  hero_image   VARCHAR(500),
  hero_cta_text VARCHAR(100) DEFAULT 'View My Work',
  hero_professions TEXT[]    DEFAULT ARRAY['Graphic Designer','Video Editor','Website Developer'],
  about_bio    TEXT,
  about_image  VARCHAR(500),
  about_age    INT,
  about_location VARCHAR(200),
  about_years_exp INT        DEFAULT 3,
  about_projects_count INT   DEFAULT 7,
  cv_url       VARCHAR(500),
  phone        VARCHAR(50),
  email        VARCHAR(255)  DEFAULT 'nureabdulmalik8@gmail.com',
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SOCIAL LINKS
-- ============================================================
CREATE TABLE IF NOT EXISTS social_links (
  id           SERIAL PRIMARY KEY,
  platform     VARCHAR(50)   NOT NULL UNIQUE,
  url          VARCHAR(500)  NOT NULL,
  icon         VARCHAR(100),
  is_visible   BOOLEAN       NOT NULL DEFAULT TRUE,
  display_order INT          NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SKILLS
-- ============================================================
CREATE TABLE IF NOT EXISTS skills (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100)  NOT NULL,
  category      VARCHAR(50)   NOT NULL DEFAULT 'technical' CHECK (category IN ('core','frontend','backend','tool','other')),
  percentage    INT           CHECK (percentage BETWEEN 0 AND 100),
  icon          VARCHAR(100),
  color_from    VARCHAR(50),
  color_to      VARCHAR(50),
  display_order INT           NOT NULL DEFAULT 0,
  is_visible    BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);

-- ============================================================
-- SERVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         VARCHAR(150)  NOT NULL,
  description   TEXT          NOT NULL,
  icon          VARCHAR(100),
  gradient      VARCHAR(100),
  display_order INT           NOT NULL DEFAULT 0,
  is_visible    BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(200)  NOT NULL,
  category        VARCHAR(100),
  description     TEXT,
  technologies    TEXT[]        DEFAULT '{}',
  github_url      VARCHAR(500),
  live_url        VARCHAR(500),
  thumbnail       VARCHAR(500),
  screenshots     TEXT[]        DEFAULT '{}',
  is_featured     BOOLEAN       NOT NULL DEFAULT FALSE,
  status          VARCHAR(30)   NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','in_progress','planned')),
  completion_date DATE,
  view_count      INT           NOT NULL DEFAULT 0,
  display_order   INT           NOT NULL DEFAULT 0,
  is_visible      BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_category    ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_projects_status      ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_name_trgm   ON projects USING gin(name gin_trgm_ops);

-- ============================================================
-- EDUCATION
-- ============================================================
CREATE TABLE IF NOT EXISTS education (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution   VARCHAR(200)  NOT NULL,
  degree        VARCHAR(200),
  department    VARCHAR(200),
  start_date    DATE,
  end_date      DATE,
  description   TEXT,
  display_order INT           NOT NULL DEFAULT 0,
  is_visible    BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EXPERIENCE
-- ============================================================
CREATE TABLE IF NOT EXISTS experience (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company       VARCHAR(200)  NOT NULL,
  position      VARCHAR(200)  NOT NULL,
  start_date    DATE,
  end_date      DATE,
  is_current    BOOLEAN       NOT NULL DEFAULT FALSE,
  description   TEXT,
  display_order INT           NOT NULL DEFAULT 0,
  is_visible    BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CERTIFICATES
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              VARCHAR(200)  NOT NULL,
  organization      VARCHAR(200),
  issue_date        DATE,
  verification_url  VARCHAR(500),
  image             VARCHAR(500),
  display_order     INT           NOT NULL DEFAULT 0,
  is_visible        BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GALLERY
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         VARCHAR(200),
  file_url      VARCHAR(500)  NOT NULL,
  file_type     VARCHAR(10)   NOT NULL DEFAULT 'image' CHECK (file_type IN ('image','video')),
  category      VARCHAR(100),
  description   TEXT,
  display_order INT           NOT NULL DEFAULT 0,
  is_visible    BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_category  ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_gallery_file_type ON gallery(file_type);

-- ============================================================
-- BLOG POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         VARCHAR(300)  NOT NULL,
  slug          VARCHAR(350)  NOT NULL UNIQUE,
  cover_image   VARCHAR(500),
  content       TEXT,
  excerpt       TEXT,
  tags          TEXT[]        DEFAULT '{}',
  category      VARCHAR(100),
  is_published  BOOLEAN       NOT NULL DEFAULT FALSE,
  published_at  TIMESTAMPTZ,
  view_count    INT           NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_slug     ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(is_published);

-- ============================================================
-- TESTIMONIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(150)  NOT NULL,
  position      VARCHAR(150),
  company       VARCHAR(150),
  photo         VARCHAR(500),
  rating        INT           NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  review        TEXT          NOT NULL,
  is_visible    BOOLEAN       NOT NULL DEFAULT TRUE,
  display_order INT           NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MESSAGES (Contact Form)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name     VARCHAR(150)  NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  phone         VARCHAR(50),
  subject       VARCHAR(300),
  message       TEXT          NOT NULL,
  is_read       BOOLEAN       NOT NULL DEFAULT FALSE,
  is_replied    BOOLEAN       NOT NULL DEFAULT FALSE,
  replied_at    TIMESTAMPTZ,
  ip_address    VARCHAR(50),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_email    ON messages(email);
CREATE INDEX IF NOT EXISTS idx_messages_is_read  ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created  ON messages(created_at DESC);

-- ============================================================
-- RESUMES
-- ============================================================
CREATE TABLE IF NOT EXISTS resumes (
  id          SERIAL PRIMARY KEY,
  file_url    VARCHAR(500)  NOT NULL,
  file_name   VARCHAR(255),
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  uploaded_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ANALYTICS
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics (
  id            BIGSERIAL PRIMARY KEY,
  event_type    VARCHAR(50)   NOT NULL CHECK (event_type IN ('page_view','contact_submit','project_view','cv_download')),
  page          VARCHAR(300),
  project_id    UUID REFERENCES projects(id) ON DELETE SET NULL,
  ip_address    VARCHAR(50),
  user_agent    TEXT,
  referrer      VARCHAR(500),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_event   ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_date    ON analytics(DATE(created_at));

-- ============================================================
-- UPDATE TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all relevant tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','settings','social_links','skills','services','projects','education','experience','certificates','gallery','blog_posts','testimonials']
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
       CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      t, t, t, t
    );
  END LOOP;
END;
$$;
