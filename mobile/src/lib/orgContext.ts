import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import type { Organization } from '../types/database';

const ORG_STORAGE_KEY = '@Sanctum:organization';
const ORGS_STORAGE_KEY = '@Sanctum:organizations';
const ACTIVE_ORG_KEY = '@Sanctum:activeOrgId';
const SIGNED_OUT_KEY = '@Sanctum:justSignedOut';

export interface StoredOrganization {
  id: string;
  name: string;
  org_code: string;
  logo_url: string | null;
  primary_color: string;
}

/**
 * Validate an organization code and return the organization if valid
 */
export async function validateOrgCode(code: string): Promise<{
  success: boolean;
  organization?: StoredOrganization;
  error?: string;
}> {
  try {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode || normalizedCode.length < 5) {
      return { success: false, error: 'Please enter a valid organization code' };
    }

    // Call the database function to get organization by code
    const { data, error } = await supabase
      .rpc('get_organization_by_code', { code: normalizedCode });

    if (error) {
      console.error('Org lookup error:', error);
      return { success: false, error: 'Unable to verify organization code' };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'Organization not found. Please check your code.' };
    }

    const org = data[0];

    if (!org.is_active) {
      return { success: false, error: 'This organization is no longer active' };
    }

    const storedOrg: StoredOrganization = {
      id: org.id,
      name: org.name,
      org_code: org.org_code,
      logo_url: org.logo_url,
      primary_color: org.primary_color || '#4A2040',
    };

    return { success: true, organization: storedOrg };
  } catch (err) {
    console.error('validateOrgCode error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

/**
 * Save the current organization to AsyncStorage
 */
export async function saveOrganization(org: StoredOrganization): Promise<void> {
  try {
    await AsyncStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(org));
  } catch (err) {
    console.error('Error saving organization:', err);
  }
}

/**
 * Get the currently stored organization from AsyncStorage
 */
export async function getStoredOrganization(): Promise<StoredOrganization | null> {
  try {
    const stored = await AsyncStorage.getItem(ORG_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as StoredOrganization;
    }
    return null;
  } catch (err) {
    console.error('Error getting organization:', err);
    return null;
  }
}

/**
 * Clear the stored organization (used on logout or org switch)
 */
export async function clearOrganization(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ORG_STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing organization:', err);
  }
}

/**
 * Check if an organization is stored
 */
export async function hasStoredOrganization(): Promise<boolean> {
  const org = await getStoredOrganization();
  return org !== null;
}

/**
 * Refresh organization data from the server
 * Updates the locally stored org with latest data from Supabase
 */
export async function refreshOrganization(orgId: string): Promise<StoredOrganization | null> {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name, org_code, logo_url, primary_color')
      .eq('id', orgId)
      .single();

    if (error || !data) {
      console.error('Error refreshing organization:', error);
      return null;
    }

    const updatedOrg: StoredOrganization = {
      id: data.id,
      name: data.name,
      org_code: data.org_code,
      logo_url: data.logo_url,
      primary_color: data.primary_color || '#4A2040',
    };

    // Update in storage
    await AsyncStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(updatedOrg));

    // Also update in the multi-org list if it exists
    const orgs = await getAllOrganizations();
    const updatedOrgs = orgs.map(o => o.id === orgId ? updatedOrg : o);
    await AsyncStorage.setItem(ORGS_STORAGE_KEY, JSON.stringify(updatedOrgs));

    return updatedOrg;
  } catch (err) {
    console.error('Error refreshing organization:', err);
    return null;
  }
}

// ============================================
// Multi-Organization Support
// ============================================

/**
 * Get all stored organizations
 */
export async function getAllOrganizations(): Promise<StoredOrganization[]> {
  try {
    const stored = await AsyncStorage.getItem(ORGS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as StoredOrganization[];
    }

    // Migration: check for legacy single org storage
    const legacyOrg = await AsyncStorage.getItem(ORG_STORAGE_KEY);
    if (legacyOrg) {
      const org = JSON.parse(legacyOrg) as StoredOrganization;
      // Migrate to new format
      await AsyncStorage.setItem(ORGS_STORAGE_KEY, JSON.stringify([org]));
      await AsyncStorage.setItem(ACTIVE_ORG_KEY, org.id);
      return [org];
    }

    return [];
  } catch (err) {
    console.error('Error getting organizations:', err);
    return [];
  }
}

/**
 * Get the active organization ID
 */
export async function getActiveOrgId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(ACTIVE_ORG_KEY);
  } catch (err) {
    console.error('Error getting active org ID:', err);
    return null;
  }
}

/**
 * Set the active organization by ID
 */
export async function setActiveOrganization(orgId: string): Promise<boolean> {
  try {
    const orgs = await getAllOrganizations();
    const org = orgs.find(o => o.id === orgId);

    if (!org) {
      console.error('Organization not found:', orgId);
      return false;
    }

    await AsyncStorage.setItem(ACTIVE_ORG_KEY, orgId);
    // Also update legacy key for backward compatibility
    await AsyncStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(org));
    return true;
  } catch (err) {
    console.error('Error setting active organization:', err);
    return false;
  }
}

/**
 * Add a new organization to the list
 * Returns true if added, false if already exists
 */
export async function addOrganization(org: StoredOrganization): Promise<boolean> {
  try {
    const orgs = await getAllOrganizations();

    // Check if already exists
    if (orgs.some(o => o.id === org.id)) {
      // Already exists, just set as active
      await setActiveOrganization(org.id);
      return false;
    }

    // Add to list
    orgs.push(org);
    await AsyncStorage.setItem(ORGS_STORAGE_KEY, JSON.stringify(orgs));

    // Set as active
    await setActiveOrganization(org.id);

    return true;
  } catch (err) {
    console.error('Error adding organization:', err);
    return false;
  }
}

/**
 * Remove an organization from the list
 */
export async function removeOrganization(orgId: string): Promise<boolean> {
  try {
    const orgs = await getAllOrganizations();
    const filtered = orgs.filter(o => o.id !== orgId);

    if (filtered.length === orgs.length) {
      return false; // Not found
    }

    await AsyncStorage.setItem(ORGS_STORAGE_KEY, JSON.stringify(filtered));

    // If we removed the active org, switch to another or clear
    const activeId = await getActiveOrgId();
    if (activeId === orgId) {
      if (filtered.length > 0) {
        await setActiveOrganization(filtered[0].id);
      } else {
        await AsyncStorage.removeItem(ACTIVE_ORG_KEY);
        await AsyncStorage.removeItem(ORG_STORAGE_KEY);
      }
    }

    return true;
  } catch (err) {
    console.error('Error removing organization:', err);
    return false;
  }
}

/**
 * Clear all organization data (used on logout)
 */
export async function clearAllOrganizations(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([ORG_STORAGE_KEY, ORGS_STORAGE_KEY, ACTIVE_ORG_KEY]);
  } catch (err) {
    console.error('Error clearing organizations:', err);
  }
}

// ============================================
// Sign-out state tracking
// ============================================

/**
 * Set a flag indicating user just signed out (to prevent auto-redirect)
 */
export async function setJustSignedOut(): Promise<void> {
  try {
    await AsyncStorage.setItem(SIGNED_OUT_KEY, 'true');
  } catch (err) {
    console.error('Error setting signed out flag:', err);
  }
}

/**
 * Check and clear the signed-out flag
 * Returns true if user just signed out
 */
export async function checkAndClearSignedOut(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(SIGNED_OUT_KEY);
    if (value === 'true') {
      await AsyncStorage.removeItem(SIGNED_OUT_KEY);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error checking signed out flag:', err);
    return false;
  }
}
