import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Carousel from './Carousel';
import styles from './Banner.module.css';
import bg1 from '../../assets/images/4.jpg';
import bg2 from '../../assets/images/5.jpg';
import bg3 from '../../assets/images/6.jpg';

const Banner = () => {
  return (
    <div
      className={styles.banner}
      data-aos="fade-up"
      data-aos-anchor-placement="top-bottom"
      data-aos-easing="linear"
      data-aos-duration="1000"
    >
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper"
      >
        <SwiperSlide>
          <Carousel
            image={bg1}
            name="Join Our Cause"
            brief="Dive into community service and be a catalyst for change. With VolunteerHub, you're not just volunteering; you're becoming part of a movement dedicated to creating a brighter future for all."
          ></Carousel>
        </SwiperSlide>
        <SwiperSlide>
          <Carousel
            image={bg2}
            name="Empower Change"
            brief=" Take action and be the change you wish to see. VolunteerHub provides the platform for you to champion causes close to your heart, driving tangible impact and fostering a culture of empowerment."
          ></Carousel>
        </SwiperSlide>
        <SwiperSlide>
          <Carousel
            image={bg3}
            name="Connect and Grow"
            brief="Expand your network while making a difference. VolunteerHub connects you with passionate individuals, fostering friendships and providing opportunities for personal and professional growth."
          ></Carousel>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default Banner;
