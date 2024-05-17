const express = require('express');
const router = express.Router();

const usersRouter = require('./userRouter');
const tasksRouter = require('./taskRouter');
const timeIntervalRouter = require('./timeIntervalRouter');
const validateToken = require('../middlewares/validateTokenHandler');

router.use('/user', usersRouter);
router.use('/task', validateToken, tasksRouter);
router.use('/timeInterval', validateToken, timeIntervalRouter);

module.exports = router;
