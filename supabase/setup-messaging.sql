-- Messaging Feature Database Schema
-- Creates tables for conversations and messages with RLS policies

-- 1. Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_message TEXT
);

-- 2. Conversation participants table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  unread_count INTEGER DEFAULT 0 NOT NULL,
  UNIQUE(conversation_id, user_id)
);

-- 3. Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  read BOOLEAN DEFAULT false NOT NULL,
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
-- Users can view conversations they're a participant in
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = auth.uid()
    )
  );

-- Users can create conversations
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (true);

-- Users can update conversations they're part of
CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = auth.uid()
    )
  );

-- RLS Policies for conversation_participants
-- Users can view participants in their conversations
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp2
      WHERE cp2.conversation_id = conversation_participants.conversation_id
      AND cp2.user_id = auth.uid()
    )
  );

-- Users can add themselves as participants
CREATE POLICY "Users can join conversations"
  ON conversation_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own participant records
CREATE POLICY "Users can update their participant status"
  ON conversation_participants FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for messages
-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
      AND conversation_participants.user_id = auth.uid()
    )
  );

-- Users can send messages to their conversations
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
      AND conversation_participants.user_id = auth.uid()
    )
  );

-- Users can update their own messages (for read status)
CREATE POLICY "Users can update message status"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
      AND conversation_participants.user_id = auth.uid()
    )
  );

-- Function to update conversation's last_message_at timestamp and unread counts
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

-- Trigger to update conversation timestamp when a new message is created
DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_new_message();

-- Function to get or create a conversation between two users
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

-- Function to mark messages as read
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
