// utils/validateCourse.js
const Joi = require('joi');

const courseSchema = Joi.object({
  id: Joi.string().required().messages({
    'any.required': 'Course ID is required',
    'string.empty': 'Course ID cannot be empty'
  }),
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
  price: Joi.string().required(),
  imageUrl: Joi.string().uri().required(),
  plans: Joi.array().items(Joi.string()).min(1).required(),
  language: Joi.string().required(),
  tag: Joi.string().optional()
});

const validateCourse = (data) => {
  return courseSchema.validate(data, { abortEarly: false });
};

module.exports = validateCourse;