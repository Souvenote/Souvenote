-- User Events: personal calendar events with reminder support
CREATE TABLE IF NOT EXISTS user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  reminder_offset_days INTEGER NOT NULL DEFAULT 7,
  reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Contacts: contacts submitted via referral landing page
CREATE TABLE IF NOT EXISTS user_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  birthday DATE,
  mailing_address TEXT,
  referral_token VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_reminder ON user_events(reminder_sent, event_date);
CREATE INDEX IF NOT EXISTS idx_user_contacts_owner ON user_contacts(owner_user_id);
