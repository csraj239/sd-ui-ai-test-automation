import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

interface Project {
  id: string;
  name: string;
  description?: string;
  appUrl?: string;
}

interface TestPlan {
  id: string;
  name: string;
  navigationFlow: string;
  acceptanceCriteria: string;
}

interface GeneratedTestCase {
  name: string;
  steps: string[];
  expectedOutput: string;
  priority: 'high' | 'medium' | 'low';
}

export function PlannerPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTestPlan, setSelectedTestPlan] = useState<TestPlan | null>(null);
  const [testScenarios, setTestScenarios] = useState<any[]>([]);
  const [isCreateModal, setIsCreateModal] = useState(false);
  const [isViewModal, setIsViewModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    navigationFlow: '',
    acceptanceCriteria: '',
    prompt: '',
  });
  const [generatedScenarios, setGeneratedScenarios] = useState<GeneratedTestCase[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Edit and Delete states
  const [isEditPlanModal, setIsEditPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TestPlan | null>(null);
  const [isEditScenarioModal, setIsEditScenarioModal] = useState(false);
  const [editingScenario, setEditingScenario] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadTestPlans();
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const response = await apiClient.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadTestPlans = async () => {
    if (!selectedProject) return;
    try {
      const response = await apiClient.get(`/test-plans?projectId=${selectedProject.id}`);
      setTestPlans(response.data);
    } catch (error) {
      console.error('Error loading test plans:', error);
    }
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value;
    const project = projects.find(p => p.id === projectId) || null;
    setSelectedProject(project);
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const response = await apiClient.post('/test-plans/-/generate', {
        navigationFlow: formData.navigationFlow,
        acceptanceCriteria: formData.acceptanceCriteria,
        prompt: formData.prompt || formData.acceptanceCriteria,
      });
      setGeneratedScenarios(response.data.scenarios || []);
    } catch (error) {
      console.error('Error generating plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!formData.name || !selectedProject) return;
    try {
      // Create test plan
      const planResponse = await apiClient.post('/test-plans', {
        name: formData.name,
        navigationFlow: formData.navigationFlow,
        acceptanceCriteria: formData.acceptanceCriteria,
        projectId: selectedProject.id,
      });
      
      const createdPlanId = planResponse.data.id;

      // Save generated scenarios for the test plan
      if (generatedScenarios.length > 0) {
        for (const scenario of generatedScenarios) {
          await apiClient.post('/test-scenarios', {
            name: scenario.name,
            steps: scenario.steps,
            expectedOutput: scenario.expectedOutput,
            priority: scenario.priority,
            testPlanId: createdPlanId,
          });
        }
      }

      setFormData({ name: '', navigationFlow: '', acceptanceCriteria: '', prompt: '' });
      setGeneratedScenarios([]);
      setIsCreateModal(false);
      loadTestPlans();
    } catch (error) {
      console.error('Error creating test plan:', error);
    }
  };

  const handleNavigateNavFlow = () => {
    if (formData.navigationFlow.startsWith('http')) {
      window.open(formData.navigationFlow, '_blank');
    }
  };

  const handleViewTestPlan = async (plan: TestPlan) => {
    setSelectedTestPlan(plan);
    try {
      // Fetch test scenarios for this test plan
      const response = await apiClient.get(`/test-scenarios?testPlanId=${plan.id}`);
      setTestScenarios(response.data || []);
    } catch (error) {
      console.error('Error loading test scenarios:', error);
      setTestScenarios([]);
    }
    setIsViewModal(true);
  };

  const handleEditTestPlan = (plan: TestPlan) => {
    setEditingPlan({ ...plan });
    setIsEditPlanModal(true);
  };

  const handleSaveEditPlan = async () => {
    if (!editingPlan) return;
    try {
      await apiClient.patch(`/test-plans/${editingPlan.id}`, {
        name: editingPlan.name,
        navigationFlow: editingPlan.navigationFlow,
        acceptanceCriteria: editingPlan.acceptanceCriteria,
      });
      setIsEditPlanModal(false);
      setEditingPlan(null);
      loadTestPlans();
    } catch (error) {
      console.error('Error updating test plan:', error);
    }
  };

  const handleDeleteTestPlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this test plan and all its test cases?')) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/test-plans/${planId}`);
      setIsViewModal(false);
      setSelectedTestPlan(null);
      setTestScenarios([]);
      loadTestPlans();
    } catch (error) {
      console.error('Error deleting test plan:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditTestCase = (scenario: any) => {
    setEditingScenario({ ...scenario });
    setIsEditScenarioModal(true);
  };

  const handleSaveEditTestCase = async () => {
    if (!editingScenario) return;
    try {
      await apiClient.patch(`/test-scenarios/${editingScenario.id}`, {
        name: editingScenario.name,
        steps: editingScenario.steps,
        expectedOutput: editingScenario.expectedOutput,
        priority: editingScenario.priority,
      });
      setIsEditScenarioModal(false);
      setEditingScenario(null);
      if (selectedTestPlan) {
        handleViewTestPlan(selectedTestPlan);
      }
    } catch (error) {
      console.error('Error updating test case:', error);
    }
  };

  const handleDeleteTestCase = async (scenarioId: string) => {
    if (!confirm('Are you sure you want to delete this test case?')) return;
    try {
      await apiClient.delete(`/test-scenarios/${scenarioId}`);
      if (selectedTestPlan) {
        handleViewTestPlan(selectedTestPlan);
      }
    } catch (error) {
      console.error('Error deleting test case:', error);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Test Planner - AI Test Case Generator</h1>

      {/* Project Selector */}
      <div className="mb-8">
        <label className="block text-sm font-semibold mb-2">Select Project:</label>
        <select
          value={selectedProject?.id || ''}
          onChange={handleProjectChange}
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Choose a project --</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
              {project.description && ` (${project.description})`}
            </option>
          ))}
        </select>
      </div>

      {selectedProject && (
        <>
          {/* Application Preview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* App Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
                  <h3 className="font-bold text-lg">Application Preview</h3>
                  {selectedProject.appUrl && (
                    <a
                      href={selectedProject.appUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-semibold hover:bg-gray-100"
                    >
                      Open App
                    </a>
                  )}
                </div>
                {selectedProject.appUrl ? (
                  <iframe
                    src={selectedProject.appUrl}
                    title="Application Preview"
                    className="w-full h-96 border-0"
                  />
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-500">
                    <p>No application URL configured for this project</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-bold text-lg mb-4">Project Info</h3>
                <div>
                  <p className="text-sm text-gray-600">Name:</p>
                  <p className="font-semibold text-gray-800">{selectedProject.name}</p>
                </div>
                {selectedProject.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Description:</p>
                    <p className="font-semibold text-gray-800">{selectedProject.description}</p>
                  </div>
                )}
                {selectedProject.appUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">App URL:</p>
                    <p className="text-sm break-all text-blue-600">{selectedProject.appUrl}</p>
                  </div>
                )}
                <button
                  onClick={() => setIsCreateModal(true)}
                  className="mt-6 w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold"
                >
                  + Create Test Plan
                </button>
              </div>
            </div>
          </div>

          {/* Test Plans List */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Test Plans</h2>
            {testPlans.length > 0 ? (
              <div className="space-y-4">
                {testPlans.map((plan) => (
                  <div 
                    key={plan.id} 
                    className="border rounded p-4 hover:bg-blue-50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleViewTestPlan(plan)}
                      >
                        <h3 className="font-bold text-lg text-blue-600">{plan.name}</h3>
                        <p className="text-sm text-gray-600 mt-2"><strong>Navigation:</strong> {plan.navigationFlow}</p>
                        <p className="text-sm text-gray-600 mt-1"><strong>Criteria:</strong> {plan.acceptanceCriteria}</p>
                        <p className="text-xs text-gray-400 mt-3">Click to view test cases →</p>
                      </div>
                      <div className="flex gap-2 ml-4 mt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTestPlan(plan);
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTestPlan(plan.id);
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No test plans yet. Click "Create Test Plan" to get started.</p>
            )}
          </div>
        </>
      )}

      {/* View Test Plan Details Modal */}
      {isViewModal && selectedTestPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{selectedTestPlan.name}</h2>
                <p className="text-sm text-gray-600 mt-2"><strong>Navigation Flow:</strong> {selectedTestPlan.navigationFlow}</p>
                <p className="text-sm text-gray-600 mt-1"><strong>Acceptance Criteria:</strong> {selectedTestPlan.acceptanceCriteria}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEditTestPlan(selectedTestPlan)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTestPlan(selectedTestPlan.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 font-semibold"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setIsViewModal(false);
                    setSelectedTestPlan(null);
                    setTestScenarios([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-xl font-bold mb-4">Test Cases ({testScenarios.length})</h3>
              
              {testScenarios.length > 0 ? (
                <div className="space-y-4">
                  {testScenarios.map((scenario, idx) => (
                    <div key={idx} className="border rounded p-4 bg-gray-50">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="font-bold text-lg">{idx + 1}. {scenario.name || scenario.title || `Test Case ${idx + 1}`}</p>
                          
                          <div className="mt-3">
                            <p className="text-sm font-semibold text-gray-700">Steps:</p>
                            <ol className="list-decimal list-inside text-sm text-gray-600 mt-1 space-y-1">
                              {Array.isArray(scenario.steps) ? (
                                scenario.steps.map((step: string, stepIdx: number) => (
                                  <li key={stepIdx}>{step}</li>
                                ))
                              ) : (
                                <li>{scenario.steps}</li>
                              )}
                            </ol>
                          </div>

                          <div className="mt-3">
                            <p className="text-sm font-semibold text-gray-700">Expected Output:</p>
                            <p className="text-sm text-gray-600 mt-1">{scenario.expectedOutput}</p>
                          </div>

                          {scenario.priority && (
                            <div className="mt-3">
                              <span className={`text-xs font-bold px-3 py-1 rounded inline-block ${
                                scenario.priority === 'high'
                                  ? 'bg-red-200 text-red-800'
                                  : scenario.priority === 'medium'
                                  ? 'bg-yellow-200 text-yellow-800'
                                  : 'bg-green-200 text-green-800'
                              }`}>
                                {scenario.priority.toUpperCase()} Priority
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-1 whitespace-nowrap">
                          <button
                            onClick={() => handleEditTestCase(scenario)}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTestCase(scenario.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No test cases found for this test plan.</p>
                  <p className="text-gray-400 text-sm mt-2">Test cases will appear here once they are created.</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-6 border-t mt-6">
              <button
                onClick={() => {
                  setIsViewModal(false);
                  setSelectedTestPlan(null);
                  setTestScenarios([]);
                }}
                className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Test Plan Modal */}
      {isCreateModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              AI Test Case Generator for "{selectedProject.name}"
            </h2>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Input Section */}
              <div>
                <h3 className="font-bold text-lg mb-4">Define Test Parameters</h3>

                <label className="block text-sm font-semibold mb-2">Test Plan Name</label>
                <input
                  type="text"
                  placeholder="e.g., Login Feature Testing"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                />

                <label className="block text-sm font-semibold mb-2">Navigation Flow (URL or Steps)</label>
                <textarea
                  placeholder="e.g., https://app.example.com/login or Navigate to home → Click login → Enter credentials"
                  value={formData.navigationFlow}
                  onChange={(e) => setFormData({ ...formData, navigationFlow: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-4 h-24"
                />

                <label className="block text-sm font-semibold mb-2">Acceptance Criteria (Required)</label>
                <textarea
                  placeholder="e.g., User should be able to login with valid credentials&#10;Error message should appear for invalid password&#10;Session should be created after successful login"
                  value={formData.acceptanceCriteria}
                  onChange={(e) => setFormData({ ...formData, acceptanceCriteria: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-4 h-32 border-blue-300 border-2"
                />

                <label className="block text-sm font-semibold mb-2">Additional Instructions (Optional)</label>
                <textarea
                  placeholder="Any specific requirements for test case generation"
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-4 h-20"
                />

                <button
                  onClick={handleGeneratePlan}
                  disabled={isGenerating || !formData.acceptanceCriteria}
                  className="w-full bg-green-600 text-white py-3 rounded mb-2 hover:bg-green-700 disabled:bg-gray-400 font-bold text-lg"
                >
                  {isGenerating ? '🔄 Generating with AI...' : '✨ Generate Test Cases with AI'}
                </button>
              </div>

              {/* Generated Cases Display */}
              <div>
                <h3 className="font-bold text-lg mb-4">AI Generated Test Cases</h3>
                {generatedScenarios.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {generatedScenarios.map((scenario, idx) => (
                      <div
                        key={idx}
                        className={`border rounded p-3 bg-gray-50 ${
                          scenario.priority === 'high'
                            ? 'border-red-400 bg-red-50'
                            : scenario.priority === 'medium'
                            ? 'border-yellow-400 bg-yellow-50'
                            : 'border-green-400 bg-green-50'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <p className="font-bold text-sm">{scenario.name}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              <strong>Steps:</strong> {scenario.steps.join(' → ')}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              <strong>Expected:</strong> {scenario.expectedOutput}
                            </p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            scenario.priority === 'high'
                              ? 'bg-red-200 text-red-800'
                              : scenario.priority === 'medium'
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-green-200 text-green-800'
                          }`}>
                            {scenario.priority}
                          </span>
                        </div>
                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="w-4 h-4" />
                          <span className="text-xs text-gray-600">Include in plan</span>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : isGenerating ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg font-semibold mb-2">🤖 AI is generating test cases...</p>
                      <p className="text-sm text-gray-600">Analyzing acceptance criteria and creating test cases</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-500">
                    <p>Fill in acceptance criteria and click "Generate Test Cases" to see AI-generated test cases</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-6 border-t">
              <button
                onClick={handleCreatePlan}
                disabled={!formData.name || !selectedProject}
                className="flex-1 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 font-bold"
              >
                Save Test Plan
              </button>
              <button
                onClick={() => {
                  setIsCreateModal(false);
                  setFormData({ name: '', navigationFlow: '', acceptanceCriteria: '', prompt: '' });
                  setGeneratedScenarios([]);
                }}
                className="flex-1 border border-gray-300 py-3 rounded hover:bg-gray-50 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Test Plan Modal */}
      {isEditPlanModal && editingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Edit Test Plan</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Test Plan Name</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Navigation Flow</label>
                <textarea
                  value={editingPlan.navigationFlow}
                  onChange={(e) => setEditingPlan({ ...editingPlan, navigationFlow: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Acceptance Criteria</label>
                <textarea
                  value={editingPlan.acceptanceCriteria}
                  onChange={(e) => setEditingPlan({ ...editingPlan, acceptanceCriteria: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-24"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-6 border-t mt-6">
              <button
                onClick={handleSaveEditPlan}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditPlanModal(false);
                  setEditingPlan(null);
                }}
                className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50 font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Test Case Modal */}
      {isEditScenarioModal && editingScenario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Edit Test Case</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Test Case Name</label>
                <input
                  type="text"
                  value={editingScenario.name}
                  onChange={(e) => setEditingScenario({ ...editingScenario, name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Steps (one per line)</label>
                <textarea
                  value={Array.isArray(editingScenario.steps) ? editingScenario.steps.join('\n') : editingScenario.steps}
                  onChange={(e) => setEditingScenario({ ...editingScenario, steps: e.target.value.split('\n') })}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-24"
                  placeholder="Step 1&#10;Step 2&#10;Step 3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Expected Output</label>
                <textarea
                  value={editingScenario.expectedOutput}
                  onChange={(e) => setEditingScenario({ ...editingScenario, expectedOutput: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Priority</label>
                <select
                  value={editingScenario.priority}
                  onChange={(e) => setEditingScenario({ ...editingScenario, priority: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-6 border-t mt-6">
              <button
                onClick={handleSaveEditTestCase}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditScenarioModal(false);
                  setEditingScenario(null);
                }}
                className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50 font-bold"
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
