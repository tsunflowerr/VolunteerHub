import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layout/AdminLayout/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard/AdminDashboard';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Redirect root to admin dashboard */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="events" element={<div style={{padding: '2rem'}}>Manage Events Page (Coming soon)</div>} />
        <Route path="users" element={<div style={{padding: '2rem'}}>Manage Users Page (Coming soon)</div>} />
      </Route>
    </Routes>
  );
}

export default App;
