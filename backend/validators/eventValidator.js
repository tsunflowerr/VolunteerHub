import Joi from 'joi';

// ====== Validation cho CREATE Event (Body) ======
export const createEventSchema = Joi.object(
    {
        name: Joi.string().min(3).max(100).required().messages({
            'string.base': `"name" should be a type of 'text'`,
            'string.empty': `"name" cannot be an empty field`,
            'string.min': `"name" should have a minimum length of {#limit}`,
            'string.max': `"name" should have a maximum length of {#limit}`,
        }),
        description: Joi.string().min(10).max(1000).required().messages({
            'string.base': `"description" should be a type of 'text'`,
            'string.empty': `"description" cannot be an empty field`,
            'string.min': `"description" should have a minimum length of {#limit}`,
            'string.max': `"description" should have a maximum length of {#limit}`,
        }),
        categories: Joi.array().items(Joi.string().hex().length(24)).min(1).single().required().messages({
            'array.base': `"categories" should be an array`,
            'array.min': `"categories" must contain at least 1 category`,
            'string.hex': `"categories" items must be valid ObjectIds`,
            'any.required': `"categories" is required`,
        }),
        activities: Joi.string().max(2000).optional().allow('').messages({
            'string.base': `"activities" should be a type of 'text'`,
            'string.max': `"activities" should have a maximum length of {#limit}`,
        }),
        prepare: Joi.string().max(1000).optional().allow('').messages({
            'string.base': `"prepare" should be a type of 'text'`,
            'string.max': `"prepare" should have a maximum length of {#limit}`,
        }),
        location: Joi.string().min(5).max(200).required().messages({
            'string.base': `"location" should be a type of 'text'`,
            'string.empty': `"location" cannot be an empty field`,
            'string.min': `"location" should have a minimum length of {#limit}`,
            'string.max': `"location" should have a maximum length of {#limit}`,
        }),
        thumbnail: Joi.string().optional().allow('').messages({
            'string.base': `"thumbnail" should be a type of 'text'`,
        }),
        images: Joi.array().items(Joi.string()).optional().default([]).messages({
            'array.base': `"images" should be an array`,
        }),
        capacity: Joi.number().integer().min(1).required().messages({
            'number.base': `"capacity" should be a type of 'number'`,
            'number.integer': `"capacity" must be an integer`, 
            'number.min': `"capacity" should be at least {#limit}`,
        }),
        startDate: Joi.date().greater('now').required().messages({
            'date.base': `"startDate" should be a type of 'date'`,
            'date.greater': `"startDate" must be greater than now`,
        }),
        endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
            'date.base': `"endDate" should be a type of 'date'`,
            'date.greater': `"endDate" must be greater than startDate`,
        }),
        // Gamification - Rewards
        rewards: Joi.object({
            pointsReward: Joi.number().integer().min(0).default(10),
            hoursCredit: Joi.number().min(0).default(0),
            bonusPoints: Joi.number().integer().min(0).default(0),
            bonusReason: Joi.string().max(200).allow('').optional(),
        }).optional(),
        // Gamification - Requirements
        requirements: Joi.object({
            hasRequirements: Joi.boolean().default(false),
            minLevel: Joi.number().integer().min(1).default(1),
            minPoints: Joi.number().integer().min(0).default(0),
            requiredAchievements: Joi.array().items(Joi.string().hex().length(24)).optional().default([]),
            minEventsCompleted: Joi.number().integer().min(0).default(0),
            requirementDescription: Joi.string().max(500).allow('').optional(),
        }).optional().default({ hasRequirements: false }),
    }
);

