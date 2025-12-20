/**
 * Middleware để validate request data
 * @param {Object} schema - Joi validation schema
 * @param {string} source - Nguồn data cần validate: 'body' | 'query' | 'params'
 */
export const validate = (schema, source = 'body') => (req, res, next) => {
    const dataToValidate = source === 'query' ? req.query : 
                           source === 'params' ? req.params : 
                           req.body;
    
    console.log(`=== VALIDATING ${source.toUpperCase()} ===`);
    console.log('Data to validate:', JSON.stringify(dataToValidate, null, 2));
    
    const { error, value } = schema.validate(dataToValidate, { 
        abortEarly: false,
        stripUnknown: true,
        convert: true  // Tự động convert kiểu dữ liệu (string -> number)
    });
    
    if (error) {
        const errors = error.details.map(detail => detail.message);
        console.log('=== VALIDATION ERRORS ===');
        console.log(errors);
        return res.status(400).json({ success: false, errors });
    }
    
    console.log('=== VALIDATION PASSED ===');
    console.log('Validated value:', JSON.stringify(value, null, 2));
    
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