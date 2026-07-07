import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('bds_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('bds_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (property) => {
    setFavorites(prev => {
      const exists = prev.find(p => p.PropertyID === property.PropertyID);
      if (exists) {
        return prev.filter(p => p.PropertyID !== property.PropertyID);
      }
      return [...prev, property];
    });
  };

  const isFavorite = (propertyId) => {
    return favorites.some(p => p.PropertyID === propertyId);
  };

  return { favorites, toggleFavorite, isFavorite, setFavorites };
}
