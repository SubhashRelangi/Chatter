import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import { useUIStore } from "../store/useUIStore";
import { formatRelativeTime } from "../lib/utils";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <>
        <div
            className={`fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
            onClick={toggleSidebar}
        ></div>
        <aside
            className={`fixed top-0 left-0 h-full w-72 bg-base-100 border-r border-base-300 z-50 transform transition-transform duration-300 ease-in-out sm:relative sm:translate-x-0 sm:w-20 lg:w-72 ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
          <div className="border-b border-base-300 w-full p-5">
            <div className="flex items-center gap-2">
              <Users className="size-6" />
              <span className="font-medium">Contacts</span>
            </div>
            {/* TODO: Online filter toggle */}
            <div className="mt-3 hidden lg:flex items-center gap-2">
              <label className="cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showOnlineOnly}
                  onChange={(e) => setShowOnlineOnly(e.target.checked)}
                  className="checkbox checkbox-sm"
                />
                <span className="text-sm">Show online only</span>
              </label>
              <span className="text-xs text-base-content/70">({Math.max(onlineUsers.length - 1, 0)} online)</span>
            </div>
          </div>

          <div className="overflow-y-auto w-full py-3">
            {filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => {
                    setSelectedUser(user);
                    if(isSidebarOpen) toggleSidebar();
                }}
                className={`
                  w-full p-3 flex items-center gap-3
                  hover:bg-base-300 transition-colors
                  ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                `}
              >
                <div className="relative avatar">
                    <div className="w-12 rounded-full">
                        <img
                            src={user.profilePic || "/profile.jpg"}
                            alt={user.username}
                        />
                    </div>
                  {onlineUsers.includes(user._id) && (
                    <span
                      className="absolute bottom-0 right-0 size-3 bg-success 
                      rounded-full ring-2 ring-base-content"
                    />
                  )}
                </div>

                {/* User info - only visible on larger screens */}
                <div className="flex justify-between w-full">
                    <div className="text-left min-w-0">
                        <div className="font-medium truncate">{user.username}</div>
                        <div className="text-sm text-base-content/70 truncate">
                            {user.lastMessage ? (user.lastMessage.text || "Image") : "No messages yet"}
                        </div>
                    </div>
                    <div className="text-right text-xs text-base-content/50">
                        <div>{onlineUsers.includes(user._id) ? "Online" : ""}</div>
                        <div>
                            {user.lastMessage ? formatRelativeTime(user.lastMessage.createdAt) : ""}
                        </div>
                    </div>
                </div>
              </button>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center text-base-content/50 py-4">No online users</div>
            )}
          </div>
        </aside>
    </>
  );
};
export default Sidebar;
