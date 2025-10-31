import Joi from 'joi';

// ====== Validation cho eventId trong params ======
export const registerEventSchema = Joi.object({
    eventId: Joi.string().hex().length(24).required().messages({
        'string.base': '"eventId" must be a string',
        'string.hex': '"eventId" must be a valid ObjectId',
        'string.length': '"eventId" must be 24 characters long',
        'any.required': '"eventId" is required',
    }),
});

// ====== Validation cho unregister event ======
export const unregisterEventSchema = Joi.object({
    eventId: Joi.string().hex().length(24).required().messages({
        'string.base': '"eventId" must be a string',
        'string.hex': '"eventId" must be a valid ObjectId',
        'string.length': '"eventId" must be 24 characters long',
        'any.required': '"eventId" is required',
    }),
});

// ====== Validation cho get my registrations (query params) ======
export const getMyRegistrationsSchema = Joi.object({
    status: Joi.string()
        .valid('pending', 'confirmed', 'completed', 'cancelled')
        .optional()
        .messages({
            'string.base': '"status" must be a string',
            'any.only': '"status" must be one of: pending, confirmed, completed, cancelled',
        }),
    page: Joi.number().integer().min(1).default(1).messages({
        'number.base': '"page" must be a number',
        'number.integer': '"page" must be an integer',
        'number.min': '"page" must be at least 1',
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
        'number.base': '"limit" must be a number',
        'number.integer': '"limit" must be an integer',
        'number.min': '"limit" must be at least 1',
        'number.max': '"limit" cannot exceed 100',
    }),
});

// ====== Validation cho registration detail (params) ======
export const getRegistrationDetailSchema = Joi.object({
    registrationId: Joi.string().hex().length(24).required().messages({
        'string.base': '"registrationId" must be a string',
        'string.hex': '"registrationId" must be a valid ObjectId',
        'string.length': '"registrationId" must be 24 characters long',
        'any.required': '"registrationId" is required',
    }),
});

// ====== Validation cho update registration status (body) ======
export const updateRegistrationStatusSchema = Joi.object({
    status: Joi.string()
        .valid('pending', 'confirmed', 'completed', 'cancelled')
        .required()
        .messages({
            'string.base': '"status" must be a string',
            'any.only': '"status" must be one of: pending, confirmed, completed, cancelled',
            'any.required': '"status" is required',
        }),
});

// ====== Validation cho get registrations by status (query params) ======
export const getRegistrationsByStatusSchema = Joi.object({
    status: Joi.string()
        .valid('pending', 'confirmed', 'completed', 'cancelled')
        .optional()
        .messages({
            'string.base': '"status" must be a string',
            'any.only': '"status" must be one of: pending, confirmed, completed, cancelled',
        }),
    eventId: Joi.string().hex().length(24).optional().messages({
        'string.base': '"eventId" must be a string',
        'string.hex': '"eventId" must be a valid ObjectId',
        'string.length': '"eventId" must be 24 characters long',
    }),
    page: Joi.number().integer().min(1).default(1).messages({
        'number.base': '"page" must be a number',
        'number.integer': '"page" must be an integer',
        'number.min': '"page" must be at least 1',
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
        'number.base': '"limit" must be a number',
        'number.integer': '"limit" must be an integer',
        'number.min': '"limit" must be at least 1',
        'number.max': '"limit" cannot exceed 100',
    }),
});