// ====== Validation cho UPDATE Event (Body) - same but dates don't need to be in future ======
export const updateEventSchema = Joi.object(
    {
        name: Joi.string().min(3).max(100).required().messages({
            'string.base': `"name" should be a type of 'text'`,
            'string.empty': `"name" cannot be an empty field`,
            'string.min': `"name" should have a minimum length of {#limit}`,
            'string.max': `"name" should have a maximum length of {#limit}`,
        }),
        description: Joi.string().min(10).max(1000).required().messages({
            'string.base': `"description" should be a type of 'text'`,
            'string.empty': `"description" cannot be an empty field`,
            'string.min': `"description" should have a minimum length of {#limit}`,
            'string.max': `"description" should have a maximum length of {#limit}`,
        }),
        categories: Joi.array().items(Joi.string().hex().length(24)).min(1).single().required().messages({
            'array.base': `"categories" should be an array`,
            'array.min': `"categories" must contain at least 1 category`,
            'string.hex': `"categories" items must be valid ObjectIds`,
            'any.required': `"categories" is required`,
        }),
        activities: Joi.string().max(2000).optional().allow('').messages({
            'string.base': `"activities" should be a type of 'text'`,
            'string.max': `"activities" should have a maximum length of {#limit}`,
        }),
        prepare: Joi.string().max(1000).optional().allow('').messages({
            'string.base': `"prepare" should be a type of 'text'`,
            'string.max': `"prepare" should have a maximum length of {#limit}`,
        }),
        location: Joi.string().min(5).max(200).required().messages({
            'string.base': `"location" should be a type of 'text'`,
            'string.empty': `"location" cannot be an empty field`,
            'string.min': `"location" should have a minimum length of {#limit}`,
            'string.max': `"location" should have a maximum length of {#limit}`,
        }),
        thumbnail: Joi.string().optional().allow('').messages({
            'string.base': `"thumbnail" should be a type of 'text'`,
        }),
        images: Joi.array().items(Joi.string()).optional().default([]).messages({
            'array.base': `"images" should be an array`,
        }),
        capacity: Joi.number().integer().min(1).required().messages({
            'number.base': `"capacity" should be a type of 'number'`,
            'number.integer': `"capacity" must be an integer`, 
            'number.min': `"capacity" should be at least {#limit}`,
        }),
        startDate: Joi.date().required().messages({
            'date.base': `"startDate" should be a type of 'date'`,
        }),
        endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
            'date.base': `"endDate" should be a type of 'date'`,
            'date.greater': `"endDate" must be greater than startDate`,
        }),
        // Gamification - Rewards
        rewards: Joi.object({
            pointsReward: Joi.number().integer().min(0).default(10),
            hoursCredit: Joi.number().min(0).default(0),
            bonusPoints: Joi.number().integer().min(0).default(0),
            bonusReason: Joi.string().max(200).allow('').optional(),
        }).optional(),
        // Gamification - Requirements
        requirements: Joi.object({
            hasRequirements: Joi.boolean().default(false),
            minLevel: Joi.number().integer().min(1).default(1),
            minPoints: Joi.number().integer().min(0).default(0),
            requiredAchievements: Joi.array().items(Joi.string().hex().length(24)).default([]),
            minEventsCompleted: Joi.number().integer().min(0).default(0),
            requirementDescription: Joi.string().max(500).allow('').optional(),
        }).optional(),
    }
);

// Keep the old name for backward compatibility
export const createAndUpdateEventSchema = createEventSchema;

// ====== Validation cho Pagination (Query Params) ======
export const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
        'number.base': `"page" must be a number`,
        'number.integer': `"page" must be an integer`,
        'number.min': `"page" must be at least 1`,
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
        'number.base': `"limit" must be a number`,
        'number.integer': `"limit" must be an integer`,
        'number.min': `"limit" must be at least 1`,
        'number.max': `"limit" cannot exceed 100 items`,
    }),
});

// ====== Validation cho MongoDB ObjectId (Params) ======
export const objectIdSchema = Joi.object({
    id: Joi.string().hex().length(24).required().messages({
        'string.base': `"id" must be a string`,
        'string.hex': `"id" must be a valid ObjectId`,
        'string.length': `"id" must be 24 characters long`,
        'any.required': `"id" is required`,
    }),
});

// ====== Validation cho eventId trong params ======
export const eventIdSchema = Joi.object({
    eventId: Joi.string().hex().length(24).required().messages({
        'string.base': `"eventId" must be a string`,
        'string.hex': `"eventId" must be a valid ObjectId`,
        'string.length': `"eventId" must be 24 characters long`,
        'any.required': `"eventId" is required`,
    }),
});

// ====== Validation cho userId trong params ======
export const userIdSchema = Joi.object({
    userId: Joi.string().hex().length(24).required().messages({
        'string.base': `"userId" must be a string`,
        'string.hex': `"userId" must be a valid ObjectId`,
        'string.length': `"userId" must be 24 characters long`,
        'any.required': `"userId" is required`,
    }),
});


