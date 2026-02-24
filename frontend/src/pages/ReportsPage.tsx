import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

export function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [scenarioStats, setScenarioStats] = useState<any>(null);

  useEffect(() => {
    loadReports();
    loadStats();
  }, []);

  const loadReports = async () => {
    try {
      const response = await apiClient.get('/reports');
      setReports(response.data);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.get('/reports/stats/scenarios');
      setScenarioStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Reports</h1>

      {/* Overall Stats */}
      {scenarioStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-gray-500 text-sm font-semibold uppercase">
                  Total Runs
                </h2>
                <p className="text-4xl font-bold text-blue-600 mt-2">
                  {scenarioStats.totalRuns || 0}
                </p>
              </div>
              <div className="text-5xl text-blue-200">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-gray-500 text-sm font-semibold uppercase">
                  Pass Rate
                </h2>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  {scenarioStats.passRate || 0}%
                </p>
              </div>
              <div className="text-5xl text-green-200">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-gray-500 text-sm font-semibold uppercase">
                  Fail Rate
                </h2>
                <p className="text-4xl font-bold text-red-600 mt-2">
                  {scenarioStats.failRate || 0}%
                </p>
              </div>
              <div className="text-5xl text-red-200">❌</div>
            </div>
          </div>
        </div>
      )}

      {/* Execution Reports */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Execution Reports</h2>
        {reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Passed</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Failed</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Success Rate</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-3">
                      {new Date(report.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 font-semibold">{report.totalTests}</td>
                    <td className="px-6 py-3 text-green-600 font-semibold">
                      {report.passedTests}
                    </td>
                    <td className="px-6 py-3 text-red-600 font-semibold">
                      {report.failedTests}
                    </td>
                    <td className="px-6 py-3">{report.successRate?.toFixed(2)}%</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {(report.totalDuration / 1000).toFixed(2)}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No reports available</p>
        )}
      </div>
    </div>
  );
}
