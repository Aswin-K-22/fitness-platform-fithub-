// src/presentation/components/Footer.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-gray-300 hover:text-white">About</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Careers</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Services</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-gray-300 hover:text-white">AI Training</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Personal Trainers</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Gym Access</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Privacy</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Terms</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Connect</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  <i className="fab fa-facebook-f"></i> <span className="ml-2">Facebook</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  <i className="fab fa-instagram"></i> <span className="ml-2">Instagram</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  <i className="fab fa-twitter"></i> <span className="ml-2">Twitter</span>
                </a>
              </li>
              <li>
  <button
    onClick={() => navigate("/trainer/login")}
    className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-600"
  >
    Trainer Login
  </button>
</li>
<li>
  <button
    onClick={() => navigate("/admin/login")}
    className="bg-indigo-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600"
  >
    Admin Login
  </button>
</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-300"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="text-gray-400 hover:text-gray-300"><i className="fab fa-instagram"></i></a>
            <a href="#" className="text-gray-400 hover:text-gray-300"><i className="fab fa-twitter"></i></a>
          </div>
          <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
            © 2025 FitHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;