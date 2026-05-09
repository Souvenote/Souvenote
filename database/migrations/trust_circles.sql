-- Trust Circles tables
-- Column names match TypeORM camelCase convention (synchronize: true manages schema)

CREATE TABLE IF NOT EXISTS trust_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "ownerUserId" UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trust_circle_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "circleId" UUID NOT NULL REFERENCES trust_circles(id) ON DELETE CASCADE,
  "userId" UUID,
  "invitedEmail" VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trust_circles_owner ON trust_circles("ownerUserId");
CREATE INDEX IF NOT EXISTS idx_trust_circle_members_circle ON trust_circle_members("circleId");
CREATE INDEX IF NOT EXISTS idx_trust_circle_members_user ON trust_circle_members("userId");
