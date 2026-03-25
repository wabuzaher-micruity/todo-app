-- Returns all members of a list: owner + collaborators, each with email and role.
-- Includes share_id for collaborators so the client can update/remove without a second query.
DROP FUNCTION IF EXISTS get_list_members(UUID);
CREATE OR REPLACE FUNCTION get_list_members(p_list_id UUID)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  role TEXT,
  share_id UUID
) AS $$
BEGIN
  IF NOT has_list_access(p_list_id, auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Owner first
  RETURN QUERY
  SELECT tl.owner_id, u.email::TEXT, 'owner'::TEXT, NULL::UUID
  FROM todo_lists tl
  JOIN auth.users u ON u.id = tl.owner_id
  WHERE tl.id = p_list_id;

  -- Then collaborators (excluding owner in case they also appear in list_shares)
  RETURN QUERY
  SELECT ls.shared_with, u.email::TEXT, ls.role::TEXT, ls.id
  FROM list_shares ls
  JOIN auth.users u ON u.id = ls.shared_with
  WHERE ls.list_id = p_list_id
    AND ls.shared_with != (SELECT owner_id FROM todo_lists WHERE id = p_list_id)
  ORDER BY ls.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
