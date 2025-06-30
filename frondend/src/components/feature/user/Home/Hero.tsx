import React from "react";
import { useNavigate } from "react-router-dom";

const Hero: React.FC = () => {
  const navigate = useNavigate();
  return(
  <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0">
      <img
        src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=1440&h=600"
        className="w-full h-full object-cover"
        alt="Hero"
      />
      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
    </div>
    <div className="relative max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
        <span className="block">Your Fitness. Your Way.</span>
        <span className="block text-blue-500">Anytime, Anywhere.</span>
      </h1>
      <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
        AI-Powered Training | Human Trainers | Flexible Gym Access
      </p>
      <div className="mt-10">
      <button
  onClick={() => navigate("/auth?type=signup")}
  className="rounded-md bg-blue-500 text-white px-8 py-3 text-base font-medium hover:bg-blue-700"
>
  Get Started for Free
</button>
      </div>
    </div>
  </section>
)};

export default Hero;