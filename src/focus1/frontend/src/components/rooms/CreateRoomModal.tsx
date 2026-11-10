import React, { useState } from "react";
import { Modal, Button } from "../Common";
import { useRoom } from "../../context/RoomContext";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated?: (roomId: string) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onRoomCreated,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<"1:1" | "1:many">("1:1");
  const [virtualAllowed, setVirtualAllowed] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { createRoom, isLoading } = useRoom();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const roomData = await createRoom(name, type, virtualAllowed);
      onClose();
      setName("");
      setError(null);
      // 自动进入房间
      if (roomData && onRoomCreated) {
        onRoomCreated(roomData.id);
      }
    } catch (err: any) {
      console.error("Failed to create room in modal:", err);
      setError(
        err.response?.data?.error || "Failed to create room. Please try again.",
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Room">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-earth-danger/10 border border-earth-danger/30 rounded-lg">
            <p className="text-sm text-earth-danger">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-earth-text mb-1">
            Room Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter room name"
            className="w-full px-3 py-2 border border-earth-border rounded-lg focus:outline-none focus:ring-2 focus:ring-earth-accent focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-earth-text mb-1">
            Room Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="roomType"
                value="1:1"
                checked={type === "1:1"}
                onChange={() => setType("1:1")}
                className="text-earth-accent"
              />
              <span className="text-sm text-earth-text">Duo (1:1)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="roomType"
                value="1:many"
                checked={type === "1:many"}
                onChange={() => setType("1:many")}
                className="text-earth-accent"
              />
              <span className="text-sm text-earth-text">Public (Many)</span>
            </label>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={virtualAllowed}
              onChange={(e) => setVirtualAllowed(e.target.checked)}
              className="text-earth-accent"
            />
            <span className="text-sm text-earth-text">Allow avatars</span>
          </label>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onClose} className="px-4 py-2">
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isLoading}
            className="px-4 py-2"
          >
            {isLoading ? "Creating..." : "Create Room"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
