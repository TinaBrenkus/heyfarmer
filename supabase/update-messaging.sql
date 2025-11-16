-- Update existing messaging tables with missing columns and functions

-- Add last_message column to conversations if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'last_message'
  ) THEN
    ALTER TABLE conversations ADD COLUMN last_message TEXT;
  END IF;
END $$;

-- Add unread_count column to conversation_participants if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_participants' AND column_name = 'unread_count'
  ) THEN
    ALTER TABLE conversation_participants ADD COLUMN unread_count INTEGER DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Update the trigger function to handle last_message and unread counts
CREATE OR REPLACE FUNCTION update_conversation_on_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation with new message content and timestamp
  UPDATE conversations
  SET
    updated_at = now(),
    last_message_at = now(),
    last_message = NEW.content
  WHERE id = NEW.conversation_id;

  -- Increment unread count for all participants except the sender
  UPDATE conversation_participants
  SET unread_count = unread_count + 1
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_new_message();

-- Update get_or_create_conversation function with proper parameter names
CREATE OR REPLACE FUNCTION get_or_create_conversation(p_user1_id UUID, p_user2_id UUID)
RETURNS UUID AS $$
DECLARE
  conv_id UUID;
BEGIN
  -- Try to find existing conversation between these two users
  SELECT cp1.conversation_id INTO conv_id
  FROM conversation_participants cp1
  INNER JOIN conversation_participants cp2
    ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = p_user1_id
    AND cp2.user_id = p_user2_id
    AND cp1.user_id != cp2.user_id
  LIMIT 1;

  -- If no conversation exists, create one
  IF conv_id IS NULL THEN
    INSERT INTO conversations DEFAULT VALUES
    RETURNING id INTO conv_id;

    -- Add both users as participants
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES
      (conv_id, p_user1_id),
      (conv_id, p_user2_id);
  END IF;

  RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the mark_messages_as_read function
CREATE OR REPLACE FUNCTION mark_messages_as_read(p_conversation_id UUID, p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Reset unread count for this user in this conversation
  UPDATE conversation_participants
  SET
    unread_count = 0,
    last_read_at = now()
  WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id;

  -- Mark all messages in this conversation as read (except those sent by this user)
  UPDATE messages
  SET read = true
  WHERE conversation_id = p_conversation_id
    AND sender_id != p_user_id
    AND read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
