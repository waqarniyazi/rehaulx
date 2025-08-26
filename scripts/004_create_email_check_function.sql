-- Create a function to check if an email exists in auth.users table
-- This is needed because we can't directly query auth.users from the client
CREATE OR REPLACE FUNCTION check_email_exists(email_input text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = auth
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE email = email_input
  );
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION check_email_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_email_exists(text) TO anon;
