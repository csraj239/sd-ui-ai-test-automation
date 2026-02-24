import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

export function GeneratorPage() {
  const [testPlans, setTestPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [testScenarios, setTestScenarios] = useState<any[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [generatedScript, setGeneratedScript] = useState('');
  const [executionOutput, setExecutionOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadTestPlans();
  }, []);

  const loadTestPlans = async () => {
    try {
      const response = await apiClient.get('/test-plans');
      setTestPlans(response.data);
    } catch (error) {
      console.error('Error loading test plans:', error);
    }
  };

  const loadTestScenarios = async (planId: string) => {
    try {
      const response = await apiClient.get(`/test-scenarios?testPlanId=${planId}`);
      setTestScenarios(response.data || []);
    } catch (error) {
      console.error('Error loading test scenarios:', error);
      setTestScenarios([]);
    }
  };

  const handleSelectPlan = (planId: string) => {
    const plan = testPlans.find(p => p.id === planId);
    setSelectedPlan(plan || null);
    setSelectedScenario(null);
    setGeneratedScript('');
    setExecutionOutput('');
    loadTestScenarios(planId);
  };

  const handleSelectScenario = (scenario: any) => {
    setSelectedScenario(scenario);
    setGeneratedScript('');
    setExecutionOutput('');
  };

  const handleGenerateScript = async () => {
    if (!selectedPlan || !selectedScenario) return;
    setIsGenerating(true);
    setExecutionOutput('');
    try {
      const response = await apiClient.post('/playwright/generate', {
        appUrl: selectedPlan.project?.appUrl || 'https://localhost:3000',
        navigationFlow: selectedPlan.navigationFlow,
        acceptanceCriteria: selectedPlan.acceptanceCriteria,
        steps: selectedScenario.steps || [],
      });
      
      if (response.data.success) {
        setGeneratedScript(response.data.script);
        setExecutionOutput('✅ Script generated successfully! Ready to execute or edit.');
      } else {
        setExecutionOutput(`❌ Generation failed: ${response.data.error}`);
      }
    } catch (error: any) {
      console.error('Error generating script:', error);
      setExecutionOutput(`❌ Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecuteScript = async () => {
    if (!generatedScript) return;
    setIsExecuting(true);
    setExecutionOutput('⏳ Launching browser in HEADED mode...\n📍 Script execution in progress...\n⏳ Please wait for output...');
    try {
      const response = await apiClient.post('/playwright/execute', {
        script: generatedScript,
      });
      
      if (response.data.success) {
        setExecutionOutput(
          `✅ Script Execution Completed Successfully!\n\n` +
          `═══════════════════════════════════════════\n` +
          `${response.data.output || '✅ Script executed with no console output'}\n` +
          `═══════════════════════════════════════════`
        );
      } else {
        setExecutionOutput(
          `❌ Script Execution Failed\n\n` +
          `Error:\n${response.data.error || response.data.output || 'Unknown error'}\n\n` +
          `💡 Tips:\n` +
          `• Check your CSS selectors/locators\n` +
          `• Verify element timeouts\n` +
          `• Review the generated script for correctness`
        );
      }
    } catch (error: any) {
      console.error('Error executing script:', error);
      setExecutionOutput(
        `❌ Error: ${error.response?.data?.message || error.message}\n\n` +
        `This might be due to:\n` +
        `• Missing Playwright dependencies\n` +
        `• Browser not available\n` +
        `• Script syntax errors`
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSaveScript = async () => {
    if (!generatedScript || !selectedScenario || !selectedPlan) return;
    setIsSaving(true);
    try {
      // Create a new ScriptScenario from the generated script
      const response = await apiClient.post(`script-scenarios`, {
        name: selectedScenario.name,
        description: selectedScenario.description || `Generated from: ${selectedPlan.name}`,
        playwrightScript: generatedScript,
        steps: selectedScenario.steps,
        expectedOutput: selectedScenario.expectedOutput,
        priority: selectedScenario.priority || 'medium',
      });

      const createdScenario = response.data;

      setExecutionOutput(
        `✅ Script Scenario Created Successfully!\n\n` +
        `📍 Scenario: "${createdScenario.name}"\n` +
        `🆔 ID: ${createdScenario.id}\n` +
        `💾 Stored in: Database (PostgreSQL)\n` +
        `⏰ Created: ${new Date(createdScenario.createdAt).toLocaleString()}\n\n` +
        `The scenario is now saved and can be:\n` +
        `• Viewed on the Scenarios page\n` +
        `• Executed anytime\n` +
        `• Part of your test automation suite`
      );
    } catch (error: any) {
      console.error('Error saving script:', error);
      setExecutionOutput(`❌ Error saving script: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedPlan(null);
    setSelectedScenario(null);
    setGeneratedScript('');
    setExecutionOutput('');
    setTestScenarios([]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedScript);
    setExecutionOutput('📋 Script copied to clipboard!');
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-2 text-gray-800">🎭 Playwright Script Generator</h1>
      <p className="text-gray-600 mb-8">Generate and execute Playwright scripts with actual page locators</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Configuration */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
            <h2 className="text-2xl font-bold mb-4">Configuration</h2>

            {/* Test Plan Selection */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Test Plan:</label>
              <select
                value={selectedPlan?.id || ''}
                onChange={(e) => handleSelectPlan(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
              >
                <option value="">-- Select a Test Plan --</option>
                {testPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>

              {selectedPlan && (
                <div className="bg-blue-50 p-3 rounded text-sm space-y-1">
                  <p><strong>Navigation:</strong> {selectedPlan.navigationFlow}</p>
                  <p><strong>Criteria:</strong> {selectedPlan.acceptanceCriteria}</p>
                </div>
              )}
            </div>

            {/* Test Scenario Selection */}
            {testScenarios.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Test Scenario:</label>
                <select
                  value={selectedScenario?.id || ''}
                  onChange={(e) => {
                    const scenario = testScenarios.find(s => s.id === e.target.value);
                    handleSelectScenario(scenario);
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                >
                  <option value="">-- Select a Scenario --</option>
                  {testScenarios.map((scenario) => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </option>
                  ))}
                </select>

                {selectedScenario && (
                  <div className="bg-green-50 p-3 rounded text-sm space-y-1">
                    <p><strong>Steps:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      {Array.isArray(selectedScenario.steps) && selectedScenario.steps.map((step: string, idx: number) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t">
              <button
                onClick={handleGenerateScript}
                disabled={isGenerating || !selectedScenario}
                className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 font-semibold"
              >
                {isGenerating ? '⏳ Generating...' : '✨ Generate Script'}
              </button>

              <button
                onClick={handleExecuteScript}
                disabled={!generatedScript || isExecuting}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400 font-semibold"
              >
                {isExecuting ? '⏳ Executing...' : '▶️ Execute Script'}
              </button>

              <button
                onClick={handleSaveScript}
                disabled={!generatedScript || isSaving}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
              >
                {isSaving ? '⏳ Saving...' : '💾 Save to Scenario'}
              </button>

              <button
                onClick={copyToClipboard}
                disabled={!generatedScript}
                className="w-full bg-slate-600 text-white py-2 rounded hover:bg-slate-700 disabled:bg-gray-400 font-semibold"
              >
                📋 Copy Script
              </button>

              <button
                onClick={handleReset}
                className="w-full border border-gray-300 py-2 rounded hover:bg-gray-50 font-semibold"
              >
                ↻ Reset
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Script and Execution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Generated Script */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Generated Script</h2>
              {generatedScript && (
                <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded">
                  ✓ Ready
                </span>
              )}
            </div>
            <textarea
              value={generatedScript}
              onChange={(e) => setGeneratedScript(e.target.value)}
              className="w-full h-96 border border-gray-300 rounded px-3 py-2 font-mono text-sm bg-gray-50"
              placeholder="Generated Playwright script will appear here..."
            />
            {generatedScript && (
              <div className="mt-2 text-xs text-gray-600">
                <p>📝 Lines: {generatedScript.split('\n').length}</p>
              </div>
            )}
          </div>

          {/* Execution Output */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Execution Output</h2>
            <div className="bg-gray-900 text-green-400 rounded px-4 py-3 font-mono text-sm h-48 overflow-y-auto whitespace-pre-wrap">
              {executionOutput || '👁️ Output will appear here after script generation or execution...'}
            </div>
          </div>

          {/* Script Info */}
          {selectedPlan && (
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2">📋 Script Details</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Test Plan:</strong> {selectedPlan.name}</p>
                <p><strong>Application URL:</strong> <code className="bg-white px-1 rounded">{selectedPlan.project?.appUrl || 'Configured in project'}</code></p>
                <p><strong>Mode:</strong> <span className="bg-white px-1 rounded font-semibold">Headed (Visual)</span></p>
                <p><strong>Features:</strong></p>
                <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                  <li>Automatic element locator detection</li>
                  <li>Real browser automation with screenshots</li>
                  <li>Error handling and assertions</li>
                  <li>Step-by-step navigation</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
