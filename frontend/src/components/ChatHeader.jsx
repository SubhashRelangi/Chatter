import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const formatLastSeen = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return "last seen just now";
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `last seen ${diffInMinutes}m ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `last seen ${diffInHours}h ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "last seen yesterday";
  }
  return `last seen on ${date.toLocaleDateString()}`;
};

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="border-b border-base-300 px-3 py-2.5 sm:px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/profile.jpg"} alt={selectedUser.username} />
            </div>
          </div>

          {/* User info */}
          <div className="min-w-0">
            <h3 className="font-medium truncate">{selectedUser.username}</h3>
            <p className="text-sm text-base-content/70 truncate">
              {isOnline ? "Online" : formatLastSeen(selectedUser.updatedAt)}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)} className="btn btn-ghost btn-circle btn-sm" aria-label="Back to contacts">
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
