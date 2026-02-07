import { create } from 'zustand';
import axiosInstance from '../lib/axios.js';
import toast from 'react-hot-toast';

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoading: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  setSocket: (socketInstance) => set({ socket: socketInstance }),

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check');
      if (res.status === 200) {
        set({ authUser: res.data });
      } else {
        set({ authUser: null });
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (userData) => {
    set({ isSigningUp: true });
    const toastId = toast.loading('Signing you up...');

    try {
      const res = await axiosInstance.post('/auth/signup', userData);
      if (res.status === 201) {
        set({ authUser: res.data });
        toast.success('Signup completed!', { id: toastId });
        return;
      }

      toast.error('Signup failed', { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Server error', { id: toastId });
      console.error('Signup error:', error);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    const toastId = toast.loading("Logging you in...");

    try {
      const res = await axiosInstance.post("/auth/login", credentials);
      const user = res.data?.user;

      if (user) {
        set({ authUser: user });
        toast.success("Login completed!", { id: toastId });
      } else {
        toast.error("Login failed. Please try again.", { id: toastId });
      }
    } catch (error) {
      const message = error.response?.data?.message;

      const errorMessages = {
        "User not found": "No account found with this email. Please sign up.",
        "Invalid credentials": "Incorrect email or password.",
      };

      toast.error(errorMessages[message] || "Something went wrong. Please try again later.", {
        id: toastId,
      });

      console.error("Login error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const toastId = toast.loading('Logging you out...');

    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed', { id: toastId });
      return;
    }

    set({ authUser: null, onlineUsers: [] });
    toast.success('Logout completed!', { id: toastId });
  },

  resetAuthState: () =>
    set({
      isSigningUp: false,
      isLoading: false,
      isUpdatingProfile: false,
    }),

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });

    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
    } catch (error) {
      console.error("Error in updateProfile:", error);

      // Handle network errors and unexpected cases
      if (error.code === "ERR_NETWORK") {
        toast.error("Network error. Please check your connection.");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Unexpected error occurred.");
      }
    } finally {
      set({ isUpdatingProfile: false });
    }
  }
}));
