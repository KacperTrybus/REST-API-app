const Joi = require("joi");

const contactValidation = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^\d{9}$/)
    .required(),
});

module.exports = {
  contactValidation,
};
