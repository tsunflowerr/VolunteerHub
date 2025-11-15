import React from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Routes, Route } from 'react-router';
import MainLayout from './layout/MainLayout';
import ManagerLayout from './layout/ManagerLayout';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import Home from './pages/Home/Home';
import UserInfo from './components/UserInfo/UserInfo';
import Events from './pages/Events/Events';
import MyEvents from './pages/MyEvents/MyEvents';
import UserProfile from './pages/UserProfile/UserProfile';
import EventDetail from './pages/EventDetail/EventDetail';
import EventForm from './pages/EventForm/EventForm';
import ManagerDashboard from './pages/Manager/ManagerDashboard';
import ManagerEvents from './pages/Manager/ManagerEvents';
import ManagerEventForm from './pages/Manager/ManagerEventForm';
import ManagerEventDetail from './pages/Manager/ManagerEventDetail';
import ManagerRegistrations from './pages/Manager/ManagerRegistrations';

const App = () => {
  AOS.init({
    duration: 1000,
    once: false,
    mirror: true,
  });
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />}></Route>
      <Route path="/register" element={<RegisterPage />}></Route>
      <Route path="/" element={<MainLayout />}>
        <Route>
          <Route path="/" element={<Home />}></Route>
          <Route path="/userinfo" element={<UserInfo />}></Route>
          <Route path="/events" element={<Events />}></Route>
          <Route path="/events/:id" element={<EventDetail />}></Route>
          <Route path="/myevents" element={<MyEvents />}></Route>
          <Route path="/profile" element={<UserProfile />}></Route>
        </Route>
      </Route>
      <Route path="/manager" element={<ManagerLayout />}>
        <Route path="dashboard" element={<ManagerDashboard />}></Route>
        <Route path="events" element={<ManagerEvents />}></Route>
        <Route path="events/create" element={<ManagerEventForm />}></Route>
        <Route path="events/edit/:id" element={<ManagerEventForm />}></Route>
        <Route path="events/:id" element={<ManagerEventDetail />}></Route>
        <Route path="registrations" element={<ManagerRegistrations />}></Route>
      </Route>
    </Routes>
  );
};

export default App;
