import React from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Routes, Route } from 'react-router';
import MainLayout from './layout/MainLayout/MainLayout';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import Home from './pages/Home/Home';
import UserInfo from './components/UserInfo/UserInfo';
import Events from './pages/Events/Events';
import MyEvents from './pages/MyEvents/MyEvents';
import UserProfile from './pages/UserProfile/UserProfile';
import EventDetail from './pages/EventDetail/EventDetail';
import EventForm from './pages/EventForm/EventForm';

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
        <Route path="userinfo" element={<UserInfo />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="myevents" element={<MyEvents />} />

        {/* Events Routes */}
        <Route path="events">
          <Route index element={<Events />} />
          <Route path="create" element={<EventForm />} />
          <Route path=":id" element={<EventDetail />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
