import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="home-container">
      <NavBar></NavBar>
      <Footer></Footer>
    </div>
  );
};

export default Home;
