import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore.js";
import { ArrowLeft, Camera, Mail, User } from "lucide-react";
import { toast } from "react-hot-toast";

export const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const { setSelectedUser } = useChatStore();
  const navigate = useNavigate();

  const [selectedImg, setSelectedImg] = useState(null);
  const [newUsername, setNewUsername] = useState(authUser?.username || "");
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  const handleBack = () => {
    setSelectedUser(null);
    navigate('/');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image); // Optimistic UI update

      try {
        await updateProfile({ profilePic: base64Image });
        toast.success("Profile picture updated!");
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error(
          error.code === "ERR_NETWORK"
            ? "Network error. Please check your connection."
            : error.response?.data?.message || "Something went wrong."
        );
      }
    };
  };

  const handleUsernameUpdate = async () => {
    if (!newUsername.trim()) return toast.error("Username can't be empty");
    if (newUsername === authUser.username) {
      setIsEditingUsername(false);
      return;
    }

    try {
      await updateProfile({ username: newUsername });
      toast.success("Username updated!");
      setIsEditingUsername(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update username"
      );
    }
  };

  return (
    <div className="w-full h-full flex justify-center bg-base-200 pt-20">
        <div className="bg-base-100 rounded-xl p-6 space-y-8 shadow-lg w-full max-w-2xl h-fit mb-20">
          {/* Header */}
          <div className="flex items-center justify-center relative">
            <button onClick={handleBack} className="btn btn-ghost btn-circle sm:hidden absolute left-0">
                <ArrowLeft className="size-6" />
            </button>
            <h1 className="text-2xl font-semibold">Profile</h1>
          </div>
          <p className="mt-2 text-base-content/60 text-center">Your profile information</p>

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <img
                src={selectedImg || authUser.profilePic || "/profile.jpg"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 border-primary"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 bg-primary hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                  isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                }`}
              >
                <Camera className="w-5 h-5 text-base-100" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-base-content/60">
              {isUpdatingProfile
                ? "Uploading..."
                : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* Username Section */}
          <div className="space-y-1.5">
            <div className="text-sm text-base-content/60 flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </div>

            {isEditingUsername ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  disabled={isUpdatingProfile}
                />
                <button
                  className="btn btn-success"
                  onClick={handleUsernameUpdate}
                  disabled={isUpdatingProfile}
                >
                  Confirm
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setNewUsername(authUser.username);
                    setIsEditingUsername(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div
                className="px-4 py-2.5 bg-base-200 rounded-lg border border-base-300 flex justify-between items-center cursor-pointer hover:bg-base-300 transition"
                onClick={() => setIsEditingUsername(true)}
              >
                <span>{authUser?.username}</span>
                <span className="text-primary text-sm">Edit</span>
              </div>
            )}
          </div>

          {/* Email Section */}
          <div className="space-y-1.5">
            <div className="text-sm text-base-content/60 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </div>
            <p className="px-4 py-2.5 bg-base-200 rounded-lg border border-base-300">
              {authUser?.email}
            </p>
          </div>

          {/* Account Info */}
          <div className="mt-6 bg-base-100 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-base-300">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-success">Active</span>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};
