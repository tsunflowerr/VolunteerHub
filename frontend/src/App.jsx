import React from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Routes, Route } from 'react-router';
import MainLayout from './layout/MainLayout';
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
          <Route path="/events/create" element={<EventForm />}></Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
