-- Simplest fix: Just let authenticated users read all conversation_participants
-- We already have "Enable read for own records", now delete it and replace with a broader one

DROP POLICY IF EXISTS "Enable read for own records" ON conversation_participants;

CREATE POLICY "Enable read for all authenticated users"
  ON conversation_participants FOR SELECT
  USING (auth.uid() IS NOT NULL);
