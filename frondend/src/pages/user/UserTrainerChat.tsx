import React, { useState, useEffect, useRef } from 'react';
import { 
  PaperAirplaneIcon, 
  VideoCameraIcon, 
  PhoneIcon, 
  EllipsisVerticalIcon,

  CheckIcon,
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { HeartIcon, BoltIcon } from '@heroicons/react/24/solid';

// DTOs
interface IUserPurchaseDTO {
  id: string | null;
  status: string;
  startDate: string;
  endDate: string;
  paymentId?: string | null;
  price?: number | null;
  currency: string;
  paymentStatus?: string | null;
  paymentDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface IUserPlanWithPurchaseDTO {
  plan: {
    id: string | null;
    title: string;
    category: string;
    mode: string;
    description: string;
    goal: string;
    features: string[];
    duration: number;
    image: string | null;
    trainerPrice: number;
    totalPrice: number | null;
    verifiedByAdmin: boolean;
  };
  purchase: IUserPurchaseDTO;
}

interface IUserTrainerWithPlansDTO {
  trainer: {
    id: string | null;
    name: string;
    profilePic: string | null;
    specialties: string[];
    experienceLevel?: string | null;
    bio?: string | null;
  };
  plans: IUserPlanWithPurchaseDTO[];
  lastMessage?: IMessage;
  unreadCount?: number;
  isOnline?: boolean;
}

interface IMessage {
  id: string;
  sender: 'user' | 'trainer';
  content: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'workout';
}

// Dummy data for multiple trainers
const dummyTrainers: IUserTrainerWithPlansDTO[] = [
  {
    trainer: {
      id: '1',
      name: 'Sarah Mitchell',
      profilePic: 'https://images.unsplash.com/photo-1594736797933-d0c95d7a0fa0?w=150&h=150&fit=crop&crop=face',
      specialties: ['HIIT Training', 'Nutrition Coaching', 'Weight Loss', 'Strength Building'],
      experienceLevel: 'Expert (8+ years)',
      bio: 'Certified personal trainer specializing in transformative fitness journeys.',
    },
    plans: [{
      plan: {
        id: '1',
        title: 'Premium Transformation Package',
        category: 'Weight Loss',
        mode: 'Hybrid',
        description: 'Complete body transformation with personalized workouts and nutrition',
        goal: 'Lose 15-20 lbs in 12 weeks',
        features: ['1-on-1 Sessions', 'Meal Planning', '24/7 Support', 'Progress Tracking'],
        duration: 84,
        image: null,
        trainerPrice: 299,
        totalPrice: 399,
        verifiedByAdmin: true,
      },
      purchase: {
        id: '1',
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2024-04-15',
        paymentId: 'pay_123456',
        price: 399,
        currency: 'USD',
        paymentStatus: 'completed',
        paymentDate: '2024-01-15',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
      },
    }],
    lastMessage: {
      id: '5',
      sender: 'trainer',
      content: 'Great question! Yes, do a 5-minute light warm-up. I\'ll send you the workout plan in a moment.',
      timestamp: '2:36 PM',
      status: 'sent',
    },
    unreadCount: 0,
    isOnline: true,
  },
  {
    trainer: {
      id: '2',
      name: 'Mike Johnson',
      profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      specialties: ['Strength Training', 'Powerlifting', 'Muscle Building'],
      experienceLevel: 'Expert (10+ years)',
      bio: 'Former competitive powerlifter, now helping others build strength and muscle.',
    },
    plans: [{
      plan: {
        id: '2',
        title: 'Strength & Power Program',
        category: 'Strength Building',
        mode: 'In-Person',
        description: 'Build serious strength with powerlifting techniques',
        goal: 'Increase lifts by 30% in 16 weeks',
        features: ['1-on-1 Sessions', 'Form Correction', 'Competition Prep'],
        duration: 112,
        image: null,
        trainerPrice: 450,
        totalPrice: 550,
        verifiedByAdmin: true,
      },
      purchase: {
        id: '2',
        status: 'active',
        startDate: '2024-02-01',
        endDate: '2024-05-25',
        paymentId: 'pay_789012',
        price: 550,
        currency: 'USD',
        paymentStatus: 'completed',
        paymentDate: '2024-02-01',
        createdAt: '2024-02-01',
        updatedAt: '2024-02-01',
      },
    }],
    lastMessage: {
      id: '1',
      sender: 'trainer',
      content: 'Hey! Ready for deadlift day? We\'re going for a new PR today! 💪',
      timestamp: '1:45 PM',
      status: 'read',
    },
    unreadCount: 3,
    isOnline: true,
  },
  {
    trainer: {
      id: '3',
      name: 'Emma Davis',
      profilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      specialties: ['Yoga', 'Flexibility', 'Mindfulness', 'Recovery'],
      experienceLevel: 'Expert (6+ years)',
      bio: 'Yoga instructor focused on mind-body connection and holistic wellness.',
    },
    plans: [{
      plan: {
        id: '3',
        title: 'Mindful Movement Program',
        category: 'Flexibility',
        mode: 'Virtual',
        description: 'Improve flexibility and mindfulness through yoga',
        goal: 'Better flexibility and mental wellness',
        features: ['Virtual Sessions', 'Meditation Guides', 'Flexibility Tracking'],
        duration: 60,
        image: null,
        trainerPrice: 180,
        totalPrice: 250,
        verifiedByAdmin: true,
      },
      purchase: {
        id: '3',
        status: 'active',
        startDate: '2024-01-20',
        endDate: '2024-03-20',
        paymentId: 'pay_345678',
        price: 250,
        currency: 'USD',
        paymentStatus: 'completed',
        paymentDate: '2024-01-20',
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20',
      },
    }],
    lastMessage: {
      id: '1',
      sender: 'user',
      content: 'Thank you for the meditation session yesterday. I felt so relaxed!',
      timestamp: 'Yesterday',
      status: 'read',
    },
    unreadCount: 1,
    isOnline: false,
  },
  {
    trainer: {
      id: '4',
      name: 'Alex Chen',
      profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      specialties: ['Cardio', 'Running', 'Marathon Training', 'Endurance'],
      experienceLevel: 'Advanced (5+ years)',
      bio: 'Marathon runner and cardio specialist helping you build endurance.',
    },
    plans: [{
      plan: {
        id: '4',
        title: 'Marathon Training Plan',
        category: 'Cardio',
        mode: 'Hybrid',
        description: 'Complete marathon training program',
        goal: 'Complete a marathon in under 4 hours',
        features: ['Running Plans', 'Pace Training', 'Nutrition Guidance'],
        duration: 120,
        image: null,
        trainerPrice: 320,
        totalPrice: 420,
        verifiedByAdmin: true,
      },
      purchase: {
        id: '4',
        status: 'active',
        startDate: '2024-01-10',
        endDate: '2024-05-10',
        paymentId: 'pay_901234',
        price: 420,
        currency: 'USD',
        paymentStatus: 'completed',
        paymentDate: '2024-01-10',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10',
      },
    }],
    lastMessage: {
      id: '1',
      sender: 'trainer',
      content: 'Great 5K run today! Your pace is improving consistently. Keep it up! 🏃‍♀️',
      timestamp: 'Monday',
      status: 'read',
    },
    unreadCount: 0,
    isOnline: false,
  },
];

// Sample messages for each trainer
const messagesByTrainer: { [key: string]: IMessage[] } = {
  '1': [
    {
      id: '1',
      sender: 'trainer',
      content: 'Hey! Ready for today\'s HIIT session? 💪 I\'ve prepared an intense 30-minute workout that will really challenge you!',
      timestamp: '2:30 PM',
      status: 'read',
    },
    {
      id: '2',
      sender: 'user',
      content: 'Absolutely! I\'m pumped and ready to go. What equipment do I need today?',
      timestamp: '2:32 PM',
      status: 'read',
    },
    {
      id: '3',
      sender: 'trainer',
      content: 'Just your yoga mat, a water bottle, and maybe a towel 😅 We\'ll be doing bodyweight exercises focusing on your core and cardio endurance.',
      timestamp: '2:33 PM',
      status: 'read',
    },
    {
      id: '4',
      sender: 'user',
      content: 'Perfect! All set. Should I warm up before we start?',
      timestamp: '2:35 PM',
      status: 'delivered',
    },
    {
      id: '5',
      sender: 'trainer',
      content: 'Great question! Yes, do a 5-minute light warm-up. I\'ll send you the workout plan in a moment.',
      timestamp: '2:36 PM',
      status: 'sent',
    },
  ],
  '2': [
    {
      id: '1',
      sender: 'trainer',
      content: 'Hey! Ready for deadlift day? We\'re going for a new PR today! 💪',
      timestamp: '1:45 PM',
      status: 'read',
    },
    {
      id: '2',
      sender: 'user',
      content: 'I\'m a bit nervous but excited! What weight are we targeting?',
      timestamp: '1:47 PM',
      status: 'read',
    },
    {
      id: '3',
      sender: 'trainer',
      content: 'We\'ll start with your current max and work our way up. Remember, form is everything!',
      timestamp: '1:48 PM',
      status: 'sent',
    },
    {
      id: '4',
      sender: 'trainer',
      content: 'Don\'t forget to bring your lifting belt and knee sleeves.',
      timestamp: '1:49 PM',
      status: 'sent',
    },
    {
      id: '5',
      sender: 'trainer',
      content: 'See you at 3 PM sharp! 🏋️‍♂️',
      timestamp: '1:50 PM',
      status: 'sent',
    },
  ],
  '3': [
    {
      id: '1',
      sender: 'user',
      content: 'Thank you for the meditation session yesterday. I felt so relaxed!',
      timestamp: 'Yesterday',
      status: 'read',
    },
    {
      id: '2',
      sender: 'trainer',
      content: 'I\'m so glad to hear that! How did you sleep after the session?',
      timestamp: 'Yesterday',
      status: 'read',
    },
    {
      id: '3',
      sender: 'user',
      content: 'Like a baby! Best sleep I\'ve had in weeks.',
      timestamp: 'Yesterday',
      status: 'read',
    },
    {
      id: '4',
      sender: 'trainer',
      content: 'Perfect! Are you ready for today\'s flow sequence? We\'ll focus on hip flexibility.',
      timestamp: '10:30 AM',
      status: 'sent',
    },
  ],
  '4': [
    {
      id: '1',
      sender: 'trainer',
      content: 'Great 5K run today! Your pace is improving consistently. Keep it up! 🏃‍♀️',
      timestamp: 'Monday',
      status: 'read',
    },
    {
      id: '2',
      sender: 'user',
      content: 'Thanks! I really felt the difference in my breathing today.',
      timestamp: 'Monday',
      status: 'read',
    },
    {
      id: '3',
      sender: 'trainer',
      content: 'That\'s the cardio training paying off! Ready for tomorrow\'s interval training?',
      timestamp: 'Monday',
      status: 'read',
    },
  ],
};

const MessageBubble: React.FC<{ message: IMessage; isTrainer: boolean; trainerPic?: string; trainerName?: string }> = ({ 
  message, 
  isTrainer, 
  trainerPic, 
  trainerName 
}) => {
  const getStatusIcon = () => {
    if (message.sender === 'user') {
      switch (message.status) {
        case 'sent':
          return <CheckIcon className="w-4 h-4 text-gray-400" />;
        case 'delivered':
          return (
            <div className="flex">
              <CheckIcon className="w-4 h-4 text-gray-400" />
              <CheckIcon className="w-4 h-4 text-gray-400 -ml-2" />
            </div>
          );
        case 'read':
          return (
            <div className="flex">
              <CheckIcon className="w-4 h-4 text-blue-500" />
              <CheckIcon className="w-4 h-4 text-blue-500 -ml-2" />
            </div>
          );
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <div className={`flex ${isTrainer ? 'justify-start' : 'justify-end'} mb-4 animate-in slide-in-from-bottom-2 duration-300`}>
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
          <span className="text-xs text-gray-500">{message.timestamp}</span>
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

const TrainerListItem: React.FC<{ 
  trainer: IUserTrainerWithPlansDTO; 
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
          <div className={`absolute bottom-0 right-0 w-3 h-3 ${trainer.isOnline ? 'bg-green-400' : 'bg-gray-300'} rounded-full ring-2 ring-white`}></div>
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
          
          <p className="text-xs text-gray-500 truncate">
            {trainer.trainer.specialties[0]}
          </p>
          
          {trainer.lastMessage && (
            <p className="text-xs text-gray-600 truncate mt-1">
              {trainer.lastMessage.sender === 'user' ? 'You: ' : ''}
              {trainer.lastMessage.content}
            </p>
          )}
          
          <span className="text-xs text-gray-400">
            {trainer.lastMessage?.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
};

const MultiTrainerChat: React.FC = () => {
  const [trainers] = useState<IUserTrainerWithPlansDTO[]>(dummyTrainers);
  const [selectedTrainer, setSelectedTrainer] = useState<IUserTrainerWithPlansDTO | null>(trainers[0]);
  const [messages, setMessages] = useState<IMessage[]>(messagesByTrainer['1'] || []);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTrainerSelect = (trainer: IUserTrainerWithPlansDTO) => {
    setSelectedTrainer(trainer);
    setMessages(messagesByTrainer[trainer.trainer.id || '1'] || []);
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedTrainer) {
      const newMessage: IMessage = {
        id: Date.now().toString(),
        sender: 'user',
        content: messageInput,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      };
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');

      // Update the messages in the messagesByTrainer object
      messagesByTrainer[selectedTrainer.trainer.id || '1'] = [...messages, newMessage];

      // Simulate message status updates
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        ));
      }, 1000);

      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
        ));
      }, 2000);

      // Simulate trainer typing
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }, 1500);
    }
  };

  const filteredTrainers = trainers.filter(trainer =>
    trainer.trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.trainer.specialties.some(specialty => 
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
      <div className={`relative bg-white/90 backdrop-blur-xl border-r border-gray-200 shadow-xl transition-all duration-300 ${
        isSidebarOpen ? 'w-80' : 'w-0'
      } overflow-hidden`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
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
            
            {/* Search */}
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

          {/* Trainer List */}
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
            {/* Chat Header */}
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
                      <div className={`absolute bottom-0 right-0 w-4 h-4 ${selectedTrainer.isOnline ? 'bg-green-400' : 'bg-gray-300'} rounded-full ring-2 ring-white shadow-md`}></div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h1 className="text-lg font-bold text-gray-900">{selectedTrainer.trainer.name}</h1>
                        <CheckBadgeIcon className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 ${selectedTrainer.isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-300'} rounded-full`}></div>
                        <span className="text-sm text-gray-600">
                          {selectedTrainer.isOnline ? 'Online' : 'Offline'} • {selectedTrainer.trainer.experienceLevel}
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

              {/* Trainer Specialties */}
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

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {/* Welcome Message */}
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
                  isTrainer={message.sender === 'trainer'}
                  trainerPic={selectedTrainer.trainer.profilePic || ''}
                  trainerName={selectedTrainer.trainer.name}
                />
              ))}

              {/* Typing Indicator */}
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

            {/* Message Input */}
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
              
              {/* Quick Actions */}
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
          /* No Trainer Selected State */
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

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MultiTrainerChat;