import React from 'react';
import RatingCard from './RatingCard';
import styles from './RatingSection.module.css';
const RatingSection = () => {
  return (
    <section className={styles['rating-container']}>
      {/* Header Section */}
      <div className={styles['rating-container__header']}>
        <h2 className={styles['rating-container__title']}>What Users Say</h2>
        <p className={styles['rating-container__subtitle']}>
          Real stories from people who made a difference through volunteering
        </p>
      </div>

      {/* Rating Cards Grid */}
      <div className={styles['rating-container__flex']}>
        <RatingCard
          image="https://randomuser.me/api/portraits/men/32.jpg"
          name="Anh Hiển"
          position="Tình nguyện viên"
          review="Tôi có trải nghiệm tuyệt với khi sử dụng VolunteerHub, tôi dễ dàng tìm kiếm được thông tin và tham gia các sự kiện thiện nguyện"
          rating={5}
        />
        <RatingCard
          image={'/hoimau.png'}
          name="Hội máu Việt Nam"
          position="Tổ chức thiện nguyện"
          review="Tổ chức các sự kiện trên VolunteerHub rất tiện lợi bởi VolunteerHub hỗ trợ các tính năng để quản lý, trao đổi một cách dễ dàng, nhanh chóng"
          rating={5}
        />
        <RatingCard
          image={'/aoamchoem.jpg'}
          name="Áo ấm cho em"
          position="Tổ chức"
          review="VolunteerHub giúp chúng tôi kết nối với các bạn trẻ nhiệt huyết. Thật tuyệt vời!"
          rating={5}
        />
        <RatingCard
          image={'/hoai-linh.jpg'}
          name="Mr. Linh"
          position="Tình nguyện viên quốc tế"
          review="Many people around the world connect through VolunteerHub to donate to my charity organization. I will definitely distribute those funds to people in need."
          rating={4}
        />
      </div>
    </section>
  );
};

export default RatingSection;
