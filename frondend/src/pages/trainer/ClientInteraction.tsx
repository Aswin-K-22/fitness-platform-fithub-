//src/pages/trianer/ClientInteraction.tsx


import React, { useState, useEffect, useRef } from 'react';
import {
  PaperAirplaneIcon,
  VideoCameraIcon,
  PhoneIcon,
  EllipsisVerticalIcon,
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { HeartIcon, BoltIcon } from '@heroicons/react/24/solid';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import type { RootState } from '../../store/store';
import { fetchTrainerUsersPTPlans, getChatSummary, getConversationMessages } from '../../services/api/trainerApi';
import {
  getTrainerChatSocket,
  sendTrainerMessage,
  joinTrainerConversation,
  trainerTyping,
} from '../../services/sockets/trainerChatSocket';
import type { ITrainerUserWithPlansDTO } from '../../types/dtos/ITrainerUsersPTPlansResponseDTO';
import type {  GetConversationMessagesResponseDTO } from '../../types/chat/chat.types';
import type { MessageDTO, ChatParticipantType, MessageSentAck } from '../../types/chat/chatSocket.types';
import { debounce } from 'lodash';

// Extend MessageDTO to include isPending only
interface IChatMessage  {
    id: string;
  conversationId: string | null;
  senderId: string;
  senderType: ChatParticipantType;
  content: string;
  createdAt: string;
  isPending?: boolean;
}

// Extend IChatSummaryItemDTO to include client and isOnline
interface IExtendedChatSummaryItemDTO {
  participantId: string;
  client: ITrainerUserWithPlansDTO['user'];
  isOnline: boolean;
  conversationId?: string; // Made optional since not all clients have conversations
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    senderType: ChatParticipantType;
    createdAt: string;
  };
  unreadCount?: number;
}

