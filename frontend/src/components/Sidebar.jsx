import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useUIStore } from "../store/useUIStore.js";
import { formatRelativeTime } from "../lib/utils";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { isSidebarOpen, closeSidebar } = useUIStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const showMobileContactsPanel = !selectedUser;
  const isMobileDrawerVisible = Boolean(selectedUser && isSidebarOpen);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  const asideClassName = `
    flex h-full flex-col overflow-hidden border-r border-base-300 bg-base-100
    transition-transform duration-300 ease-in-out
    sm:relative sm:translate-x-0 sm:w-24 md:w-72 lg:w-80
    ${showMobileContactsPanel ? "relative z-20 w-full translate-x-0" : "fixed inset-y-0 left-0 z-50 w-[82vw] max-w-xs"}
    ${showMobileContactsPanel || isMobileDrawerVisible ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
  `;

  return (
    <>
      {isMobileDrawerVisible && (
        <div className="fixed inset-0 z-40 bg-black/40 sm:hidden" onClick={closeSidebar} aria-hidden="true" />
      )}

      <aside className={asideClassName}>
        <div className="shrink-0 border-b border-base-300 p-4 lg:p-5">
          <div className="flex items-center gap-2 sm:justify-center md:justify-start">
            <Users className="size-6" />
            <span className="font-medium sm:hidden md:inline">Contacts</span>
          </div>

          <div className="mt-3 flex items-center gap-2 sm:hidden md:flex">
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

        <div className="flex-1 overflow-y-auto py-3">
          {isUsersLoading ? (
            <div className="px-3">
              <SidebarSkeleton />
            </div>
          ) : (
            <>
              {filteredUsers.map((user) => {
                const lastMessagePreview = user.lastMessage
                  ? user.lastMessage.isEncrypted
                    ? "Encrypted message"
                    : user.lastMessage.text || "Image"
                  : "No messages yet";

                return (
                  <button
                    key={user._id}
                    onClick={() => {
                      setSelectedUser(user);
                      closeSidebar();
                    }}
                    className={`
                      w-full p-3 flex items-center gap-3 transition-colors
                      hover:bg-base-300 sm:justify-center md:justify-start
                      ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                    `}
                  >
                    <div className="relative avatar shrink-0">
                      <div className="w-12 rounded-full">
                        <img src={user.profilePic || "/profile.jpg"} alt={user.username} />
                      </div>
                      {onlineUsers.includes(user._id) && (
                        <span className="absolute bottom-0 right-0 size-3 rounded-full bg-success ring-2 ring-base-content" />
                      )}
                    </div>

                    <div className="min-w-0 w-full sm:hidden md:flex md:items-start md:justify-between">
                      <div className="min-w-0 text-left">
                        <div className="truncate font-medium">{user.username}</div>
                        <div className="truncate text-sm text-base-content/70">
                          {lastMessagePreview}
                        </div>
                      </div>
                      <div className="text-right text-xs text-base-content/50">
                        <div>{onlineUsers.includes(user._id) ? "Online" : ""}</div>
                        <div>{user.lastMessage ? formatRelativeTime(user.lastMessage.createdAt) : ""}</div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-base-content/50">
                  {showOnlineOnly ? "No online users" : "No contacts yet"}
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
