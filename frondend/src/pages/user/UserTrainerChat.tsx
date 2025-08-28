// src/pages/user/UserTrainerChat.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  PaperAirplaneIcon,
  VideoCameraIcon,
  PhoneIcon,
  EllipsisVerticalIcon,
  CheckIcon,
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { HeartIcon, BoltIcon } from '@heroicons/react/24/solid';
import { useSelector,  } from 'react-redux';
import { useLocation } from 'react-router-dom';
import type { RootState,  } from '../../store/store';
import { getChatSummary, getUserCurrentPTPlans, getConversationMessages } from '../../services/api/userApi';
import { getUserChatSocket, sendUserMessage, joinUserConversation, emitUserTyping, markUserMessageRead } from '../../services/sockets/userChatSocket';
import type { IUserTrainerWithPlansDTO } from '../../types/dtos/IUserCurrentPTPlanDTO';
import type { IChatSummaryItemDTO, GetConversationMessagesResponseDTO } from '../../types/chat/chat.types';
import type { ChatParticipantType, MessageDTO, MessageReadEvent, MessageSentAck, TypingEvent, UserStatusEvent } from '../../types/chat/chatSocket.types';
import { debounce } from 'lodash';

// Define IChatMessage interface to include client-side properties
interface IChatMessage  {
  read: boolean;
  isPending?: boolean;
   id: string;
   conversationId: string | null;
    senderId: string;
    senderType: ChatParticipantType;
    content: string;
    createdAt: string;
}

// Extend IChatSummaryItemDTO with trainer and online status
interface ExtendedChatSummaryItem extends IChatSummaryItemDTO {
  trainer: IUserTrainerWithPlansDTO['trainer'];
  isOnline: boolean;
}

