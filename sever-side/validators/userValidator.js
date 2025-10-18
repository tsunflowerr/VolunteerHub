import Joi from 'joi';

export const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().message({
        "string.empty": "Username is required",
        "string.alphanum": "Username must only contain alphanumeric characters",
        "string.min": "Username must be at least 3 characters long",
    }),
    email: Joi.string().email().required().message({
        "string.empty": "Email is required",
        "string.email": "Email must be a valid email address",
    }),
    phone_number: Joi.string().pattern(/^[0-9]{10}$/).required().message({
        "string.empty": "Phone number is required",
        "string.pattern.base": "Phone number must be 10 digits long",
    }),
    password: Joi.string().min(6).required().message({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters long",
    }),
    confirm_password: Joi.string().valid(Joi.ref('password')).required().message({
        "any.only": "Passwords do not match",
        "string.empty": "Confirm password is required",
    })
})

export const loginSchema = Joi.object({
    email: Joi.string().email().required().message({
        "string.empty": "Email is required",
        "string.email": "Email must be a valid email address",
    }),
    password: Joi.string().required().message({
        "string.empty": "Password is required",
    })
})

export const updateUserProfile = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().message({
        "string.empty": "Username is required",
        "string.alphanum": "Username must only contain alphanumeric characters",
        "string.min": "Username must be at least 3 characters long",
    }),
    email: Joi.string().email().required().message({
        "string.empty": "Email is required",
        "string.email": "Email must be a valid email address",
    }),
    phone_number: Joi.string().pattern(/^[0-9]{10}$/).required().message({
        "string.empty": "Phone number is required",
        "string.pattern.base": "Phone number must be 10 digits long",
    }),
    avatar: Joi.string().uri().optional().message({
        "string.uri": "Avatar must be a valid URL",
    })
})

export const changePasswordSchema = Joi.object({
    current_password: Joi.string().required().message({
        "string.empty":" Current password is required",
    }),
    new_password: Joi.string().min(6).required().message({
        "string.empty": "New password is required",
        "string.min": "New password must be at least 6 characters long",
    }),
    confirm_new_password: Joi.string().valid(Joi.ref('new_password')).required().message({
        "any.only": "New passwords do not match",
        "string.empty": "Confirm new password is required",
    })
})