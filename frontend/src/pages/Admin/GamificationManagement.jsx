import { useState, useCallback } from 'react';
import { Plus, Loader2, Trophy, Star, Zap, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useAdminAchievements,
  useAdminLevels,
  useCreateAchievement,
  useUpdateAchievement,
  useDeleteAchievement,
  useCreateLevel,
  useUpdateLevel,
  useDeleteLevel,
  useSeedDefaultLevels,
  useSeedDefaultAchievements,
  useGamificationStats,
} from '../../hooks/useGamification';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import styles from './GamificationManagement.module.css';

// ==================== Achievement Modal ====================
function AchievementModal({ isOpen, onClose, achievement, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    name: achievement?.name || '',
    slug: achievement?.slug || '',
    description: achievement?.description || '',
    icon: achievement?.icon || '🏆',
    color: achievement?.color || '#FFD700',
    category: achievement?.category || 'participation',
    rarity: achievement?.rarity || 'common',
    pointsReward: achievement?.pointsReward || 0,
    criteriaType: achievement?.criteria?.type || 'manual',
    criteriaThreshold: achievement?.criteria?.threshold || 1,
    displayOrder: achievement?.displayOrder || 0,
    isActive: achievement?.isActive ?? true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      icon: formData.icon,
      color: formData.color,
      category: formData.category,
      rarity: formData.rarity,
      pointsReward: formData.pointsReward,
      criteria: {
        type: formData.criteriaType,
        threshold: formData.criteriaThreshold
      },
      displayOrder: formData.displayOrder,
      isActive: formData.isActive
    };
    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>
          {achievement ? 'Edit Achievement' : 'Create Achievement'}
        </h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Icon (Emoji)</label>
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Color</label>
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="participation">Participation</option>
                <option value="milestone">Milestone</option>
                <option value="special">Special</option>
                <option value="category_master">Category Master</option>
                <option value="streak">Streak</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Rarity</label>
              <select name="rarity" value={formData.rarity} onChange={handleChange}>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Criteria Type</label>
              <select name="criteriaType" value={formData.criteriaType} onChange={handleChange}>
                <option value="manual">Manual (Awarded by Manager)</option>
                <option value="first_event">First Event Completed</option>
                <option value="events_completed">Events Completed</option>
                <option value="hours_volunteered">Hours Volunteered</option>
                <option value="consecutive_events">Consecutive Events</option>
                <option value="events_hosted">Events Hosted</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Threshold</label>
              <input
                type="number"
                name="criteriaThreshold"
                value={formData.criteriaThreshold}
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Points Reward</label>
              <input
                type="number"
                name="pointsReward"
                value={formData.pointsReward}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              Active
            </label>
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.btnCancel}>
              Cancel
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : achievement ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== Level Modal ====================
function LevelModal({ isOpen, onClose, level, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    level: level?.level || 1,
    name: level?.name || '',
    title: level?.title || '',
    description: level?.description || '',
    pointsRequired: level?.pointsRequired || 0,
    icon: level?.icon || '⭐',
    color: level?.color || '#4CAF50',
    perks: level?.perks?.join('\n') || '',
    isActive: level?.isActive ?? true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      level: formData.level,
      name: formData.name,
      title: formData.title,
      description: formData.description,
      pointsRequired: formData.pointsRequired,
      icon: formData.icon,
      color: formData.color,
      perks: formData.perks.split('\n').filter(p => p.trim()),
      isActive: formData.isActive
    };
    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>
          {level ? 'Edit Level' : 'Create Level'}
        </h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Level Number</label>
              <input
                type="number"
                name="level"
                value={formData.level}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Points Required</label>
              <input
                type="number"
                name="pointsRequired"
                value={formData.pointsRequired}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Name (Vietnamese)</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Chiến Tướng"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Title (English)</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., General"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Icon (Emoji)</label>
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Color</label>
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Perks (one per line)</label>
            <textarea
              name="perks"
              value={formData.perks}
              onChange={handleChange}
              rows={4}
              placeholder="Enter perks, one per line"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              Active
            </label>
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.btnCancel}>
              Cancel
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : level ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== Main Component ====================
function GamificationManagement() {
  const [activeTab, setActiveTab] = useState('achievements');
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [deleteAchievementId, setDeleteAchievementId] = useState(null);
  const [deleteLevelId, setDeleteLevelId] = useState(null);
  
  // Pagination for achievements
  const [achievementPage, setAchievementPage] = useState(1);
  const [achievementItemsPerPage, setAchievementItemsPerPage] = useState(10);

  // Queries
  const { data: achievementsData, isLoading: achievementsLoading } = useAdminAchievements();
  const { data: levelsData, isLoading: levelsLoading } = useAdminLevels();
  const { data: statsData } = useGamificationStats();

  // Mutations
  const createAchievementMutation = useCreateAchievement();
  const updateAchievementMutation = useUpdateAchievement();
  const deleteAchievementMutation = useDeleteAchievement();
  const createLevelMutation = useCreateLevel();
  const updateLevelMutation = useUpdateLevel();
  const deleteLevelMutation = useDeleteLevel();
  const seedLevelsMutation = useSeedDefaultLevels();
  const seedAchievementsMutation = useSeedDefaultAchievements();

  // Handlers
  const handleOpenAchievementModal = (achievement = null) => {
    setSelectedAchievement(achievement);
    setShowAchievementModal(true);
  };

  const handleCloseAchievementModal = () => {
    setShowAchievementModal(false);
    setSelectedAchievement(null);
  };

  const handleSubmitAchievement = async (data) => {
    try {
      if (selectedAchievement) {
        await updateAchievementMutation.mutateAsync({ id: selectedAchievement._id, data });
      } else {
        await createAchievementMutation.mutateAsync(data);
      }
      handleCloseAchievementModal();
    } catch (error) {
      console.error('Error saving achievement:', error);
    }
  };

  const handleDeleteAchievement = (id) => {
    setDeleteAchievementId(id);
  };

  const confirmDeleteAchievement = async () => {
    if (deleteAchievementId) {
      try {
        await deleteAchievementMutation.mutateAsync(deleteAchievementId);
        toast.success('Achievement deleted successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete achievement');
      }
    }
    setDeleteAchievementId(null);
  };

  const handleOpenLevelModal = (level = null) => {
    setSelectedLevel(level);
    setShowLevelModal(true);
  };

  const handleCloseLevelModal = () => {
    setShowLevelModal(false);
    setSelectedLevel(null);
  };

  const handleSubmitLevel = async (data) => {
    try {
      if (selectedLevel) {
        await updateLevelMutation.mutateAsync({ id: selectedLevel._id, data });
      } else {
        await createLevelMutation.mutateAsync(data);
      }
      handleCloseLevelModal();
    } catch (error) {
      console.error('Error saving level:', error);
    }
  };

  const handleDeleteLevel = (id) => {
    setDeleteLevelId(id);
  };

  const confirmDeleteLevel = async () => {
    if (deleteLevelId) {
      try {
        await deleteLevelMutation.mutateAsync(deleteLevelId);
        toast.success('Level deleted successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete level');
      }
    }
    setDeleteLevelId(null);
  };

  const achievements = achievementsData?.data || [];
  const levels = levelsData?.data || [];
  const stats = statsData?.data;

  // Pagination logic for achievements
  const totalAchievements = achievements.length;
  const totalAchievementPages = Math.ceil(totalAchievements / achievementItemsPerPage);
  const achievementStartIndex = (achievementPage - 1) * achievementItemsPerPage;
  const achievementEndIndex = Math.min(achievementStartIndex + achievementItemsPerPage, totalAchievements);
  const paginatedAchievements = achievements.slice(achievementStartIndex, achievementEndIndex);

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#9E9E9E',
      uncommon: '#8BC34A',
      rare: '#03A9F4',
      epic: '#9C27B0',
      legendary: '#FFD700'
    };
    return colors[rarity] || '#9E9E9E';
  };

  return (
    <div className={styles.container}>
      {/* Stats Overview */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <Trophy size={24} />
            <div>
              <span className={styles.statValue}>{stats.overview?.totalAchievements || 0}</span>
              <span className={styles.statLabel}>Achievements</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <Star size={24} />
            <div>
              <span className={styles.statValue}>{stats.overview?.totalLevels || 0}</span>
              <span className={styles.statLabel}>Levels</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <Zap size={24} />
            <div>
              <span className={styles.statValue}>{stats.overview?.totalPointsEarned?.toLocaleString() || 0}</span>
              <span className={styles.statLabel}>Total Points Earned</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'achievements' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <Trophy size={18} />
          Achievements
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'levels' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('levels')}
        >
          <Star size={18} />
          Levels
        </button>
      </div>

      {/* Content */}
      {activeTab === 'achievements' && (
        <div className={styles.content}>
          <div className={styles.header}>
            <h2>Achievements Management</h2>
            <div className={styles.headerActions}>
              <button 
                className={styles.btnSeed}
                onClick={() => seedAchievementsMutation.mutate()}
                disabled={seedAchievementsMutation.isPending}
              >
                <RefreshCw size={16} />
                Seed Defaults
              </button>
              <button 
                className={styles.btnPrimary}
                onClick={() => handleOpenAchievementModal()}
              >
                <Plus size={18} />
                Add Achievement
              </button>
            </div>
          </div>

          {achievementsLoading ? (
            <div className={styles.loading}>
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : (
            <>
              <div className={styles.table}>
                <table>
                  <thead>
                    <tr>
                      <th>Icon</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Rarity</th>
                      <th>Points</th>
                      <th>Earned By</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAchievements.map(achievement => (
                      <tr key={achievement._id}>
                        <td>
                          <span className={styles.achievementIcon}>{achievement.icon}</span>
                        </td>
                        <td>
                          <div className={styles.achievementName}>
                            <strong>{achievement.name}</strong>
                            <span>{achievement.description}</span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.badge}>{achievement.category}</span>
                        </td>
                        <td>
                          <span 
                            className={styles.rarityBadge}
                            style={{ backgroundColor: getRarityColor(achievement.rarity) + '20', color: getRarityColor(achievement.rarity) }}
                          >
                            {achievement.rarity}
                          </span>
                        </td>
                        <td>{achievement.pointsReward}</td>
                        <td>{achievement.earnedCount || 0}</td>
                        <td>
                          <span className={`${styles.status} ${achievement.isActive ? styles.statusActive : styles.statusInactive}`}>
                            {achievement.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button 
                              className={styles.btnEdit}
                              onClick={() => handleOpenAchievementModal(achievement)}
                            >
                              Edit
                            </button>
                            <button 
                              className={styles.btnDelete}
                              onClick={() => handleDeleteAchievement(achievement._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Simple Pagination */}
              {totalAchievementPages > 1 && (
                <div className={styles.simplePagination}>
                  <div className={styles.paginationInfo}>
                    Showing {achievementStartIndex + 1}-{achievementEndIndex} of {totalAchievements} achievements
                  </div>
                  <div className={styles.paginationControls}>
                    <button
                      onClick={() => setAchievementPage(p => Math.max(1, p - 1))}
                      disabled={achievementPage === 1}
                      className={styles.paginationBtn}
                    >
                      Previous
                    </button>
                    <span className={styles.paginationPages}>
                      Page {achievementPage} of {totalAchievementPages}
                    </span>
                    <button
                      onClick={() => setAchievementPage(p => Math.min(totalAchievementPages, p + 1))}
                      disabled={achievementPage === totalAchievementPages}
                      className={styles.paginationBtn}
                    >
                      Next
                    </button>
                  </div>
                  <div className={styles.paginationPageSize}>
                    <label>Per page:</label>
                    <select 
                      value={achievementItemsPerPage} 
                      onChange={(e) => {
                        setAchievementItemsPerPage(Number(e.target.value));
                        setAchievementPage(1);
                      }}
                      className={styles.pageSizeSelect}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'levels' && (
        <div className={styles.content}>
          <div className={styles.header}>
            <h2>Levels Management</h2>
            <div className={styles.headerActions}>
              <button 
                className={styles.btnSeed}
                onClick={() => seedLevelsMutation.mutate()}
                disabled={seedLevelsMutation.isPending}
              >
                <RefreshCw size={16} />
                Seed Defaults
              </button>
              <button 
                className={styles.btnPrimary}
                onClick={() => handleOpenLevelModal()}
              >
                <Plus size={18} />
                Add Level
              </button>
            </div>
          </div>

          {levelsLoading ? (
            <div className={styles.loading}>
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : (
            <div className={styles.levelsGrid}>
              {levels.map(level => (
                <div 
                  key={level._id} 
                  className={styles.levelCard}
                  style={{ borderColor: level.color }}
                >
                  <div className={styles.levelHeader}>
                    <span className={styles.levelIcon}>{level.icon}</span>
                    <div className={styles.levelInfo}>
                      <h3>Level {level.level}: {level.name}</h3>
                      <span className={styles.levelTitle}>{level.title}</span>
                    </div>
                  </div>
                  <p className={styles.levelDescription}>{level.description}</p>
                  <div className={styles.levelStats}>
                    <span>{level.pointsRequired} points required</span>
                    <span>{level.userCount || 0} users</span>
                  </div>
                  {level.perks?.length > 0 && (
                    <div className={styles.levelPerks}>
                      <strong>Perks:</strong>
                      <ul>
                        {level.perks.map((perk, idx) => (
                          <li key={idx}>{perk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className={styles.levelActions}>
                    <button 
                      className={styles.btnEdit}
                      onClick={() => handleOpenLevelModal(level)}
                    >
                      Edit
                    </button>
                    <button 
                      className={styles.btnDelete}
                      onClick={() => handleDeleteLevel(level._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AchievementModal
        isOpen={showAchievementModal}
        onClose={handleCloseAchievementModal}
        achievement={selectedAchievement}
        onSubmit={handleSubmitAchievement}
        isLoading={createAchievementMutation.isPending || updateAchievementMutation.isPending}
      />

      <LevelModal
        isOpen={showLevelModal}
        onClose={handleCloseLevelModal}
        level={selectedLevel}
        onSubmit={handleSubmitLevel}
        isLoading={createLevelMutation.isPending || updateLevelMutation.isPending}
      />

      {/* Delete Achievement Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteAchievementId}
        onClose={() => setDeleteAchievementId(null)}
        onConfirm={confirmDeleteAchievement}
        title="Delete Achievement"
        message="Are you sure you want to delete this achievement? Users who have earned it will lose it."
        confirmText="Delete"
        variant="danger"
        isLoading={deleteAchievementMutation.isPending}
      />

      {/* Delete Level Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteLevelId}
        onClose={() => setDeleteLevelId(null)}
        onConfirm={confirmDeleteLevel}
        title="Delete Level"
        message="Are you sure you want to delete this level? This may affect user progression."
        confirmText="Delete"
        variant="danger"
        isLoading={deleteLevelMutation.isPending}
      />
    </div>
  );
}

export default GamificationManagement;
