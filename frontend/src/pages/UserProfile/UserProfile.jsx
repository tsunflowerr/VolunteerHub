import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import useAuth from '../../hooks/useAuth';
import {
  useUserProfile,
  useUpdateProfile,
  useChangePassword,
  useDeleteAccount,
} from '../../hooks/useUser';
import {
  MapPin,
  Mail,
  Phone,
  Calendar,
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
  const { id } = useParams();
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const eventsPerPage = 9;

  const { data: user, isLoading: loading, isError } = useUserProfile(id);

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const deleteAccount = useDeleteAccount();

  const isOwnProfile =
    !id ||
    (currentUser &&
      user &&
      (currentUser.id === user.id || currentUser._id === user._id));
  const stats = user?.stats || { events: 0, hours: 0, hosts: 0 };

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

  const handleEditProfile = async (data) => {
    try {
      await updateProfile.mutateAsync(data);
      setOpen(false);
    } catch (error) {
      // Error handling is done in the hook
      console.error(error);
    }
  };

  const handleChangePasswordSubmit = async (data) => {
    try {
      await changePassword.mutateAsync(data);
    } catch (error) {
      console.error(error);
      throw error; // Re-throw so the form can handle it if needed
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      try {
        await deleteAccount.mutateAsync();
        await logout(); // Ensure local state is cleared
        navigate('/');
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles['profile']}>
        <div
          className={styles['profile__container']}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
        >
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className={styles['profile']}>
        <div
          className={styles['profile__container']}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
        >
          <h2>User not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['profile']}>
      <div className={styles['profile__container']}>
        {/* Sidebar */}
        <aside className={styles['profile__sidebar']}>
          {/* Avatar Section */}
          <div className={styles['profile__avatar-section']}>
            <img
              src={user.avatar || 'https://via.placeholder.com/150'}
              alt={user.username}
              className={styles['profile__avatar']}
            />
            <h1 className={styles['profile__name']}>{user.username}</h1>
            <p className={styles['profile__role']}>
              {user.bio || 'No bio available'}
            </p>
          </div>

          {/* Stats Section */}
          <div className={styles['profile__stats']}>
            <div className={styles['profile__stat']}>
              <div className={styles['profile__stat-value']}>
                {stats.events}
              </div>
              <div className={styles['profile__stat-label']}>Events</div>
            </div>

            <div className={styles['profile__stat']}>
              <div className={styles['profile__stat-value']}>{stats.hours}</div>
              <div className={styles['profile__stat-label']}>Hours</div>
            </div>

            <div className={styles['profile__stat']}>
              <div className={styles['profile__stat-value']}>{stats.hosts}</div>
              <div className={styles['profile__stat-label']}>Hosts</div>
            </div>
          </div>

          {/* About Section */}
          <div className={styles['profile__about']}>
            <h2 className={styles['profile__section-title']}>ABOUT</h2>
            <p className={styles['profile__about-text']}>
              {user.about ||
                "This user hasn't written anything about themselves yet."}
            </p>
          </div>

          {/* Contact Info */}
          <div className={styles['profile__contact']}>
            <div className={styles['profile__contact-item']}>
              <Mail size={18} />
              <span>{user.email}</span>
            </div>

            <div className={styles['profile__contact-item']}>
              <Phone size={18} />
              <span>{user.phoneNumber || 'No phone number'}</span>
            </div>

            <div className={styles['profile__contact-item']}>
              <MapPin size={18} />
              <span>{user.location || 'Location not set'}</span>
            </div>

            <div className={styles['profile__contact-item']}>
              <Calendar size={18} />
              <span>
                Member since{' '}
                {user.createdAt
                  ? format(new Date(user.createdAt), 'MMMM yyyy')
                  : 'Unknown'}
              </span>
            </div>
          </div>

          {/* Interests Section */}
          <div className={styles['profile__interests']}>
            <h2 className={styles['profile__section-title']}>INTERESTS</h2>
            {user.interests && user.interests.length > 0 ? (
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
            ) : (
              <p className={styles['profile__about-text']}>
                No interests listed.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {isOwnProfile && (
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
                onSubmit={handleChangePasswordSubmit}
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
          )}
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
