import React from "react";

const AITrainer: React.FC = () => (
  <section className="py-16 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Meet Our AI Trainer</h2>
          <p className="mt-4 text-lg text-gray-500">
            Experience the future of fitness with our advanced AI personal trainer. Get real-time feedback, personalized workout plans, and 24/7 guidance to achieve your fitness goals.
          </p>
          <ul className="mt-8 space-y-4">
            <li className="flex items-start">
              <i className="fas fa-brain text-blue-500 mt-1"></i>
              <span className="ml-3 text-gray-500">Advanced machine learning algorithms for personalized training</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-mobile-alt text-blue-500 mt-1"></i>
              <span className="ml-3 text-gray-500">Real-time form correction and feedback</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-chart-bar text-blue-500 mt-1"></i>
              <span className="ml-3 text-gray-500">Continuous adaptation based on your progress</span>
            </li>
          </ul>
          <div className="mt-8">
            <button className="rounded-md bg-blue-500 text-white px-6 py-3 text-base font-medium hover:bg-blue-700">
              Try AI Trainer Free
            </button>
          </div>
        </div>
        <div className="mt-10 lg:mt-0">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1550345332-09e3ac987658?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
              className="rounded-lg shadow-lg w-full h-full object-cover"
              alt="AI Trainer Interface"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 opacity-20 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AITrainer;