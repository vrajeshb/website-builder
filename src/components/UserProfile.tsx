import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, Package, ChevronDown, CreditCard as Edit3 } from 'lucide-react';

interface UserData {
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
}

interface UserProfileProps {
  userData: UserData;
  onSettingsClick: () => void;
  onLogout?: () => void;
  onMyProjectsClick?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userData,
  onSettingsClick,
  onLogout,
  onMyProjectsClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 transition-all duration-200 text-white"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-600 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-md">
          {userData.avatar ? (
            <img src={userData.avatar} alt={userData.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            getInitials(userData.name)
          )}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium">{userData.name}</div>
          <div className="text-xs opacity-75">{userData.email}</div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-600 rounded-full flex items-center justify-center text-lg font-semibold text-white shadow-md">
                {userData.avatar ? (
                  <img src={userData.avatar} alt={userData.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(userData.name)
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{userData.name}</div>
                <div className="text-sm text-gray-500">{userData.email}</div>
                <div className="text-xs text-gray-400">Member since {userData.joinDate}</div>
              </div>
            </div>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                onSettingsClick();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Account Settings</span>
            </button>
            
            <button
              onClick={() => {
                if (onMyProjectsClick) {
                  onMyProjectsClick();
                }
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>My Projects</span>
            </button>

            <div className="border-t border-gray-100 my-1"></div>
            
            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};