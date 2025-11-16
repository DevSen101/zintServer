// tests/courseDetail.test.js
const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express = require("express");
const courseDetailRouter = require("../routes/courseDetailRoutes"); // adjust path
const CourseDetail = require("../models/CourseDetail");

let app;
let mongoServer;

jest.setTimeout(60000); // increase timeout if needed

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Initialize Express app
  app = express();
  app.use(express.json());
  app.use("/api/courseDetail", courseDetailRouter);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clean database between tests
  await CourseDetail.deleteMany({});
});

describe("CourseDetail API", () => {
  const sampleCourse = {
    courseId: "CS101",
    title: "Computer Science 101",
    duration: "3 months",
    description: "Intro to CS",
    nextBatch: "2025-12-01",
    images: { Background: "bg.png", poster: "poster.png", certificate: "cert.png", curriculumPdf: "curr.pdf" },
    jobAssistance: ["Resume", "Interview"],
    highlights: [{ title: "Hands-on", value: "Labs" }],
    liveBatch: [{ title: "Batch1", teacher: "John Doe", time: "10AM", date: "2025-12-01", seats: 30, joinLink: "link", live: true }],
    faqs: [{ question: "What?", answer: "This" }],
    fees: [{ planName: "Basic", price: 100, discountedPrice: 80, features: ["Feature1"] }]
  };

  it("should create a new course detail", async () => {
    const res = await request(app)
      .post("/api/courseDetail")
      .send(sampleCourse);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.courseId).toBe(sampleCourse.courseId);
  });

  it("should not create a duplicate course detail", async () => {
    await CourseDetail.create(sampleCourse);

    const res = await request(app)
      .post("/api/courseDetail")
      .send(sampleCourse);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/);
  });

  it("should get all course details", async () => {
    await CourseDetail.create(sampleCourse);

    const res = await request(app).get("/api/courseDetail");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it("should get a single course detail by courseId", async () => {
    await CourseDetail.create(sampleCourse);

    const res = await request(app).get(`/api/courseDetail/${sampleCourse.courseId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.courseId).toBe(sampleCourse.courseId);
  });

  it("should update an existing course detail", async () => {
    await CourseDetail.create(sampleCourse);

    const res = await request(app)
      .put(`/api/courseDetail/${sampleCourse.courseId}`)
      .send({ title: "Updated Title" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Updated Title");
  });

  it("should delete a course detail", async () => {
    await CourseDetail.create(sampleCourse);

    const res = await request(app).delete(`/api/courseDetail/${sampleCourse.courseId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const check = await CourseDetail.findOne({ courseId: sampleCourse.courseId });
    expect(check).toBeNull();
  });

  it("should get live batches", async () => {
    await CourseDetail.create(sampleCourse);

    const res = await request(app).get("/api/courseDetail/live");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.liveBatches.length).toBe(1);
    expect(res.body.liveBatches[0].title).toBe("Batch1");
  });
});
