import { useState, useEffect } from 'react';
import { Component } from '../types';
import { componentService } from '../../../lib/_supabase';
import toast from 'react-hot-toast';

export const useComponentData = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComponents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add caching with timestamp
      const cacheKey = 'components-cache';
      const cacheTimestamp = 'components-cache-timestamp';
      const cacheDuration = 5 * 60 * 1000; // 5 minutes
      
      const cachedData = localStorage.getItem(cacheKey);
      const cachedTimestamp = localStorage.getItem(cacheTimestamp);
      
      if (cachedData && cachedTimestamp) {
        const age = Date.now() - parseInt(cachedTimestamp);
        if (age < cacheDuration) {
          setComponents(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
      }

      const data = await componentService.getAll();
      const processedData = data || [];
      
      setComponents(processedData);
      
      // Cache the data
      localStorage.setItem(cacheKey, JSON.stringify(processedData));
      localStorage.setItem(cacheTimestamp, Date.now().toString());
      
    } catch (error) {
      console.error('Failed to load components:', error);
      setError('Failed to load components');
      toast.error('Failed to load components');
    } finally {
      setLoading(false);
    }
  };

  const refreshComponents = () => {
    // Clear cache and reload
    localStorage.removeItem('components-cache');
    localStorage.removeItem('components-cache-timestamp');
    loadComponents();
  };

  useEffect(() => {
    loadComponents();
  }, []);

  return {
    components,
    loading,
    error,
    refreshComponents,
    setComponents
  };
};