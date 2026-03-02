import React from 'react';
import NoSelectedUser from '../components/NoChatSeleted';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import { useChatStore } from '../store/useChatStore';

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-base-100 text-base-content">

      <Sidebar />

      <div className={`min-w-0 flex-1 ${selectedUser ? 'flex' : 'hidden sm:flex'}`}>
        {selectedUser ? (
            <ChatContainer />
        ) : (
          <NoSelectedUser />
        )}
      </div>
    </div>
  );
};

export default HomePage;
