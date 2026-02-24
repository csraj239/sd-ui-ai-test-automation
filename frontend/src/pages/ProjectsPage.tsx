import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

interface Project {
  id: string;
  name: string;
  description?: string;
  appUrl?: string;
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModal, setIsCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', appUrl: '' });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await apiClient.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      appUrl: project.appUrl || '',
    });
    setIsCreateModal(true);
  };

  const handleCreate = async () => {
    if (!formData.name) return;
    try {
      if (editingProject) {
        // Update existing project
        await apiClient.patch(`/projects/${editingProject.id}`, formData);
      } else {
        // Create new project
        await apiClient.post('/projects', formData);
      }
      setFormData({ name: '', description: '', appUrl: '' });
      setEditingProject(null);
      setIsCreateModal(false);
      loadProjects();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await apiClient.delete(`/projects/${id}`);
        loadProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Projects</h1>
        <button
          onClick={() => {
            setEditingProject(null);
            setFormData({ name: '', description: '', appUrl: '' });
            setIsCreateModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Project
        </button>
      </div>

      {/* Project Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">App URL</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-3 font-semibold">{project.name}</td>
                <td className="px-6 py-3 text-sm">{project.description || '-'}</td>
                <td className="px-6 py-3 text-sm">{project.appUrl || '-'}</td>
                <td className="px-6 py-3 text-center space-x-2">
                  <button 
                    onClick={() => handleEdit(project)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {isCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h2>
            <input
              type="text"
              placeholder="Project Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            />
            <input
              type="text"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            />
            <input
              type="url"
              placeholder="App URL"
              value={formData.appUrl}
              onChange={(e) => setFormData({ ...formData, appUrl: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                {editingProject ? 'Update' : 'Create'}
              </button>
              <button
                onClick={() => {
                  setIsCreateModal(false);
                  setEditingProject(null);
                }}
                className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
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
