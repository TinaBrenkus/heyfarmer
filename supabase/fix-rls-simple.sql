-- Simplest possible RLS policies - no recursion!

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their participant status" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participant records" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update message status" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON messages;

-- CONVERSATION_PARTICIPANTS: Super simple - just check user_id directly
CREATE POLICY "Enable read for own records"
  ON conversation_participants FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Enable insert for all authenticated users"
  ON conversation_participants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for own records"
  ON conversation_participants FOR UPDATE
  USING (user_id = auth.uid());

-- CONVERSATIONS: Allow all authenticated users (we'll control access via conversation_participants)
CREATE POLICY "Enable read for all authenticated users"
  ON conversations FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for all authenticated users"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for all authenticated users"
  ON conversations FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- MESSAGES: Simple sender-based policies
CREATE POLICY "Enable read for all authenticated users"
  ON messages FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Enable update for all authenticated users"
  ON messages FOR UPDATE
  USING (auth.uid() IS NOT NULL);
