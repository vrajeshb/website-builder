import { useState, useCallback } from 'react';

export const useFavorites = () => {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('component-favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const toggleFavorite = useCallback((componentId: string) => {
    setFavoriteIds(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(componentId)) {
        newFavorites.delete(componentId);
      } else {
        newFavorites.add(componentId);
      }
      localStorage.setItem('component-favorites', JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  }, []);

  const addToFavorites = useCallback((componentIds: string[]) => {
    setFavoriteIds(prev => {
      const newFavorites = new Set([...prev, ...componentIds]);
      localStorage.setItem('component-favorites', JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  }, []);

  return {
    favoriteIds,
    toggleFavorite,
    addToFavorites
  };
};