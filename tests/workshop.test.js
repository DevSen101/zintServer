// tests/workshop.test.js
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app'); // your Express app
const Workshop = require('../models/Workshop');

let mongoServer;

beforeAll(async () => {
  // Increase Jest timeout
  jest.setTimeout(60000);

  // Start in-memory MongoDB
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
  // Clean up all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

describe('Workshop API', () => {
  let workshopId;

  const workshopData = {
    title: 'Test Workshop',
    instructor: 'John Doe',
    duration: '2 hours',
    date: '2025-11-20',
    description: 'This is a test workshop.',
    image: 'https://example.com/image.jpg',
    public_id: 'test123',
    slug: 'test-workshop',
    zoomLink: 'https://zoom.us/testlink',
    category: 'Testing',
  };

  test('should create a new workshop', async () => {
    const res = await request(app)
      .post('/api/workshops')
      .send(workshopData)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(workshopData.title);
    workshopId = res.body.data._id; // save for later tests
  });

  test('should get all workshops', async () => {
    // Create one workshop first
    await Workshop.create(workshopData);

    const res = await request(app)
      .get('/api/workshops')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  test('should get workshop by ID', async () => {
    const workshop = await Workshop.create(workshopData);

    const res = await request(app)
      .get(`/api/workshops/${workshop._id}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(workshopData.title);
  });

  test('should get workshop by slug (_id route works like slug)', async () => {
    const workshop = await Workshop.create(workshopData);

    const res = await request(app)
      .get(`/api/workshops/slug/${workshop._id}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(workshopData.title);
  });

  test('should update a workshop', async () => {
    const workshop = await Workshop.create(workshopData);

    const updatedData = {
      title: 'Updated Title',
      instructor: 'Jane Doe',
      duration: '3 hours',
      date: '2025-12-01',
      description: 'Updated description',
      zoomLink: 'https://zoom.us/updatedlink',
      category: 'Updated Category',
    };

    const res = await request(app)
      .put(`/api/workshops/${workshop._id}`)
      .send(updatedData)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(updatedData.title);
  });

  test('should return 404 for non-existent workshop', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/workshops/${fakeId}`)
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Workshop not found');
  });

  test('should delete a workshop', async () => {
    const workshop = await Workshop.create(workshopData);

    const res = await request(app)
      .delete(`/api/workshops/${workshop._id}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Workshop deleted');
  });
});
