const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const RecipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    ingredients: { type: [String], required: true },
    instructions: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ratings: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, rating: { type: Number, required: true } }],
    comments: [CommentSchema],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Recipe', RecipeSchema);
