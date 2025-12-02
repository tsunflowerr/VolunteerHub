import React from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Routes, Route, Navigate } from 'react-router';
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
import ManagerDashboard from './pages/Manager/ManagerDashboard';
import ManagerEvents from './pages/Manager/ManagerEvents';
import ManagerEventForm from './pages/Manager/ManagerEventForm';
import ManagerEventDetail from './pages/Manager/ManagerEventDetail';
import ManagerRegistrations from './pages/Manager/ManagerRegistrations';

// Admin imports
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UsersManagement from './pages/Admin/UsersManagement';
import CategoriesManagement from './pages/Admin/CategoriesManagement';
import EventsManagement from './pages/Admin/EventsManagement';
import { ExportData } from './components/Admin';

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
        <Route path="profile" element={<UserProfile />} />
        <Route path="profile/:id" element={<UserProfile />} />
        <Route path="myevents" element={<MyEvents />} />
        <Route path="result" element={<SearchResult />} />

        {/* Events Routes */}
        <Route path="events">
          <Route index element={<Events />} />
          <Route path=":id" element={<EventDetail />} />
          <Route path=":id/discussion" element={<EventDiscussion />} />
        </Route>
      </Route>
      <Route path="/manager" element={<ManagerLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ManagerDashboard />}></Route>
        <Route path="events" element={<ManagerEvents />}></Route>
        <Route path="events/create" element={<ManagerEventForm />}></Route>
        <Route path="events/edit/:id" element={<ManagerEventForm />}></Route>
        <Route path="events/:id" element={<ManagerEventDetail />}></Route>
        <Route path="registrations" element={<ManagerRegistrations />}></Route>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="events" element={<EventsManagement />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="categories" element={<CategoriesManagement />} />
        <Route path="export" element={<ExportData />} />
      </Route>
    </Routes>
  );
};

export default App;
