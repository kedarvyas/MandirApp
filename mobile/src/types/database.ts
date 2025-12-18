/**
 * Database Types
 *
 * These types mirror the Supabase database schema.
 * Update these when the schema changes.
 */

// Member status enum
export type MemberStatus =
  | 'pending_invite'       // Created by front desk, SMS sent, not registered
  | 'pending_registration' // Phone verified, profile incomplete
  | 'active'               // Fully registered with QR code
  | 'inactive';            // Membership expired or deactivated

// Relationship types
export type RelationshipType =
  | 'self'
  | 'spouse'
  | 'child'
  | 'parent'
  | 'in_law'
  | 'sibling'
  | 'other';

// Payment methods
export type PaymentMethod = 'check' | 'cash' | 'card' | 'other';

// Staff roles
export type StaffRole = 'admin' | 'staff';

// ============================================
// Database Table Types
// ============================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  settings: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface FamilyGroup {
  id: string;
  organization_id: string;
  prime_member_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  organization_id: string;
  family_group_id: string | null;
  phone: string | null;
  email: string | null;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  is_prime_member: boolean;
  is_independent: boolean;
  relationship_to_prime: RelationshipType;
  qr_token: string | null;
  status: MemberStatus;
  membership_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  organization_id: string;
  family_group_id: string;
  member_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  recorded_by: string;
  notes: string | null;
  created_at: string;
}

export interface CheckIn {
  id: string;
  organization_id: string;
  member_id: string;
  checked_in_by: string;
  checked_in_at: string;
  notes: string | null;
}

export interface Staff {
  id: string;
  organization_id: string;
  user_id: string;
  name: string;
  email: string;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Extended Types (with relations)
// ============================================

export interface MemberWithFamily extends Member {
  family_group: FamilyGroup | null;
  family_members?: Member[];
}

export interface FamilyGroupWithMembers extends FamilyGroup {
  members: Member[];
  prime_member: Member | null;
}

export interface CheckInWithMember extends CheckIn {
  member: Member;
}

// ============================================
// Form/Input Types
// ============================================

export interface NewMemberInput {
  first_name: string;
  last_name: string;
  phone: string;
}

export interface ProfileUpdateInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  photo_url?: string;
}

export interface AddFamilyMemberInput {
  first_name: string;
  last_name: string;
  phone?: string;           // Optional for dependents
  relationship_to_prime: RelationshipType;
  is_independent: boolean;  // true = send invite, false = add as dependent
}

export interface PaymentInput {
  family_group_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  notes?: string;
}

// ============================================
// API Response Types
// ============================================

export interface QRScanResult {
  success: boolean;
  member: MemberWithFamily | null;
  error?: string;
}

export interface AuthResult {
  success: boolean;
  member: Member | null;
  isNewMember: boolean;
  error?: string;
}
