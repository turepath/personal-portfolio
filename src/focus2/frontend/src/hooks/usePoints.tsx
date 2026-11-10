
import { useState, useCallback, useEffect } from 'react';
import { MOCK_USER } from '../utils/constants';

export const usePoints = () => {
  const [points, setPoints] = useState(MOCK_USER.points);
  const [recentGain, setRecentGain] = useState<{ amount: number; id: number } | null>(null);

  const awardPoints = useCallback((amount: number) => {
    setPoints(prev => prev + amount);
    setRecentGain({ amount, id: Date.now() });
  }, []);

  const spendPoints = useCallback((amount: number): boolean => {
    if (points >= amount) {
      setPoints(prev => prev - amount);
      return true;
    }
    return false;
  }, [points]);

  useEffect(() => {
    if (recentGain) {
      const timer = setTimeout(() => setRecentGain(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [recentGain]);

  return { points, awardPoints, spendPoints, recentGain };
};
