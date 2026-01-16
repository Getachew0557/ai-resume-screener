const request = require('supertest');
const express = require('express');
const recruitmentRoutes = require('../../src/routes/recruitmentRoutes');

// Mock the database and middleware
jest.mock('../../src/middleware/authMiddleware', () => ({
    authenticate: (req, res, next) => {
        req.user = { id: 1, role: 'hr' };
        next();
    },
    authorize: (...roles) => (req, res, next) => next()
}));

describe('Recruitment Routes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/recruitment', recruitmentRoutes);
    });

    describe('GET /recruitment/jobs', () => {
        it('should return list of jobs', async () => {
            const response = await request(app)
                .get('/recruitment/jobs')
                .expect('Content-Type', /json/);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('POST /recruitment/jobs', () => {
        it('should create a new job', async () => {
            const newJob = {
                title: 'Software Engineer',
                department: 'Engineering',
                location: 'Remote',
                salary_range: '80000-120000',
                status: 'open',
                description: 'We are looking for a talented software engineer'
            };

            const response = await request(app)
                .post('/recruitment/jobs')
                .send(newJob)
                .expect('Content-Type', /json/);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.title).toBe(newJob.title);
        });

        it('should return 400 for invalid job data', async () => {
            const invalidJob = {
                title: '', // Empty title should fail
            };

            const response = await request(app)
                .post('/recruitment/jobs')
                .send(invalidJob);

            expect(response.status).toBe(400);
        });
    });
});
