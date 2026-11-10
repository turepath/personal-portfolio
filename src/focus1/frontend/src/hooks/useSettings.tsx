import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { settingsApi, Settings, UpdateSettingsData } from "../services/api/settings";

export const useSettings = () => {
  const { token } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取设置
  const fetchSettings = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await settingsApi.getSettings(token);
      setSettings(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch settings");
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 更新设置
  const updateSettings = useCallback(
    async (data: UpdateSettingsData) => {
      if (!token || !settings) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const updatedSettings = await settingsApi.updateSettings(token, data);
        setSettings(updatedSettings);
        return updatedSettings;
      } catch (err: any) {
        setError(err.message || "Failed to update settings");
        console.error("Error updating settings:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, settings],
  );

  // 恢复默认设置
  const resetSettings = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const resetSettings = await settingsApi.resetSettings(token);
      setSettings(resetSettings);
      return resetSettings;
    } catch (err: any) {
      setError(err.message || "Failed to reset settings");
      console.error("Error resetting settings:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 初始化时获取设置
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    resetSettings,
  };
};
