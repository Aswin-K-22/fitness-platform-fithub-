import React from "react";
import { useNavigate } from "react-router-dom";

const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a
                  href="#"
                  className="text-base text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label="About FitHub"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label="Careers at FitHub"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label="Contact FitHub"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Services</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a
                  href="#"
                  className="text-base text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label="AI Training services"
                >
                  AI Training
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label="Personal Trainers"
                >
                  Personal Trainers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label="Gym Access"
                >
                  Gym Access
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a
                  href="#"
                  className="text-base text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label="Privacy Policy"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label="Terms of Service"
                >
                  Terms
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Connect</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a
                  href="#"
                  className="flex items-center text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label="Follow FitHub on Facebook"
                >
                  <i className="fab fa-facebook-f mr-2"></i>
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label="Follow FitHub on Instagram"
                >
                  <i className="fab fa-instagram mr-2"></i>
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label="Follow FitHub on Twitter"
                >
                  <i className="fab fa-twitter mr-2"></i>
                  Twitter
                </a>
              </li>
              <li>
                <button
                  onClick={() => navigate("/trainer/login")}
                  className="w-full text-left px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200"
                  aria-label="Trainer Login"
                >
                  Trainer Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/admin/login")}
                  className="w-full text-left px-3 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-200"
                  aria-label="Admin Login"
                >
                  Admin Login
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base text-gray-400">
            © 2025 FitHub. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-200"
              aria-label="Follow FitHub on Facebook"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-200"
              aria-label="Follow FitHub on Instagram"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-200"
              aria-label="Follow FitHub on Twitter"
            >
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;