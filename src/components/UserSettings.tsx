import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Calendar, Package, CreditCard as Edit3, Trash2, Eye, Copy } from 'lucide-react';
import { DroppedComponent } from '../types';
import toast from 'react-hot-toast';

interface UserData {
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
}

interface UserSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData;
  onUserDataUpdate: (data: UserData) => void;
  userComponents: DroppedComponent[];
  onDeleteUserComponent?: (componentId: string) => void;
}

export const UserSettings: React.FC<UserSettingsProps> = ({
  isOpen,
  onClose,
  userData,
  onUserDataUpdate,
  userComponents,
  onDeleteUserComponent
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'components'>('profile');
  const [formData, setFormData] = useState(userData);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setFormData(userData);
  }, [userData]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    onUserDataUpdate(formData);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Account Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('components')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'components'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="w-4 h-4" />
              My Components ({userComponents.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-semibold text-white shadow-lg">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt={formData.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      formData.name
                        .split(' ')
                        .map(word => word.charAt(0))
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{formData.name}</h4>
                    <p className="text-gray-500 text-sm">Member since {formData.joinDate}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        isEditing
                          ? 'border-gray-300 bg-white'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        isEditing
                          ? 'border-gray-300 bg-white'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Join Date
                    </label>
                    <input
                      type="text"
                      value={formData.joinDate}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'components' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">My Components</h3>
                <div className="text-sm text-gray-500">
                  {userComponents.length} component{userComponents.length !== 1 ? 's' : ''} created
                </div>
              </div>

              {userComponents.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No components yet</h4>
                  <p className="text-gray-500">Start building to see your components here.</p>
                </div>
              ) : (
                <div className="">
                  {userComponents.map((component) => (
                    <div key={component.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{component.component.name}</h4>
                          <p className="text-sm text-gray-500">{component.component.category}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(component.component.html);
                              toast.success('Component HTML copied!');
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Copy HTML"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          {onDeleteUserComponent && (
                            <button
                              onClick={() => onDeleteUserComponent(component.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete component"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 border-2 border-dashed border-gray-200">
                        <div 
                          className="text-xs overflow-hidden"
                          style={{ maxHeight: '100px' }}
                          dangerouslySetInnerHTML={{ __html: component.component.html }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span>Position: {component.position}</span>
                        <span>Created: {new Date(component.id.split('_').pop() || '').toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};