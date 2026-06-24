-- ============================================================
-- CV Documents Table Migration
-- Run this after the main schema to add CV management support
-- ============================================================

CREATE TABLE IF NOT EXISTS cv_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_name   VARCHAR(200)  NOT NULL,
  document_type   VARCHAR(50)   NOT NULL CHECK (document_type IN ('design_1_cv','design_2_cv','complete_professional_portfolio')),
  description     TEXT,
  file_name       VARCHAR(255)  NOT NULL,
  file_path       VARCHAR(500)  NOT NULL,
  file_size       BIGINT,
  mime_type       VARCHAR(100),
  uploaded_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  status          VARCHAR(20)   NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  view_count      INT           NOT NULL DEFAULT 0,
  download_count  INT           NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Only one active document per type
CREATE UNIQUE INDEX IF NOT EXISTS idx_cv_documents_type_active
  ON cv_documents(document_type)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_cv_documents_type   ON cv_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_cv_documents_status ON cv_documents(status);

-- Extend analytics to cover cv_view and portfolio_view events
ALTER TABLE analytics
  DROP CONSTRAINT IF EXISTS analytics_event_type_check;

ALTER TABLE analytics
  ADD CONSTRAINT analytics_event_type_check
  CHECK (event_type IN ('page_view','contact_submit','project_view','cv_download','cv_view','portfolio_download','portfolio_view'));

-- Add cv_document_id FK to analytics for per-document tracking
ALTER TABLE analytics
  ADD COLUMN IF NOT EXISTS cv_document_id UUID REFERENCES cv_documents(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_cv_doc ON analytics(cv_document_id);

-- Trigger
DROP TRIGGER IF EXISTS update_cv_documents_updated_at ON cv_documents;
CREATE TRIGGER update_cv_documents_updated_at
  BEFORE UPDATE ON cv_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
