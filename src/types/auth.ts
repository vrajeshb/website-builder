// Filename: auth.ts

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}
 
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: string | null; // <-- Add this line
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<void>;
  clearError: () => void;
}