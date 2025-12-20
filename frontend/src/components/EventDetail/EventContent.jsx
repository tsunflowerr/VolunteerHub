import { Trophy, Star, Lock, Award } from 'lucide-react';
import EventHost from './EventHost';
import EventDateTime from './EventDateTime';
import EventLocation from './EventLocation';
import EventCategories from './EventCategories';
import EventAbout from './EventAbout';
import styles from './EventDetail.module.css';

const EventContent = ({ event }) => {
  const hasRewards = event.rewards && (event.rewards.pointsReward > 0 || event.rewards.hoursCredit > 0);
  const hasRequirements = event.requirements?.hasRequirements;

  return (
    <div className={styles['event-detail__main']}>
      <h1 className={styles['event-detail__title']}>{event.name}</h1>

      <EventHost managerId={event.managerId} />

      <EventDateTime startDate={event.startDate} endDate={event.endDate} />

      <EventLocation location={event.location} />

      <EventCategories categories={event.categories} />

      {/* Event Rewards */}
      {hasRewards && (
        <div className={styles['event-detail__rewards']}>
          <h3 className={styles['event-detail__rewards-title']}>
            <Trophy size={24} />
            Rewards for Completion
          </h3>
          <div className={styles['event-detail__rewards-list']}>
            {event.rewards.pointsReward > 0 && (
              <div className={styles['event-detail__reward-item']}>
                <div className={styles['event-detail__reward-icon']}>
                  <Star size={20} />
                </div>
                <div className={styles['event-detail__reward-info']}>
                  <span className={styles['event-detail__reward-value']}>{event.rewards.pointsReward}</span>
                  <span className={styles['event-detail__reward-label']}>XP Points</span>
                </div>
              </div>
            )}
            {event.rewards.hoursCredit > 0 && (
              <div className={styles['event-detail__reward-item']}>
                <div className={styles['event-detail__reward-icon']}>
                  <Award size={20} />
                </div>
                <div className={styles['event-detail__reward-info']}>
                  <span className={styles['event-detail__reward-value']}>{event.rewards.hoursCredit}</span>
                  <span className={styles['event-detail__reward-label']}>Volunteer Hours</span>
                </div>
              </div>
            )}
            {event.rewards.bonusPoints > 0 && (
              <div className={styles['event-detail__reward-item']}>
                <div className={styles['event-detail__reward-icon']}>
                  <Star size={20} />
                </div>
                <div className={styles['event-detail__reward-info']}>
                  <span className={styles['event-detail__reward-value']}>+{event.rewards.bonusPoints}</span>
                  <span className={styles['event-detail__reward-label']}>
                    Bonus XP {event.rewards.bonusReason && `(${event.rewards.bonusReason})`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Requirements */}
      {hasRequirements && (
        <div className={styles['event-detail__requirements']}>
          <h3 className={styles['event-detail__requirements-title']}>
            <Lock size={24} />
            Requirements to Join
          </h3>
          {event.requirements.requirementDescription && (
            <p className={styles['event-detail__requirements-desc']}>
              {event.requirements.requirementDescription}
            </p>
          )}
          <div className={styles['event-detail__requirements-list']}>
            {event.requirements.minLevel > 1 && (
              <div className={styles['event-detail__requirement-item']}>
                <Lock size={18} />
                Minimum Level: <span>{event.requirements.minLevel}</span>
              </div>
            )}
            {event.requirements.minEventsCompleted > 0 && (
              <div className={styles['event-detail__requirement-item']}>
                <Award size={18} />
                Min. Events Completed: <span>{event.requirements.minEventsCompleted}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <EventAbout
        description={event.description}
        activities={event.activities}
        prepare={event.prepare}
        images={event.images}
      />
    </div>
  );
};

export default EventContent;
