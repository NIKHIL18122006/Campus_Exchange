CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE email_otps (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  otp_hash   TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts   INT NOT NULL DEFAULT 0,
  used       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_otps_user_created
  ON email_otps (user_id, created_at DESC);

CREATE TYPE listing_condition AS ENUM ('new', 'like_new', 'used', 'heavily_used');
CREATE TYPE listing_status    AS ENUM ('available', 'sold');
CREATE TYPE listing_category  AS ENUM
  ('books', 'electronics', 'furniture', 'stationery', 'cycles', 'other');

CREATE TABLE listings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(120) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price       INTEGER NOT NULL CHECK (price >= 0),
  negotiable  BOOLEAN NOT NULL DEFAULT FALSE,
  category    listing_category NOT NULL,
  condition   listing_condition NOT NULL,
  status      listing_status NOT NULL DEFAULT 'available',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE listing_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  position   SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_listings_status_created ON listings (status, created_at DESC);
CREATE INDEX idx_listing_images_listing ON listing_images (listing_id, position);