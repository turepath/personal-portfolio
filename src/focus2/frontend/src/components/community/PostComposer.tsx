import React, { useState, useRef } from "react";
import { Button } from "../Common";

interface PostComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (
    title: string,
    content: string,
    tags: string[],
    location: string,
    images: string[],
    videos: string[],
  ) => Promise<void>;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  isOpen,
  onClose,
  onPublish,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 文件上传函数
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const newImages: string[] = [];
      const newVideos: string[] = [];

      for (const file of files) {
        try {
          // 上传文件到服务器
          const serverUrl = await uploadFile(file);

          if (file.type.startsWith("image/")) {
            newImages.push(serverUrl);
          } else if (file.type.startsWith("video/")) {
            newVideos.push(serverUrl);
          }
        } catch (error) {
          console.error("File upload error:", error);
          // 如果上传失败，不添加到列表中
          alert(`Failed to upload ${file.name}. Please try again.`);
        }
      }

      setImages((prev) => [...prev, ...newImages]);
      setVideos((prev) => [...prev, ...newVideos]);
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = (index: number, type: "image" | "video") => {
    if (type === "image") {
      setImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setVideos((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && !isPosting) {
      setIsPosting(true);
      try {
        await onPublish(
          title.trim() || "Untitled",
          content.trim(),
          tags,
          location,
          images,
          videos,
        );
        // 重置表单
        setTitle("");
        setContent("");
        setTags([]);
        setLocation("");
        setImages([]);
        setVideos([]);
        onClose();
      } catch (error) {
        console.error("Post failed:", error);
      } finally {
        setIsPosting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in"
        onClick={onClose}
      ></div>
      <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-earth-border bg-earth-bg/20">
          <h2 className="text-xl font-black text-earth-text tracking-tighter">
            Share Your Focus
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-earth-card rounded-full text-earth-text-sec"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto">
          <input
            type="text"
            placeholder="Post Title..."
            className="w-full text-xl font-black text-earth-text border-none focus:ring-0 placeholder:text-earth-text/20 bg-transparent mb-4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
          <div className="mb-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your focus journey..."
              className="w-full bg-earth-bg border-2 border-earth-border rounded-2xl p-4 text-sm font-bold focus:border-earth-accent focus:outline-none resize-none h-32"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] font-black text-earth-text-sec uppercase tracking-widest">
                {content.length}/500
              </span>
            </div>
          </div>

          {/* Media Previews */}
          {(images.length > 0 || videos.length > 0) && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-earth-border mb-6">
              {images.map((img, index) => (
                <div
                  key={`img-${index}`}
                  className="relative w-24 h-24 rounded-2xl overflow-hidden border border-earth-border group"
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover"
                    alt="Selected"
                  />
                  <button
                    onClick={() => handleRemoveMedia(index, "image")}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all"
                  >
                    <svg
                      className="w-4 h-4"
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
              ))}
              {videos.map((video, index) => (
                <div
                  key={`video-${index}`}
                  className="relative w-24 h-24 rounded-2xl overflow-hidden border border-earth-border group"
                >
                  <video src={video} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemoveMedia(index, "video")}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all"
                  >
                    <svg
                      className="w-4 h-4"
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
              ))}
            </div>
          )}

          {/* Upload Button */}
          <div className="flex gap-4 mb-6">
            <Button
              variant="outline"
              className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <i className="fas fa-upload"></i>
              {isUploading ? "Uploading..." : "Add Media"}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              multiple
              className="hidden"
            />
          </div>

          {/* Tags and Location */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-widest block mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g., study, focus, productivity"
                className="w-full bg-earth-bg border-2 border-earth-border rounded-2xl p-3 text-sm font-bold focus:border-earth-accent focus:outline-none"
                onChange={(e) =>
                  setTags(
                    e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter((tag) => tag),
                  )
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-widest block mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g., Library, Home"
                className="w-full bg-earth-bg border-2 border-earth-border rounded-2xl p-3 text-sm font-bold focus:border-earth-accent focus:outline-none"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full h-14 text-sm font-black uppercase tracking-widest shadow-lg"
            disabled={!content.trim() || isPosting || isUploading}
          >
            {isPosting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Sharing...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane mr-2"></i>
                Share Focus
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
