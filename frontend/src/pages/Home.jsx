import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AOS from 'aos';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Banner from '../components/Banner';
import EventSection from '../components/EventCard/EventSection';
import PartnerSlider from '../components/PartnerSlider';

const Home = () => {
  useEffect(() => {
    // Refresh AOS when component mounts
    AOS.refresh();
  }, []);

  return (
    <div className="home-container">
      <NavBar></NavBar>
      <div>
        <Banner></Banner>
        <EventSection></EventSection>
        <PartnerSlider></PartnerSlider>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default Home;
