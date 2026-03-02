import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { UserFlowManager } from '@/components/UserFlowManager';
import { UserFlowTable } from '@/components/UserFlowTable';

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

interface UserFlowStep {
  id?: string;
  stepNumber: number;
  action: string;
  description?: string;
  page?: string;
  locator?: string;
  data?: string;
}

interface UserFlow {
  id: string;
  name: string;
  description?: string;
  status: string;
  steps: UserFlowStep[];
  createdAt: string;
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

  // User Flow states
  const [userFlows, setUserFlows] = useState<UserFlow[]>([]);
  const [selectedUserFlow, setSelectedUserFlow] = useState<UserFlow | null>(null);
  const [isLoadingUserFlows, setIsLoadingUserFlows] = useState(false);
  const [isExecutingUserFlow, setIsExecutingUserFlow] = useState(false);
  const [executingUserFlowId, setExecutingUserFlowId] = useState<string | null>(null);

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
      loadUserFlows();
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

  const loadUserFlows = async () => {
    if (!selectedProject) {
      console.log('loadUserFlows: No project selected, skipping');
      return;
    }
    setIsLoadingUserFlows(true);
    try {
      console.log('Loading user flows for project:', selectedProject.id);
      const response = await apiClient.get(`/user-flows?projectId=${selectedProject.id}`);
      console.log('Loaded user flows:', response.data);
      const flows = response.data || [];
      setUserFlows(flows);
      
      // Maintain the selected flow with fresh data, or auto-select first flow
      if (selectedUserFlow) {
        const refreshedFlow = flows.find(f => f.id === selectedUserFlow.id);
        if (refreshedFlow) {
          setSelectedUserFlow(refreshedFlow);
          console.log('Updated selected flow with fresh data:', refreshedFlow.id);
        } else {
          // Selected flow no longer exists, select first available
          if (flows.length > 0) {
            setSelectedUserFlow(flows[0]);
            console.log('Selected flow removed, auto-selected first flow:', flows[0].id);
          } else {
            setSelectedUserFlow(null);
          }
        }
      } else if (flows.length > 0) {
        setSelectedUserFlow(flows[0]);
        console.log('Auto-selected first flow:', flows[0].id);
      }
    } catch (error) {
      console.error('Error loading user flows:', error);
      setUserFlows([]);
    } finally {
      setIsLoadingUserFlows(false);
    }
  };

  const handleCreateUserFlow = async (name: string, description: string) => {
    if (!selectedProject) {
      alert('No project selected');
      return;
    }
    try {
      console.log('Creating user flow:', { name, description, projectId: selectedProject.id });
      const response = await apiClient.post('/user-flows', {
        name,
        description,
        projectId: selectedProject.id,
      });
      console.log('User flow created successfully:', response.data);
      // Reload flows from backend to ensure consistency
      await loadUserFlows();
    } catch (error) {
      console.error('Error creating user flow:', error);
      alert('Failed to create user flow. Please check the console for details.');
    }
  };

  const handleDeleteUserFlow = async (flowId: string) => {
    try {
      await apiClient.delete(`/user-flows/${flowId}`);
      setUserFlows(userFlows.filter(f => f.id !== flowId));
      if (selectedUserFlow?.id === flowId) {
        setSelectedUserFlow(null);
      }
    } catch (error) {
      console.error('Error deleting user flow:', error);
    }
  };

  const handleAddUserFlowStep = async (userFlowId: string, step: UserFlowStep) => {
    try {
      const response = await apiClient.post(`/user-flows/${userFlowId}/steps`, step);
      setUserFlows(userFlows.map(flow => {
        if (flow.id === userFlowId) {
          return { ...flow, steps: [...flow.steps, response.data] };
        }
        return flow;
      }));
      setSelectedUserFlow(prev => {
        if (prev?.id === userFlowId) {
          return { ...prev, steps: [...prev.steps, response.data] };
        }
        return prev;
      });
    } catch (error) {
      console.error('Error adding user flow step:', error);
    }
  };

  const handleAddUserFlowStepAfter = async (userFlowId: string, step: UserFlowStep, afterStepNumber: number) => {
    try {
      const response = await apiClient.post(`/user-flows/${userFlowId}/steps/insert-after/${afterStepNumber}`, step);
      // Reload the entire user flow to get updated step numbers
      loadUserFlows();
    } catch (error) {
      console.error('Error adding user flow step after position:', error);
    }
  };

