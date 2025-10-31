import Joi from 'joi';

export const createandUpdatePostSchema = Joi.object({
    title: Joi.string().min(3).max(100).required().messages({
        "string.empty": "Title is required",
        "string.min": "Title must be at least 3 characters long",
        "string.max": "Title must be at most 100 characters long",
    }),
    content: Joi.string().min(10).required().messages({
        "string.empty": "Content is required",
        "string.min": "Content must be at least 10 characters long",
    }),
    image: Joi.array().items(Joi.string().uri()).messages({
        "array.base": "Images must be an array",
        "string.uri": "Each image must be a valid URI",
    }),
});

// Validate postId in params
export const postIdParamsSchema = Joi.object({
    postId: Joi.string().hex().length(24).required().messages({
        'string.base': `"postId" must be a string`,
        'string.hex': `"postId" must be a valid ObjectId`,
        'string.length': `"postId" must be 24 characters long`,
        'any.required': `"postId" is required`,
    }),
});

// Validate eventId + postId together
export const eventPostParamsSchema = Joi.object({
    eventId: Joi.string().hex().length(24).required().messages({
        'string.base': `"eventId" must be a string`,
        'string.hex': `"eventId" must be a valid ObjectId`,
        'string.length': `"eventId" must be 24 characters long`,
        'any.required': `"eventId" is required`,
    }),
    postId: Joi.string().hex().length(24).required().messages({
        'string.base': `"postId" must be a string`,
        'string.hex': `"postId" must be a valid ObjectId`,
        'string.length': `"postId" must be 24 characters long`,
        'any.required': `"postId" is required`,
    }),
});