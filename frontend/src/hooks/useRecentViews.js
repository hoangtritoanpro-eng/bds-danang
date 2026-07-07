import { useState, useEffect } from 'react';

export function useRecentViews() {
  const [recentViews, setRecentViews] = useState(() => {
    try {
      const saved = localStorage.getItem('bds_recent');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('bds_recent', JSON.stringify(recentViews));
  }, [recentViews]);

  const addRecentView = (property) => {
    if (!property || !property.PropertyID) return;
    setRecentViews(prev => {
      // Bỏ property này nếu đã có trong list
      const filtered = prev.filter(p => p.PropertyID !== property.PropertyID);
      // Thêm lên đầu, giữ tối đa 10 mục
      return [property, ...filtered].slice(0, 10);
    });
  };

  return { recentViews, addRecentView };
}
