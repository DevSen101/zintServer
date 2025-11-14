const Director = require("../models/Director");

/* -------  CREATE (POST /api/director)  ------- */
exports.createDirector = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (body.imageUrl && !body.image) body.image = body.imageUrl; // fix
    if (!body.image) return res.status(400).json({ message: 'image (imageUrl) is required' });

    const doc = await Director.create(body);
    res.status(201).json(doc);
  } catch (err) { next(err); }
};

/* -------  READ (GET /api/director)  ------- */
exports.getDirector = async (req, res, next) => {
  try {
    const doc = await Director.findOne();
    if (!doc) return res.status(404).json({ message: 'Director not found' });
    res.json(doc);
  } catch (err) { next(err); }
};

/* -------  UPDATE (PUT /api/director)  ------- */
exports.updateDirector = async (req, res, next) => {
  try {
    console.log("director",req.body);
    const body = { ...req.body };
     body.image = body.imageUrl || body.image;

    const updated = await Director.findOneAndUpdate({}, body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Director not found' });
    res.json(updated);
  } catch (err) { next(err); } 
};

/* -------  DELETE (DELETE /api/director)  ------- */
exports.deleteDirector = async (req, res, next) => {
  try {
    const deleted = await Director.findOneAndDelete();
    if (!deleted) return res.status(404).json({ message: 'Director not found' });
    res.json({ message: 'Director profile deleted' });
  } catch (err) { next(err); }
};