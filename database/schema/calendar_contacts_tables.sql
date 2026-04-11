-- Calendar and Contacts Tables
-- Reference SQL schema. TypeORM will manage the actual schema via entities.

-- User Contacts: address book for each user
CREATE TABLE IF NOT EXISTS user_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_birthday DATE,
    mailing_address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_contacts_owner ON user_contacts(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_user_contacts_email ON user_contacts(contact_email);

-- User Events: calendar events (personal or circle-based)
CREATE TABLE IF NOT EXISTS user_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    circle_id UUID,                          -- null = personal event
    occasion_person_id UUID,                 -- the person this event is FOR (linked to user_contacts.id)
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    reminder_offset_days INTEGER DEFAULT 7,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_events_user ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_date ON user_events(event_date);
CREATE INDEX IF NOT EXISTS idx_user_events_reminder ON user_events(reminder_sent, event_date);
