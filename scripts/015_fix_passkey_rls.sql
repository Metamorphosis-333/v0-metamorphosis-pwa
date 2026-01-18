-- Add policy to allow anonymous challenge creation for registration
CREATE POLICY "Allow anonymous challenge creation" 
  ON webauthn_challenges FOR INSERT 
  WITH CHECK (true);

-- Add policy to allow reading challenges by email (for verification)
CREATE POLICY "Allow reading challenges"
  ON webauthn_challenges FOR SELECT
  USING (true);

-- Add policy to allow deletion of challenges
CREATE POLICY "Allow deleting challenges"
  ON webauthn_challenges FOR DELETE
  USING (true);