// MessageBubble Component
const MessageBubble: React.FC<{
  message: IChatMessage;
  isTrainer: boolean;
  trainerPic?: string;
  trainerName?: string;
}> = ({ message, isTrainer, trainerPic, trainerName }) => {
  const getStatusIcon = () => {
    if (message.senderType === 'USER') {
      if (message.isPending) {
        return <span className="text-xs text-gray-400">Sending...</span>;
      }
      return message.read ? (
        <div className="flex">
          <CheckIcon className="w-4 h-4 text-blue-500" />
          <CheckIcon className="w-4 h-4 text-blue-500 -ml-2" />
        </div>
      ) : (
        <div className="flex">
          <CheckIcon className="w-4 h-4 text-gray-400" />
          <CheckIcon className="w-4 h-4 text-gray-400 -ml-2" />
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`flex ${isTrainer ? 'justify-start' : 'justify-end'} mb-4 animate-in slide-in-from-bottom-2 duration-300 ${
        message.isPending ? 'opacity-70' : ''
      }`}
    >
      <div className={`max-w-xs lg:max-w-md ${isTrainer ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
            isTrainer
              ? 'bg-gradient-to-r from-gray-50 to-white border border-gray-100 text-gray-800'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-blue-200'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <div className={`flex items-center mt-1 space-x-1 ${isTrainer ? 'justify-start' : 'justify-end'}`}>
          <span className="text-xs text-gray-500">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!isTrainer && getStatusIcon()}
        </div>
      </div>
      {isTrainer && trainerPic && (
        <div className="order-1 mr-3">
          <img
            src={trainerPic}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-md"
            alt={trainerName || 'Trainer'}
          />
        </div>
      )}
    </div>
  );
};

// TrainerListItem Component
const TrainerListItem: React.FC<{
  trainer: ExtendedChatSummaryItem;
  isActive: boolean;
  onClick: () => void;
}> = ({ trainer, isActive, onClick }) => {
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
            src={trainer.trainer.profilePic || ''}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
            alt={trainer.trainer.name}
          />
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 ${trainer.isOnline ? 'bg-green-400' : 'bg-gray-300'} rounded-full ring-2 ring-white`}
          ></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{trainer.trainer.name}</h3>
              <CheckBadgeIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
            </div>
            {trainer.unreadCount && trainer.unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {trainer.unreadCount}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{trainer.trainer.specialties[0]}</p>
          {trainer.lastMessage && (
            <p className="text-xs text-gray-600 truncate mt-1">
              {trainer.lastMessage.senderType === 'USER' ? 'You: ' : ''}{trainer.lastMessage.content}
            </p>
          )}
          <span className="text-xs text-gray-400">
            {trainer.lastMessage?.createdAt &&
              new Date(trainer.lastMessage.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
          </span>
        </div>
      </div>
    </div>
  );
};

// Main Component
const UserTrainerChat: React.FC = () => {
  const user = useSelector((state: RootState) => state.userAuth.user);
  const [trainers, setTrainers] = useState<ExtendedChatSummaryItem[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<ExtendedChatSummaryItem | null>(null);
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch trainers and chat summaries
  useEffect(() => {
    const fetchTrainersAndSummaries = async () => {
      try {
        const [trainersData, summariesData] = await Promise.all([
          getUserCurrentPTPlans(),
          getChatSummary(),
        ]);

        const extendedTrainers: ExtendedChatSummaryItem[] = trainersData.map((trainer) => {
          const summary = summariesData.data?.find(
            (s) => s.participantId === trainer.trainer.id && s.participantRole === 'TRAINER'
          );
          return {
            ...summary,
            trainer: trainer.trainer,
            isOnline: false, // Default, updated via socket
            participantId: trainer.trainer.id!,
            participantRole: 'TRAINER' as const,
            conversationId: summary?.conversationId,
            lastMessage: summary?.lastMessage,
            unreadCount: summary?.unreadCount || 0,
          };
        });

        setTrainers(extendedTrainers);

        // Check if a trainerId was passed in the location state
        const trainerId = location.state?.trainerId;
        if (trainerId) {
          const selected = extendedTrainers.find((t) => t.trainer.id === trainerId);
          if (selected) {
            setSelectedTrainer(selected);
          } else {
            setSelectedTrainer(extendedTrainers[0] || null);
          }
        } else if (extendedTrainers.length > 0) {
          setSelectedTrainer(extendedTrainers[0]);
        }
      } catch (error) {
        console.error('Failed to fetch trainers or chat summaries:', error);
      }
    };
    fetchTrainersAndSummaries();
  }, [location.state]);

  // Initialize WebSocket and handle events
  useEffect(() => {
    const socket = getUserChatSocket();
  if (socket && user?.id && selectedTrainer?.conversationId) {
    console.log(`[UserTrainerChat] Joining conversationId=${selectedTrainer.conversationId} for userId=${user.id}`);
    joinUserConversation(selectedTrainer.conversationId);

    socket.on('joinedConversation', ({ conversationId }) => {
      console.log(`[UserTrainerChat] Successfully joined conversationId=${conversationId}`);
    });

    socket.on('error', (error) => {
      console.error(`[UserTrainerChat] Socket error for conversationId=${selectedTrainer.conversationId}:`, error);
    });



    socket.on('conversationCreated', ({ conversationId }: { conversationId: string }) => {
      console.log(`[UserTrainerChat] New conversation created: conversationId=${conversationId}`);
      setSelectedTrainer((prev) =>
        prev ? { ...prev, conversationId } : prev
      );
      joinUserConversation(conversationId);
      setTrainers((prev) =>
        prev.map((t) =>
          t.trainer.id === selectedTrainer.trainer.id
            ? { ...t, conversationId }
            : t
        )
      );
    });

      // Handle message sent acknowledgment
 socket.on('messageSent', (ack: MessageSentAck) => {
  if (ack.success && ack.tempId && ack.message) {
    setMessages((prev) =>
      prev.map(msg =>
        msg.id === ack.tempId
          ? {
              ...ack.message, // properties from MessageDTO
              read: true,     // or appropriate value
              isPending: false,
              conversationId: ack.message?.conversationId || null,
            } as IChatMessage // explicit casting, optional if shape matches
          : msg
      )
        );
        // Update last message in trainer list
        setTrainers((prev) =>
          prev.map((t) =>
            t.conversationId === ack.message?.conversationId
              ? { ...t, lastMessage: ack.message, unreadCount: 0 }
              : t
          )
        );
      } else {
        console.error('Message send failed:', ack.error);
        // Remove optimistic message on failure
        setMessages((prev) => prev.filter((msg) => msg.id !== ack.tempId));
      }
    });
    

      // Handle new messages
      socket.on('newMessage', (newMessage: MessageDTO) => {
        console.log(`[UserTrainerChat] Received newMessage for conversationId=${newMessage.conversationId}:`, newMessage);

        if (
          newMessage.senderId === selectedTrainer?.trainer.id &&
          newMessage.conversationId === selectedTrainer?.conversationId
        ) {
          setMessages((prev) => [
            ...prev,
            { ...newMessage, read: false, isPending: false },
          ]);
          markUserMessageRead(newMessage.conversationId, newMessage.id);
        }
        // Update unread count in trainer list
        setTrainers((prev) =>
          prev.map((t) =>
            t.conversationId === newMessage.conversationId && t.trainer.id !== selectedTrainer?.trainer.id
              ? { ...t, unreadCount: t.unreadCount + 1, lastMessage: newMessage }
              : t
          )
        );
      });

      // Handle message read acknowledgment
      socket.on('messageRead', (data: MessageReadEvent) => {
        if (data.conversationId === selectedTrainer?.conversationId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === data.messageId ? { ...msg, read: true } : msg
            )
          );
        }
      });

      // Handle typing events
    socket.on('conversation:typing', (data: TypingEvent) => {
      console.log(`[UserTrainerChat] Received typing event:`, data);
      if (
        data.conversationId === selectedTrainer?.conversationId &&
        data.senderType === 'TRAINER'
      ) {
        setIsTyping(data.isTyping);
        if (data.isTyping) {
          setTimeout(() => setIsTyping(false), 2000);
        }
      }
    });


      // Handle user status (online/offline)
  socket.on('userStatus', (data: UserStatusEvent) => {
      console.log(`[UserTrainerChat] Received userStatus event: userId=${data.userId}, status=${data.status}`);
      setTrainers((prev) =>
        prev.map((t) => {
          if (t.trainer.id === data.userId) {
            console.log(`[UserTrainerChat] Updating isOnline for trainerId=${t.trainer.id} to ${data.status === 'online'}`);
            return { ...t, isOnline: data.status === 'online' };
          }
          return t;
        })
      );
    });

      return () => {
        socket.off('joinedConversation');
      socket.off('error');
      socket.off('conversationCreated');
        socket.off('newMessage');
        socket.off('messageRead');
        socket.off('conversation:typing');
        socket.off('userStatus');
      };
    }
  }, [selectedTrainer, user]);

  // Fetch messages for selected trainer
  useEffect(() => {
    if (selectedTrainer?.conversationId && user?.id) {
      const fetchMessages = async () => {
        try {
          const response: GetConversationMessagesResponseDTO = await getConversationMessages(
            selectedTrainer.conversationId!,
            { userId: user.id, limit: 50 }
          );
          if (response.success && response.data?.messages) {
            const messagesWithStatus: IChatMessage[] = response.data.messages.map((msg) => ({
              ...msg,
              read: msg.senderType === 'TRAINER' ? true : false, // Assume trainer messages are read
              isPending: false,
            }));
            setMessages(messagesWithStatus);
            // Mark unread messages as read
            const unreadMessages = messagesWithStatus.filter(
              (msg) => msg.senderType === 'TRAINER' && !msg.read
            );
            if (unreadMessages.length > 0) {
              markUserMessageRead(selectedTrainer.conversationId!);
              setTrainers((prev) =>
                prev.map((t) =>
                  t.conversationId === selectedTrainer.conversationId
                    ? { ...t, unreadCount: 0 }
                    : t
                )
              );
            }
          }
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        }
      };
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedTrainer, user]);

  // Emit typing event
useEffect(() => {
  if (selectedTrainer?.conversationId && messageInput.trim()) {
    const convId = selectedTrainer.conversationId;
    const debouncedEmitTyping = debounce(() => {
      console.log(`[UserTrainerChat] Emitting typing event for conversationId=${convId}, isTyping=true`);
      emitUserTyping(convId, true);
    }, 300);

    debouncedEmitTyping();

    const timeout = setTimeout(() => {
      console.log(`[UserTrainerChat] Emitting typing event for conversationId=${convId}, isTyping=false`);
      emitUserTyping(convId, false);
    }, 2000);

    return () => {
      debouncedEmitTyping.cancel();
      clearTimeout(timeout);
    };
  }
}, [messageInput, selectedTrainer?.conversationId]);



  const handleTrainerSelect = (trainer: ExtendedChatSummaryItem) => {
    setSelectedTrainer(trainer);
    setMessages([]);
  };

// pages/user/UserTrainerChat.tsx
const handleSendMessage = async () => {
  if (!messageInput.trim() || !user || !selectedTrainer || !selectedTrainer.trainer.id) return;

  const tempId = `pending-${user.id}-${selectedTrainer.trainer.id}-${Date.now()}`;
  const newMessage: IChatMessage = {
    id: tempId,
    conversationId: selectedTrainer.conversationId || null,
    senderId: user.id,
    senderType: 'USER',
    content: messageInput,
    createdAt: new Date().toISOString(),
    read: false,
    isPending: true,
  };

  // Optimistic UI update
  setMessages((prev) => [...prev, newMessage]);
  setMessageInput('');

  try {
    sendUserMessage({
      conversationId: selectedTrainer.conversationId || null,
      content: messageInput,
      tempId,
      receiverId: selectedTrainer.trainer.id,
      isGroup: false,
    });
    // Note: Do not update trainers list here; wait for conversationCreated event
  } catch (error) {
    console.error('Failed to send message:', error);
    setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
  }
};



  const filteredTrainers = trainers.filter(
    (trainer) =>
      trainer.trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.trainer.specialties.some((specialty) =>
        specialty.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Sidebar - Trainer List */}
      <div
        className={`relative bg-white/90 backdrop-blur-xl border-r border-gray-200 shadow-xl transition-all duration-300 ${
          isSidebarOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Trainers</h2>
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
                placeholder="Search trainers..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredTrainers.map((trainer) => (
              <TrainerListItem
                key={trainer.trainer.id}
                trainer={trainer}
                isActive={selectedTrainer?.trainer.id === trainer.trainer.id}
                onClick={() => handleTrainerSelect(trainer)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {selectedTrainer ? (
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
                        src={selectedTrainer.trainer.profilePic || ''}
                        className="w-12 h-12 rounded-full object-cover ring-3 ring-gradient-to-r from-blue-400 to-purple-500 shadow-lg"
                        alt={selectedTrainer.trainer.name}
                      />
                      <div
                        className={`absolute bottom-0 right-0 w-4 h-4 ${
                          selectedTrainer.isOnline ? 'bg-green-400' : 'bg-gray-300'
                        } rounded-full ring-2 ring-white shadow-md`}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h1 className="text-lg font-bold text-gray-900">{selectedTrainer.trainer.name}</h1>
                        <CheckBadgeIcon className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 ${selectedTrainer.isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-300'} rounded-full`}
                        ></div>
                        <span className="text-sm text-gray-600">
                          {selectedTrainer.isOnline ? 'Online' : 'Offline'} • {selectedTrainer.trainer.experienceLevel || 'N/A'}
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
              <div className="px-4 pb-4">
                <div className="flex flex-wrap gap-2">
                  {selectedTrainer.trainer.specialties.slice(0, 3).map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200/50"
                    >
                      {specialty}
                    </span>
                  ))}
                  {selectedTrainer.trainer.specialties.length > 3 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      +{selectedTrainer.trainer.specialties.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-md">
                  <HeartIcon className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-600">Your fitness journey continues!</span>
                  <BoltIcon className="w-4 h-4 text-yellow-500" />
                </div>
              </div>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isTrainer={message.senderType === 'TRAINER'}
                  trainerPic={selectedTrainer.trainer.profilePic || ''}
                  trainerName={selectedTrainer.trainer.name}
                />
              ))}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedTrainer.trainer.profilePic || ''}
                      className="w-8 h-8 rounded-full object-cover"
                      alt={selectedTrainer.trainer.name}
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
                    onChange={(e) => setMessageInput(e.target.value)}
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
                  🍎 Meal Plans
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Trainer</h3>
              <p className="text-gray-600 max-w-sm">
                Choose a trainer from the sidebar to start your conversation and continue your fitness journey.
              </p>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                View Trainers
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

export default UserTrainerChat;