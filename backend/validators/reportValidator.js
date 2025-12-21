import Joi from 'joi';

export const createReportSchema = Joi.object({
  type: Joi.string().valid('post', 'comment', 'user', 'event').required().messages({
    'any.required': 'Report type is required',
    'any.only': 'Type must be one of: "post", "comment", "user", "event"',
  }),
  targetId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'any.required': 'Target ID is required',
      'string.pattern.base': 'Invalid target ID format',
    }),
  reason: Joi.string()
    .valid(
      'spam',
      'harassment',
      'hate_speech',
      'violence',
      'inappropriate_content',
      'misinformation',
      'other'
    )
    .required()
    .messages({
      'any.required': 'Reason is required',
      'any.only': 'Invalid reason',
    }),
  description: Joi.string().max(500).allow('', null).messages({
    'string.max': 'Description must not exceed 500 characters',
  }),
});

export const reviewReportSchema = Joi.object({
  status: Joi.string().valid('reviewed', 'resolved', 'dismissed').required().messages({
    'any.required': 'Status is required',
    'any.only': 'Status must be "reviewed", "resolved", or "dismissed"',
  }),
  action: Joi.string()
    .valid('none', 'content_removed', 'user_warned', 'user_banned')
    .when('status', {
      is: 'resolved',
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      'any.required': 'Action is required when resolving a report',
      'any.only': 'Invalid action',
    }),
  adminNote: Joi.string().max(500).allow('', null).messages({
    'string.max': 'Admin note must not exceed 500 characters',
  }),
});
