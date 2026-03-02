import React, { useState } from 'react';

interface UserFlow {
  id: string;
  name: string;
  description?: string;
  status: string;
  steps: any[];
  createdAt: string;
}

interface UserFlowManagerProps {
  userFlows: UserFlow[];
  selectedUserFlow: UserFlow | null;
  isLoading?: boolean;
  onSelectFlow: (flow: UserFlow | null) => void;
  onCreateFlow: (name: string, description: string) => void;
  onDeleteFlow: (flowId: string) => void;
  onRefresh?: () => void;
}

export const UserFlowManager: React.FC<UserFlowManagerProps> = ({
  userFlows,
  selectedUserFlow,
  isLoading = false,
  onSelectFlow,
  onCreateFlow,
  onDeleteFlow,
  onRefresh,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowDescription, setNewFlowDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFlow = async () => {
    if (newFlowName.trim()) {
      setIsCreating(true);
      try {
        await onCreateFlow(newFlowName, newFlowDescription);
        setNewFlowName('');
        setNewFlowDescription('');
        setIsCreateModalOpen(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } finally {
        setIsCreating(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold text-sm"
        >
          ✚ Create New User Flow
        </button>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 font-semibold text-sm"
          >
            🔄 Refresh Flows
          </button>
        )}
      </div>

      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✓ User Flow created successfully! Add steps to get started.
        </div>
      )}

      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="font-bold text-sm mb-3 text-gray-700">
          Saved User Flows {isLoading ? '(Loading...)' : `(${userFlows.length})`}
        </h3>
        {isLoading ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-600">Loading flows...</p>
          </div>
        ) : userFlows.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {userFlows.map((flow) => (
              <div
                key={flow.id}
                onClick={() => onSelectFlow(flow)}
                className={`border rounded-lg p-3 cursor-pointer transition ${
                  selectedUserFlow?.id === flow.id
                    ? 'border-blue-500 bg-blue-50 shadow'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-800 truncate">{flow.name}</h4>
                    {flow.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{flow.description}</p>
                    )}
                    <div className="flex gap-2 mt-2 items-center flex-wrap">
                      <span className="inline-block text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        {flow.steps?.length || 0} steps
                      </span>
                      {flow.status === 'executed' && (
                        <span className="inline-block text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-semibold">
                          ✓ Executed
                        </span>
                      )}
                      {flow.status === 'executing' && (
                        <span className="inline-block text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded font-semibold">
                          ⏳ Running
                        </span>
                      )}
                      {flow.status === 'failed' && (
                        <span className="inline-block text-xs bg-red-200 text-red-800 px-2 py-1 rounded font-semibold">
                          ✗ Failed
                        </span>
                      )}
                      {(!flow.status || flow.status === 'draft') && (
                        <span className="inline-block text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded font-semibold">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          'Delete this user flow? This will remove all steps and cannot be undone.',
                        )
                      ) {
                        onDeleteFlow(flow.id);
                      }
                    }}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 font-semibold flex-shrink-0"
                  >
                    ✕ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-600 mb-3">No user flows yet</p>
            <p className="text-xs text-gray-500">Create one above to start recording playwright actions</p>
          </div>
        )}
      </div>

      {/* Create User Flow Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Create New User Flow</h2>
            <p className="text-sm text-gray-600 mb-6">
              Create a user flow to record a sequence of Playwright actions like clicking, entering text, and verifying content.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">User Flow Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Login Flow, Checkout Flow"
                  value={newFlowName}
                  onChange={(e) => setNewFlowName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newFlowName.trim()) {
                      handleCreateFlow();
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description (Optional)</label>
                <textarea
                  placeholder="Describe what this flow does, e.g., 'User logs in and navigates to dashboard'"
                  value={newFlowDescription}
                  onChange={(e) => setNewFlowDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-6 border-t mt-6">
              <button
                onClick={handleCreateFlow}
                disabled={!newFlowName.trim() || isCreating}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 font-bold text-sm"
              >
                {isCreating ? 'Creating...' : 'Create Flow'}
              </button>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewFlowName('');
                  setNewFlowDescription('');
                }}
                className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50 font-bold text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
