/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageBubble from '../../components/common/trainer/MessageBubble'; // Reusing trainer's MessageBubble

// Dummy interface for messages
interface IMessage {
  id: string;
  sender: 'user' | 'trainer';
  content: string;
  timestamp: string;
}

// Dummy trainer data (consistent with UserProfile.tsx)
const dummyTrainer = {
  name: 'John Smith',
  email: 'john.smith@fitapp.com',
  specialization: 'Strength Training & Nutrition',
  contactNumber: '+1-555-123-4567',
  profilePic: '/images/trainers/john-smith.jpg',
  isOnline: true,
  lastSession: 'Yesterday',
};

// Dummy messages
const dummyMessages: IMessage[] = [
  {
    id: '1',
    sender: 'trainer',
    content: 'Hey! How’s your workout going today?',
    timestamp: '10:30 AM',
  },
  {
    id: '2',
    sender: 'user',
    content: 'It’s going great! Just finished my cardio session.',
    timestamp: '10:35 AM',
  },
  {
    id: '3',
    sender: 'trainer',
    content: 'Awesome! Make sure to stretch afterward.',
    timestamp: '10:40 AM',
  },
];

const UserTrainerChat: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<IMessage[]>(dummyMessages);
  const [messageInput, setMessageInput] = useState('');
  const [trainer] = useState<any>(dummyTrainer); // Using any for dummy data

  // Simulate fetching trainer data (already set as dummy)
  useEffect(() => {
    // In a real app, fetch trainer data here
    // For now, using dummyTrainer directly
  }, []);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: IMessage = {
        id: Date.now().toString(),
        sender: 'user',
        content: messageInput,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setMessageInput('');
      // TODO: Send message to backend via API
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex max-w-7xl mx-auto w-full mt-16">
        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col bg-white rounded-xl shadow-lg">
          {trainer ? (
            <>
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {trainer.profilePic ? (
                      <img
                        src={trainer.profilePic}
                        className="h-12 w-12 rounded-full object-cover"
                        alt={trainer.name}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {trainer.name?.charAt(0).toUpperCase() || 'T'}
                        </span>
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">{trainer.name}</h2>
                      <p className="text-sm text-gray-500">
                        {trainer.isOnline ? 'Online' : 'Offline'} • Last session: {trainer.lastSession}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      className="rounded-md px-4 py-2 bg-blue-500 text-white font-medium hover:bg-blue-600"
                      onClick={() => navigate('/user/profile')}
                    >
                      Back to Profile
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isTrainer={message.sender === 'trainer'}
                  />
                ))}
              </div>
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    className="rounded-md px-4 py-2 bg-blue-500 text-white font-medium hover:bg-blue-600"
                    onClick={handleSendMessage}
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">No trainer assigned. Please contact support.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserTrainerChat;