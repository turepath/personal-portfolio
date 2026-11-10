import axios from "axios";

export interface Settings {
  id: number;
  user_id: number;
  theme: string;
  language: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  focus_duration: number;
  short_break_duration: number;
  long_break_duration: number;
  long_break_interval: number;
  auto_start_break: boolean;
  auto_start_focus: boolean;
  sound_enabled: boolean;
  sound_volume: number;
  notification_sound: string;
  weekly_report_enabled: boolean;
}

export interface UpdateSettingsData {
  theme?: string;
  language?: string;
  notifications_enabled?: boolean;
  email_notifications?: boolean;
  focus_duration?: number;
  short_break_duration?: number;
  long_break_duration?: number;
  long_break_interval?: number;
  auto_start_break?: boolean;
  auto_start_focus?: boolean;
  sound_enabled?: boolean;
  sound_volume?: number;
  notification_sound?: string;
  weekly_report_enabled?: boolean;
}

export const settingsApi = {
  getSettings: async (token: string): Promise<Settings> => {
    const response = await axios.get("/api/settings", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateSettings: async (
    token: string,
    data: UpdateSettingsData,
  ): Promise<Settings> => {
    const response = await axios.put("/api/settings", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  resetSettings: async (token: string): Promise<Settings> => {
    const response = await axios.post(
      "/api/settings/reset",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  },
};
