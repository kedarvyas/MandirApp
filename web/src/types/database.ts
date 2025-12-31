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
export type StaffRole =
  | 'owner'      // Full access + can transfer ownership, delete org
  | 'admin'      // Full access to all features
  | 'treasurer'  // Payments/donations focus
  | 'secretary'  // Members/attendance focus
  | 'volunteer'  // Check-in only
  | 'viewer';    // Read-only access

// ============================================
// Database Table Types
// ============================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  org_code: string;  // Human-readable code for mobile app entry (e.g., "TEMPLE-ABC123")
  logo_url: string | null;
  primary_color: string;  // Hex color code for branding
  settings: OrganizationSettings | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Organization type options
export type OrganizationType = 'temple' | 'church' | 'mosque' | 'synagogue' | 'gurdwara' | 'other';

// Kiosk payment method options
export type KioskPaymentMethod = 'apple_pay' | 'google_pay' | 'card' | 'venmo';

// Kiosk settings (stored in organization.settings.kiosk)
export interface KioskSettings {
  enabled: boolean;
  preset_amounts: number[];
  custom_amount_enabled: boolean;
  payment_methods: KioskPaymentMethod[];
  thank_you_message: string;
  show_org_logo: boolean;
  require_email: boolean;  // Whether to ask for email for receipt
}

// Default kiosk settings
export const DEFAULT_KIOSK_SETTINGS: KioskSettings = {
  enabled: false,
  preset_amounts: [25, 51, 101, 251, 501, 1001],
  custom_amount_enabled: true,
  payment_methods: ['apple_pay', 'google_pay', 'card'],
  thank_you_message: 'Thank you for your generous donation!',
  show_org_logo: true,
  require_email: false,
};

// Organization settings structure
export interface OrganizationSettings {
  type?: OrganizationType;
  kiosk?: KioskSettings;
}

// Organization signup input
export interface OrganizationSignupInput {
  org_name: string;
  org_type: OrganizationType;
  admin_name: string;
  admin_email: string;
  admin_phone: string;
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

export interface RolePermissions {
  role: StaffRole;
  // Member permissions
  can_view_members: boolean;
  can_create_members: boolean;
  can_edit_members: boolean;
  can_delete_members: boolean;
  // Payment permissions
  can_view_payments: boolean;
  can_create_payments: boolean;
  can_edit_payments: boolean;
  can_delete_payments: boolean;
  can_export_payments: boolean;
  // Check-in permissions
  can_view_checkins: boolean;
  can_create_checkins: boolean;
  // Report permissions
  can_view_reports: boolean;
  can_export_reports: boolean;
  // Staff management
  can_view_staff: boolean;
  can_manage_staff: boolean;
  // Organization settings
  can_edit_org_settings: boolean;
  can_delete_org: boolean;
  // Description
  description: string;
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
