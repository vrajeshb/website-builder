import { createClient } from '@supabase/supabase-js';

// =======================
// ✅ ENV CONFIGURATION
// =======================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// =======================
// ✅ CREATE SUPABASE CLIENT (with fallback)
// =======================
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Missing Supabase environment variables. Using fallback client.');
    return createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

export const supabase = createSupabaseClient();

// =======================
// ✅ CONFIGURATION CHECKER
// =======================
export const isSupabaseConfigured = () => {
  return !!(
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseKey !== 'placeholder-key'
  );
};

// =======================
// ✅ PROFILE CACHE
// =======================
const profileCache = new Map<string, any>();

export const clearProfileCache = () => {
  profileCache.clear();
};

// =======================
// ✅ COMPONENT SERVICE
// =======================
export const componentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByCategory(category: string) {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(component: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('components')
      .insert([{ ...component, created_by: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async search(query: string) {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .or(`name.ilike.%${query}%, tags.cs.{${query}}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

// =======================
// ✅ PROJECT SERVICE
// =======================
export const projectService = {
  async save(project: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          user_id: user.id,
          name: project.name || 'Untitled Project',
          components: project.components || [],
          settings: project.settings || {},
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(projectId: string, project: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .update({
        name: project.name,
        components: project.components,
        settings: project.settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(projectId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async delete(projectId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (error) throw error;
  },
};

// =======================
// ✅ PROFILE SERVICE
// =======================
export const profileService = {
  async getUserProfile(userId: string) {
    if (profileCache.has(userId)) {
      return profileCache.get(userId);
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('full_name, avatar_url, is_premium, premium_expires_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Could not fetch user profile:', error);
      return null;
    }

    if (profile) profileCache.set(userId, profile);
    return profile;
  },

  async checkPremiumStatus(userId: string) {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('is_premium, premium_expiry')
      .eq('id', userId)
      .maybeSingle();

    if (error || !profile) return false;

    if (!profile.is_premium) return false;

    if (profile.premium_expiry) {
      const expiresAt = new Date(profile.premium_expiry);
      if (expiresAt < new Date()) return false;
    }

    return true;
  },

  async getCurrentUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return this.getUserProfile(user.id);
  },

  clearCache() {
    profileCache.clear();
  },
};
