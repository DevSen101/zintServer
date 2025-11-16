// tests/dashboardCourse.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app'); // your Express app
const DashboardCourse = require('../models/DashboardCourse');

let mongoServer;

beforeAll(async () => {
  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri); // Mongoose v6+ works without useNewUrlParser / useUnifiedTopology
});

afterAll(async () => {
  // Clean up and stop server
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear data between tests
  await DashboardCourse.deleteMany({});
});

describe('DashboardCourse API', () => {
  const sampleCourses = [
    {
      _id: '1',
      courseId: 'c1',
      title: 'MERN Stack',
      description: 'Learn MERN Stack',
      duration: '3 months',
    },
    {
      _id: '2',
      courseId: 'c2',
      title: 'Python',
      description: 'Learn Python',
      duration: '2 months',
    },
  ];

  test('should save dashboard courses', async () => {
    const res = await request(app)
      .post('/api/dashboard-courses/save-dashboard-courses')
      .send(sampleCourses)
      .expect(200);

    expect(res.body.message).toBe('Dashboard courses saved successfully');
    expect(res.body.count).toBe(2);

    const dbCourses = await DashboardCourse.find();
    expect(dbCourses.length).toBe(2);
    expect(dbCourses[0].title).toBe('MERN Stack');
    expect(dbCourses[1].title).toBe('Python');
  });

  test('should get all dashboard courses', async () => {
    await DashboardCourse.insertMany(sampleCourses);

    const res = await request(app)
      .get('/api/dashboard-courses/get-dashboard-courses')
      .expect(200);

    expect(res.body.length).toBe(2);
    expect(res.body[0].title).toBe('MERN Stack');
    expect(res.body[1].title).toBe('Python');
  });

  test('should return 400 if body is not an array', async () => {
    const res = await request(app)
      .post('/api/dashboard-courses/save-dashboard-courses')
      .send({ invalid: 'data' })
      .expect(400);

    expect(res.body.error).toBe('Expected an array of courses');
  });
});
