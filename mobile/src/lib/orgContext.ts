import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import type { Organization } from '../types/database';

const ORG_STORAGE_KEY = '@MandirApp:organization';

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
