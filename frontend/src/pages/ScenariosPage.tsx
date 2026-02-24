import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

interface ScriptScenario {
  id: string;
  name: string;
  description?: string;
  playwrightScript: string;
  status: string;
  executionCount: number;
  passCount: number;
  failCount: number;
  createdAt: string;
  updatedAt: string;
}

export function ScenariosPage() {
  const [scenarios, setScenarios] = useState<ScriptScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<ScriptScenario | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedScript, setEditedScript] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [executionOutput, setExecutionOutput] = useState('');

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      // Load script scenarios (from generated scripts only)
      const response = await apiClient.get('script-scenarios');
      setScenarios(response.data);
    } catch (error) {
      console.error('Error loading scenarios:', error);
    }
  };

  const handleSelectScenario = (scenario: ScriptScenario) => {
    setSelectedScenario(scenario);
    setEditedScript(scenario.playwrightScript);
    setIsEditing(false);
    setExecutionOutput('');
  };

  const handleSaveScript = async () => {
    if (!selectedScenario) return;
    try {
      await apiClient.patch(`script-scenarios/${selectedScenario.id}/script`, {
        script: editedScript,
      });
      setIsEditing(false);
      loadScenarios();
      setSelectedScenario(null);
    } catch (error) {
      console.error('Error saving script:', error);
    }
  };

  const handleExecute = async () => {
    if (!selectedScenario) return;
    setIsRunning(true);
    setExecutionOutput('⏳ Launching browser in HEADED mode...');
    try {
      const response = await apiClient.post('playwright/execute', {
        script: selectedScenario.playwrightScript,
      });
      
      if (response.data.success) {
        setExecutionOutput(`✅ Execution Completed\n\n${response.data.output}`);
      } else {
        setExecutionOutput(`❌ Execution Failed\n\n${response.data.output || response.data.error}`);
      }
    } catch (error: any) {
      console.error('Error executing:', error);
      setExecutionOutput(`❌ Error executing script: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this scenario?')) {
      setIsDeleting(true);
      try {
        await apiClient.delete(`script-scenarios/${id}`);
        if (selectedScenario?.id === id) {
          setSelectedScenario(null);
        }
        loadScenarios();
      } catch (error) {
        console.error('Error deleting:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">🎭 Generated Test Scenarios</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Scenarios List - Column 1 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Scenarios</h2>
            <div className="space-y-2 max-h-[700px] overflow-y-auto">
              {scenarios.length === 0 ? (
                <p className="text-gray-500 text-sm">No saved scenarios yet. Generate and save scripts from the Generator page.</p>
              ) : (
                scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    onClick={() => handleSelectScenario(scenario)}
                    className={`p-3 rounded cursor-pointer border-2 transition ${
                      selectedScenario?.id === scenario.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-semibold text-sm">{scenario.name}</p>
                    <div className="text-xs text-gray-600 mt-1">
                      <p>🏃 Runs: {scenario.executionCount}</p>
                      <p>✅ {scenario.passCount} ✗ {scenario.failCount}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Script Display - Column 2 */}
        <div className="lg:col-span-2">
          {selectedScenario ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{selectedScenario.name}</h2>
                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  selectedScenario.status === 'approved' ? 'bg-green-100 text-green-800' : 
                  selectedScenario.status === 'executed' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedScenario.status}
                </span>
              </div>

              {selectedScenario.description && (
                <p className="text-gray-700 mb-4">{selectedScenario.description}</p>
              )}

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Script ({editedScript.split('\n').length} lines):</label>
                {isEditing ? (
                  <textarea
                    value={editedScript}
                    onChange={(e) => setEditedScript(e.target.value)}
                    className="w-full h-[400px] border border-gray-300 rounded px-3 py-2 font-mono text-sm"
                  />
                ) : (
                  <pre className="w-full h-[400px] border border-gray-300 rounded px-3 py-2 bg-gray-50 overflow-auto text-sm">
                    {selectedScenario.playwrightScript}
                  </pre>
                )}
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveScript}
                      className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 font-semibold"
                    >
                      ✅ Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50 font-semibold"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={handleExecute}
                      disabled={isRunning}
                      className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                    >
                      {isRunning ? '⏳ Running...' : '▶ Execute'}
                    </button>
                    <button
                      onClick={() => handleDelete(selectedScenario.id)}
                      disabled={isDeleting}
                      className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:bg-gray-400 font-semibold"
                    >
                      {isDeleting ? '🗑️ Deleting...' : '🗑️ Delete'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center text-gray-500">
              Select a scenario to view details
            </div>
          )}
        </div>

        {/* Execution Output - Column 3 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Execution Output</h2>
            <pre className="w-full h-[700px] border border-gray-300 rounded px-3 py-2 bg-gray-900 text-green-400 text-xs overflow-auto font-mono whitespace-pre-wrap break-words">
              {executionOutput || '⏳ Ready to execute...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
