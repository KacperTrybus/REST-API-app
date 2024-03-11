const Joi = require("joi");

const userValidation = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required(),
  subscription: Joi.string().valid("starter", "pro", "business"),
  token: Joi.string().allow(null).optional(),
});

module.exports = {
  userValidation,
};
