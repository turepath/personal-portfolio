import React, { useState, useEffect } from "react";
import { FocusEnvironmentPanel } from "./FocusEnvironmentPanel";
import { NotificationsPanel } from "./NotificationsPanel";
import { AccountSecurityPanel } from "./AccountSecurityPanel";
import { PreferencesPanel } from "./PreferencesPanel";
import { HelpSupportPanel } from "./HelpSupportPanel";
import { PrivacySettings } from "./PrivacySettings";
import { useSettings } from "../../hooks/useSettings";

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

export const SettingsLayout: React.FC = () => {
  const [activeId, setActiveId] = useState("env");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 使用useSettings hook获取和更新设置
  const { settings, loading, error, updateSettings, resetSettings } =
    useSettings();

  // 定义默认的前端设置结构
  const defaultFrontendSettings = {
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

  // 将后端扁平设置转换为前端嵌套结构
  const mapToFrontendSettings = () => {
    if (!settings) {
      return defaultFrontendSettings;
    }

    return {
      focusEnvironment: {
        themeMode:
          settings.theme === "light"
            ? "Light"
            : settings.theme === "dark"
              ? "Dark"
              : "Auto (system)",
        simplifiedMode: false,
        animationControl: "Reduced motion",
        focusAccent: "#8A9B6E",
        fontSize: 16,
      },
      notifications: {
        dndEnabled: !settings.notifications_enabled,
        restReminder: "Visual",
        restFrequency: settings.focus_duration,
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
  };

  // 将前端嵌套设置转换为后端扁平结构
  const mapToBackendSettings = (frontendDelta: any) => {
    const backendDelta: any = {};

    // 处理focusEnvironment更新
    if (frontendDelta.focusEnvironment) {
      const env = frontendDelta.focusEnvironment;
      if (env.themeMode === "Light") {
        backendDelta.theme = "light";
      } else if (env.themeMode === "Dark") {
        backendDelta.theme = "dark";
      } else {
        backendDelta.theme = "system";
      }
    }

    // 处理notifications更新
    if (frontendDelta.notifications) {
      const notif = frontendDelta.notifications;
      if (notif.restFrequency !== undefined) {
        backendDelta.focus_duration = notif.restFrequency;
      }
      backendDelta.notifications_enabled = !notif.dndEnabled;
    }

    return backendDelta;
  };

  // 处理设置更新
  const handleUpdate = async (frontendDelta: any) => {
    if (!settings) return;

    try {
      // 将前端嵌套结构转换为后端扁平结构
      const backendDelta = mapToBackendSettings(frontendDelta);
      await updateSettings(backendDelta);
    } catch (err) {
      console.error("Failed to update settings:", err);
    }
  };

  // 处理设置重置
  const handleReset = async () => {
    try {
      await resetSettings();
    } catch (err) {
      console.error("Failed to reset settings:", err);
    }
  };

  // 获取适配后的前端设置
  const frontendSettings = mapToFrontendSettings();

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
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-earth-text-sec">Loading settings...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="text-earth-text-error">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-earth-accent text-white rounded-lg hover:bg-earth-accent/90"
          >
            Try again
          </button>
        </div>
      );
    }

    switch (activeId) {
      case "env":
        return (
          <FocusEnvironmentPanel
            settings={frontendSettings}
            onChange={handleUpdate}
            onReset={handleReset}
          />
        );
      case "notif":
        return (
          <NotificationsPanel
            settings={frontendSettings}
            onChange={handleUpdate}
            onReset={handleReset}
          />
        );
      case "privacy":
        return <PrivacySettings />;
      case "account":
        return (
          <AccountSecurityPanel
            settings={frontendSettings}
            onChange={handleUpdate}
            onReset={handleReset}
          />
        );
      case "prefs":
        return (
          <PreferencesPanel
            settings={frontendSettings}
            onChange={handleUpdate}
            onReset={handleReset}
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
        <div className="max-w-2xl mx-auto">{renderPanel()}</div>
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
