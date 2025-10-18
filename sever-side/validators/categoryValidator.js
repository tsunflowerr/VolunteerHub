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
    })
});