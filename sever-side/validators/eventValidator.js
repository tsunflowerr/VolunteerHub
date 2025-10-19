import Joi from 'joi';

export const createAndUpdateEventSchema = Joi.object(
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
        category: Joi.string().hex().length(24).required().messages({
            'string.base': `"category" should be a type of 'text'`,
            'string.empty': `"category" cannot be an empty field`,
            'string.hex': `"category" must be a valid ObjectId`,
        }),
        location: Joi.string().min(5).max(200).required().messages({
            'string.base': `"location" should be a type of 'text'`,
            'string.empty': `"location" cannot be an empty field`,
            'string.min': `"location" should have a minimum length of {#limit}`,
            'string.max': `"location" should have a maximum length of {#limit}`,
        }),
        thumbnail: Joi.string().uri().optional().messages({
            'string.base': `"thumbnail" should be a type of 'text'`,
            'string.uri': `"thumbnail" must be a valid URI`,
        }),
        images: Joi.array().items(Joi.string().uri().messages({
            'string.base': `"image" should be a type of 'text'`,
            'string.uri': `"image" must be a valid URI`,
        })),
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
    }
)