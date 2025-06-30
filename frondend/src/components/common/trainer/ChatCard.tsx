import React from "react";

interface ChatCardProps {
  name: string;
  status: string;
  avatar: string;
}

const ChatCard: React.FC<ChatCardProps> = ({ name, status, avatar }) => {
   
  return(
  <div className="flex items-center">
    <img className="h-10 w-10 rounded-full object-cover" src={avatar} alt={name} />
    <div className="ml-3">
      <p className="text-sm font-medium text-gray-900">{name}</p>
      <p className="text-sm text-gray-500">{status}</p>
    </div>
    <button className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded-md">Chat</button>
  </div>
  
)}

export default ChatCard;