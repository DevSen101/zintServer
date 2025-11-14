const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Director = require("../../models/Director");

let app;
let mongo;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  process.env.MONGO_URL = uri;

  // Connect mongoose
  await mongoose.connect(uri);

  // Import app AFTER mongo connects
  app = require("../../server"); // <-- your Express app
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
});

afterEach(async () => {
  await Director.deleteMany({});
});

/**
 * TEST DATA
 */
const directorData = {
  name: "John Doe",
  title: "Managing Director",
  imageUrl: "https://example.com/image.jpg",
  bio: "Experienced leader with 20 years in management.",
  email: "john@example.com",
  socialMedia: {
    linkedin: "https://linkedin.com/john",
    twitter: "",
    instagram: "",
    facebook: "",
  },
};

describe("Director API Tests", () => {
  /* -------------------- CREATE -------------------- */
  it("should create a director", async () => {
    const res = await request(app)
      .post("/api/director")
      .send(directorData);

    expect(res.status).toBe(201);
    expect(res.body.name).toBe(directorData.name);
    expect(res.body.image).toBe(directorData.imageUrl); // controller copies imageUrl → image
  });

  it("should return 400 if image is missing", async () => {
    const { imageUrl, ...withoutImage } = directorData;

    const res = await request(app)
      .post("/api/director")
      .send(withoutImage);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/image/i);
  });

  /* -------------------- READ -------------------- */
  it("should get the director", async () => {
    await Director.create({ ...directorData, image: directorData.imageUrl });

    const res = await request(app).get("/api/director");

    expect(res.status).toBe(200);
    expect(res.body.name).toBe(directorData.name);
  });

  it("should return 404 if director does not exist", async () => {
    const res = await request(app).get("/api/director");

    expect(res.status).toBe(404);
  });

  /* -------------------- UPDATE -------------------- */
  it("should update the director", async () => {
    await Director.create({ ...directorData, image: directorData.imageUrl });

    const res = await request(app)
      .put("/api/director")
      .send({ name: "Updated Name" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Name");
  });

  /* -------------------- DELETE -------------------- */
  it("should delete the director", async () => {
    await Director.create({ ...directorData, image: directorData.imageUrl });

    const res = await request(app).delete("/api/director");

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);

    // Should actually remove from DB
    const found = await Director.findOne();
    expect(found).toBeNull();
  });

  it("should return 404 when deleting non-existing director", async () => {
    const res = await request(app).delete("/api/director");

    expect(res.status).toBe(404);
  });
});
