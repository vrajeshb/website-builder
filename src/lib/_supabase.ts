import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a fallback client if environment variables are missing
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase environment variables. Using fallback configuration.');
    // Return a mock client that won't cause errors
    return createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
};

export const supabase = createSupabaseClient();

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseKey !== 'placeholder-key');
};

// Profile cache to avoid repeated database calls
const profileCache = new Map<string, any>();

export const clearProfileCache = () => {
  profileCache.clear();
};

// Database helper functions
export const componentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getByCategory(category: string) {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(component: Omit<any, 'id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('components')
      .insert([{
        ...component,
        created_by: user?.id
      }])
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
    return data;
  }
};

export const projectService = {
  async save(project: Omit<any, 'id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        ...project,
        updated_at: new Date().toISOString(),
        user_id: user?.id
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<any>) {
    const { data, error } = await supabase
      .from('projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// Optimized profile service
export const profileService = {
  async getUserProfile(userId: string) {
    // Check cache first
    if (profileCache.has(userId)) {
      return profileCache.get(userId);
    }

    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (!error && profile) {
        // Cache the result
        profileCache.set(userId, profile);
        return profile;
      }
      
      return null;
    } catch (error) {
      console.warn('Could not fetch user profile:', error);
      return null;
    }
  },

  clearCache() {
    profileCache.clear();
  }
};