// MessageBubble Component
const MessageBubble: React.FC<{
  message: IChatMessage;
  isClient: boolean;
  clientPic?: string;
  clientName?: string;
}> = ({ message, isClient, clientPic, clientName }) => {
  return (
    <div
      className={`flex ${isClient ? 'justify-start' : 'justify-end'} mb-4 animate-in slide-in-from-bottom-2 duration-300 ${
        message.isPending ? 'opacity-70' : ''
      }`}
    >
      <div className={`max-w-xs lg:max-w-md ${isClient ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
            isClient
              ? 'bg-gradient-to-r from-gray-50 to-white border border-gray-100 text-gray-800'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-blue-200'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <div className={`flex items-center mt-1 space-x-1 ${isClient ? 'justify-start' : 'justify-end'}`}>
          <span className="text-xs text-gray-500">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {message.isPending && !isClient && <span className="text-xs text-gray-400">Sending...</span>}
        </div>
      </div>
      {isClient && clientPic && (
        <div className="order-1 mr-3">
          <img
            src={clientPic}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-md"
            alt={clientName || 'Client'}
          />
        </div>
      )}
    </div>
  );
};

// ClientListItem Component
const ClientListItem: React.FC<{
  client: IExtendedChatSummaryItemDTO;
  isActive: boolean;
  onClick: () => void;
}> = ({ client, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all duration-200 border-b border-gray-100 hover:bg-gray-50 ${
        isActive ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            src={client.client.profilePic || ''}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
            alt={client.client.name}
          />
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 ${client.isOnline ? 'bg-green-400' : 'bg-gray-300'} rounded-full ring-2 ring-white`}
          ></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{client.client.name}</h3>
              <CheckBadgeIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
            </div>
            {client.unreadCount && client.unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {client.unreadCount}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">Client</p>
          {client.lastMessage && (
            <p className="text-xs text-gray-600 truncate mt-1">
              {client.lastMessage.senderType === 'TRAINER' ? 'You: ' : ''}{client.lastMessage.content}
            </p>
          )}
          <span className="text-xs text-gray-400">
            {client.lastMessage?.createdAt &&
              new Date(client.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

// Main Component
const ClientInteraction: React.FC = () => {
  const trainer = useSelector((state: RootState) => state.trainerAuth.trainer);
  const [clients, setClients] = useState<IExtendedChatSummaryItemDTO[]>([]);
  const [selectedClient, setSelectedClient] = useState<IExtendedChatSummaryItemDTO | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const debouncedTyping = debounce((conversationId: string, isTyping: boolean) => {
  console.log(`[ClientInteraction] Emitting typing event: conversationId=${conversationId}, isTyping=${isTyping}`);
  trainerTyping(conversationId, isTyping);
}, 300);



  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch clients and chat summary
  useEffect(() => {
    const fetchClientsAndSummary = async () => {
      try {
        const [clientData, chatSummary] = await Promise.all([
          fetchTrainerUsersPTPlans(),
          getChatSummary(),
        ]);

        // Map all PT plan clients to the extended chat summary format
        const mergedClients = clientData.data?.map((client) => {
          const chatSummaryItem = chatSummary.data?.find((s) => s.participantId === client.user.id);
          return {
            participantId: client.user.id,
            client: client.user,
            isOnline: false, // Default, updated via socket
            conversationId: chatSummaryItem?.conversationId,
            lastMessage: chatSummaryItem?.lastMessage,
            unreadCount: chatSummaryItem?.unreadCount || 0,
          };
        }) || [];

        setClients(mergedClients);

        // Check if a clientId was passed in the location state
        const clientId = location.state?.clientId;
        if (clientId) {
          const selected = mergedClients.find((c) => c.participantId === clientId);
          if (selected) {
            setSelectedClient(selected);
          } else {
            setSelectedClient(mergedClients[0] || null);
          }
        } else if (mergedClients.length > 0) {
          setSelectedClient(mergedClients[0]);
        }
      } catch (error) {
        console.error('Failed to fetch clients or chat summary:', error);
      }
    };

    fetchClientsAndSummary();
  }, [location.state]);

  // Initialize WebSocket and handle events
// Initialize WebSocket and handle events
useEffect(() => {
  const socket = getTrainerChatSocket();
  if (socket && trainer?.id && selectedClient?.conversationId) {
    console.log(`[ClientInteraction] Joining conversationId=${selectedClient.conversationId} for trainerId=${trainer.id}`);
    joinTrainerConversation(selectedClient.conversationId);

    socket.on('joinedConversation', ({ conversationId }) => {
      console.log(`[ClientInteraction] Successfully joined conversationId=${conversationId}`);
    });

    socket.on('error', (error) => {
      console.error(`[ClientInteraction] Socket error for conversationId=${selectedClient.conversationId}:`, error);
    });

    socket.on('conversationCreated', ({ conversationId }: { conversationId: string }) => {
      console.log(`[ClientInteraction] New conversation created: conversationId=${conversationId}`);
      setSelectedClient((prev) =>
        prev ? { ...prev, conversationId } : prev
      );
      joinTrainerConversation(conversationId);
      setClients((prev) =>
        prev.map((c) =>
          c.participantId === selectedClient.participantId
            ? { ...c, conversationId }
            : c
        )
      );
    });

    // Add this new handler for messageSent acknowledgment
    socket.on('messageSent', (ack: MessageSentAck) => {
      if (ack.success && ack.tempId && ack.message) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === ack.tempId
              ? { ...ack.message, isPending: false } as IChatMessage
              : msg
          )
        );
        // Update last message in client list
        setClients((prev) =>
          prev.map((c) =>
            c.conversationId === ack.message?.conversationId
              ? { ...c, lastMessage: ack.message, unreadCount: 0 }
              : c
          )
        );
      } else {
        console.error('Message send failed:', ack.error);
        // Remove optimistic message on failure
        setMessages((prev) => prev.filter((msg) => msg.id !== ack.tempId));
      }
    });

    socket.on('newMessage', (newMessage: MessageDTO) => {
      console.log(`[ClientInteraction] Received newMessage:`, newMessage);
      if (
        newMessage.senderId === selectedClient.participantId &&
        newMessage.conversationId === selectedClient.conversationId
      ) {
        setMessages((prev) => [
          ...prev.filter((m) => !m.isPending || m.id !== newMessage.id),
          { ...newMessage, isPending: false },
        ]);
      }
    });

    socket.on('conversation:typing', (data: { conversationId: string; isTyping: boolean; senderType: ChatParticipantType }) => {
      console.log(`[ClientInteraction] Received typing event:`, data);
      if (data.conversationId === selectedClient.conversationId && data.senderType === 'USER') {
        setIsTyping(data.isTyping);
        if (data.isTyping) {
          setTimeout(() => setIsTyping(false), 2000);
        }
      }
    });

    socket.on('userStatus', (data: { userId: string; status: 'online' | 'offline' }) => {
      console.log(`[ClientInteraction] Received userStatus:`, data);
      setClients((prev) =>
        prev.map((c) =>
          c.participantId === data.userId ? { ...c, isOnline: data.status === 'online' } : c
        )
      );
    });

    return () => {
      socket.off('joinedConversation');
      socket.off('error');
      socket.off('conversationCreated');
      socket.off('messageSent'); // Clean up the new handler
      socket.off('newMessage');
      socket.off('conversation:typing');
      socket.off('userStatus');
    };
  }
}, [selectedClient, trainer]);

  // Fetch messages for selected client
  useEffect(() => {
    if (selectedClient?.conversationId && trainer?.id) {
      const fetchMessages = async () => {
        try {
          const response: GetConversationMessagesResponseDTO = await getConversationMessages(
            selectedClient.conversationId!,
            {
              userId: selectedClient.participantId,
              limit: 50,
            }
          );
          if (response.success && response.data) {
            setMessages(
              response.data.messages.map((msg) => ({
                ...msg,
                isPending: false,
              }))
            );
          }
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        }
      };
      fetchMessages();
    } else {
      // Clear messages if no conversation exists
      setMessages([]);
    }
  }, [selectedClient, trainer]);

  const handleClientSelect = (client: IExtendedChatSummaryItemDTO) => {
    setSelectedClient(client);
    setMessages([]);
  };


const handleSendMessage = async () => {
  if (!messageInput.trim() || !trainer || !selectedClient) return;

  const tempId = `pending-${trainer.id}-${selectedClient.participantId}-${Date.now()}`;
  const newMessage: IChatMessage = {
    id: tempId,
    conversationId: selectedClient.conversationId || null,
    senderId: trainer.id,
    senderType: 'TRAINER',
    content: messageInput,
    createdAt: new Date().toISOString(),
    isPending: true,
  };

  // Optimistic UI update
  setMessages((prev) => [...prev, newMessage]);
  setMessageInput('');

  try {
    sendTrainerMessage({
      conversationId: selectedClient.conversationId || null,
      content: messageInput,
      tempId,
      receiverId: selectedClient.participantId,
      isGroup: false,
    });
    // Note: Do not update clients list here; wait for conversationCreated event
  } catch (error) {
    console.error('Failed to send message:', error);
    setMessages((prev) => prev.filter((m) => m.id !== tempId));
  }
};

  const filteredClients = clients.filter(
    (client) =>
      client.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Sidebar - Client List */}
      <div
        className={`relative bg-white/90 backdrop-blur-xl border-r border-gray-200 shadow-xl transition-all duration-300 ${
          isSidebarOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Clients</h2>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 lg:hidden"
              >
                <Bars3Icon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredClients.map((client) => (
              <ClientListItem
                key={client.participantId}
                client={client}
                isActive={selectedClient?.participantId === client.participantId}
                onClick={() => handleClientSelect(client)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {selectedClient ? (
          <>
            <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 lg:hidden"
                  >
                    <Bars3Icon className="w-6 h-6 text-gray-600" />
                  </button>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={selectedClient.client.profilePic || ''}
                        className="w-12 h-12 rounded-full object-cover ring-3 ring-gradient-to-r from-blue-400 to-purple-500 shadow-lg"
                        alt={selectedClient.client.name}
                      />
                      <div
                        className={`absolute bottom-0 right-0 w-4 h-4 ${
                          selectedClient.isOnline ? 'bg-green-400' : 'bg-gray-300'
                        } rounded-full ring-2 ring-white shadow-md`}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h1 className="text-lg font-bold text-gray-900">{selectedClient.client.name}</h1>
                        <CheckBadgeIcon className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 ${selectedClient.isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-300'} rounded-full`}
                        ></div>
                        <span className="text-sm text-gray-600">
                          {selectedClient.isOnline ? 'Online' : 'Offline'} • Client
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-3 rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    <PhoneIcon className="w-5 h-5" />
                  </button>
                  <button className="p-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    <VideoCameraIcon className="w-5 h-5" />
                  </button>
                  <button className="p-3 rounded-full bg-white/80 text-gray-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    <EllipsisVerticalIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-md">
                  <HeartIcon className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-600">Support your client's fitness journey!</span>
                  <BoltIcon className="w-4 h-4 text-yellow-500" />
                </div>
              </div>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isClient={message.senderType === 'USER'}
                  clientPic={selectedClient.client.profilePic || ''}
                  clientName={selectedClient.client.name}
                />
              ))}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedClient.client.profilePic || ''}
                      className="w-8 h-8 rounded-full object-cover"
                      alt={selectedClient.client.name}
                    />
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 shadow-md">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="bg-white/80 backdrop-blur-xl border-t border-white/20 p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                 <input
  type="text"
  placeholder="Type your message..."
  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg transition-all duration-200 placeholder-gray-500"
  value={messageInput}
  onChange={(e) => {
    setMessageInput(e.target.value);
    if (selectedClient?.conversationId) {
      debouncedTyping(selectedClient.conversationId, e.target.value.length > 0);
    }
  }}
  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
/>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <PaperAirplaneIcon className="w-5 h-5 rotate-45" />
                </button>
              </div>
              <div className="flex items-center justify-center mt-3 space-x-4">
                <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors duration-200">
                  📅 Schedule Session
                </button>
                <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors duration-200">
                  📊 View Progress
                </button>
                <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors duration-200">
                  🍎 Assign Meal Plan
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <HeartIcon className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Client</h3>
              <p className="text-gray-600 max-w-sm">
                Choose a client from the sidebar to start your conversation and support their fitness journey.
              </p>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                View Clients
              </button>
            </div>
          </div>
        )}
      </div>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-10 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
};

export default ClientInteraction;