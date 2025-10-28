import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, LogIn, UserPlus, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
  error?: string | null;
}

export function AuthForm({ mode, onModeChange, error }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Get loading and authError directly from the AuthContext
  const { signIn, signUp, loading, authError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupSuccess(false);

    try {
      if (mode === 'signup') {
        await signUp(email, password, fullName);
        // If signup is successful, show success message and redirect to signin
        setSignupSuccess(true);
        setEmail('');
        setPassword('');
        setFullName('');
        setTimeout(() => {
          setSignupSuccess(false);
          onModeChange('signin');
        }, 2000);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      // Error handling is managed by the AuthContext
      console.error('Auth error:', error);
    }
  };

  const isSignUp = mode === 'signup';

  // Show success message after signup
  if (signupSuccess) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-600 mb-6">
            Your account has been created successfully. You can now sign in with your credentials.
          </p>
          <div className="flex items-center justify-center gap-2 text-green-600">
            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Redirecting to sign in...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          {isSignUp ? (
            <UserPlus className="w-8 h-8 text-blue-600" />
          ) : (
            <LogIn className="w-8 h-8 text-blue-600" />
          )}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-gray-600">
          {isSignUp
            ? 'Sign up to get started with your account'
            : 'Sign in to your account to continue'
          }
        </p>
      </div>

      {(authError || error) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{authError || error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {isSignUp && (
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your full name"
                required={isSignUp}
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {isSignUp ? 'Creating Account...' : 'Signing In...'}
            </div>
          ) : (
            isSignUp ? 'Create Account' : 'Sign In'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => onModeChange(isSignUp ? 'signin' : 'signup')}
            className="ml-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}