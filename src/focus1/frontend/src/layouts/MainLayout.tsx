import React, { useState } from "react";
import { NavLink, useLocation, Link, Outlet } from "react-router-dom";
import { AICompanion } from "../components/AICompanion";
import { useNotifications } from "../hooks/useNotifications";
import { useChat } from "../hooks/useChat";
import { usePoints } from "../hooks/usePoints";
import { useAuth } from "../context/AuthContext";

const TopHeader: React.FC = () => {
  const location = useLocation();
  const { counts: notifCounts } = useNotifications();
  const { friends } = useChat();
  const { points, recentGain } = usePoints();
  const { user, isAuthenticated, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isRoomSession = location.pathname.startsWith("/room/");
  const hasUnreadMessages = friends.some((f) => f.unreadCount > 0);
  const totalAlerts = notifCounts.total + (hasUnreadMessages ? 1 : 0);

  if (isRoomSession) return null;

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/rooms", label: "Rooms" },
    { to: "/community", label: "Community" },
    { to: "/messages", label: "Messages", badge: totalAlerts > 0 },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-[var(--header-height)] bg-white/80 backdrop-blur-xl border-b border-earth-border z-[300] flex items-center px-6 md:px-10 justify-between">
      <NavLink to="/" className="flex items-center gap-3 group">
        <div className="w-9 h-9 bg-earth-accent rounded-lg flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
          F
        </div>
        <h1 className="text-earth-text font-black tracking-tighter text-lg hidden sm:block">
          FocusCompanion
        </h1>
      </NavLink>

      <div className="flex-1 flex justify-center px-8 hidden md:flex items-center gap-8">
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-4 py-2 text-[13px] font-black uppercase tracking-widest transition-all rounded-lg relative ${isActive ? "text-earth-accent bg-earth-accent/5" : "text-earth-text-sec hover:text-earth-text hover:bg-earth-bg"}`
              }
            >
              {link.label}
              {link.badge && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-earth-danger rounded-full ring-2 ring-white"></span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4 relative">
        {/* Points Display */}
        <div className="hidden lg:flex items-center gap-2 bg-earth-accent/10 px-3 py-1.5 rounded-full border border-earth-accent/20 relative">
          <span className="text-[10px] font-black text-earth-accent uppercase tracking-widest">
            Points: {points.toLocaleString()}
          </span>
          {recentGain && (
            <div
              key={recentGain.amount}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-earth-success animate-bounce"
            >
              +{recentGain.amount}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `p-2 hidden sm:block transition-all hover:scale-110 ${isActive ? "text-earth-accent" : "text-earth-text-sec hover:text-earth-accent"}`
            }
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
                strokeWidth="2.5"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
          </NavLink>
        </div>

        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 p-1 rounded-full hover:bg-earth-bg transition-all group"
            >
              <img
                src={user?.avatar || "https://picsum.photos/seed/user/100/100"}
                alt="User"
                className="w-9 h-9 rounded-full border border-earth-border shadow-sm group-hover:border-earth-accent"
              />
              <div className="hidden lg:block pr-2 text-left">
                <p className="text-xs font-black text-earth-text leading-none mb-0.5">
                  {user?.name || "User"}
                </p>
                <p className="text-[10px] text-earth-accent font-bold uppercase tracking-tighter">
                  Pro Member
                </p>
              </div>
            </button>

            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-[310]"
                  onClick={() => setIsUserMenuOpen(false)}
                ></div>
                <div className="absolute right-0 mt-4 w-56 bg-white border border-earth-border rounded-2xl shadow-2xl z-[320] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 bg-earth-bg border-b border-earth-border">
                    <p className="text-[10px] font-black uppercase text-earth-text-sec mb-1">
                      ID: {user?.accountID || "00000000"}
                    </p>
                    <p className="text-sm font-bold text-earth-text truncate">
                      {user?.name || "User"}
                    </p>
                  </div>
                  <div className="py-2">
                    <NavLink
                      to="/my"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-earth-text-sec hover:bg-earth-accent/5 hover:text-earth-accent transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          strokeWidth="2"
                        />
                      </svg>
                      My Profile
                    </NavLink>
                    <NavLink
                      to="/store"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-earth-text-sec hover:bg-earth-accent/5 hover:text-earth-accent transition-colors font-bold"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          strokeWidth="2"
                        />
                      </svg>
                      Points Store
                    </NavLink>
                    <NavLink
                      to="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-earth-text-sec hover:bg-earth-accent/5 hover:text-earth-accent transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                          strokeWidth="2"
                        />
                      </svg>
                      Settings
                    </NavLink>
                  </div>
                  <div className="border-t border-earth-border py-2">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-earth-danger hover:bg-earth-danger/5 transition-colors text-left"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          strokeWidth="2"
                        />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-bold text-earth-text hover:text-earth-accent transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-bold text-white bg-earth-accent rounded-lg hover:bg-earth-accent/90 transition-colors shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

const MobileTabs: React.FC = () => {
  const location = useLocation();
  const { counts: notifCounts } = useNotifications();
  const { friends } = useChat();
  const hasUnread =
    notifCounts.total > 0 || friends.some((f) => f.unreadCount > 0);

  if (location.pathname.startsWith("/room/")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-earth-border flex items-center justify-around z-[100] md:hidden">
      {[
        {
          to: "/",
          icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
        },
        {
          to: "/rooms",
          icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
        },
        { to: "/community", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857" },
        {
          to: "/messages",
          icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
          badge: hasUnread,
        },
      ].map((link, idx) => (
        <NavLink
          key={idx}
          to={link.to}
          className={({ isActive }) =>
            `p-3 rounded-xl transition-all relative ${isActive ? "bg-earth-accent/10 text-earth-accent scale-110" : "text-earth-text-sec"}`
          }
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
              strokeWidth="2.5"
              d={link.icon}
            ></path>
          </svg>
          {link.badge && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-earth-danger rounded-full ring-2 ring-white"></span>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const isRoomSession = location.pathname.startsWith("/room/");

  return (
    <div className="min-h-screen flex flex-col bg-earth-bg text-earth-text font-sans">
      <TopHeader />
      <main
        className={`flex-1 flex flex-col ${isRoomSession ? "pt-0" : "pt-[var(--header-height)]"}`}
      >
        <div
          className={`flex-1 flex flex-col ${isRoomSession ? "" : "justify-center items-center min-h-[calc(100vh-var(--header-height))]"}`}
        >
          <div
            className={`${isRoomSession ? "w-full h-full" : "w-full max-w-[var(--max-content-width)] p-6 md:p-10 pb-24 md:pb-16"}`}
          >
            <Outlet />
          </div>
        </div>
      </main>
      {!isRoomSession && <AICompanion />}
      <MobileTabs />
    </div>
  );
};
