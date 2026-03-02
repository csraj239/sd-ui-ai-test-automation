import React, { useState, useCallback } from 'react';

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

interface UserFlowTableProps {
  userFlow: UserFlow | null;
  isLoading?: boolean;
  onExecute?: (userFlowId: string) => void;
  onStopExecution?: (userFlowId: string) => void;
  onStepAdd?: (userFlowId: string, step: UserFlowStep) => void;
  onStepAddAfter?: (userFlowId: string, step: UserFlowStep, afterStepNumber: number) => void;
  onStepUpdate?: (stepId: string, step: UserFlowStep) => void;
  onStepDelete?: (stepId: string) => void;
  onSaveFlow?: () => void;
  appUrl?: string;
}

const ACTION_OPTIONS = ['Launch', 'Click', 'Enter', 'Hover', 'verifyText', 'Pause', 'CloseBrowser'];

const ACTION_DESCRIPTIONS: Record<string, string> = {
  Launch: 'Navigate to a URL or application page',
  Click: 'Click on an HTML element using CSS selector or XPath',
  Enter: 'Type or enter text into an input field',
  Hover: 'Hover over an element to trigger hover effects',
  verifyText: 'Verify that specific text exists on the page',
  Pause: 'Wait for a specified time (in milliseconds)',
  CloseBrowser: 'Close the browser and end the flow',
};

