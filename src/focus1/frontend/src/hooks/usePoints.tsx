import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export const usePoints = () => {
  const { user } = useAuth();
  const [points, setPoints] = useState(user?.points || 0);
  const [recentGain, setRecentGain] = useState<{
    amount: number;
    id: number;
  } | null>(null);

  // 当用户数据变化时更新points
  useEffect(() => {
    if (user) {
      setPoints(user.points || 0);
    }
  }, [user]);

  const awardPoints = useCallback((amount: number) => {
    setPoints((prev) => prev + amount);
    setRecentGain({ amount, id: Date.now() });
  }, []);

  const spendPoints = useCallback(
    (amount: number): boolean => {
      if (points >= amount) {
        setPoints((prev) => prev - amount);
        return true;
      }
      return false;
    },
    [points],
  );

  useEffect(() => {
    if (recentGain) {
      const timer = setTimeout(() => setRecentGain(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [recentGain]);

  return { points, awardPoints, spendPoints, recentGain };
};
