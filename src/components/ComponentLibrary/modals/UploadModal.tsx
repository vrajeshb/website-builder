import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Star } from 'lucide-react';
import { CATEGORIES } from '../constants';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (data: any) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'custom',
    html: '',
    css: '',
    js: '',
    tags: '',
    description: '',
    is_premium: false
  });
  const [previewImage, setPreviewImage] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpload({
      ...formData,
      preview_image: previewImage,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-2xl font-bold flex items-center gap-3">
            <Upload className="w-7 h-7 text-green-400" />
            Upload Component
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Component Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter component name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-blue-500 outline-none"
                >
                  {CATEGORIES.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category} className="capitalize">{category}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 bg-gray-700/30 px-4 py-3 rounded-xl border border-gray-600">
                  <input
                    type="checkbox"
                    checked={formData.is_premium}
                    onChange={(e) => setFormData({...formData, is_premium: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300 flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    Premium
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-blue-500 outline-none h-24"
                placeholder="Describe what this component does..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="responsive, modern, business, dark-theme"
                className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-blue-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Comma-separated tags</p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Preview Image</label>
              <div
                className={`border-2 border-dashed rounded-xl p-6 transition-all ${
                  dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith('image/')) {
                    handleImageUpload(file);
                  }
                }}
              >
                {previewImage ? (
                  <div className="relative">
                    <img src={previewImage} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setPreviewImage('')}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">Drop image here or click to upload</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="mt-2 inline-block bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                    >
                      Choose File
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Code */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">HTML Code *</label>
              <textarea
                required
                value={formData.html}
                onChange={(e) => setFormData({...formData, html: e.target.value})}
                className="w-full bg-gray-900/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-blue-500 outline-none h-48 font-mono text-sm"
                placeholder="<div class='...'>\n  Component HTML here\n</div>"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">CSS (Optional)</label>
              <textarea
                value={formData.css}
                onChange={(e) => setFormData({...formData, css: e.target.value})}
                className="w-full bg-gray-900/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-blue-500 outline-none h-32 font-mono text-sm"
                placeholder=".custom-class {\n  /* CSS styles */\n}"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">JavaScript (Optional)</label>
              <textarea
                value={formData.js}
                onChange={(e) => setFormData({...formData, js: e.target.value})}
                className="w-full bg-gray-900/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-blue-500 outline-none h-32 font-mono text-sm"
                placeholder="// JavaScript code"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="lg:col-span-2 flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Component
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;