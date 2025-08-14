import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ProtectedRoute } from './components/Router/ProtectedRoute';
import { PublicRoute } from './components/Router/PublicRoute';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import FormsPage from './pages/FormsPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicRoute />}>
              <Route index element={<HomePage />} />
            </Route>

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute />}>
              <Route index element={<DashboardPage />} />
            </Route>

            {/* Forms routes - accessible by authenticated users */}
            <Route path="/forms" element={<ProtectedRoute />}>
              <Route index element={<FormsPage />} />
            </Route>

            {/* Error routes */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            
            {/* Catch all - redirect to 404 */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;