import Joi from 'joi';

// ====== Validation cho Event Search ======
export const eventSearchSchema = Joi.object({
    keyword: Joi.string().trim().min(1).max(100).optional()
        .messages({
            'string.min': 'Từ khóa phải có ít nhất 1 ký tự',
            'string.max': 'Từ khóa không được vượt quá 100 ký tự'
        }),
    
    category: Joi.alternatives().try(
        Joi.string().trim(),
        Joi.array().items(Joi.string().trim())
    ).optional()
        .messages({
            'alternatives.match': 'Danh mục không hợp lệ (phải là chuỗi hoặc danh sách chuỗi)'
        }),
    
    location: Joi.string().trim().optional()
        .messages({
            'string.base': 'Địa điểm không hợp lệ'
        }),
    
    startDate: Joi.date().optional()
        .messages({
            'date.base': 'Ngày bắt đầu không hợp lệ'
        }),
    
    endDate: Joi.date().optional()
        .greater(Joi.ref('startDate'))
        .messages({
            'date.base': 'Ngày kết thúc không hợp lệ',
            'date.greater': 'Ngày kết thúc phải sau ngày bắt đầu'
        }),
    
    status: Joi.string().valid('pending', 'approved', 'rejected', 'cancelled', 'completed').optional()
        .messages({
            'any.only': 'Trạng thái không hợp lệ'
        }),
    
    sort: Joi.string().valid('relevance', 'newest', 'trending').default('newest')
        .messages({
            'any.only': 'Kiểu sắp xếp không hợp lệ. Chỉ chấp nhận: relevance, newest, trending'
        }),
    
    page: Joi.number().integer().min(1).default(1)
        .messages({
            'number.base': 'Trang phải là số',
            'number.min': 'Trang phải lớn hơn 0'
        }),
    
    limit: Joi.number().integer().min(1).max(50).default(10)
        .messages({
            'number.base': 'Giới hạn phải là số',
            'number.min': 'Giới hạn phải lớn hơn 0',
            'number.max': 'Giới hạn không được vượt quá 50'
        })
});

// ====== Validation cho User Search (Admin only) ======
export const userSearchSchema = Joi.object({
    keyword: Joi.string().trim().min(1).max(100).optional()
        .messages({
            'string.min': 'Từ khóa phải có ít nhất 1 ký tự',
            'string.max': 'Từ khóa không được vượt quá 100 ký tự'
        }),
    
    role: Joi.string().valid('user', 'manager', 'admin').optional()
        .messages({
            'any.only': 'Vai trò không hợp lệ'
        }),
    
    status: Joi.string().valid('active', 'locked').optional()
        .messages({
            'any.only': 'Trạng thái không hợp lệ'
        }),
    
    page: Joi.number().integer().min(1).default(1)
        .messages({
            'number.base': 'Trang phải là số',
            'number.min': 'Trang phải lớn hơn 0'
        }),
    
    limit: Joi.number().integer().min(1).max(50).default(10)
        .messages({
            'number.base': 'Giới hạn phải là số',
            'number.min': 'Giới hạn phải lớn hơn 0',
            'number.max': 'Giới hạn không được vượt quá 50'
        })
});

// ====== Validation cho Post Search ======
export const postSearchSchema = Joi.object({
    keyword: Joi.string().trim().min(1).max(100).optional()
        .messages({
            'string.min': 'Từ khóa phải có ít nhất 1 ký tự',
            'string.max': 'Từ khóa không được vượt quá 100 ký tự'
        }),
    
    sort: Joi.string().valid('newest', 'popular').default('newest')
        .messages({
            'any.only': 'Kiểu sắp xếp không hợp lệ. Chỉ chấp nhận: newest, popular'
        }),
    
    page: Joi.number().integer().min(1).default(1)
        .messages({
            'number.base': 'Trang phải là số',
            'number.min': 'Trang phải lớn hơn 0'
        }),
    
    limit: Joi.number().integer().min(1).max(50).default(10)
        .messages({
            'number.base': 'Giới hạn phải là số',
            'number.min': 'Giới hạn phải lớn hơn 0',
            'number.max': 'Giới hạn không được vượt quá 50'
        })
});

// ====== Validation cho Advanced Search ======
export const advancedSearchSchema = Joi.object({
    q: Joi.string().trim().min(1).max(100).required()
        .messages({
            'string.empty': 'Keyword is required',
            'string.min': 'Keyword must be at least 1 character',
            'string.max': 'Keyword cannot exceed 100 characters',
            'any.required': 'Please enter a search keyword'
        }),
    
    type: Joi.string().valid('events', 'posts', 'users', 'all').default('all')
        .messages({
            'any.only': 'Invalid type. Only accepts: events, posts, users, all'
        }),
    
    page: Joi.number().integer().min(1).default(1)
        .messages({
            'number.base': 'Page must be a number',
            'number.min': 'Page must be greater than 0'
        }),
    
    limit: Joi.number().integer().min(1).max(50).default(10)
        .messages({
            'number.base': 'Limit must be a number',
            'number.min': 'Limit must be greater than 0',
            'number.max': 'Limit cannot exceed 50'
        })
});
