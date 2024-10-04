const Joi = require('joi');

const recipeSchema = Joi.object({
    title: Joi.string().min(3).required(),
    ingredients: Joi.array().items(Joi.string()).required(),
    instructions: Joi.string().min(10).required(),
});

const ratingSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
});

const commentSchema = Joi.object({
    comment: Joi.string().min(1).required(),
});

module.exports = {
    recipeSchema,
    ratingSchema,
    commentSchema,
};
