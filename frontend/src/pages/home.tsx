import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-400 to-yellow-300 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg mb-6">
          Welcome to FormEase 🚀
        </h1>
        <p className="text-white text-lg mb-10">Smart, seamless form submission experience.</p>

        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-purple-700 px-8 py-3 rounded-full font-semibold text-lg shadow-md hover:bg-purple-100 transition"
        >
          Get Started
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-sm text-center relative">
            <button
              className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-xl"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>

            <h2 className="text-2xl font-bold text-purple-700 mb-6">Choose an option</h2>

            <div className="flex flex-col space-y-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  navigate("/signup");
                }}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Sign Up
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  navigate("/login");
                }}
                className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
