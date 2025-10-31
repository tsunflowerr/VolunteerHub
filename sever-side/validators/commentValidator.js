import Joi from 'joi';

export const createAndUpdateCommentSchema = Joi.object({
    content: Joi.string().min(1).max(500).required().messages({
        "string.empty": "Content is required",
        "string.min": "Content must be at least 1 character long",
        "string.max": "Content must be at most 500 characters long",
    }),
});

// Validate commentId in params
export const commentIdParamsSchema = Joi.object({
    commentId: Joi.string().hex().length(24).required().messages({
        'string.base': `"commentId" must be a string`,
        'string.hex': `"commentId" must be a valid ObjectId`,
        'string.length': `"commentId" must be 24 characters long`,
        'any.required': `"commentId" is required`,
    }),
});

// Validate eventId + postId + commentId together
export const eventPostCommentParamsSchema = Joi.object({
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
    commentId: Joi.string().hex().length(24).required().messages({
        'string.base': `"commentId" must be a string`,
        'string.hex': `"commentId" must be a valid ObjectId`,
        'string.length': `"commentId" must be 24 characters long`,
        'any.required': `"commentId" is required`,
    }),
});