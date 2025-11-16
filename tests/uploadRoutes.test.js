// tests/uploadRoutes.test.js
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../app');
const cloudinary = require('../config/cloudinary');

// Mock Cloudinary
jest.mock('../config/cloudinary', () => ({
  v2: {},
  uploader: {
    upload: jest.fn(),
    destroy: jest.fn(),
  },
}));

describe('Upload Routes', () => {
  const imagePath = path.join(__dirname, 'sample.jpg'); // create a small test file
  const pdfPath = path.join(__dirname, 'sample.pdf');   // create a small test file

  beforeAll(() => {
    // create dummy files if they don't exist
    if (!fs.existsSync(imagePath)) fs.writeFileSync(imagePath, 'dummy image content');
    if (!fs.existsSync(pdfPath)) fs.writeFileSync(pdfPath, 'dummy pdf content');
  });

  afterAll(() => {
    // clean up dummy files
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
  });

  test('should upload an image successfully', async () => {
    cloudinary.uploader.upload.mockResolvedValue({
      secure_url: 'http://cloudinary.com/image.jpg',
      public_id: 'image123',
      resource_type: 'image',
      original_filename: 'sample',
      format: 'jpg',
    });

    const res = await request(app)
      .post('/api/upload')
      .attach('image', imagePath);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.url).toBe('http://cloudinary.com/image.jpg');
  });

  test('should upload a PDF successfully', async () => {
    cloudinary.uploader.upload.mockResolvedValue({
      secure_url: 'http://cloudinary.com/file.pdf',
      public_id: 'pdf123',
      resource_type: 'raw',
      original_filename: 'sample',
      format: 'pdf',
    });

    const res = await request(app)
      .post('/api/upload')
      .attach('image', pdfPath);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.resource_type).toBe('raw');
  });

  test('should fail on unsupported file type', async () => {
    const txtPath = path.join(__dirname, 'sample.txt');
    fs.writeFileSync(txtPath, 'hello');

    const res = await request(app)
      .post('/api/upload')
      .attach('image', txtPath);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);

    fs.unlinkSync(txtPath);
  });

  test('should delete a file by public_id', async () => {
    cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });

    const res = await request(app)
      .delete('/api/upload')
      .send({ public_id: 'image123', resource_type: 'image' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('File deleted successfully');
  });

  test('should delete a file by URL', async () => {
    cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });

    const url = 'http://res.cloudinary.com/demo/image/upload/v12345/course_images/sample.jpg';

    const res = await request(app)
      .post('/api/upload/delete-by-url')
      .send({ url });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.public_id).toBe('course_images/sample');
  });
});
