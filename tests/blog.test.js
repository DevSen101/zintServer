const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const blogRoutes = require('../routes/blogs');
const Blog = require('../models/Blog');

const app = express();
app.use(express.json());
app.use('/api/blogs', blogRoutes);

let mongoServer;

beforeAll(async () => {
  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Connect Mongoose
  await mongoose.connect(uri);
});

afterAll(async () => {
  // Disconnect Mongoose & stop MongoDB server
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear database after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Blog API', () => {
  let blogId;
  const blogData = {
    title: 'Test Blog',
    excerpt: 'This is a test blog',
    content: 'Content of test blog',
    author: 'Dev',
    date: '2025-11-16',
    readTime: '5 min',
    image: 'image-url',
    public_id: 'public-id',
    slug: 'test-blog',
    category: 'Test'
  };

  it('should create a new blog', async () => {
    const res = await request(app).post('/api/blogs').send(blogData);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(blogData.title);
    blogId = res.body.data._id;
  });

  it('should fetch all blogs', async () => {
    await new Blog(blogData).save();
    const res = await request(app).get('/api/blogs');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should fetch blog by slug', async () => {
    await new Blog(blogData).save();
    const res = await request(app).get(`/api/blogs/slug/${blogData.slug}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe(blogData.slug);
  });

  it('should update a blog', async () => {
    const blog = await new Blog(blogData).save();
    const res = await request(app).put(`/api/blogs/${blog._id}`).send({ ...blogData, title: 'Updated Blog' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe('Updated Blog');
  });

  it('should delete a blog', async () => {
    const blog = await new Blog(blogData).save();
    const res = await request(app).delete(`/api/blogs/${blog._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
