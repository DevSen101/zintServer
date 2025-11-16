const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');

const Course = require('../models/Course');
const courseRoutes = require('../routes/courseRoutes');

let app;
let mongoServer;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);

  // Setup Express app
  app = express();
  app.use(express.json());
  app.use('/courses', courseRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear all data between tests
  await Course.deleteMany();
});

describe('Course API', () => {
  it('should create a new course', async () => {
    const response = await request(app)
      .post('/courses')
      .send({
        heading: 'Programming',
        subheadings: [
          { name: 'Frontend', courses: [{ name: 'React' }, { name: 'Vue' }] },
          { name: 'Backend', courses: [{ name: 'Node.js' }] }
        ]
      });

    expect(response.status).toBe(201);
    expect(response.body.course.heading).toBe('Programming');
    expect(response.body.course.subheadings.length).toBe(2);
    expect(response.body.course.subheadings[0].courses[0]).toHaveProperty('_id');
    expect(response.body.course.subheadings[0].courses[0].name).toBe('React');
  });

  it('should return all courses', async () => {
    const course = new Course({
      heading: 'Programming',
      subheadings: [{ name: 'Frontend', courses: [{ name: 'React' }] }]
    });
    await course.save();

    const response = await request(app).get('/courses');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].heading).toBe('Programming');
  });

  it('should return a course by ID', async () => {
    const course = new Course({
      heading: 'Programming',
      subheadings: [{ name: 'Frontend', courses: [{ name: 'React' }] }]
    });
    await course.save();

    const response = await request(app).get(`/courses/${course._id}`);
    expect(response.status).toBe(200);
    expect(response.body.heading).toBe('Programming');
    expect(response.body.subheadings[0].courses[0].name).toBe('React');
  });

  it('should update a course', async () => {
    const course = new Course({
      heading: 'Programming',
      subheadings: [{ name: 'Frontend', courses: [{ name: 'React' }] }]
    });
    await course.save();

    const response = await request(app)
      .put(`/courses/${course._id}`)
      .send({
        heading: 'Software Development',
        subheadings: [{ name: 'Frontend', courses: [{ name: 'Angular' }] }]
      });

    expect(response.status).toBe(200);
    expect(response.body.course.heading).toBe('Software Development');
    expect(response.body.course.subheadings[0].courses[0].name).toBe('Angular');
  });

  it('should delete a course', async () => {
    const course = new Course({
      heading: 'Programming',
      subheadings: [{ name: 'Frontend', courses: [{ name: 'React' }] }]
    });
    await course.save();

    const response = await request(app).delete(`/courses/${course._id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Course deleted successfully');

    const courses = await Course.find();
    expect(courses.length).toBe(0);
  });

  it('should return 404 if course not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const response = await request(app).get(`/courses/${fakeId}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Course not found');
  });
});
