import PropTypes from 'prop-types';
import styles from './Gamification.module.css';

/**
 * Achievement Badge Component - displays a single achievement
 */
export function AchievementBadge({ 
  achievement, 
  userProgress = null, 
  size = 'medium',
  onClick 
}) {
  const isLocked = !userProgress?.isCompleted;
  const progress = userProgress?.progress || 0;
  const threshold = achievement.criteria?.threshold || 1;
  const progressPercent = Math.min(100, (progress / threshold) * 100);

  const rarityClass = `achievement-badge--${achievement.rarity || 'common'}`;
  const lockedClass = isLocked ? 'achievement-badge--locked' : '';

  return (
    <div 
      className={`${styles['achievement-badge']} ${styles[rarityClass]} ${isLocked ? styles[lockedClass] : ''}`}
      onClick={() => onClick?.(achievement)}
      title={achievement.description}
    >
      <span className={styles['achievement-badge__icon']}>
        {achievement.icon || '🏆'}
      </span>
      <span className={styles['achievement-badge__name']}>
        {achievement.name}
      </span>
      {userProgress?.timesAwarded > 1 && (
        <span className={styles['achievement-badge__count']}>
          ×{userProgress.timesAwarded}
        </span>
      )}
      {size !== 'small' && (
        <span className={styles['achievement-badge__description']}>
          {achievement.description}
        </span>
      )}
      {achievement.pointsReward > 0 && (
        <span className={styles['achievement-badge__points']}>
          +{achievement.pointsReward} pts
        </span>
      )}
      {isLocked && threshold > 1 && (
        <div className={styles['achievement-badge__progress']}>
          <div className={styles['achievement-badge__progress-bar']}>
            <div 
              className={styles['achievement-badge__progress-fill']}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className={styles['achievement-badge__progress-text']}>
            {progress}/{threshold}
          </span>
        </div>
      )}
    </div>
  );
}

AchievementBadge.propTypes = {
  achievement: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    icon: PropTypes.string,
    color: PropTypes.string,
    rarity: PropTypes.oneOf(['common', 'uncommon', 'rare', 'epic', 'legendary']),
    pointsReward: PropTypes.number,
    criteria: PropTypes.shape({
      type: PropTypes.string,
      threshold: PropTypes.number
    })
  }).isRequired,
  userProgress: PropTypes.shape({
    progress: PropTypes.number,
    isCompleted: PropTypes.bool,
    completedAt: PropTypes.string
  }),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  onClick: PropTypes.func
};

/**
 * Achievement Card Component - larger display with more details
 */
