-- Migration: Add DELETE policy for members
-- This allows staff with delete permission to remove members

-- Create DELETE policy for members
CREATE POLICY "Staff with permission can delete members"
ON members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM staff s
    JOIN role_permissions rp ON rp.role = s.role
    WHERE s.user_id = auth.uid()
    AND s.organization_id = members.organization_id
    AND s.is_active = TRUE
    AND rp.can_delete_members = TRUE
  )
);

-- Also add DELETE policies for check_ins and payments (needed to delete member's related records)
CREATE POLICY "Staff can delete check-ins"
ON check_ins
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM staff s
    WHERE s.user_id = auth.uid()
    AND s.organization_id = check_ins.organization_id
    AND s.is_active = TRUE
    AND s.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Staff can delete payments"
ON payments
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM staff s
    WHERE s.user_id = auth.uid()
    AND s.organization_id = payments.organization_id
    AND s.is_active = TRUE
    AND s.role IN ('owner', 'admin', 'treasurer')
  )
);
