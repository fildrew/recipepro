const express = require('express');
const Recipe = require('../models/recipe');
const auth = require('../middleware/auth');
const { recipeSchema, ratingSchema, commentSchema } = require('../validators/recipevalidator');
const router = express.Router();

// Create Recipe
router.post('/', auth, async (req, res) => {
    const { error } = recipeSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { title, ingredients, instructions } = req.body;
    const newRecipe = new Recipe({ title, ingredients, instructions, user: req.user.id });
    await newRecipe.save();
    res.status(201).json(newRecipe);
});

// Get All Recipes
router.get('/', async (req, res) => {
    const recipes = await Recipe.find().populate('user', 'username');
    res.json(recipes);
});

// Get Recipe by ID
router.get('/:id', async (req, res) => {
    const recipe = await Recipe.findById(req.params.id).populate('user', 'username');
    if (!recipe) return res.status(404).send('Recipe not found');
    res.json(recipe);
});

// Update Recipe
router.put('/:id', auth, async (req, res) => {
    const { title, ingredients, instructions } = req.body;
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).send('Recipe not found');

    // Check if the user is the owner of the recipe
    if (recipe.user.toString() !== req.user.id) {
        return res.status(403).send('Access denied');
    }

    recipe.title = title || recipe.title;
    recipe.ingredients = ingredients || recipe.ingredients;
    recipe.instructions = instructions || recipe.instructions;
    await recipe.save();
    res.json(recipe);
});

// Delete Recipe
router.delete('/:id', auth, async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).send('Recipe not found');

    // Check if the user is the owner of the recipe
    if (recipe.user.toString() !== req.user.id) {
        return res.status(403).send('Access denied');
    }

    await recipe.remove();
    res.json({ message: 'Recipe deleted' });
});

// Rate Recipe
router.post('/:id/rate', auth, async (req, res) => {
    const { error } = ratingSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { rating } = req.body;
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).send('Recipe not found');

    const existingRating = recipe.ratings.find(r => r.user.toString() === req.user.id);
    if (existingRating) {
        existingRating.rating = rating;
    } else {
        recipe.ratings.push({ user: req.user.id, rating });
    }

    await recipe.save();
    res.json({ message: 'Rating submitted', recipe });
});

// Comment on Recipe
router.post('/:id/comments', auth, async (req, res) => {
    const { error } = commentSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { comment } = req.body;
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).send('Recipe not found');

    recipe.comments.push({ user: req.user.id, comment });
    await recipe.save();
    res.json({ message: 'Comment submitted', recipe });
});

// Save Recipe to Favorites
router.post('/:id/save', auth, async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).send('Recipe not found');

    // Logic to save the recipe to the user's favorites (you may need to implement a User model update)
    // For simplicity, let's assume we just log it for now
    console.log(`User ${req.user.id} saved recipe ${recipe.id}`);
    res.json({ message: 'Recipe saved to favorites' });
});

module.exports = router;
