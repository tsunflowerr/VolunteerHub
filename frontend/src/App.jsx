import React from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Routes, Route } from 'react-router';
import MainLayout from './layout/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Home from './pages/Home';
import UserInfo from './components/UserInfo/UserInfo';

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
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
