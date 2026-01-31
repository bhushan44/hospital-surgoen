-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    user_id UUID NOT NULL,
    booking_updates_push BOOLEAN DEFAULT true,
    booking_updates_email BOOLEAN DEFAULT true,
    payment_push BOOLEAN DEFAULT true,
    reminders_push BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id 
    ON notification_preferences USING btree (user_id ASC NULLS LAST);

-- Add foreign key constraint
ALTER TABLE notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

-- Add unique constraint on user_id (one preference record per user)
ALTER TABLE notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_key
    UNIQUE (user_id);







































