import React from "react";

const ExperiencePremium: React.FC = () => (
  <div className="relative h-[500px] overflow-hidden">
    <img
      src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1440&h=500"
      className="w-full h-full object-cover"
      alt="Gym Interior"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50"></div>
    <div className="absolute bottom-0 left-0 right-0 p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white">Experience Premium Fitness</h2>
        <p className="mt-2 text-xl text-gray-200">State-of-the-art facilities available nationwide</p>
      </div>
    </div>
  </div>
);

export default ExperiencePremium;