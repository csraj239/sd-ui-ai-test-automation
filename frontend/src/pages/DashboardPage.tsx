import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

interface DashboardStats {
  totalProjects: number;
  totalTestSuites: number;
  totalTestScenarios: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalTestSuites: 0,
    totalTestScenarios: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // TODO: Fetch actual stats from backend
      setStats({
        totalProjects: 5,
        totalTestSuites: 12,
        totalTestScenarios: 48,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Projects */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-500 text-sm font-semibold uppercase">
                Total Projects
              </h2>
              <p className="text-4xl font-bold text-blue-600 mt-2">
                {stats.totalProjects}
              </p>
            </div>
            <div className="text-5xl text-blue-200">📁</div>
          </div>
        </div>

        {/* Total Test Suites */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-500 text-sm font-semibold uppercase">
                Total Test Suites
              </h2>
              <p className="text-4xl font-bold text-purple-600 mt-2">
                {stats.totalTestSuites}
              </p>
            </div>
            <div className="text-5xl text-purple-200">🧪</div>
          </div>
        </div>

        {/* Total Test Scenarios */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-500 text-sm font-semibold uppercase">
                Total Test Scenarios
              </h2>
              <p className="text-4xl font-bold text-green-600 mt-2">
                {stats.totalTestScenarios}
              </p>
            </div>
            <div className="text-5xl text-green-200">✅</div>
          </div>
        </div>
      </div>
    </div>
  );
}
