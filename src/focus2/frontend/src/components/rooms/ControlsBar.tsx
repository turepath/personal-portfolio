import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WHITE_NOISE_TRACKS } from "../../utils/constants";

interface ControlsBarProps {
  isMicOn: boolean;
  onMicToggle: () => void;
  isCamOn: boolean;
  onCamToggle: () => void;
  isVirtualAllowed: boolean;
  isVirtualActive: boolean;
  privacyMode?: "real" | "mask" | "avatar";
  onVirtualToggle: () => void;
  isChatOpen: boolean;
  onChatToggle: () => void;
  isTasksOpen?: boolean;
  onTasksToggle?: () => void;
  onLeave: () => void;
  onStoreClick?: () => void;
  currentEmoji?: string;
  onEmojiChange?: (emoji: string) => void;
  currentBackground?: string;
  onBackgroundChange?: (bgId: string) => void;
  currentNoiseId?: string;
  onNoiseChange?: (noiseId: string) => void;
  isNoiseOn?: boolean;
  onNoiseToggle?: () => void;
  isCreator?: boolean;
}

const DEFAULT_EMOJIS = [
  { char: "🦊", id: "av_fox" },
  { char: "🐱", id: "av_cat" },
  { char: "🐶", id: "av_dog" },
  { char: "🐰", id: "av_rabbit" },
  { char: "🐻", id: "av_bear" },
  { char: "😎", id: "st_cool" },
  { char: "🧐", id: "st_scholar" },
  { char: "😇", id: "st_angel" },
];

const BG_OPTIONS = [
  { id: "forest", name: "Deep Forest", preview: "🌿" },
  { id: "desert", name: "Warm Desert", preview: "🏜️" },
  { id: "space", name: "Starry Sky", preview: "🌌" },
  { id: "solid", name: "Minimalist", preview: "🎨" },
];

