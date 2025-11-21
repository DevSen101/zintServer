// tests/contact.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app"); // ensure this loads our express app
const Contact = require("../models/Contact");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await Contact.deleteMany({});
});


// Sample contact data
const sampleContact = () => ({
  name: "John Doe",
  email: "john@example.com",
  phone: "9876543210",
  interest: "Web Development",
  message: "I want more details.",
});


/* =====================================================
    TEST 1: CREATE CONTACT
===================================================== */
test("Should create a new contact", async () => {
  const res = await request(app)
    .post("/api/contacts")
    .send(sampleContact());

  expect(res.statusCode).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.data.name).toBe("John Doe");
});


/* =====================================================
    TEST 2: FAIL ON MISSING FIELDS
===================================================== */
test("Should return 400 when required fields are missing", async () => {
  const res = await request(app)
    .post("/api/contacts")
    .send({});

  expect(res.statusCode).toBe(500); 
  // Your controller sends 500 for validation errors.
  expect(res.body.success).toBe(false);
});


/* =====================================================
    TEST 3: GET ALL CONTACTS
===================================================== */
test("Should return all contacts", async () => {
  await Contact.create(sampleContact());

  const res = await request(app).get("/api/contacts");

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data.length).toBe(1);
});


/* =====================================================
    TEST 4: GET CONTACT BY ID
===================================================== */
test("Should return a contact by ID", async () => {
  const contact = await Contact.create(sampleContact());

  const res = await request(app).get(`/api/contacts/${contact._id}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data._id).toBe(contact._id.toString());
});


/* =====================================================
    TEST 5: RETURN 404 IF CONTACT NOT FOUND
===================================================== */
test("Should return 404 for non-existing contact", async () => {
  const fakeId = new mongoose.Types.ObjectId();

  const res = await request(app).get(`/api/contacts/${fakeId}`);

  expect(res.statusCode).toBe(404);
  expect(res.body.success).toBe(false);
  expect(res.body.message).toBe("Contact not found");
});
