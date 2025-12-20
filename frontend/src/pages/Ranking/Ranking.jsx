import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gamificationApi } from '../../api/gamification';
import { LevelBadge } from '../../components/Gamification';
import { Trophy, Medal, Award, Star } from 'lucide-react';
import styles from './Ranking.module.css';

const Ranking = () => {
  const [filterType, setFilterType] = useState('points'); // 'points', 'level', 'events', 'achievements'
  const [limit, setLimit] = useState(50);

  // Fetch leaderboard data - always use 'points' type for base data when filtering by achievements
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['leaderboard', filterType, limit],
    queryFn: () => gamificationApi.getLeaderboard({ 
      type: filterType === 'achievements' ? 'points' : filterType, 
      limit 
    }),
  });

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className={styles.ranking__iconGold} size={28} />;
    if (rank === 2) return <Medal className={styles.ranking__iconSilver} size={28} />;
    if (rank === 3) return <Medal className={styles.ranking__iconBronze} size={28} />;
    return <span className={styles.ranking__rankNumber}>#{rank}</span>;
  };

  const getRankClass = (rank) => {
    if (rank === 1) return styles['ranking__item--gold'];
    if (rank === 2) return styles['ranking__item--silver'];
    if (rank === 3) return styles['ranking__item--bronze'];
    return '';
  };

  const renderLeaderboardByAchievements = () => {
    if (!leaderboardData?.data) return null;

    // Sort by achievement count from user stats
    const sortedData = [...leaderboardData.data]
      .map(entry => ({
        ...entry,
        achievementCount: entry.stats?.achievementCount || entry.user?.gamification?.achievementCount || 0
      }))
      .sort((a, b) => b.achievementCount - a.achievementCount)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    return sortedData.map((entry) => (
      <div
        key={entry.user._id}
        className={`${styles.ranking__item} ${getRankClass(entry.rank)}`}
      >
        <div className={styles.ranking__rank}>
          {getRankIcon(entry.rank)}
        </div>
        
        <div className={styles.ranking__user}>
          <img
            src={entry.user.avatar || '/default-avatar.png'}
            alt={entry.user.username}
            className={styles.ranking__avatar}
          />
          <div className={styles.ranking__userInfo}>
            <h3 className={styles.ranking__username}>{entry.user.username}</h3>
            <div className={styles.ranking__userLevel}>
              <LevelBadge level={entry.currentLevel} levelInfo={entry.levelInfo} size="small" />
            </div>
          </div>
        </div>

        <div className={styles.ranking__stats}>
          <div className={styles.ranking__stat}>
            <Award size={20} />
            <span className={styles.ranking__statValue}>{entry.achievementCount}</span>
            <span className={styles.ranking__statLabel}>Achievements</span>
          </div>
        </div>
      </div>
    ));
  };

  const renderLeaderboard = () => {
    if (!leaderboardData?.data) return null;

    if (filterType === 'achievements') {
      return renderLeaderboardByAchievements();
    }

    return leaderboardData.data.map((entry) => (
      <div
        key={entry.user._id}
        className={`${styles.ranking__item} ${getRankClass(entry.rank)}`}
      >
        <div className={styles.ranking__rank}>
          {getRankIcon(entry.rank)}
        </div>
        
        <div className={styles.ranking__user}>
          <img
            src={entry.user.avatar || '/default-avatar.png'}
            alt={entry.user.username}
            className={styles.ranking__avatar}
          />
          <div className={styles.ranking__userInfo}>
            <h3 className={styles.ranking__username}>{entry.user.username}</h3>
            <div className={styles.ranking__userLevel}>
              <LevelBadge level={entry.currentLevel} levelInfo={entry.levelInfo} size="small" />
            </div>
          </div>
        </div>

        <div className={styles.ranking__stats}>
          {filterType === 'points' && (
            <div className={styles.ranking__stat}>
              <Star size={20} />
              <span className={styles.ranking__statValue}>{entry.totalPoints.toLocaleString()}</span>
              <span className={styles.ranking__statLabel}>Points</span>
            </div>
          )}
          {filterType === 'level' && (
            <div className={styles.ranking__stat}>
              <Trophy size={20} />
              <span className={styles.ranking__statValue}>Level {entry.currentLevel}</span>
              <span className={styles.ranking__statLabel}>Current Level</span>
            </div>
          )}
          {filterType === 'events' && (
            <div className={styles.ranking__stat}>
              <Award size={20} />
              <span className={styles.ranking__statValue}>{entry.stats?.eventsCompleted || 0}</span>
              <span className={styles.ranking__statLabel}>Events Completed</span>
            </div>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className={styles.ranking}>
      <div className={styles.ranking__container}>
        <div className={styles.ranking__header}>
          <h1 className={styles.ranking__title}>
            <Trophy size={32} />
            Leaderboard
          </h1>
          <p className={styles.ranking__subtitle}>
            View the top volunteers
          </p>
        </div>

        <div className={styles.ranking__filters}>
          <button
            className={`${styles.ranking__filterBtn} ${
              filterType === 'points' ? styles['ranking__filterBtn--active'] : ''
            }`}
            onClick={() => setFilterType('points')}
          >
            <Star size={18} />
            By Points
          </button>
          <button
            className={`${styles.ranking__filterBtn} ${
              filterType === 'level' ? styles['ranking__filterBtn--active'] : ''
            }`}
            onClick={() => setFilterType('level')}
          >
            <Trophy size={18} />
            By Level
          </button>
          <button
            className={`${styles.ranking__filterBtn} ${
              filterType === 'achievements' ? styles['ranking__filterBtn--active'] : ''
            }`}
            onClick={() => setFilterType('achievements')}
          >
            <Award size={18} />
            By Achievements
          </button>
          <button
            className={`${styles.ranking__filterBtn} ${
              filterType === 'events' ? styles['ranking__filterBtn--active'] : ''
            }`}
            onClick={() => setFilterType('events')}
          >
            <Medal size={18} />
            By Events
          </button>
        </div>

        <div className={styles.ranking__limitSelector}>
          <label>Show: </label>
          <select 
            value={limit} 
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className={styles.ranking__limitSelect}
          >
            <option value={10}>Top 10</option>
            <option value={25}>Top 25</option>
            <option value={50}>Top 50</option>
            <option value={100}>Top 100</option>
          </select>
        </div>

        {isLoading ? (
          <div className={styles.ranking__loading}>
            <div className={styles.ranking__spinner}></div>
            <p>Loading leaderboard...</p>
          </div>
        ) : (
          <div className={styles.ranking__list}>
            {renderLeaderboard()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Ranking;
