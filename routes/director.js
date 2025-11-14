const express = require('express');
const router  = express.Router();
const {
  getDirector,
  createDirector,
  updateDirector,
  deleteDirector
} = require('../controllers/directorController');

router.route('/')
  .get(getDirector)
  .post(createDirector)
  .put(updateDirector)
  .delete(deleteDirector);

module.exports = router;