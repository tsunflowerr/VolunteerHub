import { useEffect } from 'react';
import AOS from 'aos';
import Banner from '../components/Banner/Banner.jsx';
import EventSection from '../components/EventCard/EventSection.jsx';
import PartnerSlider from '../components/PartnerSlider/PartnerSlider.jsx';
import RatingSection from '../components/Rating/RatingSection.jsx';

const Home = () => {
  useEffect(() => {
    // Refresh AOS when component mounts
    AOS.refresh();
  }, []);

  return (
    <>
      <Banner></Banner>
      <EventSection></EventSection>
      <PartnerSlider></PartnerSlider>
      <RatingSection></RatingSection>
    </>
  );
};

export default Home;
