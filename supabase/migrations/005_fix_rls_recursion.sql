-- ============================================
-- 005: Fix infinite recursion in RLS policies
--
-- The todo_lists SELECT policy queries list_shares,
-- and the list_shares SELECT policy queries todo_lists,
-- causing infinite recursion. Fix by using SECURITY DEFINER
-- functions that bypass RLS for the cross-table checks.
-- ============================================

-- Helper: check if user has a share on a list (bypasses RLS on list_shares)
CREATE OR REPLACE FUNCTION is_shared_with_user(p_list_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM list_shares WHERE list_id = p_list_id AND shared_with = p_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if user owns a list (bypasses RLS on todo_lists)
CREATE OR REPLACE FUNCTION is_list_owner(p_list_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM todo_lists WHERE id = p_list_id AND owner_id = p_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Fix todo_lists SELECT: use SECURITY DEFINER function for list_shares check
DROP POLICY "select_own_or_shared" ON todo_lists;
CREATE POLICY "select_own_or_shared" ON todo_lists FOR SELECT USING (
  owner_id = auth.uid() OR
  is_shared_with_user(id, auth.uid())
);

-- Fix list_shares SELECT: use SECURITY DEFINER function for todo_lists check
DROP POLICY "select_own_shares" ON list_shares;
CREATE POLICY "select_own_shares" ON list_shares FOR SELECT USING (
  shared_with = auth.uid() OR
  is_list_owner(list_id, auth.uid())
);

-- Fix list_shares INSERT/UPDATE/DELETE: same issue with inline todo_lists queries
DROP POLICY "manage_as_owner" ON list_shares;
CREATE POLICY "manage_as_owner" ON list_shares FOR INSERT WITH CHECK (
  is_list_owner(list_id, auth.uid())
);

DROP POLICY "update_as_owner" ON list_shares;
CREATE POLICY "update_as_owner" ON list_shares FOR UPDATE USING (
  is_list_owner(list_id, auth.uid())
);

DROP POLICY "delete_as_owner_or_self" ON list_shares;
CREATE POLICY "delete_as_owner_or_self" ON list_shares FOR DELETE USING (
  shared_with = auth.uid() OR
  is_list_owner(list_id, auth.uid())
);

-- Fix share_invites: same pattern, uses inline todo_lists queries
DROP POLICY "select_own_invites" ON share_invites;
CREATE POLICY "select_own_invites" ON share_invites FOR SELECT USING (
  is_list_owner(list_id, auth.uid())
);

DROP POLICY "create_as_owner" ON share_invites;
CREATE POLICY "create_as_owner" ON share_invites FOR INSERT WITH CHECK (
  is_list_owner(list_id, auth.uid())
);

DROP POLICY "delete_as_owner" ON share_invites;
CREATE POLICY "delete_as_owner" ON share_invites FOR DELETE USING (
  is_list_owner(list_id, auth.uid())
);
