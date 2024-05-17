const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

router.post('/create', createTask);
router.post('/get', getTasks);
router.delete('/delete/:id', deleteTask);
router.put('/update/:id', updateTask);

module.exports = router;
