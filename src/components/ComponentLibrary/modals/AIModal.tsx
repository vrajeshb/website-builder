import React, { useState, useEffect } from 'react';
import { Sparkles, X, AlertCircle, CheckCircle } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { openaiService } from '../../../services/openai';
import { GenerationOptions } from '../../../services/types';

interface AIModalProps {
  onClose: () => void;
  onGenerate: (description: string, category: string, options: GenerationOptions, code: string) => void;
}

const AIModal: React.FC<AIModalProps> = ({ onClose, onGenerate }) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('custom');
  const [options, setOptions] = useState<GenerationOptions>({
    style: 'modern',
    colorScheme: 'blue',
    complexity: 'medium',
    responsive: true
  });
  const [generating, setGenerating] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = () => {
    const configured = openaiService.isConfigured();
    setIsConfigured(configured);

    if (configured) {
      const models = openaiService.getAvailableModels();
      setAvailableModels(models);
      setSelectedModel('gpt-4o-mini');
      openaiService.setModel('gpt-4o-mini');
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    openaiService.setModel(model);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setGenerating(true);
    setError(null);

    try {
      const code = await openaiService.generateComponent(description, category, options);
      onGenerate(description, category, options, code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate component');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 w-full max-w-2xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            AI Component Generator
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!isConfigured && (
          <div className="mb-4 bg-red-900/30 border border-red-700 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-200">
              <p className="font-semibold mb-1">OpenAI API Key Not Configured</p>
              <p>Please add your OpenAI API key to the .env file:</p>
              <code className="block mt-2 bg-black/30 p-2 rounded text-xs">
                VITE_OPENAI_API_KEY=your_api_key_here
              </code>
              <p className="mt-2">Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-red-300 hover:text-red-100 underline">OpenAI Platform</a></p>
            </div>
          </div>
        )}

        {isConfigured && (
          <div className="mb-4 bg-green-900/30 border border-green-700 rounded-lg p-3 flex items-center gap-2 text-sm text-green-200">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Connected to OpenAI ({availableModels.length} models available)
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-900/30 border border-red-700 rounded-lg p-3 flex items-start gap-2 text-sm text-red-200">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {availableModels.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">AI Model</label>
              <select
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full bg-black/20 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-blue-500 outline-none"
              >
                {availableModels.map(model => (
                  <option key={model} value={model} className="bg-gray-800">{model}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Describe your component</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Create a modern hero section with a centered title, subtitle, and call-to-action button..."
              className="w-full bg-black/20 text-white px-4 py-4 rounded-xl border border-gray-600 focus:border-blue-500 outline-none h-32 backdrop-blur-sm placeholder:text-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-black/20 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-blue-500 outline-none"
              >
                {CATEGORIES.filter(cat => cat !== 'all').map(cat => (
                  <option key={cat} value={cat} className="capitalize bg-gray-800">
                    {cat.replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Style</label>
              <select
                value={options.style}
                onChange={(e) => setOptions({...options, style: e.target.value})}
                className="w-full bg-black/20 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-blue-500 outline-none"
              >
                <option value="modern" className="bg-gray-800">Modern</option>
                <option value="minimal" className="bg-gray-800">Minimal</option>
                <option value="bold" className="bg-gray-800">Bold</option>
                <option value="elegant" className="bg-gray-800">Elegant</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Color Scheme</label>
              <select
                value={options.colorScheme}
                onChange={(e) => setOptions({...options, colorScheme: e.target.value})}
                className="w-full bg-black/20 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-blue-500 outline-none"
              >
                <option value="blue" className="bg-gray-800">Blue</option>
                <option value="green" className="bg-gray-800">Green</option>
                <option value="red" className="bg-gray-800">Red</option>
                <option value="gray" className="bg-gray-800">Gray</option>
                <option value="orange" className="bg-gray-800">Orange</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Complexity</label>
              <select
                value={options.complexity}
                onChange={(e) => setOptions({...options, complexity: e.target.value})}
                className="w-full bg-black/20 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-blue-500 outline-none"
              >
                <option value="simple" className="bg-gray-800">Simple</option>
                <option value="medium" className="bg-gray-800">Medium</option>
                <option value="complex" className="bg-gray-800">Complex</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/20 p-4 rounded-xl border border-gray-600">
            <input
              type="checkbox"
              id="responsive"
              checked={options.responsive}
              onChange={(e) => setOptions({...options, responsive: e.target.checked})}
              className="rounded"
            />
            <label htmlFor="responsive" className="text-gray-200">Make it responsive</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={generating}
              className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white py-3 px-6 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating || !description.trim() || !isConfigured}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Component
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIModal;
