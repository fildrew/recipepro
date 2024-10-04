const express = require('express'); // Import Express
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth'); // Import the auth middleware
const router = express.Router(); // Create a router instance

// Sign Up
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and management
 */

/**
 * @swagger
* /api/auth/signup:
 *   post:
 *     summary: Create a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).send('User created');
});

// Login
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
         return res.status(400).send('Invalid credentials');

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).send({ token });
});

// Follow User
/**
 * @swagger
 * /api/auth/follow/{id}:
 *   post:
 *     summary: Follow a user
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to follow
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully followed the user
 *       404:
 *         description: User not found
 *       400:
 *         description: Already following this user
 */
router.post('/follow/:id', auth, async (req, res) => {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) return res.status(404).send('User not found');

    const user = await User.findById(req.user.id);
    if (user.following.includes(userToFollow._id)) {
        return res.status(400).send('You are already following this user');
    }

    user.following.push(userToFollow._id);
    await user.save();
    res.json({ message: 'You are now following this user' });
});

module.exports = router;