import React from "react";
import { useNavigate } from "react-router-dom";


const BecomeATriiner : React.FC = () => {
  const navigate = useNavigate()
  return (
    
  
      <div className="text-center py-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Fitness Platform</h2>
        <p className="text-gray-600 mb-6">Are you a fitness professional? Become a trainer with FitHub!</p>
        <button
          onClick={ () => navigate("/trainer/signup")}
          className="rounded-md bg-indigo-600 px-6 py-3 text-white font-medium hover:bg-indigo-700"
        >
          Become a Trainer
        </button>
      </div>
  
  );
};

export default BecomeATriiner;