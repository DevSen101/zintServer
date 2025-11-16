// tests/studentReview.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app'); // your Express app
const StudentReview = require('../models/StudentReview');

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
  await StudentReview.deleteMany({});
});

describe('StudentReview API', () => {
  const sampleReview = {
    name: 'John Doe',
    course: 'MERN Stack',
    placementDetails: 'Placed at Google',
    review: 'Great course!',
    achievements: ['Completed project', 'Got a certificate'],
    ratings: 5,
    photoUrl: 'http://res.cloudinary.com/demo/image/upload/sample.jpg'
  };

  const baseRoute = '/api/student-reviews'; // ✅ correct plural route

  test('should create a new review', async () => {
    const res = await request(app)
      .post(baseRoute)
      .send(sampleReview)
      .expect(201);

    expect(res.body.name).toBe(sampleReview.name);
    expect(res.body.course).toBe(sampleReview.course);

    const dbReview = await StudentReview.findOne({ name: 'John Doe' });
    expect(dbReview).not.toBeNull();
    expect(dbReview.review).toBe('Great course!');
  });

  test('should get all reviews', async () => {
    await StudentReview.create(sampleReview);

    const res = await request(app)
      .get(baseRoute)
      .expect(200);

    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('John Doe');
  });

  test('should get review by ID', async () => {
    const review = await StudentReview.create(sampleReview);

    const res = await request(app)
      .get(`${baseRoute}/${review._id}`)
      .expect(200);

    expect(res.body.name).toBe('John Doe');
  });

  test('should update a review', async () => {
    const review = await StudentReview.create(sampleReview);

    const updatedData = { review: 'Updated review text', ratings: 4 };
    const res = await request(app)
      .put(`${baseRoute}/${review._id}`)
      .send(updatedData)
      .expect(200);

    expect(res.body.review).toBe('Updated review text');
    expect(res.body.ratings).toBe(4);
  });

  test('should delete a review', async () => {
    const review = await StudentReview.create(sampleReview);

    const res = await request(app)
      .delete(`${baseRoute}/${review._id}`)
      .expect(200);

    expect(res.body.message).toBe('Review deleted successfully');

    const dbReview = await StudentReview.findById(review._id);
    expect(dbReview).toBeNull();
  });

  test('should return 404 for non-existent review', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .get(`${baseRoute}/${fakeId}`)
      .expect(404);
  });
});
