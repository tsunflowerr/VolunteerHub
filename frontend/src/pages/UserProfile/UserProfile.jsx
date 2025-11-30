import { useState } from 'react';
import {
  MapPin,
  Mail,
  Phone,
  Calendar,
  Award,
  Heart,
  Edit2,
  Trash2,
  Lock,
} from 'lucide-react';
import EventList from '../../components/EventCard/EventList';
import { volunteerEvents } from '../../dummy/volunteerEvents';
import { Pagination } from '@mui/material';
import styles from './UserProfile.module.css';
import { categoriesById } from '../../utilities/CategoriesIcons.jsx';
import UserInfoDialog from '../../components/UserInfo/UserInfoDialog.jsx';
import ChangePasswordDialog from '../../components/UserInfo/ChangePasswordDialog.jsx';

const UserProfile = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const eventsPerPage = 9;
  const [user, setUser] = useState({
    id: 1,
    username: 'John Doe',
    email: 'john.doe@example.com',
    location: 'San Francisco, CA',
    phoneNumber: '09342343',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    joinedDate: '2022',
    bio: 'Passionate Volunteer',
    about:
      'Dedicated to making a positive impact in the community through volunteering. Passionate about environmental conservation and social justice.',
    stats: {
      events: 24,
      hours: 156,
      hosts: 12,
    },
    interests: ['health', 'education', 'community-development'],
  });

  // Filter events that user has contributed to (mock filter)
  // In production, this would be filtered by user ID from the backend
  const contributedEvents = volunteerEvents.slice(0, 15); // Mock data

  // Pagination
  const totalEvents = contributedEvents.length;
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = contributedEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );

  const handleChangePage = (e, value) => setCurrentPage(value);

  const handleEditProfile = (e) => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.currentTarget));
    console.log(data);
    // TODO: handle update userProfile

    setOpen(false);
  };

  const handleDeleteAccount = () => {
    // TODO: Implement delete account functionality
    if (
      window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      console.log('Delete account clicked');
    }
  };

  return (
    <div className={styles['profile']}>
      <div className={styles['profile__container']}>
        {/* Sidebar */}
        <aside className={styles['profile__sidebar']}>
          {/* Avatar Section */}
          <div className={styles['profile__avatar-section']}>
            <img
              src={user.avatar}
              alt={user.name}
              className={styles['profile__avatar']}
            />
            <h1 className={styles['profile__name']}>{user.username}</h1>
            <p className={styles['profile__role']}>{user.bio}</p>
          </div>

          {/* Stats Section */}
          <div className={styles['profile__stats']}>
            <div className={styles['profile__stat']}>
              <div className={styles['profile__stat-value']}>
                {user.stats.events}
              </div>
              <div className={styles['profile__stat-label']}>Events</div>
            </div>

            <div className={styles['profile__stat']}>
              <div className={styles['profile__stat-value']}>
                {user.stats.hours}
              </div>
              <div className={styles['profile__stat-label']}>Hours</div>
            </div>

            <div className={styles['profile__stat']}>
              <div className={styles['profile__stat-value']}>
                {user.stats.hosts}
              </div>
              <div className={styles['profile__stat-label']}>Hosts</div>
            </div>
          </div>

          {/* About Section */}
          <div className={styles['profile__about']}>
            <h2 className={styles['profile__section-title']}>ABOUT</h2>
            <p className={styles['profile__about-text']}>{user.about}</p>
          </div>

          {/* Contact Info */}
          <div className={styles['profile__contact']}>
            <div className={styles['profile__contact-item']}>
              <Mail size={18} />
              <span>{user.email}</span>
            </div>

            <div className={styles['profile__contact-item']}>
              <Phone size={18} />
              <span>{user.phoneNumber}</span>
            </div>

            <div className={styles['profile__contact-item']}>
              <MapPin size={18} />
              <span>{user.location}</span>
            </div>

            <div className={styles['profile__contact-item']}>
              <Calendar size={18} />
              <span>Member since {user.joinedDate}</span>
            </div>
          </div>

          {/* Interests Section */}
          <div className={styles['profile__interests']}>
            <h2 className={styles['profile__section-title']}>INTERESTS</h2>
            {user.interests && (
              <div className={styles['profile__interest-item']}>
                {user.interests.map((categoryId) => {
                  const category = categoriesById[categoryId];
                  if (!category) return null;

                  return (
                    <div
                      key={categoryId}
                      className={styles['profile__interest']}
                    >
                      {category.icon && (
                        <span className={styles['profile__interest-icon']}>
                          {category.icon}
                        </span>
                      )}
                      {category.name}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={styles['profile__actions']}>
            <UserInfoDialog
              user={user}
              onSubmit={handleEditProfile}
              open={open}
              onOpenChange={setOpen}
            >
              <button className={styles['profile__btn-edit']}>
                <Edit2 size={18} />
                Edit Profile
              </button>
            </UserInfoDialog>

            <ChangePasswordDialog
              open={passwordOpen}
              onOpenChange={setPasswordOpen}
            >
              <button className={styles['profile__btn-password']}>
                <Lock size={18} />
                Change Password
              </button>
            </ChangePasswordDialog>

            <button
              className={styles['profile__btn-delete']}
              onClick={handleDeleteAccount}
            >
              <Trash2 size={18} />
              Remove Account
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles['profile__main']}>
          <div className={styles['profile__header']}>
            <h2 className={styles['profile__main-title']}>
              Contributed Events
            </h2>
            <p className={styles['profile__main-subtitle']}>
              Events you've participated in and made an impact
            </p>
          </div>

          {currentEvents.length > 0 ? (
            <>
              <EventList events={currentEvents} />
              {totalEvents > eventsPerPage && (
                <div className={styles['profile__pagination']}>
                  <Pagination
                    count={Math.ceil(totalEvents / eventsPerPage)}
                    shape="rounded"
                    page={currentPage}
                    onChange={handleChangePage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className={styles['profile__empty']}>
              <Calendar size={80} className={styles['profile__empty-icon']} />
              <p className={styles['profile__empty-text']}>
                You haven't contributed to any events yet.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
