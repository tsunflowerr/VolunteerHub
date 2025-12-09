import Joi from 'joi';

export const categorySchema = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
        "string.empty": "Category name is required",
        "string.min": "Category name must be at least 3 characters long",
        "string.max": "Category name must be at most 50 characters long",
    }),
    slug: Joi.string().pattern(/^[a-zA-Z0-9]+$/).min(3).max(50).required().messages({
        "string.empty": "Slug is required",
        "string.pattern.base": "Slug must only contain alphanumeric characters",
        "string.min": "Slug must be at least 3 characters long",
        "string.max": "Slug must be at most 50 characters long",
    }),
    description: Joi.string().max(500).optional().messages({
        "string.max": "Description must be at most 500 characters long",
    }),
    color: Joi.string().optional().messages({
        "string.base": "Color must be a string"
    })
});

export const categorySlugSchema = Joi.object({
    slug: Joi.string().min(2).max(100).pattern(/^[a-z0-9-]+$/).required().messages({
        'string.base': `"slug" must be a string`,
        'string.pattern.base': `"slug" must contain only lowercase letters, numbers, and hyphens`,
        'string.min': `"slug" must be at least 2 characters`,
        'string.max': `"slug" cannot exceed 100 characters`,
        'any.required': `"slug" is required`,
    }),
});

