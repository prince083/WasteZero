const Joi = require('joi');

const validate = (schema, property = 'body') => (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });

    if (error) {
        return res.status(400).json({
            error: error.details.map((d) => d.message)
        });
    }

    next();
};

const registerSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('user', 'admin', 'ngo', 'volunteer').required(),
    securityCode: Joi.string().allow('').optional(),
    address: Joi.string().required(),
    skills: Joi.array().items(Joi.string()).optional(),
    bio: Joi.string().optional(),
    location: Joi.object({
        type: Joi.string(),
        coordinates: Joi.array().items(Joi.number())
    }).optional()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const opportunitySchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    address: Joi.string().required(),
    required_skills: Joi.array().items(Joi.string()).optional(),
    duration: Joi.string().optional(),
    date: Joi.date().optional(),
    location: Joi.object({
        type: Joi.string().valid('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2)
    }).optional(),
    status: Joi.string().valid('open', 'closed', 'in-progress').optional(),
    image: Joi.string().optional()
});
const notificationIdSchema = Joi.object({
    id: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            "string.pattern.base": "Invalid notification ID format"
        })
});
// Schema for posting a new chat message
const createMessageSchema = Joi.object({
    roomId: Joi.string().optional(), // optional if using getRoomId
    sender_id: Joi.string().required(),
    receiver_id: Joi.string().required(),
    content: Joi.string().required()
});

// Schema for fetching messages
const getMessagesSchema = Joi.object({
    roomId: Joi.string().required()
});

module.exports = { validate, registerSchema, loginSchema, opportunitySchema, notificationIdSchema, createMessageSchema, getMessagesSchema };
