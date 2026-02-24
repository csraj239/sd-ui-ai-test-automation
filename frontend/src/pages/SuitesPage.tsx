import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

interface TestSuite {
  id: string;
  name: string;
  description?: string;
  testScenarios: any[];
}

export function SuitesPage() {
  const [suites, setTestSuites] = useState<TestSuite[]>([]);
  const [isCreateModal, setIsCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isExecuting, setIsExecuting] = useState<string | null>(null);

  useEffect(() => {
    loadSuites();
  }, []);

  const loadSuites = async () => {
    try {
      const response = await apiClient.get('/test-suites');
      setTestSuites(response.data);
    } catch (error) {
      console.error('Error loading test suites:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.name) return;
    try {
      await apiClient.post('/test-suites', formData);
      setFormData({ name: '', description: '' });
      setIsCreateModal(false);
      loadSuites();
    } catch (error) {
      console.error('Error creating suite:', error);
    }
  };

  const handleExecute = async (suiteId: string) => {
    setIsExecuting(suiteId);
    try {
      await apiClient.post('/executions/suite', { suiteId, headless: true });
      alert('Suite execution started!');
    } catch (error) {
      console.error('Error executing suite:', error);
    } finally {
      setIsExecuting(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await apiClient.delete(`/test-suites/${id}`);
        loadSuites();
      } catch (error) {
        console.error('Error deleting suite:', error);
      }
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Test Suites</h1>
        <button
          onClick={() => setIsCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Test Suite
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suites.map((suite) => (
          <div key={suite.id} className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-2">{suite.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{suite.description}</p>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Scenarios: {suite.testScenarios?.length || 0}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleExecute(suite.id)}
                disabled={isExecuting === suite.id}
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                {isExecuting === suite.id ? 'Running...' : '▶ Execute'}
              </button>
              <button
                onClick={() => handleDelete(suite.id)}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create New Test Suite</h2>
            <input
              type="text"
              placeholder="Suite Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 h-20"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Create
              </button>
              <button
                onClick={() => setIsCreateModal(false)}
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
