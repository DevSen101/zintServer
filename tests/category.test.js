// tests/category.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');

const categoryRoutes = require('../routes/categories');
const Category = require('../models/Category');

let app;
let mongoServer;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // Initialize Express app
  app = express();
  app.use(express.json());
  app.use('/api/categories', categoryRoutes);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clean up categories after each test
  await Category.deleteMany({});
});

describe('Category API', () => {
  test('GET /api/categories returns empty object if no category exists', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({});
  });

  test('POST /api/categories creates a new category document', async () => {
    const categoryData = { programming: ['JavaScript', 'Python'], design: ['UI', 'UX'] };

    const res = await request(app)
      .post('/api/categories')
      .send(categoryData);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(categoryData);

    // Confirm document in DB
    const doc = await Category.findOne();
    expect(doc.data).toEqual(categoryData);
  });

  test('POST /api/categories updates existing category document', async () => {
    const initialData = { programming: ['JavaScript'] };
    const updatedData = { programming: ['JavaScript', 'Python'], design: ['UI'] };

    // Create initial doc
    await Category.create({ data: initialData });

    const res = await request(app)
      .post('/api/categories')
      .send(updatedData);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(updatedData);

    // Confirm DB updated
    const doc = await Category.findOne();
    expect(doc.data).toEqual(updatedData);
  });

  test('POST /api/categories returns 400 for empty body', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Empty body - no data to save');
  });
});
