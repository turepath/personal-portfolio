import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Common";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/auth";

const DEFAULT_AVATAR = "https://picsum.photos/seed/user/100/100";
const AVATAR_SIZE = 300;
const AVATAR_QUALITY = 0.9;

interface ImagePreview {
  original: string;
  cropped: string | null;
}

export const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    avatar: "",
    bio: "",
    birthDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<ImagePreview | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const token = localStorage.getItem("access_token") || "";

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.username || user.displayName || "",
        avatar: user.user_photo || user.avatar || "",
        bio: user.bio || "",
        birthDate: user.birthDate || "",
      });
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImagePreview({
          original: event.target?.result as string,
          cropped: null,
        });
        setShowCropModal(true);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imagePreview?.original) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = async () => {
      canvas.width = AVATAR_SIZE;
      canvas.height = AVATAR_SIZE;

      ctx.clearRect(0, 0, AVATAR_SIZE, AVATAR_SIZE);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, AVATAR_SIZE, AVATAR_SIZE);

      const scale = Math.max(AVATAR_SIZE / img.width, AVATAR_SIZE / img.height);
      const x = (AVATAR_SIZE - img.width * scale) / 2;
      const y = (AVATAR_SIZE - img.height * scale) / 2;

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      const croppedDataUrl = canvas.toDataURL("image/jpeg", AVATAR_QUALITY);
      setCroppedImage(croppedDataUrl);
      setImagePreview({
        original: imagePreview.original,
        cropped: croppedDataUrl,
      });
      setShowCropModal(false);

      setUploading(true);
      setError(null);
      try {
        const updatedUser = await authApi.updateUser({
          user_photo: croppedDataUrl,
        });
        setFormData((prev) => ({
          ...prev,
          avatar: updatedUser.user_photo || updatedUser.avatar || "",
        }));
        updateUser(updatedUser);
        setCroppedImage(null);
        setImagePreview(null);
        alert("Avatar updated successfully!");
      } catch (err: any) {
        setError(err.message || "Failed to upload avatar");
      } finally {
        setUploading(false);
      }
    };
    img.src = imagePreview.original;
  };

  const handleCancelCrop = () => {
    setShowCropModal(false);
    setImagePreview(null);
    setCroppedImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const updatedUser = await authApi.updateUser({
        username: formData.name,
        bio: formData.bio,
        birthDate: formData.birthDate,
      });
      updateUser(updatedUser);
      console.log("更新用户信息成功:", updatedUser);
      alert("Profile updated successfully!");
      navigate("/my");
    } catch (err: any) {
      console.error("更新用户信息失败:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center py-10">Loading user data...</div>;
  }

  const avatar = croppedImage || formData.avatar || DEFAULT_AVATAR;

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-earth-card rounded-full text-earth-text-sec"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M15 19l-7-7 7-7" strokeWidth="2.5" />
          </svg>
        </button>
        <h2 className="text-3xl font-black text-earth-text uppercase tracking-tighter">
          Edit Profile
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-earth-border p-8 shadow-xl space-y-8"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <div
            className="relative group cursor-pointer"
            onClick={handleAvatarClick}
          >
            <img
              src={avatar}
              alt="Avatar"
              className="w-32 h-32 rounded-full border-4 border-earth-bg shadow-lg object-cover"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  strokeWidth="2"
                />
                <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase text-earth-text-sec tracking-widest">
            Click to change photo
          </p>
        </div>

        {showCropModal && imagePreview && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">Crop Avatar</h3>
              <div className="flex justify-center mb-4">
                <img
                  src={imagePreview.original}
                  alt="Preview"
                  className="max-w-64 max-h-64 object-contain"
                />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancelCrop}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCropConfirm}
                  className="flex-1"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Finish"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-widest px-1">
              Display Name
            </label>
            <input
              type="text"
              className="w-full bg-earth-bg border border-earth-border rounded-xl px-4 py-3 text-sm focus:border-earth-accent outline-none font-bold"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2 opacity-60">
            <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-widest px-1">
              Account ID (Fixed)
            </label>
            <input
              type="text"
              readOnly
              className="w-full bg-earth-bg border border-earth-border rounded-xl px-4 py-3 text-sm font-mono cursor-not-allowed"
              value={user.accountID}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-widest px-1">
              Personal Bio
            </label>
            <textarea
              className="w-full bg-earth-bg border border-earth-border rounded-xl px-4 py-3 text-sm h-32 resize-none focus:border-earth-accent outline-none"
              placeholder="Tell other scholars about yourself..."
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-widest px-1">
              Birth Month & Year
            </label>
            <input
              type="date"
              className="w-full bg-earth-bg border border-earth-border rounded-xl px-4 py-3 text-sm focus:border-earth-accent outline-none"
              value={formData.birthDate}
              onChange={(e) =>
                setFormData({ ...formData, birthDate: e.target.value })
              }
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="pt-6 border-t border-earth-border flex gap-4">
          <Button
            variant="outline"
            type="button"
            className="flex-1"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Discard
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="flex-1 shadow-lg font-black uppercase tracking-widest"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};
