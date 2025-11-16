// tests/coursePage2.test.js

const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');

const coursePage2Routes = require('../routes/coursePage2Routes');
const CoursePage2 = require('../models/CoursePage2');

let app;
let mongoServer;

beforeAll(async () => {
  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);

  // Setup Express app
  app = express();
  app.use(express.json());
  app.use('/api', coursePage2Routes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clean database after each test
  await CoursePage2.deleteMany({});
});

describe('CoursePage2 API', () => {

  it('should create a new CoursePage2 entry', async () => {
    const res = await request(app)
      .post('/api/courses_page_second')
      .send({
        mainCategory: 'Programming',
        subCategory: 'Web Development',
        childCategory: 'Frontend',
        course: {
          id: 'course1',
          title: 'React Basics',
          duration: '4 weeks',
          level: 'Beginner',
          nextBatch: 'Nov 2025',
          description: 'Learn React from scratch',
          topics: ['JSX', 'Components', 'Hooks'],
          icon: 'react.png'
        }
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.course.title).toBe('React Basics');
  });

  it('should not create duplicate course id', async () => {
    // First insert
    await CoursePage2.create({
      mainCategory: 'Programming',
      subCategory: 'Web Development',
      childCategory: 'Frontend',
      course: {
        id: 'course1',
        title: 'React Basics'
      }
    });

    // Try inserting duplicate
    const res = await request(app)
      .post('/api/courses_page_second')
      .send({
        mainCategory: 'Programming',
        subCategory: 'Web Development',
        childCategory: 'Frontend',
        course: {
          id: 'course1',
          title: 'React Advanced'
        }
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/already exists/);
  });

  it('should fail when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/courses_page_second')
      .send({
        mainCategory: 'Programming',
        course: {
          id: 'course2'
        }
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Missing required fields/);
  });

  it('should get all CoursePage2 entries', async () => {
    await CoursePage2.create([
      {
        mainCategory: 'Programming',
        subCategory: 'Web',
        childCategory: 'Frontend',
        course: { id: 'course1', title: 'React Basics' }
      },
      {
        mainCategory: 'Programming',
        subCategory: 'Web',
        childCategory: 'Backend',
        course: { id: 'course2', title: 'Node.js Basics' }
      }
    ]);

    const res = await request(app)
      .get('/api/courses_page_second');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].course.id).toBeDefined();
  });

});
