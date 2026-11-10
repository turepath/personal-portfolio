import React, { useState } from "react";
import { Badge, Button } from "../components/Common";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const My: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyId = () => {
    if (user?.accountID) {
      navigator.clipboard.writeText(user.accountID);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 w-full max-w-4xl mx-auto pb-20">
      <div className="bg-earth-card rounded-[2.5rem] border border-earth-border overflow-hidden shadow-2xl mb-12">
        <div className="h-48 bg-gradient-to-r from-earth-accent/40 to-earth-accent/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-30"></div>
        </div>
        <div className="px-10 pb-10">
          <div className="relative flex justify-between items-end -mt-20 mb-8">
            <div
              className="relative group cursor-pointer"
              onClick={() => navigate("/avatar-studio")}
            >
              <div className="w-40 h-40 rounded-[2.5rem] border-8 border-white shadow-2xl bg-white overflow-hidden relative transition-transform hover:scale-105 active:scale-95">
                <img
                  src={
                    user?.user_photo ||
                    user?.avatar ||
                    "https://picsum.photos/seed/user/100/100"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                  <i className="fas fa-magic text-2xl mb-2"></i>
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Update Studio
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-pink-500 text-white p-2 rounded-full shadow-lg border-4 border-white animate-bounce">
                <i className="fas fa-sparkles"></i>
              </div>
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
                  {user?.username || user?.displayName || "User"}
                </h2>
                <Badge color="accent">Level 24</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div
                  className="flex items-center gap-2 group cursor-pointer bg-white border border-earth-border px-3 py-1.5 rounded-xl shadow-sm"
                  onClick={handleCopyId}
                >
                  <p className="text-[11px] font-mono font-bold text-earth-text-sec">
                    Account ID: {user?.accountID || "00000000"}
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

                {user?.birthDate && (
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
                {user?.bio || "No bio yet"}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-earth-border">
              <div className="bg-white border border-earth-border p-6 rounded-3xl text-center shadow-sm hover:shadow-xl transition-all duration-300">
                <p className="text-[10px] text-earth-text-sec uppercase font-black mb-1 tracking-[0.2em]">
                  Total Points
                </p>
                <p className="text-3xl font-black text-earth-accent">12,450</p>
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
                <p className="text-xs text-earth-text-sec">
                  Completed on March {15 + i}, 2024
                </p>
              </div>
              <Badge color="success">+15 PTS</Badge>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <h3 className="font-black text-xl text-earth-text flex items-center gap-3 uppercase tracking-tighter">
            <div className="w-8 h-8 bg-pink-100 rounded-xl flex items-center justify-center text-pink-500">
              <i className="fas fa-wand-magic-sparkles"></i>
            </div>
            Creative Persona
          </h3>
          <div
            onClick={() => navigate("/avatar-studio")}
            className="bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-pink-200 flex flex-col items-center text-center group hover:border-pink-400 transition-all cursor-pointer bg-gradient-to-br from-white to-pink-50/20"
          >
            <div className="w-20 h-20 bg-pink-100 rounded-3xl flex items-center justify-center mb-6 text-4xl group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner">
              🎨
            </div>
            <p className="font-black text-slate-800 mb-2 uppercase tracking-widest">
              Moe Sticker Studio
            </p>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-medium">
              Use AI to transform your photo into a 3D iOS-style sticker with
              macaron aesthetics.
            </p>
            <button className="mt-6 px-8 py-3 bg-pink-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-pink-200 group-hover:bg-pink-600 transition-all">
              Enter Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
