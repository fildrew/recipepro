const request = require('supertest');
const app = require('../server'); // Adjust the path as necessary
const connectDB = require('../config/db');

beforeAll(async () => {
    await connectDB();
});

describe('Recipe API', () => {
    let token;

    beforeAll(async () => {
        // Create a user and log in to get a token
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ username: 'testuser', email: 'test@example.com', password: 'password' });
        
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'password' });
        
        token = loginRes.body.token;
    });

    it('should create a new recipe', async () => {
        const res = await request(app)
            .post('/api/recipes')
            .set('Authorization', token)
            .send({
                title: 'Pasta',
                ingredients: ['Pasta', 'Tomato Sauce'],
                instructions: 'Boil pasta and add sauce.',
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body.title).toBe('Pasta');
    });

    it('should rate a recipe', async () => {
        const recipeRes = await request(app)
            .post('/api/recipes')
            .set('Authorization', token)
            .send({
                title: 'Pasta',
                ingredients: ['Pasta', 'Tomato Sauce'],
                instructions: 'Boil pasta and add sauce.',
            });

        const res = await request(app)
            .post(`/api/recipes/${recipeRes.body._id}/rate`)
            .set('Authorization', token)
            .send({ rating: 5 });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Rating submitted');
    });

    it('should comment on a recipe', async () => {
        const recipeRes = await request(app)
            .post('/api/recipes')
            .set('Authorization', token)
            .send({
                title: 'Pasta',
                ingredients: ['Pasta', 'Tomato Sauce'],
                instructions: 'Boil pasta and add sauce.',
            });

        const res = await request(app)
            .post(`/api/recipes/${recipeRes.body._id}/comments`)
            .set('Authorization', token)
            .send({ comment: 'Delicious!' });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Comment submitted');
    });
});
