import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { io } from 'socket.io-client';

import Navbar from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';

import { useAuthStore } from './store/useAuthStore.js';

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, setSocket } = useAuthStore();
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';
  const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authUser) {
      setSocket(null);
      useAuthStore.setState({ onlineUsers: [] });
      return;
    }

    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket'],
    });

    setSocket(socket);

    socket.on('getOnlineUsers', (users) => {
      useAuthStore.setState({ onlineUsers: users });
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection failed:', error.message);
    });

    return () => {
      socket.off('getOnlineUsers');
      socket.off('connect_error');
      socket.disconnect();
      setSocket(null);
    };
  }, [authUser, setSocket, socketUrl]);

  const hideNavbarPaths = ['/login', '/signup'];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }
  return (
    <div data-theme='cupcake' className='h-screen flex flex-col'>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#1e293b',
            },
          },
        }}
      />

      {!shouldHideNavbar && <Navbar />}

      <div className={`flex-1 flex ${isProfilePage ? 'overflow-y-auto' : 'overflow-hidden'}`}>
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/" />} />
          <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to="/login" />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
