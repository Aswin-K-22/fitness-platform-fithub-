import React from "react";

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  features: string[];
  buttonText: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description, features, buttonText }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-8">
        <div className="flex items-center">
          <i className={`${icon} text-blue-500 text-3xl`}></i>
          <h3 className="ml-3 text-xl font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="mt-4 text-gray-500">{description}</p>
        <ul className="mt-6 space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <i className="fas fa-check text-green-500 mt-1"></i>
              <span className="ml-3 text-gray-500">{feature}</span>
            </li>
          ))}
        </ul>
        <button className="mt-8 w-full rounded-md bg-blue-500 text-white px-4 py-2 font-medium hover:bg-blue-700">
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;