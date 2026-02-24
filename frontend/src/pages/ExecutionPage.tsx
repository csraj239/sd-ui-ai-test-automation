import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

export function ExecutionPage() {
  const [executions, setExecutions] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);

  useEffect(() => {
    loadExecutions();
  }, []);

  const loadExecutions = async () => {
    try {
      const response = await apiClient.get('/executions');
      setExecutions(response.data);
    } catch (error) {
      console.error('Error loading executions:', error);
    }
  };

  const handleCreateExecution = async () => {
    if (selectedScenarios.length === 0) return;
    try {
      await apiClient.post('/executions', {
        name: `Execution ${new Date().toLocaleString()}`,
        scenarioIds: selectedScenarios,
      });
      setSelectedScenarios([]);
      setIsCreating(false);
      loadExecutions();
    } catch (error) {
      console.error('Error creating execution:', error);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Test Execution</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Execution
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Execution History</h2>
        {executions.length > 0 ? (
          <div className="space-y-4">
            {executions.map((execution, idx) => (
              <div key={idx} className="border rounded p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{execution.name}</p>
                    <p className="text-sm text-gray-600">
                      Status: <span className="font-semibold">{execution.status || 'pending'}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Started: {new Date(execution.startedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No executions yet</p>
        )}
      </div>

      {/* Create Execution Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create New Execution</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select test scenarios to include in this execution
            </p>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {/* Scenario checkboxes would go here */}
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>Example Scenario 1</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateExecution}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Create
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="flex-1 border border-gray-300 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
