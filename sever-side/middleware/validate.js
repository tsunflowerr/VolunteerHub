/**
 * Middleware để validate request data
 * @param {Object} schema - Joi validation schema
 * @param {string} source - Nguồn data cần validate: 'body' | 'query' | 'params'
 */
export const validate = (schema, source = 'body') => (req, res, next) => {
    const dataToValidate = source === 'query' ? req.query : 
                           source === 'params' ? req.params : 
                           req.body;
    
    const { error, value } = schema.validate(dataToValidate, { 
        abortEarly: false,
        stripUnknown: true 
    });
    
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ success: false, errors });
    }
    
    if (source === 'query') req.query = value;
    else if (source === 'params') req.params = value;
    else req.body = value;
    
    next();
}