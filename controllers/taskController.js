const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');

const createTask = asyncHandler(async (req, res) => {
  const { title, comments, createdDate } = req.body;
  if (!title || !createdDate) {
    res.status(400);
    throw new Error('mandatory fields are missing');
  }
  /* validate created at date length */
  if (createdDate.length !== 10) {
    return res.status(400).json({ message: 'invalid format for created date' });
  }

  const taskInput = comments
    ? { userId: req.user.id, title, createdDate, comments }
    : { userId: req.user.id, title, createdDate };
  const task = await Task.create(taskInput);

  res.status(201).json({ message: 'task created', task });
});

const deleteTask = asyncHandler(async (req, res) => {
  if (req.params.id.length !== 24) {
    return res.status(400).json({ message: 'invalid task id format' });
  }
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (task.userId.toString() !== req.user.id) {
    res.status(403);
    throw new Error("User don't have permission to delete other user's task");
  }

  await task.deleteOne({ _id: req.params.id });

  res.status(200).json({ message: 'task deleted', task });
});

const getTasks = asyncHandler(async (req, res) => {
  /* validate created at date length */
  if (req.body.createdDate.length !== 10) {
    return res.status(400).json({ message: 'invalid format for created date' });
  }
  const task = await Task.find({
    userId: req.user.id,
    createdDate: req.body.createdDate,
  }).populate('timeIntervals');

  res.status(200).json({ message: 'tasks fetched by created date', task });
});

const updateTask = asyncHandler(async (req, res) => {
  if (req.params.id.length !== 24) {
    return res.status(400).json({ message: 'invalid task id format' });
  }
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'task not found' });
  }
  if (task.userId.toString() !== req.user.id) {
    res.status(403);
    throw new Error("User don't have permission to update other user's task");
  }
  if (task.status === 'inProgress' && req.body.status === 'completed') {
    return res
      .status(400)
      .json({ message: 'can not mark an inProgress task as complete' });
  }

  const {
    userId,
    timeIntervals,
    timeTook,
    ongoingTimeInterval,
    ongoingTimeIntervalTimeStart,
  } = req.body;
  if (
    userId ||
    timeIntervals ||
    timeTook ||
    ongoingTimeInterval ||
    ongoingTimeIntervalTimeStart
  ) {
    return res
      .status(400)
      .json({ message: 'can not update some fields sent in the request' });
  }

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  }).populate('timeIntervals');

  res.status(200).json({ message: 'task updated', task: updatedTask });
});

module.exports = { createTask, getTasks, deleteTask, updateTask };