export const ControlsBar: React.FC<ControlsBarProps> = ({
  isMicOn,
  onMicToggle,
  isCamOn,
  onCamToggle,
  isVirtualAllowed,
  isVirtualActive,
  privacyMode = "real",
  onVirtualToggle,
  isChatOpen,
  onChatToggle,
  isTasksOpen,
  onTasksToggle,
  onLeave,
  onStoreClick,
  currentEmoji,
  onEmojiChange,
  currentBackground,
  onBackgroundChange,
  currentNoiseId,
  onNoiseChange,
  isNoiseOn,
  onNoiseToggle,
  isCreator = false,
}) => {
  const navigate = useNavigate();
  const [activePopover, setActivePopover] = useState<
    "avatar" | "ambient" | null
  >(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("user_custom_avatar_v2");
    if (saved) setCustomAvatar(saved);
  }, [activePopover]); // Re-check when panel opens

  const handleStickerSelect = (val: string) => {
    onEmojiChange?.(val);
    setActivePopover(null);
  };

  return (
    <div
      className={`absolute bottom-[4vh] left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-1000 w-full max-w-[90%] flex justify-center pointer-events-none transition-all duration-700 ${isChatOpen ? "translate-x-[-60%]" : "-translate-x-1/2"}`}
    >
      <div className="bg-[#1A1A1A]/90 backdrop-blur-3xl rounded-full px-8 py-4 border border-white/10 flex items-center gap-4 shadow-2xl transition-all hover:scale-[1.02] pointer-events-auto relative w-full max-w-[800px]">
        {activePopover === "avatar" && (
          <div className="absolute bottom-full mb-8 left-0 bg-[#222222]/95 backdrop-blur-xl border border-white/10 p-8 rounded-[3rem] shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in duration-300 min-w-[380px]">
            <div className="flex justify-between items-center px-1">
              <div>
                <p className="text-[12px] font-black text-white uppercase tracking-[0.4em]">
                  Identity Hub
                </p>
                <p className="text-[9px] text-white/40 uppercase mt-1 tracking-widest">
                  Select sticker or 3D persona
                </p>
              </div>
              <button
                onClick={() => navigate("/avatar-studio")}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg"
              >
                <i className="fas fa-magic mr-2"></i> Studio
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 max-h-[300px] overflow-y-auto scrollbar-hide pr-1">
              {/* Custom Persona Option */}
              {customAvatar && (
                <button
                  onClick={() => handleStickerSelect(customAvatar)}
                  className={`relative aspect-square flex items-center justify-center rounded-2xl transition-all border overflow-hidden ${currentEmoji === customAvatar ? "border-earth-accent ring-2 ring-earth-accent" : "border-white/10 opacity-60 hover:opacity-100"}`}
                >
                  <img
                    src={customAvatar}
                    className="w-full h-full object-cover"
                    alt="Custom"
                  />
                  <div className="absolute bottom-1 right-1 bg-earth-accent text-[8px] font-black text-white px-1.5 py-0.5 rounded-md">
                    AI
                  </div>
                </button>
              )}

              {/* Default Emojis */}
              {DEFAULT_EMOJIS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleStickerSelect(item.char)}
                  className={`w-16 h-16 flex items-center justify-center text-3xl rounded-2xl transition-all border ${currentEmoji === item.char ? "bg-earth-accent border-earth-accent shadow-lg shadow-earth-accent/30" : "bg-white/5 border-white/5 opacity-40 hover:opacity-100 hover:bg-white/10"}`}
                >
                  {item.char}
                </button>
              ))}

              {/* Entry to Studio when no custom avatar exists */}
              {!customAvatar && (
                <button
                  onClick={() => navigate("/avatar-studio")}
                  className="w-16 h-16 flex flex-col items-center justify-center rounded-2xl bg-white/5 border-2 border-dashed border-white/10 text-white/40 hover:text-white hover:border-pink-400 hover:bg-pink-500/10 transition-all group"
                >
                  <i className="fas fa-plus text-xl mb-1 group-hover:rotate-90 transition-transform"></i>
                  <span className="text-[8px] font-black uppercase">
                    Create
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {activePopover === "ambient" && (
          <div className="absolute bottom-full mb-8 right-0 bg-[#252525] border border-white/10 p-6 rounded-[2.5rem] shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in duration-300 min-w-[320px]">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                White Noise
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={onNoiseToggle}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${isNoiseOn ? "bg-earth-accent border-earth-accent text-white" : "bg-white/5 border-white/10 text-white/40"}`}
                >
                  {isNoiseOn ? "ON" : "OFF"}
                </button>
                {WHITE_NOISE_TRACKS.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => onNoiseChange?.(track.id)}
                    className={`w-10 h-10 flex items-center justify-center text-lg rounded-xl transition-all ${currentNoiseId === track.id ? "bg-white/20 text-white" : "bg-white/5 text-white/30 hover:bg-white/10"}`}
                    title={track.name}
                  >
                    {track.icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                Environment Background
              </p>
              <div className="grid grid-cols-4 gap-3">
                {BG_OPTIONS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => onBackgroundChange?.(bg.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border ${currentBackground === bg.id ? "bg-earth-accent/20 border-earth-accent" : "bg-white/5 border-white/5 hover:bg-white/10"}`}
                  >
                    <span className="text-xl">{bg.preview}</span>
                    <span className="text-[8px] font-black text-white/60 uppercase truncate w-full text-center">
                      {bg.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onMicToggle}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${isMicOn ? "text-white/60 hover:text-white hover:bg-white/10" : "bg-earth-danger text-white shadow-xl ring-8 ring-earth-danger/10"}`}
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMicOn ? (
              <path
                d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v1a7 7 0 01-14 0v-1M12 18.5V23"
                strokeWidth="2.5"
              />
            ) : (
              <path
                d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v1a7 7 0 01-14 0v-1M1 1l22 22"
                strokeWidth="2.5"
              />
            )}
          </svg>
        </button>

        <button
          onClick={onCamToggle}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${isCamOn ? "text-white/60 hover:text-white hover:bg-white/10" : "bg-earth-danger text-white shadow-xl ring-8 ring-earth-danger/10"}`}
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isCamOn ? (
              <path
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                strokeWidth="2.5"
              />
            ) : (
              <path
                d="M1 1l22 22M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14"
                strokeWidth="2.5"
              />
            )}
          </svg>
        </button>

        <div className="w-px h-10 bg-white/10 mx-2"></div>

        {isVirtualAllowed && (
          <div className="flex gap-2">
            <button
              onClick={onVirtualToggle}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex flex-col items-center justify-center transition-all group relative overflow-visible ${isVirtualActive ? "bg-earth-accent text-white shadow-xl ring-8 ring-earth-accent/20" : "text-white/60 hover:text-white hover:bg-white/10"}`}
              title="Cycle Privacy Modes"
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex items-center justify-center transition-transform ${isVirtualActive ? "scale-110" : "grayscale opacity-40"}`}
              >
                {currentEmoji?.startsWith("data:image") ? (
                  <img
                    src={currentEmoji}
                    className="w-full h-full object-cover"
                    alt="Persona"
                  />
                ) : (
                  <span className="text-xl sm:text-2xl">{currentEmoji}</span>
                )}
              </div>
              <div className="absolute -bottom-1 flex gap-0.5">
                <div
                  className={`w-1 h-1 rounded-full ${privacyMode === "real" ? "bg-white/20" : "bg-white"}`}
                ></div>
                <div
                  className={`w-1 h-1 rounded-full ${privacyMode === "mask" ? "bg-white" : "bg-white/20"}`}
                ></div>
                <div
                  className={`w-1 h-1 rounded-full ${privacyMode === "avatar" ? "bg-white" : "bg-white/20"}`}
                ></div>
              </div>
            </button>
            <button
              onClick={() =>
                setActivePopover(activePopover === "avatar" ? null : "avatar")
              }
              className="w-8 h-12 sm:w-10 sm:h-14 flex items-center justify-center text-white/20 hover:text-white/60 transition-colors"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" strokeWidth="3" />
              </svg>
            </button>
          </div>
        )}

        <button
          onClick={() =>
            setActivePopover(activePopover === "ambient" ? null : "ambient")
          }
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all relative ${activePopover === "ambient" ? "bg-earth-accent text-white shadow-xl ring-8 ring-earth-accent/20" : "text-white/60 hover:text-white hover:bg-white/10"}`}
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M3 21v-4m18 4v-4M10 21V11m4 10V11M7 21v-7m10 7v-7M3 10V6a3 3 0 013-3h12a3 3 0 013 3v4M3 10a2 2 0 002 2h14a2 2 0 002-2"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          onClick={onTasksToggle}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all relative ${isTasksOpen ? "bg-earth-accent text-white shadow-xl ring-8 ring-earth-accent/20" : "text-white/60 hover:text-white hover:bg-white/10"}`}
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </button>

        <button
          onClick={onChatToggle}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${isChatOpen ? "bg-earth-accent text-white shadow-xl ring-8 ring-earth-accent/20" : "text-white/60 hover:text-white hover:bg-white/10"}`}
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              strokeWidth="2.5"
            />
          </svg>
        </button>

        <div className="w-px h-8 sm:h-10 bg-white/10 mx-2"></div>

        <button
          onClick={onLeave}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-earth-danger/20 text-earth-danger hover:bg-earth-danger hover:text-white transition-all shadow-xl group"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:rotate-90 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M6 18L18 6M6 6l12 12" strokeWidth="3" />
          </svg>
        </button>
      </div>
    </div>
  );
};
