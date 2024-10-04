const request = require('supertest');
const app = require('../server'); // Import the app
const connectDB = require('../config/db');

const createUser = async (username, password) => {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        throw new Error('User already exists with this username');
    }

    // Proceed to create a new user
    const newUser = new User({ username, password });
    await newUser.save();
};

beforeAll(async () => {
    // Check if the user already exists
    const existingUser = await User.findOne({ username: "testuser" });
    if (!existingUser) {
        // Create a user and log in to get a token   
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ username: "testuser", password: "password" });
        token = res.body.token;
    } else {
        // If the user exists, retrieve the token or handle accordingly
        token = existingUser.token; // Adjust this line based on your logic
    }
});

afterAll(async () => {
    // Clean up the test user
    await User.deleteOne({ username: "testuser" });
    // Close the server
    await server.close();
});

describe('Auth API', () => {
    let token;
    let userId;

    it('should sign up a new user', async () => {
        // Check if the user already exists before signing up
        const existingUser = await User.findOne({ email: 'test@example.com' });
        if (existingUser) {
            await User.deleteOne({ email: 'test@example.com' });
        }
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password',
            });
        expect(res.statusCode).toEqual(201);
        expect(res.text).toBe('User created');
    });

    it('should log in the user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password',
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body.token).toBeDefined();
        token = res.body.token; // Save the token for later use
    });

    it('should follow a user', async () => {
        // Create another user to follow
        const newUserRes = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'followuser',
                email: 'follow@example.com',
                password: 'password',
            });
        userId = newUserRes.body._id; // Get the ID of the new user

        const res = await request(app)
            .post(`/api/auth/follow/${userId}`)
            .set('Authorization', token);
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('You are now following this user');
    });
});
