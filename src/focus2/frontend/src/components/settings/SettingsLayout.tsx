import React, { useState, useEffect } from "react";
import { FocusEnvironmentPanel } from "./FocusEnvironmentPanel";
import { NotificationsPanel } from "./NotificationsPanel";
import { AccountSecurityPanel } from "./AccountSecurityPanel";
import { PreferencesPanel } from "./PreferencesPanel";
import { HelpSupportPanel } from "./HelpSupportPanel";
import { PrivacySettings } from "./PrivacySettings";
import { settingsService } from "../../services/settings";

const SECTIONS = [
  {
    id: "env",
    label: "Focus Environment",
    icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
  },
  {
    id: "notif",
    label: "Notifications & Reminders",
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  },
  {
    id: "privacy",
    label: "Privacy & Permissions",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    id: "account",
    label: "Account & Security",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    id: "prefs",
    label: "Preferences",
    icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
  },
  {
    id: "support",
    label: "Help & Support",
    icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

const DEFAULT_SETTINGS = {
  focusEnvironment: {
    themeMode: "Auto (system)",
    simplifiedMode: false,
    animationControl: "Reduced motion",
    focusAccent: "#8A9B6E",
    fontSize: 16,
  },
  notifications: {
    dndEnabled: true,
    restReminder: "Visual",
    restFrequency: 25,
    taskDueReminder: "30 min before",
  },
  account: {
    displayName: "Alex Rivera",
    bio: "Productivity enthusiast & Computer Science student.",
  },
  preferences: {
    whiteNoisePreset: "None",
    autoPlayNoise: false,
    defaultRoomType: "1:1",
    privacy: {
      shareAnalytics: false,
      personalizedRecommendations: false,
      allowTargetedSuggestions: false,
    },
  },
};

export const SettingsLayout: React.FC = () => {
  const [activeId, setActiveId] = useState("env");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从后端获取设置
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await settingsService.getSettings();
        // 转换后端设置格式为前端使用的格式
        const formattedSettings = {
          focusEnvironment: {
            themeMode: response.Theme,
            simplifiedMode: response.Simplified_Mode,
            animationControl: response.Animation,
            focusAccent: response.Color,
            fontSize: response.Font_Size,
          },
          notifications: {
            dndEnabled: true, // 默认值，后端暂时没有这个字段
            restReminder: "Visual", // 默认值，后端暂时没有这个字段
            restFrequency: response.Rest_interval,
            taskDueReminder: response.task_due_reminders,
          },
          account: {
            displayName: "Alex Rivera", // 从用户表获取
            bio: "Productivity enthusiast & Computer Science student.", // 从用户表获取
          },
          preferences: {
            whiteNoisePreset: response.White_Noise,
            autoPlayNoise: response.White_Noise_start,
            defaultRoomType: response.default_room,
            privacy: {
              shareAnalytics: response.Anonymized,
              personalizedRecommendations: response.Personalized,
              allowTargetedSuggestions: response.Targeted,
            },
          },
        };
        setSettings(formattedSettings);
      } catch (err) {
        console.error("Failed to fetch settings:", err);
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleUpdate = async (delta: any) => {
    try {
      const newSettings = { ...settings, ...delta };
      setSettings(newSettings);

      // 转换前端设置格式为后端使用的格式
      const backendSettings = {
        Theme: newSettings.focusEnvironment.themeMode,
        Simplified_Mode: newSettings.focusEnvironment.simplifiedMode,
        Animation: newSettings.focusEnvironment.animationControl,
        Color: newSettings.focusEnvironment.focusAccent,
        Font_Size: newSettings.focusEnvironment.fontSize,
        Rest_interval: newSettings.notifications.restFrequency,
        task_due_reminders: newSettings.notifications.taskDueReminder,
        White_Noise: newSettings.preferences.whiteNoisePreset,
        White_Noise_start: newSettings.preferences.autoPlayNoise,
        default_room: newSettings.preferences.defaultRoomType,
        Anonymized: newSettings.preferences.privacy.shareAnalytics,
        Personalized:
          newSettings.preferences.privacy.personalizedRecommendations,
        Targeted: newSettings.preferences.privacy.allowTargetedSuggestions,
      };

      await settingsService.updateSettings(backendSettings);
    } catch (err) {
      console.error("Failed to update settings:", err);
      setError("Failed to save settings");
    }
  };

  const handleReset = async (section: keyof typeof DEFAULT_SETTINGS) => {
    try {
      const newSettings = { ...settings, [section]: DEFAULT_SETTINGS[section] };
      setSettings(newSettings);

      // 转换前端设置格式为后端使用的格式
      const backendSettings = {
        Theme: newSettings.focusEnvironment.themeMode,
        Simplified_Mode: newSettings.focusEnvironment.simplifiedMode,
        Animation: newSettings.focusEnvironment.animationControl,
        Color: newSettings.focusEnvironment.focusAccent,
        Font_Size: newSettings.focusEnvironment.fontSize,
        Rest_interval: newSettings.notifications.restFrequency,
        task_due_reminders: newSettings.notifications.taskDueReminder,
        White_Noise: newSettings.preferences.whiteNoisePreset,
        White_Noise_start: newSettings.preferences.autoPlayNoise,
        default_room: newSettings.preferences.defaultRoomType,
        Anonymized: newSettings.preferences.privacy.shareAnalytics,
        Personalized:
          newSettings.preferences.privacy.personalizedRecommendations,
        Targeted: newSettings.preferences.privacy.allowTargetedSuggestions,
      };

      await settingsService.updateSettings(backendSettings);
    } catch (err) {
      console.error("Failed to reset settings:", err);
      setError("Failed to reset settings");
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderPanel = () => {
    switch (activeId) {
      case "env":
        return (
          <FocusEnvironmentPanel
            settings={settings}
            onChange={handleUpdate}
            onReset={() => handleReset("focusEnvironment")}
          />
        );
      case "notif":
        return (
          <NotificationsPanel
            settings={settings}
            onChange={handleUpdate}
            onReset={() => handleReset("notifications")}
          />
        );
      case "privacy":
        return <PrivacySettings />;
      case "account":
        return (
          <AccountSecurityPanel
            settings={settings}
            onChange={handleUpdate}
            onReset={() => handleReset("account")}
          />
        );
      case "prefs":
        return (
          <PreferencesPanel
            settings={settings}
            onChange={handleUpdate}
            onReset={() => handleReset("preferences")}
          />
        );
      case "support":
        return <HelpSupportPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row min-h-[700px] bg-earth-card border border-earth-border rounded-2xl overflow-hidden shadow-2xl relative">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-24 left-8 z-50 w-12 h-12 bg-earth-accent text-white rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-90"
        aria-label="Toggle settings menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16m-7 6h7"
          ></path>
        </svg>
      </button>

      <nav
        className={`lg:w-1/3 w-full border-r border-earth-border bg-earth-card-alt p-8 flex flex-col transition-all duration-300 z-40 ${isSidebarOpen ? "relative" : "hidden lg:flex"}`}
        role="navigation"
        aria-label="Settings categories"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-earth-text">Settings</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-earth-text-sec"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <div className="flex-1 space-y-1.5">
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveId(item.id);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold transition-all ${activeId === item.id ? "bg-earth-accent text-white shadow-lg translate-x-1" : "text-earth-text-sec hover:bg-earth-border/50 hover:text-earth-text"}`}
              aria-current={activeId === item.id ? "page" : undefined}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={item.icon}
                ></path>
              </svg>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-8 p-4 bg-earth-bg rounded-xl border border-earth-border/50">
          <p className="text-[10px] text-earth-text-sec font-bold uppercase tracking-widest mb-1 text-center">
            Sync Status
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-earth-success animate-pulse"></div>
            <span className="text-xs font-medium text-earth-text">
              All changes synced
            </span>
          </div>
        </div>
      </nav>
      <main
        className="flex-1 lg:w-2/3 bg-earth-bg p-6 sm:p-10 lg:p-16 overflow-y-auto scrollbar-hide min-h-full"
        aria-labelledby="section-title"
      >
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-earth-text">Loading settings...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-earth-danger/10 border border-earth-danger rounded-xl">
              <p className="text-earth-danger font-bold">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-earth-accent text-white rounded-lg text-sm font-bold"
              >
                Try again
              </button>
            </div>
          ) : (
            renderPanel()
          )}
        </div>
      </main>
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-earth-text/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};
