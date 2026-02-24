import React from 'react';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">
          SD UI AI Test Automation
        </h1>
        <p className="text-2xl mb-8">
          Intelligent Test Automation with AI Agents
        </p>
        <div className="space-x-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 cursor-pointer transition-colors"
          >
            Get Started
          </button>
          <button 
            onClick={() => navigate('/projects')}
            className="border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-blue-600 cursor-pointer transition-colors"
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
