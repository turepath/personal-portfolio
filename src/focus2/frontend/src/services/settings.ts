import apiClient from './index';

interface Settings {
  id: number;
  user_id: number;
  Theme: string;
  Simplified_Mode: boolean;
  Animation: string;
  Color: string;
  Font_Size: number;
  Rest_interval: number;
  task_due_reminders: string;
  White_Noise: string;
  White_Noise_start: boolean;
  default_room: string;
  Anonymized: boolean;
  Personalized: boolean;
  Targeted: boolean;
}

export const settingsService = {
  async getSettings(): Promise<Settings> {
    const response = await apiClient.get('/api/settings');
    return response.data;
  },

  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    const response = await apiClient.put('/api/settings', settings);
    return response.data;
  },

  async resetSettings(): Promise<Settings> {
    const response = await apiClient.post('/api/settings/reset');
    return response.data;
  },
};

export type { Settings };
