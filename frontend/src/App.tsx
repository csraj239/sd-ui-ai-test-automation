import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { PlannerPage } from '@/pages/PlannerPage';
import { GeneratorPage } from '@/pages/GeneratorPage';
import { ScenariosPage } from '@/pages/ScenariosPage';
import { SuitesPage } from '@/pages/SuitesPage';
import { ExecutionPage } from '@/pages/ExecutionPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { HealerPage } from '@/pages/HealerPage';
import { Navigation } from '@/components/Navigation';

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        {/* Main Application Routes */}
        <Route
          path="/*"
          element={
            <>
              <Navigation />
              {/* Content wrapper with left margin for collapsed sidebar */}
              <div className="ml-20 min-h-screen">
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/planner" element={<PlannerPage />} />
                  <Route path="/generator" element={<GeneratorPage />} />
                  <Route path="/scenarios" element={<ScenariosPage />} />
                  <Route path="/suites" element={<SuitesPage />} />
                  <Route path="/execution" element={<ExecutionPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/healer" element={<HealerPage />} />
                </Routes>
              </div>
            </>
          }
        />
      </Routes>
    </Router>
  );
}
