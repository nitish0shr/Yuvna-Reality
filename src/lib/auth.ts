import { supabase } from './supabase';
import { db } from './supabase';
import type { BuyerProfile } from '../types/realEstate';

// Authentication helper functions using Supabase Auth

export interface AuthUser {
  id: string;
  email: string;
  isAgent?: boolean;
}

// Sign up with email (magic link)
export async function signUpWithEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Sign in with email (magic link)
export async function signInWithEmail(email: string): Promise<{ success: boolean; error?: string }> {
  return signUpWithEmail(email); // Same flow for Supabase
}

// Sign in with password (for agents)
export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email!,
        isAgent: data.user.user_metadata?.isAgent || false,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Sign out
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// Get current user
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  return {
    id: user.id,
    email: user.email!,
    isAgent: user.user_metadata?.isAgent || false,
  };
}

// Get current session
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Listen for auth changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email!,
        isAgent: session.user.user_metadata?.isAgent || false,
      });
    } else {
      callback(null);
    }
  });
}

// Create or get buyer profile after authentication
export async function getOrCreateBuyerProfile(authUser: AuthUser): Promise<BuyerProfile | null> {
  try {
    // Check if buyer exists
    let buyer = await db.getBuyerByEmail(authUser.email);

    if (!buyer) {
      // Create new buyer
      buyer = await db.createBuyer({
        id: authUser.id,
        email: authUser.email,
        first_name: authUser.email.split('@')[0], // Temporary name
        country: 'Unknown',
        language: 'en',
        currency: 'USD',
        lead_category: 'cold',
        urgency_score: 0,
        lead_score: 0,
      });
    }

    // Convert DB format to app format
    return {
      id: buyer.id,
      firstName: buyer.first_name,
      lastName: buyer.last_name || '',
      email: buyer.email,
      phone: buyer.phone || undefined,
      country: buyer.country,
      language: buyer.language || 'en',
      currency: buyer.currency || 'USD',
      timezone: 'UTC',
      persona: buyer.persona as any || null,
      personaConfidence: 0,
      goal: buyer.goal as any || 'exploring',
      budgetBand: buyer.budget_band as any || 'under-500k',
      urgencyScore: buyer.urgency_score || 0,
      leadScore: buyer.lead_score as any || 'cold',
      engagementScore: 0,
      riskTolerance: 'moderate' as const,
      investmentHorizon: '3-5-years' as const,
      source: 'website' as const,
      consentMarketing: false,
      consentWhatsApp: false,
      consentEmail: false,
      optOutChannels: [],
      onboardingCompletedAt: buyer.onboarding_completed_at ? new Date(buyer.onboarding_completed_at) : undefined,
      lastActiveAt: buyer.last_active_at ? new Date(buyer.last_active_at) : new Date(),
      createdAt: new Date(buyer.created_at),
      updatedAt: new Date(buyer.updated_at),
    } as BuyerProfile;
  } catch (error) {
    console.error('Error getting/creating buyer profile:', error);
    return null;
  }
}

// Update buyer profile after onboarding
export async function updateBuyerAfterOnboarding(
  buyerId: string,
  data: {
    firstName: string;
    lastName?: string;
    phone?: string;
    country: string;
    persona: string;
    goal: string;
    budgetBand: string;
  }
): Promise<boolean> {
  try {
    await db.updateBuyer(buyerId, {
      first_name: data.firstName,
      last_name: data.lastName || null,
      phone: data.phone || null,
      country: data.country,
      persona: data.persona,
      goal: data.goal,
      budget_band: data.budgetBand,
      onboarding_completed_at: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error updating buyer after onboarding:', error);
    return false;
  }
}

export default {
  signUpWithEmail,
  signInWithEmail,
  signInWithPassword,
  signOut,
  getCurrentUser,
  getSession,
  onAuthStateChange,
  getOrCreateBuyerProfile,
  updateBuyerAfterOnboarding,
};

