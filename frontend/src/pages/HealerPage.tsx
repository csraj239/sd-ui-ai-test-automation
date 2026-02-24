import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

export function HealerPage() {
  const [failedScenarios, setFailedScenarios] = useState<any[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [isHealing, setIsHealing] = useState(false);
  const [healedScript, setHealedScript] = useState('');

  useEffect(() => {
    loadFailedScenarios();
  }, []);

  const loadFailedScenarios = async () => {
    try {
      // Get scenarios with high failure rate
      const response = await apiClient.get('/test-scenarios');
      const failed = response.data.filter(
        (s: any) => s.failCount > s.passCount && s.executionCount > 0
      );
      setFailedScenarios(failed);
    } catch (error) {
      console.error('Error loading failed scenarios:', error);
    }
  };

  const handleHealScenario = async () => {
    if (!selectedScenario) return;
    setIsHealing(true);
    try {
      // TODO: Call the Healer AI Agent to fix the failing test
      const response = await apiClient.post('/test-scenarios/generate-script', {
        scenarioName: selectedScenario.name,
        scenarioDescription: `Fixing failing scenario: ${selectedScenario.name}`,
      });
      setHealedScript(response.data.script);
    } catch (error) {
      console.error('Error healing scenario:', error);
    } finally {
      setIsHealing(false);
    }
  };

  const handleSaveHealed = async () => {
    if (!selectedScenario || !healedScript) return;
    try {
      await apiClient.patch(`/test-scenarios/${selectedScenario.id}/script`, {
        script: healedScript,
      });
      alert('Healed script saved successfully!');
      setHealedScript('');
      setSelectedScenario(null);
      loadFailedScenarios();
    } catch (error) {
      console.error('Error saving healed script:', error);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Test Healer</h1>

      <p className="text-gray-600 mb-6">
        The Healer AI Agent automatically fixes failing test scenarios by analyzing failures and
        generating corrected scripts.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Failed Scenarios List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Failed Scenarios</h2>
            {failedScenarios.length > 0 ? (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {failedScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    onClick={() => {
                      setSelectedScenario(scenario);
                      setHealedScript('');
                    }}
                    className={`p-3 rounded cursor-pointer border-2 ${
                      selectedScenario?.id === scenario.id
                        ? 'border-red-600 bg-red-50'
                        : 'border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-semibold text-sm">{scenario.name}</p>
                    <div className="text-xs text-red-600 mt-1">
                      ✗ {scenario.failCount} failures
                      {scenario.passCount > 0 && ` | ✓ {scenario.passCount} passes`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                🎉 No failing scenarios! All tests are passing.
              </p>
            )}
          </div>
        </div>

        {/* Healing Panel */}
        <div className="lg:col-span-2">
          {selectedScenario ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedScenario.name}</h2>

              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-sm font-semibold text-red-800">
                  ✗ {selectedScenario.failCount} failures out of{' '}
                  {selectedScenario.executionCount} runs
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Original Script:</label>
                <pre className="w-full h-[200px] border border-gray-300 rounded px-3 py-2 bg-gray-50 overflow-auto text-sm">
                  {selectedScenario.playwrightScript}
                </pre>
              </div>

              <button
                onClick={handleHealScenario}
                disabled={isHealing}
                className="w-full bg-purple-600 text-white py-2 rounded mb-4 hover:bg-purple-700 disabled:bg-gray-400 font-semibold"
              >
                {isHealing ? '🔧 Healing with AI...' : '🔧 Fix with AI Agent'}
              </button>

              {healedScript && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Healed Script:</label>
                    <pre className="w-full h-[200px] border border-green-300 rounded px-3 py-2 bg-green-50 overflow-auto text-sm">
                      {healedScript}
                    </pre>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveHealed}
                      className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 font-semibold"
                    >
                      ✅ Save Healed Script
                    </button>
                    <button
                      onClick={() => setHealedScript('')}
                      className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
                    >
                      Discard
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center text-gray-500">
              <p className="text-lg">Select a failing scenario to begin healing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
