// tests/director.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app'); // your Express app
const Director = require('../models/Director');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await Director.deleteMany({});
});

describe('Director API', () => {
  const sampleDirector = {
    name: 'John Doe',
    title: 'CEO',
    image: 'http://example.com/image.jpg',
    bio: 'Experienced leader',
    email: 'john@example.com',
    socialMedia: {
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: 'https://twitter.com/johndoe',
    },
  };

  test('should create a director', async () => {
    const res = await request(app)
      .post('/api/director')
      .send(sampleDirector)
      .expect(201);

    expect(res.body.name).toBe('John Doe');
    expect(res.body.email).toBe('john@example.com');

    const dbDirector = await Director.findOne();
    expect(dbDirector).not.toBeNull();
  });

  test('should get the director', async () => {
    await Director.create(sampleDirector);

    const res = await request(app)
      .get('/api/director')
      .expect(200);

    expect(res.body.name).toBe('John Doe');
    expect(res.body.title).toBe('CEO');
  });

  test('should update the director', async () => {
    await Director.create(sampleDirector);

    const res = await request(app)
      .put('/api/director')
      .send({ title: 'Managing Director', imageUrl: 'http://example.com/new.jpg' })
      .expect(200);

    expect(res.body.title).toBe('Managing Director');
    expect(res.body.image).toBe('http://example.com/new.jpg');
  });

  test('should delete the director', async () => {
    await Director.create(sampleDirector);

    const res = await request(app)
      .delete('/api/director')
      .expect(200);

    expect(res.body.message).toBe('Director profile deleted');
    const dbDirector = await Director.findOne();
    expect(dbDirector).toBeNull();
  });
});