export const UserFlowTable: React.FC<UserFlowTableProps> = ({
  userFlow,
  isLoading = false,
  onExecute,
  onStopExecution,
  onStepAdd,
  onStepAddAfter,
  onStepUpdate,
  onStepDelete,
  onSaveFlow,
  appUrl,
}) => {
  const [newStep, setNewStep] = useState<UserFlowStep>({
    stepNumber: (userFlow?.steps?.length || 0) + 1,
    action: 'Launch',
    description: '',
    page: '',
    locator: '',
    data: '',
  });
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<UserFlowStep | null>(null);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [addingAfterStep, setAddingAfterStep] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleEditStep = (step: UserFlowStep) => {
    setEditingStepId(step.id || null);
    setEditingStep({ ...step });
  };

  const handleSaveEditedStep = async () => {
    if (editingStep && editingStepId && onStepUpdate) {
      // Check if the step ID exists
      if (!editingStepId || editingStepId === 'undefined' || editingStepId === 'null') {
        alert('Error: Cannot save step - invalid step ID. Please refresh the page and try again.');
        return;
      }
      
      console.log('Saving step changes:', { stepId: editingStepId, changes: editingStep });
      
      setIsSaving(true);
      try {
        await onStepUpdate(editingStepId, editingStep);
        console.log('Step save completed successfully');
        setEditingStepId(null);
        setEditingStep(null);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } catch (error) {
        console.error('Failed to save step:', error);
        alert('Failed to save step changes. Please try again.');
      } finally {
        setIsSaving(false);
      }
    } else {
      console.error('Cannot save step - missing required data:', {
        hasEditingStep: !!editingStep,
        hasEditingStepId: !!editingStepId, 
        hasOnStepUpdate: !!onStepUpdate
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingStepId(null);
    setEditingStep(null);
  };

  const handleAddStepAfter = (stepNumber: number) => {
    setAddingAfterStep(stepNumber);
    setNewStep({
      stepNumber: stepNumber + 1,
      action: 'Launch',
      description: '',
      page: '',
      locator: '',
      data: '',
    });
    setIsAddingStep(true);
  };

  const updateEditingStep = (field: keyof UserFlowStep, value: string | number) => {
    if (editingStep) {
      setEditingStep({ ...editingStep, [field]: value });
    }
  };

  const handleAddStep = useCallback(() => {
    if (userFlow && newStep.action) {
      if (addingAfterStep !== null && onStepAddAfter) {
        onStepAddAfter(userFlow.id, newStep, addingAfterStep);
      } else if (onStepAdd) {
        onStepAdd(userFlow.id, newStep);
      }
      setNewStep({
        stepNumber: (userFlow.steps?.length || 0) + 1,
        action: 'Launch',
        description: '',
        page: '',
        locator: '',
        data: '',
      });
      setIsAddingStep(false);
      setAddingAfterStep(null);
    }
  }, [userFlow, onStepAdd, onStepAddAfter, newStep, addingAfterStep]);

  if (!userFlow) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-semibold mb-2">No User Flow Selected</h3>
          <p className="text-sm">Create or select a user flow from the left panel to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      {/* Success notification */}
      {saveSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 text-sm">
          ✓ Step updated successfully!
        </div>
      )}
      
      <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
        <div>
          <h3 className="font-bold text-lg">{userFlow.name}</h3>
          {userFlow.description && (
            <p className="text-sm text-blue-100">{userFlow.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {userFlow.status === 'executed' && (
            <span className="bg-green-200 text-green-800 px-3 py-1 rounded text-xs font-bold">
              ✓ Executed
            </span>
          )}
          {userFlow.status === 'executing' && (
            <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-xs font-bold">
              ⏳ Executing
            </span>
          )}
          {userFlow.status === 'failed' && (
            <span className="bg-red-200 text-red-800 px-3 py-1 rounded text-xs font-bold">
              ✗ Failed
            </span>
          )}
          {userFlow.status === 'stopped' && (
            <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs font-bold">
              ⏹ Stopped
            </span>
          )}
          {(onExecute || onStopExecution) && (
            <div className="flex gap-2">
              {isLoading ? (
                <>
                  {onStopExecution && (
                    <button
                      onClick={() => {
                        console.log('Stop button clicked for:', userFlow.id);
                        onStopExecution(userFlow.id);
                      }}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 font-semibold"
                    >
                      ⏹ Stop
                    </button>
                  )}
                  <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-xs font-bold flex items-center">
                    <span className="animate-pulse">⏳</span> Running...
                  </span>
                </>
              ) : (
                onExecute && (
                  <button
                    onClick={() => {
                      console.log('Execute button clicked for:', userFlow.id);
                      onExecute(userFlow.id);
                    }}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 font-semibold"
                  >
                    ▶ Execute
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full">
          <thead className="bg-gray-100 border-b sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-12">#</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-32">Action</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-40">Description</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-32">Page</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-48">Locator</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-32">Data</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {userFlow.steps && userFlow.steps.length > 0 ? (
              userFlow.steps.map((step, index) => (
                <tr key={step.id || index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700">{step.stepNumber}</td>
                  <td className="px-4 py-3">
                    {editingStepId === step.id ? (
                      <select
                        value={editingStep?.action || step.action}
                        onChange={(e) => updateEditingStep('action', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                        title={ACTION_DESCRIPTIONS[editingStep?.action || step.action]}
                      >
                        {ACTION_OPTIONS.map(action => (
                          <option key={action} value={action}>{action}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-800 font-medium">{step.action}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingStepId === step.id ? (
                      <input
                        type="text"
                        value={editingStep?.description || ''}
                        onChange={(e) => updateEditingStep('description', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                      />
                    ) : (
                      <span className="text-sm text-gray-600">{step.description || '-'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingStepId === step.id ? (
                      <input
                        type="text"
                        value={editingStep?.page || ''}
                        onChange={(e) => updateEditingStep('page', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                      />
                    ) : (
                      <span className="text-sm text-gray-600">{step.page || '-'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingStepId === step.id ? (
                      <input
                        type="text"
                        value={editingStep?.locator || ''}
                        onChange={(e) => updateEditingStep('locator', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-full font-mono text-xs"
                        placeholder=".btn-login or #submit or [data-test='button']"
                        title="Use CSS selectors (e.g., .class, #id, [attribute='value']) or XPath starting with '//' "
                      />
                    ) : (
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
                        {step.locator || '-'}
                      </code>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingStepId === step.id ? (
                      <input
                        type="text"
                        value={editingStep?.data || ''}
                        onChange={(e) => updateEditingStep('data', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                      />
                    ) : (
                      <span className="text-sm text-gray-600">{step.data || '-'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      {editingStepId === step.id ? (
                        <>
                          <button
                            onClick={handleSaveEditedStep}
                            disabled={isSaving}
                            className={`font-bold text-lg ${
                              isSaving 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-green-600 hover:text-green-700'
                            }`}
                            title={isSaving ? "Saving..." : "Save changes"}
                          >
                            {isSaving ? '⏳' : '✓'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            className={`text-lg ${
                              isSaving 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-gray-600 hover:text-gray-700'
                            }`}
                            title="Cancel changes"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>                          <button
                            onClick={() => handleEditStep(step)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                            title="Edit step"
                          >
                            Edit
                          </button>
                          {onStepAddAfter && (
                            <button
                              onClick={() => handleAddStepAfter(step.stepNumber)}
                              className="text-green-600 hover:text-green-700 text-xs font-semibold ml-3"
                              title="Add step after this one"
                            >
                              + Add After
                            </button>
                          )}
                          <button
                            onClick={() => onStepDelete?.(step.id!)}
                            className="text-red-600 hover:text-red-700 text-sm font-semibold"
                            title="Delete step"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center">
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-gray-800 mb-2">No steps added yet</p>
                      <p className="text-sm text-gray-600 mb-4">Click "✚ Add Step" below to record your first Playwright action</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-4 max-w-2xl mx-auto text-left">
                      <p className="text-sm font-semibold text-blue-900 mb-3">Example User Flow Steps:</p>
                      <div className="space-y-2 text-xs text-gray-700">
                        <div className="flex gap-3">
                          <span className="font-mono bg-white px-2 py-1 rounded">1. Launch</span>
                          <span>→ Navigate to https://example.com</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="font-mono bg-white px-2 py-1 rounded">2. Click</span>
                          <span>→ Click login button (locator: .login-btn)</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="font-mono bg-white px-2 py-1 rounded">3. Enter</span>
                          <span>→ Enter email into field (locator: #email-input, data: user@test.com)</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="font-mono bg-white px-2 py-1 rounded">4. Pause</span>
                          <span>→ Wait 3 seconds for page to load (data: 3000)</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="font-mono bg-white px-2 py-1 rounded">5. verifyText</span>
                          <span>→ Verify "Welcome" text appears on page</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {isAddingStep && (
              <tr className="bg-blue-50 border-2 border-blue-300">
                <td colSpan={7} className="px-4 py-2 text-center">
                  <div className="text-sm font-semibold text-blue-800 mb-2">
                    {addingAfterStep !== null 
                      ? `📝 Adding New Step After Step ${addingAfterStep}` 
                      : '📝 Adding New Step at End'
                    }
                  </div>
                </td>
              </tr>
            )}
            {isAddingStep && (
              <tr className="bg-blue-50 border-2 border-blue-300">
                <td className="px-4 py-3 text-sm font-semibold">
                  <input
                    type="number"
                    value={newStep.stepNumber}
                    onChange={(e) =>
                      setNewStep({ ...newStep, stepNumber: parseInt(e.target.value) || 0 })
                    }
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-12"
                    min="1"
                    title="Step sequence number"
                  />
                </td>
                <td className="px-4 py-3">
                  <div>
                    <select
                      value={newStep.action}
                      onChange={(e) => setNewStep({ ...newStep, action: e.target.value })}
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-full font-semibold bg-white"
                      autoFocus
                      title="Choose action type"
                    >
                      {ACTION_OPTIONS.map(action => (
                        <option key={action} value={action}>{action}</option>
                      ))}
                    </select>
                    <span className="text-xs text-gray-600 mt-1 block">
                      {ACTION_DESCRIPTIONS[newStep.action]}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={newStep.description}
                    onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                    placeholder="e.g., Click login button"
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                    title="Human-readable description of this step"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={newStep.page}
                    onChange={(e) => setNewStep({ ...newStep, page: e.target.value })}
                    placeholder="e.g., Login, Dashboard"
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                    title="Page name or URL"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={newStep.locator}
                    onChange={(e) => setNewStep({ ...newStep, locator: e.target.value })}
                    placeholder=".btn-login or #submit or [data-test='button']"
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-full font-mono text-xs"
                    title="Use CSS selectors (e.g., .class, #id, [attribute='value']) or XPath starting with '//' "
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={newStep.data}
                    onChange={(e) => setNewStep({ ...newStep, data: e.target.value })}
                    placeholder="user@test.com, Welcome, or 3000 (for pause)"
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                    title="Data to enter (for Enter action), text to verify (for verifyText), or timeout in milliseconds (for Pause)"
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={handleAddStep}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 font-semibold"
                      title="Add this step to the flow"
                    >
                      ✓ Add
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingStep(false);
                        setAddingAfterStep(null);
                        setNewStep({
                          stepNumber: (userFlow.steps?.length || 0) + 1,
                          action: 'Launch',
                          description: '',
                          page: '',
                          locator: '',
                          data: '',
                        });
                      }}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 font-semibold"
                      title="Cancel adding a step"
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t bg-gray-50 flex gap-2 flex-shrink-0">
        {!isAddingStep ? (
          <>
            <button
              onClick={() => {
                setNewStep({
                  stepNumber: (userFlow.steps?.length || 0) + 1,
                  action: 'Launch',
                  description: '',
                  page: '',
                  locator: '',
                  data: '',
                });
                setIsAddingStep(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold text-sm"
            >
              + Add Step
            </button>
            {onSaveFlow && (
              <button
                onClick={onSaveFlow}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold text-sm"
              >
                ✓ Save Flow
              </button>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};