  const handleUpdateUserFlowStep = async (stepId: string, step: UserFlowStep) => {
    console.log('handleUpdateUserFlowStep called with:', { stepId, step });
    try {
      // Clean the step data - remove fields that shouldn't be sent to the API
      const cleanStep = {
        stepNumber: step.stepNumber,
        action: step.action,
        description: step.description || '',
        page: step.page || '',
        locator: step.locator || '',
        data: step.data || '',
      };
      
      console.log('Sending API request with clean step:', cleanStep);
      const response = await apiClient.patch(`/user-flows/steps/${stepId}`, cleanStep);
      console.log('API response received:', response.data);
      
      // Immediately update local state for instant UI feedback
      const updatedStep = response.data;
      console.log('Updating local state with:', updatedStep);
      
      setUserFlows(prevFlows => 
        prevFlows.map(flow => ({
          ...flow,
          steps: flow.steps.map(s => s.id === stepId ? { ...s, ...updatedStep } : s)
        }))
      );
      
      if (selectedUserFlow) {
        setSelectedUserFlow(prev => ({
          ...prev!,
          steps: prev!.steps.map(s => s.id === stepId ? { ...s, ...updatedStep } : s)
        }));
      }
      
      console.log('Local state updated successfully');
      
    } catch (error: any) {
      console.error('Error updating user flow step:', error);
      console.error('Error response:', error.response?.data);
      alert(`Failed to update step: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteUserFlowStep = async (stepId: string) => {
    try {
      await apiClient.delete(`/user-flows/steps/${stepId}`);
      const updatedFlows = userFlows.map(flow => {
        return { ...flow, steps: flow.steps.filter(s => s.id !== stepId) };
      });
      setUserFlows(updatedFlows);
      if (selectedUserFlow) {
        setSelectedUserFlow({
          ...selectedUserFlow,
          steps: selectedUserFlow.steps.filter(s => s.id !== stepId),
        });
      }
    } catch (error) {
      console.error('Error deleting user flow step:', error);
    }
  };

  const handleSaveUserFlow = async () => {
    if (!selectedUserFlow) return;
    try {
      await apiClient.patch(`/user-flows/${selectedUserFlow.id}`, {
        status: 'saved',
      });
      // Update the local state
      const updatedFlows = userFlows.map(f =>
        f.id === selectedUserFlow.id ? { ...f, status: 'saved' } : f
      );
      setUserFlows(updatedFlows);
      setSelectedUserFlow({ ...selectedUserFlow, status: 'saved' });
      alert('User flow saved successfully!');
    } catch (error) {
      console.error('Error saving user flow:', error);
      alert('Failed to save user flow. Please try again.');
    }
  };

  const handleExecuteUserFlow = async (userFlowId: string) => {
    console.log('Starting execution for user flow:', userFlowId);
    setIsExecutingUserFlow(true);
    setExecutingUserFlowId(userFlowId);
    try {
      console.log('Calling execute API...');
      const response = await apiClient.post(`/user-flows/${userFlowId}/execute`, {
        appUrl: selectedProject?.appUrl || 'http://localhost:3000',
        headless: false,
      });
      
      console.log('Execute API response:', response.data);
      
      // Update the user flow with execution results
      setUserFlows(userFlows.map(flow => {
        if (flow.id === userFlowId) {
          return { ...flow, status: response.data.success ? 'executed' : 'failed' };
        }
        return flow;
      }));
      setSelectedUserFlow(prev => {
        if (prev?.id === userFlowId) {
          return { ...prev, status: response.data.success ? 'executed' : 'failed' };
        }
        return prev;
      });

      // Show execution results
      alert(response.data.success 
        ? `Execution successful!\n\n${response.data.output || 'User flow executed without output'}` 
        : `Execution failed!\n\n${response.data.error || 'Unknown error'}`);
    } catch (error: any) {
      console.error('Error executing user flow:', error);
      alert(`Error executing user flow: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsExecutingUserFlow(false);
      setExecutingUserFlowId(null);
    }
  };

  const handleStopUserFlowExecution = async (userFlowId: string) => {
    try {
      await apiClient.post(`/user-flows/${userFlowId}/stop-execution`);
      
      // Update status to stopped
      setUserFlows(userFlows.map(flow => {
        if (flow.id === userFlowId) {
          return { ...flow, status: 'stopped' };
        }
        return flow;
      }));
      setSelectedUserFlow(prev => {
        if (prev?.id === userFlowId) {
          return { ...prev, status: 'stopped' };
        }
        return prev;
      });
      
      alert('Execution stopped successfully!');
    } catch (error: any) {
      console.error('Stop execution error:', error);
      alert(`Failed to stop execution: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsExecutingUserFlow(false);
      setExecutingUserFlowId(null);
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
      // If a user flow is selected, generate test cases from it
      if (selectedUserFlow?.id) {
        const response = await apiClient.post(`/user-flows/${selectedUserFlow.id}/generate-test-cases`);
        if (response.data.success) {
          setGeneratedScenarios(response.data.testCases || []);
        } else {
          console.error('Error generating test cases from user flow:', response.data.error);
        }
      } else {
        // Otherwise, use AI generation as before
        const response = await apiClient.post('/test-plans/-/generate', {
          navigationFlow: formData.navigationFlow,
          acceptanceCriteria: formData.acceptanceCriteria,
          prompt: formData.prompt || formData.acceptanceCriteria,
        });
        setGeneratedScenarios(response.data.scenarios || []);
      }
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
        userFlowId: selectedUserFlow?.id, // Include selected user flow
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
          {/* User Flow Section - Main Feature */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">User Flow Manager</h2>
            <p className="text-gray-600 mb-4">
              Create user flows to record sequences of Playwright actions. Each action includes launch, click, enter, hover, verify text, and more.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* User Flow Manager Sidebar */}
              <div className="lg:col-span-1">
                <UserFlowManager
                  userFlows={userFlows}
                  selectedUserFlow={selectedUserFlow}
                  isLoading={isLoadingUserFlows}
                  onSelectFlow={setSelectedUserFlow}
                  onCreateFlow={handleCreateUserFlow}
                  onDeleteFlow={handleDeleteUserFlow}
                  onRefresh={loadUserFlows}
                />
              </div>

              {/* User Flow Table - Main Display */}
              <div className="lg:col-span-3">
                <UserFlowTable
                  userFlow={selectedUserFlow}
                  isLoading={isExecutingUserFlow && executingUserFlowId === selectedUserFlow?.id}
                  onExecute={handleExecuteUserFlow}
                  onStopExecution={handleStopUserFlowExecution}
                  onStepAdd={handleAddUserFlowStep}
                  onStepAddAfter={handleAddUserFlowStepAfter}
                  onStepUpdate={handleUpdateUserFlowStep}
                  onStepDelete={handleDeleteUserFlowStep}
                  onSaveFlow={handleSaveUserFlow}
                  appUrl={selectedProject.appUrl}
                />
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Project Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Project Name</p>
                <p className="font-semibold text-gray-800">{selectedProject.name}</p>
              </div>
              {selectedProject.description && (
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-sm text-gray-800">{selectedProject.description}</p>
                </div>
              )}
              {selectedProject.appUrl && (
                <div>
                  <p className="text-sm text-gray-600">App URL</p>
                  <p className="text-sm break-all text-blue-600 hover:underline">
                    <a href={selectedProject.appUrl} target="_blank" rel="noopener noreferrer">
                      {selectedProject.appUrl}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Create Test Plan Button */}
          <div className="mb-8">
            <button
              onClick={() => setIsCreateModal(true)}
              className="w-full bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 font-bold text-lg"
            >
              + Create Test Plan (From User Flow)
            </button>
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

                <label className="block text-sm font-semibold mb-2">Navigation Flow - Select from User Flow or Enter Manually</label>
                <div className="flex gap-2 mb-4">
                  <select
                    value={selectedUserFlow?.id || ''}
                    onChange={(e) => {
                      const flow = userFlows.find(f => f.id === e.target.value);
                      if (flow) {
                        setFormData({
                          ...formData,
                          navigationFlow: `User Flow: ${flow.name}`,
                        });
                      }
                    }}
                    className="flex-1 border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">-- Select a User Flow --</option>
                    {userFlows.map((flow) => (
                      <option key={flow.id} value={flow.id}>
                        {flow.name} ({flow.steps?.length || 0} steps)
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setIsCreateModal(false)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-semibold text-sm whitespace-nowrap"
                  >
                    Create Flow
                  </button>
                </div>

                <textarea
                  placeholder="Or enter URL/Steps: e.g., https://app.example.com/login or Navigate to home → Click login"
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
                  {isGenerating ? '🔄 Generating test cases...' : selectedUserFlow ? `📋 Generate from User Flow: ${selectedUserFlow.name}` : '✨ Generate with AI'}
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
