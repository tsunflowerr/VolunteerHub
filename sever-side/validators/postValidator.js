import Joi from 'joi';

export const createandUpdatePostSchema = Joi.object({
    title: Joi.string().min(3).max(100).required().message({
        "string.empty": "Title is required",
        "string.min": "Title must be at least 3 characters long",
        "string.max": "Title must be at most 100 characters long",
    }),
    content: Joi.string().min(10).required().message({
        "string.empty": "Content is required",
        "string.min": "Content must be at least 10 characters long",
    }),
    image: Joi.array().items(Joi.string().uri()).messages({
        "array.base": "Images must be an array",
        "string.uri": "Each image must be a valid URI",
    }),
})