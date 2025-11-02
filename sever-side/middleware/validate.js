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
        stripUnknown: true,
        convert: true  // Tự động convert kiểu dữ liệu (string -> number)
    });
    
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ success: false, errors });
    }
    
    // Assign validated values without overwriting read-only properties
    if (source === 'query') {
        Object.keys(value).forEach(key => {
            req.query[key] = value[key];
        });
    } else if (source === 'params') {
        Object.keys(value).forEach(key => {
            req.params[key] = value[key];
        });
    } else {
        req.body = value;
    }
    
    next();
}