import React from "react";


const BecomeATriiner : React.FC = () => {
  return (
    
  
      <div className="text-center py-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Fitness Platform</h2>
        <p className="text-gray-600 mb-6">Are you a fitness professional? Become a trainer with FitHub!</p>
        <button
          onClick={() => (window.location.href = import.meta.env.VITE_TRAINER_LOGIN_URL)}
          className="rounded-md bg-indigo-600 px-6 py-3 text-white font-medium hover:bg-indigo-700"
        >
          Become a Trainer
        </button>
      </div>
  
  );
};

export default BecomeATriiner;