// ====== Validation cho getUserEvents query params ======
export const userEventsQuerySchema = Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'completed', 'cancelled').optional().messages({
        'string.base': `"status" must be a string`,
        'any.only': `"status" must be one of: pending, confirmed, completed, cancelled`,
    }),
    page: Joi.number().integer().min(1).default(1).messages({
        'number.base': `"page" must be a number`,
        'number.integer': `"page" must be an integer`,
        'number.min': `"page" must be at least 1`,
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
        'number.base': `"limit" must be a number`,
        'number.integer': `"limit" must be an integer`,
        'number.min': `"limit" must be at least 1`,
        'number.max': `"limit" cannot exceed 100 items`,
    }),
})

// ====== Validation cho update event status (body) - Admin only ======
export const updateEventStatusSchema = Joi.object({
    status: Joi.string()
        .valid('approved', 'rejected', 'cancelled', 'completed')
        .required()
        .messages({
            'string.base': `"status" must be a string`,
            'any.only': `"status" must be one of: approved, rejected, cancelled, completed`,
            'any.required': `"status" is required`,
        }),
})

// ====== Validation cho Admin Update Event (Body) ======
export const adminUpdateEventSchema = Joi.object({
    name: Joi.string().min(3).max(100).optional().messages({
        'string.base': `"name" should be a type of 'text'`,
        'string.min': `"name" should have a minimum length of {#limit}`,
        'string.max': `"name" should have a maximum length of {#limit}`,
    }),
    description: Joi.string().min(10).max(1000).optional().messages({
        'string.base': `"description" should be a type of 'text'`,
        'string.min': `"description" should have a minimum length of {#limit}`,
        'string.max': `"description" should have a maximum length of {#limit}`,
    }),
    categories: Joi.array().items(Joi.string().hex().length(24)).min(1).single().optional().messages({
        'array.base': `"categories" should be an array`,
        'array.min': `"categories" must contain at least 1 category`,
        'string.hex': `"categories" items must be valid ObjectIds`,
    }),
    activities: Joi.string().max(2000).optional().allow('').messages({
        'string.base': `"activities" should be a type of 'text'`,
        'string.max': `"activities" should have a maximum length of {#limit}`,
    }),
    prepare: Joi.string().max(1000).optional().allow('').messages({
        'string.base': `"prepare" should be a type of 'text'`,
        'string.max': `"prepare" should have a maximum length of {#limit}`,
    }),
    location: Joi.string().min(5).max(200).optional().messages({
        'string.base': `"location" should be a type of 'text'`,
        'string.min': `"location" should have a minimum length of {#limit}`,
        'string.max': `"location" should have a maximum length of {#limit}`,
    }),
    thumbnail: Joi.string().uri().optional().messages({
        'string.base': `"thumbnail" should be a type of 'text'`,
        'string.uri': `"thumbnail" must be a valid URI`,
    }),
    images: Joi.array().items(Joi.string().uri()).optional().messages({
        'array.base': `"images" should be an array`,
    }),
    capacity: Joi.number().integer().min(1).optional().messages({
        'number.base': `"capacity" should be a type of 'number'`,
        'number.integer': `"capacity" must be an integer`,
        'number.min': `"capacity" should be at least {#limit}`,
    }),
    startDate: Joi.date().optional().messages({
        'date.base': `"startDate" should be a type of 'date'`,
    }),
    endDate: Joi.date().optional().messages({
        'date.base': `"endDate" should be a type of 'date'`,
    }),
    status: Joi.string().valid('pending', 'approved', 'rejected', 'cancelled', 'completed').optional().messages({
        'string.base': `"status" should be a type of 'text'`,
        'any.only': `"status" must be one of: pending, approved, rejected, cancelled, completed`,
    }),
    // Gamification - Rewards
    rewards: Joi.object({
        pointsReward: Joi.number().integer().min(0).default(10),
        hoursCredit: Joi.number().min(0).default(0),
        bonusPoints: Joi.number().integer().min(0).default(0),
        bonusReason: Joi.string().max(200).allow('').optional(),
    }).optional(),
    // Gamification - Requirements
    requirements: Joi.object({
        hasRequirements: Joi.boolean().default(false),
        minLevel: Joi.number().integer().min(1).default(1),
        minPoints: Joi.number().integer().min(0).default(0),
        requiredAchievements: Joi.array().items(Joi.string().hex().length(24)).default([]),
        minEventsCompleted: Joi.number().integer().min(0).default(0),
        requirementDescription: Joi.string().max(500).allow('').optional(),
    }).optional(),
})