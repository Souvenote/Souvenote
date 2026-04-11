-- Referral System Tables
-- Reference SQL schema. TypeORM will manage the actual schema via entities.

-- Referral Profiles: one per user, tracks their referral code and stats
CREATE TABLE IF NOT EXISTS referral_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(16) UNIQUE NOT NULL,
    total_referrals INTEGER DEFAULT 0,
    total_rewards_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referral_profiles_code ON referral_profiles(referral_code);

-- Referral Invites: tracks each email invite sent by a referrer
CREATE TABLE IF NOT EXISTS referral_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitee_email VARCHAR(255) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'verified')),
    source_location VARCHAR(255),
    invite_token VARCHAR(255) UNIQUE NOT NULL,
    sendgrid_message_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referral_invites_referrer ON referral_invites(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_invites_token ON referral_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_referral_invites_email ON referral_invites(invitee_email);

-- Referral Rewards: tracks credits awarded per verified referral
CREATE TABLE IF NOT EXISTS referral_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referral_invite_id UUID NOT NULL REFERENCES referral_invites(id) ON DELETE CASCADE,
    image_credits_awarded INTEGER DEFAULT 0,
    song_credits_awarded INTEGER DEFAULT 0,
    status VARCHAR(16) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'used')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_user ON referral_rewards(user_id);

-- Referral Events: funnel tracking
CREATE TABLE IF NOT EXISTS referral_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL,
    source_location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referral_events_user ON referral_events(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_type ON referral_events(event_type);
