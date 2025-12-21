import Joi from 'joi';
import mongoose from 'mongoose';

// Helper to validate ObjectId
const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'ObjectId validation');

// ==================== ACHIEVEMENT VALIDATORS ====================

export const createAchievementSchema = Joi.object({
  name: Joi.string().required().trim().min(2).max(100)
    .messages({
      'string.empty': 'Achievement name is required',
      'string.min': 'Achievement name must be at least 2 characters',
      'string.max': 'Achievement name must not exceed 100 characters'
    }),
  slug: Joi.string().required().trim().lowercase().pattern(/^[a-z0-9-]+$/)
    .messages({
      'string.empty': 'Slug is required',
      'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens'
    }),
  description: Joi.string().required().trim().min(10).max(500)
    .messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters',
      'string.max': 'Description must not exceed 500 characters'
    }),
  icon: Joi.string().trim().max(50).default('🏆'),
  color: Joi.string().trim().pattern(/^#[0-9A-Fa-f]{6}$/).default('#FFD700')
    .messages({
      'string.pattern.base': 'Color must be a valid hex color (e.g., #FFD700)'
    }),
  category: Joi.string().valid('participation', 'milestone', 'special', 'category_master', 'streak')
    .default('participation'),
  criteria: Joi.object({
    type: Joi.string().valid(
      'events_completed', 
      'hours_volunteered', 
      'events_in_category', 
      'consecutive_events', 
      'first_event', 
      'events_hosted', 
      'manual'
    ).default('manual'),
    threshold: Joi.number().integer().min(1).default(1),
    categoryId: objectId.when('type', {
      is: 'events_in_category',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }).default({}),
  pointsReward: Joi.number().integer().min(0).default(0),
  rarity: Joi.string().valid('common', 'uncommon', 'rare', 'epic', 'legendary').default('common'),
  isActive: Joi.boolean().default(true),
  displayOrder: Joi.number().integer().min(0).default(0)
});

export const updateAchievementSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  slug: Joi.string().trim().lowercase().pattern(/^[a-z0-9-]+$/),
  description: Joi.string().trim().min(10).max(500),
  icon: Joi.string().trim().max(50),
  color: Joi.string().trim().pattern(/^#[0-9A-Fa-f]{6}$/),
  category: Joi.string().valid('participation', 'milestone', 'special', 'category_master', 'streak'),
  criteria: Joi.object({
    type: Joi.string().valid(
      'events_completed', 
      'hours_volunteered', 
      'events_in_category', 
      'consecutive_events', 
      'first_event', 
      'events_hosted', 
      'manual'
    ),
    threshold: Joi.number().integer().min(1),
    categoryId: objectId
  }),
  pointsReward: Joi.number().integer().min(0),
  rarity: Joi.string().valid('common', 'uncommon', 'rare', 'epic', 'legendary'),
  isActive: Joi.boolean(),
  displayOrder: Joi.number().integer().min(0)
}).min(1);

export const awardAchievementSchema = Joi.object({
  achievementId: objectId.required()
    .messages({ 'any.required': 'Achievement ID is required' }),
  userId: objectId.required()
    .messages({ 'any.required': 'User ID is required' }),
  reason: Joi.string().trim().max(500),
  eventId: objectId
});

// ==================== LEVEL VALIDATORS ====================

export const createLevelSchema = Joi.object({
  level: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'Level must be a number',
      'number.min': 'Level must be at least 1',
      'any.required': 'Level number is required'
    }),
  name: Joi.string().required().trim().min(2).max(50)
    .messages({
      'string.empty': 'Level name is required',
      'string.min': 'Level name must be at least 2 characters',
      'string.max': 'Level name must not exceed 50 characters'
    }),
  title: Joi.string().trim().max(50),
  description: Joi.string().trim().max(200),
  pointsRequired: Joi.number().integer().min(0).required()
    .messages({
      'number.base': 'Points required must be a number',
      'number.min': 'Points required must be at least 0',
      'any.required': 'Points required is required'
    }),
  icon: Joi.string().trim().max(50).default('⭐'),
  color: Joi.string().trim().pattern(/^#[0-9A-Fa-f]{6}$/).default('#4CAF50'),
  badgeImage: Joi.string().uri().trim(),
  perks: Joi.array().items(Joi.string().trim().max(200)).default([]),
  isActive: Joi.boolean().default(true)
});

export const updateLevelSchema = Joi.object({
  level: Joi.number().integer().min(1),
  name: Joi.string().trim().min(2).max(50),
  title: Joi.string().trim().max(50),
  description: Joi.string().trim().max(200),
  pointsRequired: Joi.number().integer().min(0),
  icon: Joi.string().trim().max(50),
  color: Joi.string().trim().pattern(/^#[0-9A-Fa-f]{6}$/),
  badgeImage: Joi.string().uri().trim().allow(''),
  perks: Joi.array().items(Joi.string().trim().max(200)),
  isActive: Joi.boolean()
}).min(1);

// ==================== POINTS VALIDATORS ====================

export const adjustPointsSchema = Joi.object({
  userId: objectId.required()
    .messages({ 'any.required': 'User ID is required' }),
  points: Joi.number().integer().not(0).required()
    .messages({
      'number.base': 'Points must be a number',
      'any.invalid': 'Points cannot be zero',
      'any.required': 'Points is required'
    }),
  reason: Joi.string().trim().max(500)
});

// ==================== FEATURED ACHIEVEMENTS VALIDATOR ====================

export const updateFeaturedAchievementsSchema = Joi.object({
  achievementIds: Joi.array()
    .items(objectId)
    .max(5)
    .required()
    .messages({
      'array.max': 'You can only feature up to 5 achievements',
      'any.required': 'Achievement IDs array is required'
    })
});

// ==================== EVENT REWARDS/REQUIREMENTS VALIDATORS ====================

export const eventRewardsSchema = Joi.object({
  pointsReward: Joi.number().integer().min(0).default(10),
  hoursCredit: Joi.number().min(0).default(4),
  availableAchievements: Joi.array().items(objectId).default([]),
  bonusPoints: Joi.number().integer().min(0).default(0),
  bonusReason: Joi.string().trim().max(200)
});

export const eventRequirementsSchema = Joi.object({
  hasRequirements: Joi.boolean().default(false),
  minLevel: Joi.number().integer().min(1).default(1),
  minPoints: Joi.number().integer().min(0).default(0),
  requiredAchievements: Joi.array().items(objectId).default([]),
  minEventsCompleted: Joi.number().integer().min(0).default(0),
  requirementDescription: Joi.string().trim().max(500)
});
