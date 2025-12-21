import React from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Routes, Route, Navigate, Outlet } from 'react-router';
import MainLayout from './layout/MainLayout/MainLayout';
import ManagerLayout from './layout/ManagerLayout';
import AdminLayout from './layout/AdminLayout';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import Home from './pages/Home/Home';
import Events from './pages/Events/Events';
import MyEvents from './pages/MyEvents/MyEvents';
import UserProfile from './pages/UserProfile/UserProfile';
import EventDetail from './pages/EventDetail/EventDetail';
import EventDiscussion from './pages/EventDiscussion/EventDiscussion';
import SearchResult from './pages/SearchResult/SearchResult';
import Ranking from './pages/Ranking/Ranking';
import ManagerDashboard from './pages/Manager/ManagerDashboard';
import ManagerEvents from './pages/Manager/ManagerEvents';
import ManagerEventForm from './pages/Manager/ManagerEventForm';
import ManagerEventDetail from './pages/Manager/ManagerEventDetail';
import ManagerRegistrations from './pages/Manager/ManagerRegistrations';
import ErrorPage from './pages/ErrorPage/ErrorPage';

// Admin imports
import AdminDashboard from './pages/Admin/AdminDashboard';
import UsersManagement from './pages/Admin/UsersManagement';
import CategoriesManagement from './pages/Admin/CategoriesManagement';
import EventsManagement from './pages/Admin/EventsManagement';
import ReportsManagement from './pages/Admin/ReportsManagement';
import GamificationManagement from './pages/Admin/GamificationManagement';
import { ExportData } from './components/Admin';
import ProtectedRoute from './components/common/ProtectedRoute';

const App = () => {
  AOS.init({
    duration: 1000,
    once: false,
    mirror: true,
  });

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Main Layout Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route path="profile/:id" element={<UserProfile />} />
        <Route path="ranking" element={<Ranking />} />
        <Route
          path="myevents"
          element={
            <ProtectedRoute>
              <MyEvents />
            </ProtectedRoute>
          }
        />
        <Route path="result" element={<SearchResult />} />

        {/* Events Routes */}
        <Route
          path="events"
          element={
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route index element={<Events />} />
          <Route path=":id" element={<EventDetail />} />
          <Route path=":id/discussion" element={<EventDiscussion />} />
          <Route
            path=":id/discussion/posts/:postId"
            element={<EventDiscussion />}
          />
        </Route>
        
        {/* Catch-all route for 404 */}
        <Route path="*" element={<ErrorPage />} />
      </Route>
      
      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <ManagerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ManagerDashboard />}></Route>
        <Route path="events" element={<ManagerEvents />}></Route>
        <Route path="events/create" element={<ManagerEventForm />}></Route>
        <Route path="events/edit/:id" element={<ManagerEventForm />}></Route>
        <Route path="events/:id" element={<ManagerEventDetail />}></Route>
        <Route path="registrations" element={<ManagerRegistrations />}></Route>
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="events" element={<EventsManagement />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="categories" element={<CategoriesManagement />} />
        <Route path="gamification" element={<GamificationManagement />} />
        <Route path="reports" element={<ReportsManagement />} />
        <Route path="export" element={<ExportData />} />
      </Route>
      
      {/* Fallback for routes outside of layouts */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default App;
