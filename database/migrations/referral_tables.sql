-- Referral Profiles: one per user, holds their unique referral token
CREATE TABLE IF NOT EXISTS referral_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE,
  referral_token VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Referral Invites: each invite sent by a referrer
CREATE TABLE IF NOT EXISTS referral_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_token VARCHAR(255) NOT NULL REFERENCES referral_profiles(referral_token) ON DELETE CASCADE,
  invitee_email VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Referral Rewards: credits granted when a referral is verified
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id VARCHAR(255) NOT NULL,
  invite_id UUID NOT NULL REFERENCES referral_invites(id) ON DELETE CASCADE,
  image_credits_granted INTEGER NOT NULL DEFAULT 0,
  song_credits_granted INTEGER NOT NULL DEFAULT 0,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Referral Events: audit log
CREATE TABLE IF NOT EXISTS referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_token VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_profiles_user_id ON referral_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_invites_token ON referral_invites(referral_token);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer ON referral_rewards(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_token ON referral_events(referral_token);
