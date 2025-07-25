/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatCard from '../../components/common/trainer/ChatCard';
import MessageBubble from '../../components/common/trainer/MessageBubble';
import ClientDetails from '../../components/common/trainer/ClientDetails';
import { fetchClients, fetchMessages, fetchFeedback, fetchSessions } from '../../services/api/trainerApi';
import type { IClient, IClientFeedback, IClientSession, IMessage } from '../../types/dtos/IClientInteractionDTO';

const ClientInteraction: React.FC = () => {
  const [clients, setClients] = useState<IClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [feedback, setFeedback] = useState<IClientFeedback | null>(null);
  const [sessions, setSessions] = useState<IClientSession[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [filter, setFilter] = useState<'All' | 'Online' | 'Unread'>('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await fetchClients();
        setClients(response);
        if (response.length > 0) {
          setSelectedClient(response?.[0]);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      const loadClientData = async () => {
        try {
          const [messagesData, feedbackData, sessionsData] = await Promise.all([
            fetchMessages(),
            fetchFeedback(),
            fetchSessions(),
          ]);
          setMessages(messagesData);
          setFeedback(feedbackData);
          setSessions(sessionsData);
        } catch (error) {
          console.error('Error fetching client data:', error);
        }
      };
      loadClientData();
    }
  }, [selectedClient]);

  const handleSendMessage = async () => {
    if (messageInput.trim() && selectedClient) {
      const newMessage: IMessage = {
        id: Date.now().toString(),
        sender: 'trainer',
        content: messageInput,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setMessageInput('');
      // TODO: Send message to backend via trainerApi
    }
  };

  const filteredClients = clients.filter((client) => {
    if (filter === 'Online') return client.isOnline;
    if (filter === 'Unread') return client.unreadCount > 0;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex max-w-8xl mx-auto w-full">
        {/* Mobile Sidebar Toggle */}
        <button
          className="lg:hidden p-4 text-gray-500"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <i className="fas fa-bars"></i>
        </button>

        {/* Client List Sidebar */}
        <aside
          className={`w-full lg:w-80 border-r border-gray-200 bg-white lg:block ${
            isSidebarOpen ? 'block' : 'hidden'
          }`}
        >
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search clients..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-custom focus:border-custom"
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
            <div className="mt-4 flex space-x-2">
              {['All', 'Online', 'Unread'].map((f) => (
                <button
                  key={f}
                  className={`!rounded-button px-3 py-1.5 text-sm font-medium ${
                    filter === f ? 'bg-custom text-white' : 'bg-white text-gray-600 border border-gray-300'
                  }`}
                  onClick={() => setFilter(f as any)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-12rem)]">
            {filteredClients.map((client) => (
              <ChatCard
                key={client.id}
                client={client}
                isSelected={selectedClient?.id === client.id}
                onSelect={() => {
                  setSelectedClient(client);
                  setIsSidebarOpen(false);
                }}
              />
            ))}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col bg-white">
          {selectedClient ? (
            <>
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedClient.avatar}
                      className="h-12 w-12 rounded-full object-cover"
                      alt={selectedClient.name}
                    />
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">{selectedClient.name}</h2>
                      <p className="text-sm text-gray-500">
                        {selectedClient.isOnline ? 'Online' : 'Offline'} • Last workout:{' '}
                        {selectedClient.lastSession}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      className="!rounded-button px-4 py-2 bg-custom text-blue-950 font-medium"
                      onClick={() => navigate(`/trainer/client-plan/${selectedClient.id}`)}
                    >
                      <i className="fas fa-dumbbell mr-2"></i>Workout & Diet Plan
                    </button>
                    <button className="!rounded-button p-2 text-gray-400 hover:text-custom">
                      <i className="fas fa-phone"></i>
                    </button>
                    <button className="!rounded-button p-2 text-gray-400 hover:text-custom">
                      <i className="fas fa-video"></i>
                    </button>
                    <button className="!rounded-button p-2 text-gray-400 hover:text-custom">
                      <i className="fas fa-ellipsis-h"></i>
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
                  <button className="!rounded-button p-2 text-gray-400 hover:text-custom">
                    <i className="fas fa-paperclip"></i>
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-custom focus:border-custom"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button className="!rounded-button p-2 text-gray-400 hover:text-custom">
                    <i className="fas fa-microphone"></i>
                  </button>
                  <button
                    className="!rounded-button px-4 py-2 bg-custom text-white font-medium"
                    onClick={handleSendMessage}
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Select a client to start chatting</p>
            </div>
          )}
        </main>

        {/* Client Details Sidebar */}
        <ClientDetails feedback={feedback} sessions={sessions} />
      </div>
    </div>
  );
};

export default ClientInteraction;