export function AchievementCard({ 
  achievement, 
  completedAt,
  showDate = true 
}) {
  return (
    <div className={styles['achievement-card']}>
      <div 
        className={styles['achievement-card__icon']}
        style={{ backgroundColor: achievement.color + '20' }}
      >
        {achievement.icon || '🏆'}
      </div>
      <div className={styles['achievement-card__content']}>
        <h4 className={styles['achievement-card__name']}>{achievement.name}</h4>
        <p className={styles['achievement-card__description']}>{achievement.description}</p>
        <div className={styles['achievement-card__meta']}>
          <span className={`${styles['achievement-card__rarity']} ${styles[`achievement-card__rarity--${achievement.rarity}`]}`}>
            {achievement.rarity}
          </span>
          {achievement.pointsReward > 0 && (
            <span>+{achievement.pointsReward} điểm</span>
          )}
          {showDate && completedAt && (
            <span className={styles['achievement-card__date']}>
              {new Date(completedAt).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

AchievementCard.propTypes = {
  achievement: PropTypes.object.isRequired,
  completedAt: PropTypes.string,
  showDate: PropTypes.bool
};

/**
 * Achievements Grid Component - displays multiple achievements
 */
export function AchievementsGrid({ achievements, userAchievements = [], onAchievementClick }) {
  // Create a map of user achievements for quick lookup
  const userAchievementMap = userAchievements.reduce((acc, ua) => {
    acc[ua.achievementId?._id || ua.achievementId] = ua;
    return acc;
  }, {});

  return (
    <div className={styles['achievements-grid']}>
      {achievements.map(achievement => {
        const userAch = userAchievementMap[achievement._id];
        return (
          <div 
            key={achievement._id}
            className={styles['achievement-icon-only']}
            title={`${achievement.name}${userAch?.timesAwarded > 1 ? ` (×${userAch.timesAwarded})` : ''}`}
            onClick={() => onAchievementClick?.(achievement)}
            style={{ cursor: onAchievementClick ? 'pointer' : 'default', position: 'relative' }}
          >
            <span style={{ fontSize: '2rem' }}>{achievement.icon || '🏆'}</span>
            {userAch?.timesAwarded > 1 && (
              <span className={styles['achievement-badge__count']} style={{ top: '-5px', right: '-5px', fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                ×{userAch.timesAwarded}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

AchievementsGrid.propTypes = {
  achievements: PropTypes.array.isRequired,
  userAchievements: PropTypes.array,
  onAchievementClick: PropTypes.func
};

/**
 * Level Badge Component - displays user's current level
 */
export function LevelBadge({ level, levelInfo, size = 'medium' }) {
  const style = {
    backgroundColor: (levelInfo?.color || '#4CAF50') + '20',
    color: levelInfo?.color || '#4CAF50',
    border: `2px solid ${levelInfo?.color || '#4CAF50'}`
  };

  return (
    <div className={styles['level-badge']} style={style}>
      <span className={styles['level-badge__icon']}>
        {levelInfo?.icon || '⭐'}
      </span>
      <div className={styles['level-badge__info']}>
        <span className={styles['level-badge__level']}>Level {level}</span>
        <span className={styles['level-badge__name']}>
          {levelInfo?.name || `Level ${level}`}
        </span>
      </div>
    </div>
  );
}

LevelBadge.propTypes = {
  level: PropTypes.number.isRequired,
  levelInfo: PropTypes.shape({
    name: PropTypes.string,
    icon: PropTypes.string,
    color: PropTypes.string
  }),
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};

/**
 * Level Progress Component - shows XP progress bar to next level
 */
export function LevelProgress({ 
  currentLevel, 
  currentLevelInfo, 
  nextLevelInfo, 
  totalPoints, 
  progressPercent,
  pointsToNextLevel 
}) {
  const currentLevelPoints = currentLevelInfo?.pointsRequired || 0;
  const nextLevelPoints = nextLevelInfo?.pointsRequired || (currentLevelPoints + 100);
  const pointsInCurrentLevel = totalPoints - currentLevelPoints;
  const pointsNeededForLevel = nextLevelPoints - currentLevelPoints;
  
  return (
    <div className={styles['level-progress']}>
      <div className={styles['level-progress__header']}>
        <div className={styles['level-progress__current']}>
          <span className={styles['level-progress__current-icon']}>
            {currentLevelInfo?.icon || '⭐'}
          </span>
          <div className={styles['level-progress__current-info']}>
            <span className={styles['level-progress__current-level']}>
              Level {currentLevel}
            </span>
            <span className={styles['level-progress__current-name']}>
              {currentLevelInfo?.name || `Level ${currentLevel}`}
            </span>
          </div>
        </div>
        {nextLevelInfo && (
          <div className={styles['level-progress__next']}>
            <span className={styles['level-progress__next-label']}>Next</span>
            <span className={styles['level-progress__next-name']}>
              {nextLevelInfo.icon} {nextLevelInfo.name}
            </span>
          </div>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className={styles['level-progress__xp-bar']}>
        <div className={styles['level-progress__bar']}>
          <div 
            className={styles['level-progress__bar-fill']}
            style={{ width: `${Math.min(progressPercent || 0, 100)}%` }}
          />
          <span className={styles['level-progress__bar-text']}>
            {Math.round(progressPercent || 0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

LevelProgress.propTypes = {
  currentLevel: PropTypes.number.isRequired,
  currentLevelInfo: PropTypes.object,
  nextLevelInfo: PropTypes.object,
  totalPoints: PropTypes.number.isRequired,
  progressPercent: PropTypes.number.isRequired,
  pointsToNextLevel: PropTypes.number
};

/**
 * Points Display Component
 */
export function PointsDisplay({ points, label = 'XP', size = 'medium' }) {
  return (
    <div className={`${styles['points-display']} ${styles[`points-display--${size}`]}`}>
      <span className={styles['points-display__icon']}>⚡</span>
      <span className={styles['points-display__value']}>{points.toLocaleString()}</span>
      <span className={styles['points-display__label']}>{label}</span>
    </div>
  );
}

PointsDisplay.propTypes = {
  points: PropTypes.number.isRequired,
  label: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};

/**
 * Leaderboard Component
 */
export function Leaderboard({ data, title = 'Bảng xếp hạng' }) {
  const getRankClass = (rank) => {
    if (rank === 1) return styles['leaderboard__item--top-1'];
    if (rank === 2) return styles['leaderboard__item--top-2'];
    if (rank === 3) return styles['leaderboard__item--top-3'];
    return '';
  };

  const getRankNumberClass = (rank) => {
    if (rank <= 3) return styles[`leaderboard__rank--${rank}`];
    return '';
  };

  return (
    <div className={styles['leaderboard']}>
      <h3 className={styles['leaderboard__title']}>
        🏆 {title}
      </h3>
      <div className={styles['leaderboard__list']}>
        {data.map((entry) => (
          <div 
            key={entry.rank} 
            className={`${styles['leaderboard__item']} ${getRankClass(entry.rank)}`}
          >
            <span className={`${styles['leaderboard__rank']} ${getRankNumberClass(entry.rank)}`}>
              {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
            </span>
            <img 
              src={entry.user?.avatar || 'https://via.placeholder.com/40'} 
              alt={entry.user?.username}
              className={styles['leaderboard__avatar']}
            />
            <div className={styles['leaderboard__user-info']}>
              <span className={styles['leaderboard__username']}>
                {entry.user?.username || 'Unknown'}
              </span>
              <span className={styles['leaderboard__level']}>
                {entry.levelInfo?.icon} {entry.levelInfo?.name || `Level ${entry.currentLevel}`}
              </span>
            </div>
            <span className={styles['leaderboard__points']}>
              {entry.totalPoints.toLocaleString()} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

Leaderboard.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    rank: PropTypes.number.isRequired,
    user: PropTypes.shape({
      username: PropTypes.string,
      avatar: PropTypes.string
    }),
    totalPoints: PropTypes.number.isRequired,
    currentLevel: PropTypes.number,
    levelInfo: PropTypes.object
  })).isRequired,
  title: PropTypes.string
};

export default {
  AchievementBadge,
  AchievementCard,
  AchievementsGrid,
  LevelBadge,
  LevelProgress,
  PointsDisplay,
  Leaderboard
};
