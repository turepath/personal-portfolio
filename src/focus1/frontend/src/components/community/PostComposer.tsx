import React, { useState, useRef, useEffect } from "react";
import { Button } from "../Common";
import { TagsPicker } from "./TagsPicker";
import { LocationPicker } from "./LocationPicker";
import { PostCategory } from "../../types";
import { communityApi } from "../../services/api/community";
import { useAuth } from "../../context/AuthContext";

interface PostComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (
    title: string,
    body: string,
    category: PostCategory,
    tags: string[],
    location: string,
    media: string[],
  ) => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  isOpen,
  onClose,
  onPublish,
}) => {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<PostCategory | null>(null);
  const [activePicker, setActivePicker] = useState<"tags" | "location" | null>(
    null,
  );

  const [selectedMedia, setSelectedMedia] = useState<
    {
      url: string;
      type: "image" | "video";
      isUploading?: boolean;
      error?: string;
    }[]
  >([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [locationName, setLocationName] = useState("");
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setBody("");
      setCategory(null);
      setSelectedMedia([]);
      setSelectedTags([]);
      setLocationName("");
      setActivePicker(null);
    }
  }, [isOpen]);

  const handlePublish = () => {
    if (!category) return;
    onPublish(
      title,
      body,
      category,
      selectedTags,
      locationName,
      selectedMedia.map((m) => m.url),
    );
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !token) return;

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file: File) => {
        // 创建临时预览URL
        const previewUrl = URL.createObjectURL(file);

        // 添加到媒体列表，标记为上传中
        const mediaIndex =
          selectedMedia.length + Array.from(files).indexOf(file);
        setSelectedMedia((prev) => [
          ...prev,
          {
            url: previewUrl,
            type: file.type.startsWith("video/")
              ? ("video" as const)
              : ("image" as const),
            isUploading: true,
          },
        ]);

        try {
          // 上传文件
          const response = await communityApi.uploadFile(token, file);

          // 上传成功，更新URL为服务器返回的路径
          setSelectedMedia((prev) =>
            prev.map((media, idx) => {
              if (idx === mediaIndex) {
                return {
                  url: response.url,
                  type: file.type.startsWith("video/")
                    ? ("video" as const)
                    : ("image" as const),
                };
              }
              return media;
            }),
          );

          return response.url;
        } catch (error) {
          // 上传失败，更新错误状态
          setSelectedMedia((prev) =>
            prev.map((media, idx) => {
              if (idx === mediaIndex) {
                return {
                  url: previewUrl,
                  type: file.type.startsWith("video/")
                    ? ("video" as const)
                    : ("image" as const),
                  error: "Upload failed",
                };
              }
              return media;
            }),
          );

          throw error;
        } finally {
          // 无论成功失败，都标记为上传完成
          setSelectedMedia((prev) =>
            prev.map((media, idx) => {
              if (idx === mediaIndex) {
                return {
                  ...media,
                  isUploading: false,
                };
              }
              return media;
            }),
          );
        }
      });

      // 等待所有文件上传完成
      await Promise.allSettled(uploadPromises);
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-5 border-b border-earth-border flex justify-between items-center bg-earth-card">
          <h2 className="text-xl font-black text-earth-text uppercase tracking-wider">
            Create New Post
          </h2>
          <button
            onClick={onClose}
            className="text-earth-text-sec hover:text-earth-danger p-2 rounded-full hover:bg-white transition-all"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto scrollbar-hide">
          {/* Mandatory Category Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-widest">
              Select Category (Required)
            </label>
            <div className="flex gap-4">
              {(["sharing", "discussion"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex-1 py-3 px-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                    category === cat
                      ? "border-earth-accent bg-earth-accent/5 text-earth-accent"
                      : "border-earth-border text-earth-text-sec hover:bg-earth-bg"
                  }`}
                >
                  <span className="text-sm font-black uppercase tracking-widest">
                    {cat}
                  </span>
                  <span className="text-[10px] opacity-60 font-bold">
                    {cat === "sharing"
                      ? "Tips & Experience"
                      : "Topics & Questions"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            placeholder="Post Title..."
            className="w-full text-2xl font-black text-earth-text border-none focus:ring-0 placeholder:text-earth-text/20 bg-transparent"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="What's on your mind?"
            className="w-full text-lg leading-relaxed text-earth-text-sec border-none focus:ring-0 min-h-[120px] resize-none placeholder:text-earth-text-sec/30 bg-transparent"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          ></textarea>

          {/* Media Previews */}
          {selectedMedia.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-earth-border">
              {selectedMedia.map((m, i) => (
                <div
                  key={i}
                  className="relative w-24 h-24 rounded-2xl overflow-hidden border border-earth-border group"
                >
                  {m.type === "video" ? (
                    <video src={m.url} className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={m.url}
                      className="w-full h-full object-cover"
                      alt="Selected"
                    />
                  )}
                  <button
                    onClick={() =>
                      setSelectedMedia((prev) =>
                        prev.filter((_, idx) => idx !== i),
                      )
                    }
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 18L18 6M6 6l12 12" strokeWidth="3" />
                    </svg>
                  </button>
                  {m.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                  {m.isUploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {m.error && (
                    <div className="absolute inset-0 bg-earth-danger/80 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-earth-border flex items-center justify-center text-earth-text-sec hover:bg-earth-bg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 4v16m8-8H4" strokeWidth="2.5" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-earth-card border-t border-earth-border flex items-center justify-between sticky bottom-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-3 rounded-xl text-earth-text-sec hover:bg-white hover:text-earth-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Add Media"
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <button
              onClick={() => setActivePicker("tags")}
              className={`p-3 rounded-xl transition-all ${activePicker === "tags" ? "bg-earth-accent text-white" : "text-earth-text-sec hover:bg-white hover:text-earth-accent"}`}
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </button>

            <button
              onClick={() => setActivePicker("location")}
              className={`p-3 rounded-xl transition-all ${activePicker === "location" ? "bg-earth-accent text-white" : "text-earth-text-sec hover:bg-white hover:text-earth-accent"}`}
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>

          <Button 
            disabled={!title.trim() || !body.trim() || !category || uploading || selectedMedia.some(m => m.isUploading || m.error)}
            onClick={handlePublish}
            className="px-10 font-black uppercase tracking-widest shadow-lg"
          >
            {uploading ? 'Uploading...' : 'Publish Post'}
          </Button>
        </div>

        {activePicker === "tags" && (
          <TagsPicker
            selectedTags={selectedTags}
            onToggle={(t) =>
              setSelectedTags((prev) =>
                prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
              )
            }
            onClose={() => setActivePicker(null)}
          />
        )}
        {activePicker === "location" && (
          <LocationPicker
            onSelect={(loc) => {
              setLocationName(loc);
              setActivePicker(null);
            }}
            onClose={() => setActivePicker(null)}
          />
        )}
      </div>
    </div>
  );
};
