import Joi from 'joi';

export const createAndUpdateCommentSchema = Joi.object({
    content: Joi.string().min(1).max(500).required().messages({
        "string.empty": "Content is required",
        "string.min": "Content must be at least 1 character long",
        "string.max": "Content must be at most 500 characters long",
    }),
})