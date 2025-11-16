const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../server"); // <-- Ensure correct path to server.js
const User = require("../models/User");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("AUTH API TESTS", () => {
  const userData = {
    firstName: "Dev",
    lastName: "Sen",
    email: "dev@test.com",
    password: "password123",
  };

  test("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(userData);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(userData.email);
  });

  test("should not register duplicate email", async () => {
    await User.create(userData);

    const res = await request(app)
      .post("/api/auth/register")
      .send(userData);

    expect(res.statusCode).toBe(400);
  });

  test("should login a user and set cookie", async () => {
    await User.create(userData);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: userData.email, password: userData.password });

    expect(res.statusCode).toBe(200);
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.body.token).toBeDefined();
  });

  test("should block invalid login credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "wrong@test.com", password: "pass1234" });

    expect(res.statusCode).toBe(401);
  });

  test("should get logged in user (protected route)", async () => {
    const user = await User.create(userData);
    const token = user.getSignedJwtToken();

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe(userData.email);
  });

  test("should reject access without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });

  test("should return reset link on forgot password", async () => {
    await User.create(userData);

    const res = await request(app)
      .post("/api/auth/forgotpassword")
      .send({ email: userData.email });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.resetUrl).toMatch(/resetpassword/);
  });

});
