// tests/teacher.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app'); // your Express app
const Teacher = require('../models/Teacher');

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
  await Teacher.deleteMany({});
});

describe('Teacher API', () => {
  const sampleTeacher = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phoneNumber: '+1234567890',
    department: 'Computer Science',
    jobProfile: 'Professor',
    coursesTaught: [],
    bio: 'Experienced CS professor',
    yearsOfExperience: 10,
    keyAchievements: ['Published papers', 'Awarded best teacher'],
    photo: 'http://res.cloudinary.com/demo/image/upload/sample.jpg',
    socialLinks: []
  };

  test('should create a new teacher', async () => {
    const res = await request(app)
      .post('/api/teachers')
      .send(sampleTeacher)
      .expect(201);

    expect(res.body.firstName).toBe(sampleTeacher.firstName);
    expect(res.body.department).toBe(sampleTeacher.department);

    const dbTeacher = await Teacher.findOne({ email: sampleTeacher.email });
    expect(dbTeacher).not.toBeNull();
  });

  test('should get all teachers', async () => {
    await Teacher.create(sampleTeacher);

    const res = await request(app)
      .get('/api/teachers')
      .expect(200);

    expect(res.body.length).toBe(1);
    expect(res.body[0].email).toBe(sampleTeacher.email);
  });

  test('should get teacher by ID', async () => {
    const teacher = await Teacher.create(sampleTeacher);

    const res = await request(app)
      .get(`/api/teachers/${teacher._id}`)
      .expect(200);

    expect(res.body.firstName).toBe(sampleTeacher.firstName);
  });

  test('should update a teacher', async () => {
    const teacher = await Teacher.create(sampleTeacher);

    const updatedData = { department: 'Math', yearsOfExperience: 12 };
    const res = await request(app)
      .put(`/api/teachers/${teacher._id}`)
      .send(updatedData)
      .expect(200);

    expect(res.body.department).toBe('Math');
    expect(res.body.yearsOfExperience).toBe(12);
  });

  test('should delete a teacher', async () => {
    const teacher = await Teacher.create(sampleTeacher);

    const res = await request(app)
      .delete(`/api/teachers/${teacher._id}`)
      .expect(200);

    expect(res.body.message).toBe('Teacher removed successfully');

    const dbTeacher = await Teacher.findById(teacher._id);
    expect(dbTeacher).toBeNull();
  });

  test('should return 404 for non-existent teacher', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .get(`/api/teachers/${fakeId}`)
      .expect(404);
  });

  test('should get distinct departments', async () => {
    // Seed teachers with different departments
    await Teacher.create([
      { 
        firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', 
        department: 'Computer Science', jobProfile: 'Professor', 
        coursesTaught: [], yearsOfExperience: 5, keyAchievements: ['Award A']
      },
      { 
        firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com', 
        department: 'Math', jobProfile: 'Lecturer', 
        coursesTaught: [], yearsOfExperience: 3, keyAchievements: ['Award B']
      },
      { 
        firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com', 
        department: 'Computer Science', jobProfile: 'Assistant', 
        coursesTaught: [], yearsOfExperience: 2, keyAchievements: ['Award C']
      }
    ]);

    const res = await request(app)
      .get('/api/teachers/department')
      .expect(200);

    expect(res.body).toContain('Computer Science');
    expect(res.body).toContain('Math');
    expect(res.body.length).toBe(2); // Only 2 distinct departments
  });
});
