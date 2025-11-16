// tests/filter.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app'); // your Express app
const Course = require('../models/Course');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await Course.deleteMany({});
});

describe('FilterController - /redirect-values', () => {
  const sampleCourses = [
    {
      heading: 'Web Development',
      redirect: true,
      subheadings: [
        {
          name: 'Frontend',
          redirect: false,
          courses: [
            { name: 'React' },
            { name: 'Vue' }
          ]
        },
        {
          name: 'Backend',
          redirect: true,
          courses: [
            { name: 'Node.js' },
          ]
        }
      ]
    },
    {
      heading: 'Data Science',
      subheadings: [
        {
          name: 'Machine Learning',
          courses: [
            { name: 'Python' },
            { name: 'R' }
          ]
        }
      ]
    }
  ];

  test('should return all redirect values and courses', async () => {
    await Course.insertMany(sampleCourses);

    const res = await request(app)
      .get('/api/filter/redirect-values')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    // Check for redirect: true objects
    const redirectObjects = res.body.data.filter(obj => obj.redirect === true);
    expect(redirectObjects.length).toBe(2); // heading "Web Development" + subheading "Backend"

    // Check that courses are included
    const courseNames = res.body.data.map(obj => obj.name).filter(Boolean);
    expect(courseNames).toContain('React');
    expect(courseNames).toContain('Vue');
    expect(courseNames).toContain('Node.js');
    expect(courseNames).toContain('Python');
    expect(courseNames).toContain('R');
  });

  test('should return empty array if no courses in DB', async () => {
    const res = await request(app)
      .get('/api/filter/redirect-values')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(0);
  });
});
