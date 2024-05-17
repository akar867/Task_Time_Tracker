const express = require('express');
const router = express.Router();
const {
  start,
  end,
  createManually,
  remove,
} = require('../controllers/timeIntervalController');

router.post('/start', start);
router.post('/end', end);
router.post('/createManually', createManually);
router.post('/delete', remove);

module.exports = router;
