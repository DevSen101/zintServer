/**
 * Jest + Supertest Test File for Event API
 */

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const Event = require("../models/Events");

let mongoServer;

/* -----------------------------------
 * Setup in-memory MongoDB
 * ----------------------------------- */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

/* -----------------------------------
 * Cleanup database after each test
 * ----------------------------------- */
afterEach(async () => {
  await Event.deleteMany({}); // remove docs

  // Drop indexes to remove unique slug conflicts
  try {
    await Event.collection.dropIndexes();
  } catch (err) {
    // Ignore "ns not found" or no indexes
  }
});

/* -----------------------------------
 * Close DB after all tests
 * ----------------------------------- */
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

/* -----------------------------------
 * Helper: Create event with unique slug
 * ----------------------------------- */
const sampleEvent = (options = {}) => ({
  title: "React Workshop",
  description: "Learn React basics",
  category: "Workshop",
  price: 50,
  capacity: 200,
  startDate: new Date(),
  locationType: "venue",
  venue: { city: "New York", address: "123 Broadway" },

  // ensure unique slug to avoid duplicate key errors
  slug:
    (options.slug || "react-workshop") +
    "-" +
    Math.random().toString(36).substring(2, 8),

  ...options,
});

/* ----------------------------------------------------
 * TEST SUITE
 * ---------------------------------------------------- */
describe("EVENT API TESTS", () => {
  /* ---------------------------
   * POST /api/events
   * --------------------------- */
  test("Should create a new event", async () => {
    const res = await request(app)
      .post("/api/events")
      .send(sampleEvent());

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("React Workshop");
  });

  test("Should fail when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/events")
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  /* ---------------------------
   * GET /api/events
   * --------------------------- */
  test("Should return events with pagination", async () => {
    await Event.create(sampleEvent());

    const res = await request(app).get("/api/events?page=1&limit=10");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
  });

  test("Should filter events by city", async () => {
    await Event.create(sampleEvent({ venue: { city: "London" } }));
    await Event.create(sampleEvent({ venue: { city: "Berlin" } }));

    const res = await request(app).get("/api/events?city=Lon");

    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].venue.city).toBe("London");
  });

  /* ---------------------------
   * GET /api/events/id/:id
   * --------------------------- */
  test("Should return event by ID", async () => {
    const event = await Event.create(sampleEvent());

    const res = await request(app).get(`/api/events/id/${event._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe(event._id.toString());
  });

  test("Should return 404 for non-existing event ID", async () => {
    const res = await request(app).get(
      `/api/events/id/${new mongoose.Types.ObjectId()}`
    );

    expect(res.statusCode).toBe(404);
  });

  /* ---------------------------
   * GET /api/events/slug/:slug
   * --------------------------- */
  test("Should return event by slug", async () => {
    const event = await Event.create(sampleEvent({ slug: "unique-slug" }));

    const res = await request(app).get(`/api/events/slug/${event.slug}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.slug).toBe(event.slug);
  });

  /* ---------------------------
   * PUT /api/events/:id
   * --------------------------- */
  test("Should update an event", async () => {
    const event = await Event.create(sampleEvent());

    const res = await request(app)
      .put(`/api/events/${event._id}`)
      .send({ title: "Updated Workshop" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe("Updated Workshop");
  });

  test("Should return 404 when updating non-existing event", async () => {
    const res = await request(app)
      .put(`/api/events/${new mongoose.Types.ObjectId()}`)
      .send({ title: "Doesn't matter" });

    expect(res.statusCode).toBe(404);
  });

  /* ---------------------------
   * DELETE /api/events/:id
   * --------------------------- */
  test("Should delete an event", async () => {
    const event = await Event.create(sampleEvent());

    const res = await request(app).delete(`/api/events/${event._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Event deleted successfully");
  });

  test("Should return 404 when deleting non-existing event", async () => {
    const res = await request(app).delete(
      `/api/events/${new mongoose.Types.ObjectId()}`
    );

    expect(res.statusCode).toBe(404);
  });

  /* ---------------------------
   * GET /api/events/stats
   * --------------------------- */
  test("Should return event stats", async () => {
    await Event.create(sampleEvent());
    await Event.create(sampleEvent({ status: "published" }));

    const res = await request(app).get("/api/events/stats");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(2);
  });
});

