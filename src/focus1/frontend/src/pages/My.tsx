import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button } from "../components/Common";
import { useAuth } from "../context/AuthContext";

export const My: React.FC = () => {
  const navigate = useNavigate();
  const [copySuccess, setCopySuccess] = useState(false);
  const { user } = useAuth();

  const handleCopyId = () => {
    if (user) {
      navigator.clipboard.writeText(user.accountID);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (!user) {
    return <div className="text-center py-10">Loading user data...</div>;
  }

  return (
    <div className="animate-in fade-in duration-500 w-full max-w-4xl mx-auto pb-20">
      <div className="bg-earth-card rounded-[2.5rem] border border-earth-border overflow-hidden shadow-2xl mb-12">
        <div className="h-48 bg-gradient-to-r from-earth-accent/40 to-earth-accent/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-30"></div>
        </div>
        <div className="px-10 pb-10">
          <div className="relative flex justify-between items-end -mt-20 mb-8">
            <div className="relative group">
              <img
                src={user.avatar}
                alt="Profile"
                className="w-40 h-40 rounded-[2rem] border-8 border-white shadow-2xl object-cover"
              />
              {user.isPro && (
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-earth-accent rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex gap-4 mb-4">
              <Button
                variant="primary"
                className="px-8 py-3 text-xs font-black uppercase tracking-widest shadow-xl"
                onClick={() => navigate("/edit-profile")}
              >
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-4xl font-black text-earth-text tracking-tighter">
                  {user.name}
                </h2>
                <Badge color="accent">Level 24</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Account ID Display */}
                <div
                  className="flex items-center gap-2 group cursor-pointer bg-white border border-earth-border px-3 py-1.5 rounded-xl shadow-sm"
                  onClick={handleCopyId}
                >
                  <p className="text-[11px] font-mono font-bold text-earth-text-sec">
                    Account ID: {user.accountID}
                  </p>
                  <button className="text-earth-text-sec transition-all">
                    {copySuccess ? (
                      <span className="text-[9px] font-black text-earth-success uppercase tracking-tighter">
                        Copied
                      </span>
                    ) : (
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        ></path>
                      </svg>
                    )}
                  </button>
                </div>

                {user.birthDate && (
                  <div className="flex items-center gap-2 bg-white border border-earth-border px-3 py-1.5 rounded-xl shadow-sm">
                    <svg
                      className="w-3.5 h-3.5 text-earth-text-sec"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"
                        strokeWidth="2.5"
                      />
                    </svg>
                    <span className="text-[11px] font-bold text-earth-text-sec uppercase tracking-tighter">
                      Born:{" "}
                      {new Date(user.birthDate).toLocaleDateString(undefined, {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-earth-text-sec text-lg mt-6 leading-relaxed max-w-2xl font-medium">
                {user.bio || "Tell other scholars about yourself..."}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-earth-border">
              <div className="bg-white border border-earth-border p-6 rounded-3xl text-center shadow-sm hover:shadow-xl transition-all duration-300">
                <p className="text-[10px] text-earth-text-sec uppercase font-black mb-1 tracking-[0.2em]">
                  Total Points
                </p>
                <p className="text-3xl font-black text-earth-accent">
                  {user.points.toLocaleString()}
                </p>
              </div>
              <div className="bg-white border border-earth-border p-6 rounded-3xl text-center shadow-sm hover:shadow-xl transition-all duration-300">
                <p className="text-[10px] text-earth-text-sec uppercase font-black mb-1 tracking-[0.2em]">
                  Study Time
                </p>
                <p className="text-3xl font-black text-earth-accent">142h</p>
              </div>
              <div className="bg-white border border-earth-border p-6 rounded-3xl text-center shadow-sm hover:shadow-xl transition-all duration-300">
                <p className="text-[10px] text-earth-text-sec uppercase font-black mb-1 tracking-[0.2em]">
                  Completed
                </p>
                <p className="text-3xl font-black text-earth-accent">54</p>
              </div>
              <div className="bg-white border border-earth-border p-6 rounded-3xl text-center shadow-sm hover:shadow-xl transition-all duration-300">
                <p className="text-[10px] text-earth-text-sec uppercase font-black mb-1 tracking-[0.2em]">
                  Global Rank
                </p>
                <p className="text-3xl font-black text-earth-accent">#42</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h3 className="font-black text-xl text-earth-text flex items-center gap-3 uppercase tracking-tighter">
            <div className="w-8 h-8 bg-earth-accent/20 rounded-xl flex items-center justify-center text-earth-accent">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            Recent Progress
          </h3>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-earth-border flex items-center justify-between shadow-sm hover:shadow-md transition-all"
            >
              <div>
                <p className="font-black text-earth-text">Deep Work Session</p>
                <p className="text-xs text-earth-text-sec font-bold opacity-60">
                  Oct {20 + i}, 2024 • 2h 15m
                </p>
              </div>
              <Badge color="success">+25 pts</Badge>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <h3 className="font-black text-xl text-earth-text flex items-center gap-3 uppercase tracking-tighter">
            <div className="w-8 h-8 bg-earth-accent/20 rounded-xl flex items-center justify-center text-earth-accent">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                ></path>
              </svg>
            </div>
            Favorite Spaces
          </h3>
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-3xl border border-earth-border flex items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 bg-earth-bg rounded-2xl overflow-hidden shadow-inner border border-earth-border shrink-0">
                <img
                  src={`https://picsum.photos/seed/room${i}/100/100`}
                  alt="Room"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="flex-1">
                <p className="font-black text-earth-text">Focus Library {i}</p>
                <p className="text-[10px] text-earth-text-sec font-bold uppercase tracking-widest opacity-60">
                  15 Participants Live
                </p>
              </div>
              <button className="w-10 h-10 bg-earth-accent/10 rounded-full flex items-center justify-center text-earth-accent group-hover:bg-earth-accent group-hover:text-white transition-all">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
