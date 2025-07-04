import React, { useCallback } from "react";
import { toast } from "react-toastify";

interface GoogleWindow extends Window {
  google?: {
    accounts: {
      oauth2: {
        initCodeClient: (config: {
          client_id: string;
          scope: string;
          ux_mode: string;
          redirect_uri: string;
          callback?: (response: { code: string }) => void;
        }) => { requestCode: () => void };
      };
    };
  };
}

const SocialAuthButtons: React.FC = () => {
  const handleGoogleLogin = useCallback(() => {
    const googleWindow = window as unknown as GoogleWindow;
    if (googleWindow.google && googleWindow.google.accounts) {
      const client = googleWindow.google.accounts.oauth2.initCodeClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: "email profile",
        ux_mode: "redirect",
        redirect_uri: import.meta.env.VITE_GOOGLE_CALLBACK_URL,
      });
      client.requestCode();
    } else {
      toast.error("Google SDK not loaded. Please try again later.");
    }
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <button
        onClick={handleGoogleLogin}
        className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-600 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Sign in with Google"
      >
        <i className="fab fa-google text-xl"></i>
      </button>
      {/* Placeholder for additional social login buttons */}
    </div>
  );
};

export default SocialAuthButtons;