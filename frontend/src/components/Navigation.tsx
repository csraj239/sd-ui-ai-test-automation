import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/projects', label: 'Projects', icon: '📁' },
  { path: '/planner', label: 'Planner', icon: '📋' },
  { path: '/generator', label: 'Generator', icon: '⚙️' },
  { path: '/scenarios', label: 'Scenarios', icon: '✅' },
  { path: '/suites', label: 'Suites', icon: '🧪' },
  { path: '/execution', label: 'Execution', icon: '▶️' },
  { path: '/reports', label: 'Reports', icon: '📈' },
  { path: '/healer', label: 'Healer', icon: '🔧' },
];

export function Navigation() {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <nav
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-blue-600 to-purple-600 text-white shadow-2xl transition-all duration-300 z-50 ${
        isHovered ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo/Header */}
      <div className="p-4 border-b border-white border-opacity-20 flex items-center justify-center">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 font-bold hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl">🤖</span>
          {isHovered && <span className="text-sm whitespace-nowrap">SD AI Test</span>}
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col gap-2 p-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 px-3 py-3 rounded-lg font-medium transition-all duration-200 ${
              location.pathname === item.path
                ? 'bg-white bg-opacity-20 border-l-4 border-white'
                : 'hover:bg-white hover:bg-opacity-10'
            }`}
            title={item.label}
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            {isHovered && <span className="text-sm whitespace-nowrap">{item.label}</span>}
          </Link>
        ))}
      </div>
    </nav>
  );
}
