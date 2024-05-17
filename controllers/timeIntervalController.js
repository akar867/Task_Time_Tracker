const Task = require('../models/Task');
const TimeInterval = require('../models/TimeInterval');
const { getFormattedTimestamp, getMilliseconds } = require('../utils');

module.exports = {
  start: async (req, res) => {
    /* timestamp to start the time interval */
    const timeStart = new Date().toISOString();
    const { taskId } = req.body;
    if (!taskId) {
      return res.status(400).json({ message: 'mandatory fields missing' });
    }
    if (taskId.length !== 24) {
      return res.status(400).json({ message: 'invalid task id' });
    }

    /* updating task to in progress */
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        status: 'inProgress',
      },
      { new: true }
    ).populate('timeIntervals');
    if (!updatedTask) {
      return res.status(404).json({ message: 'task id is not valid' });
    }

    /* create time interval */
    const timeInterval = await TimeInterval.create({
      timeStart,
      taskId,
    });

    updatedTask.ongoingTimeInterval = timeInterval.id;
    updatedTask.ongoingTimeIntervalTimeStart = timeInterval.timeStart;
    await updatedTask.save();

    res.status(201).json({
      message: 'time interval started',
      timeInterval,
      task: updatedTask,
    });
  },
  end: async (req, res) => {
    /* timestamp to end the time interval */
    const timeEnd = new Date();
    const { taskId, timeIntervalId } = req.body;
    if (!taskId || !timeIntervalId) {
      return res.status(400).json({ message: 'mandatory fields missing' });
    }
    if (taskId.length !== 24 || timeIntervalId.length !== 24) {
      return res.status(400).json({ message: 'invalid id in request' });
    }

    const timeInterval = await TimeInterval.findById(timeIntervalId);
    if (!timeInterval) {
      return res.status(404).json({ message: 'time interval id is not valid' });
    }
    if (timeInterval.timeEnd) {
      return res.status(400).json({ message: 'time interval already closed' });
    }
    if (timeInterval.taskId.toString() !== taskId) {
      return res
        .status(400)
        .json({ message: 'time interval id does not belong to this task' });
    }

    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        status: 'paused',
      },
      { new: true }
    ).populate('timeIntervals');
    if (!task) {
      return res.status(500).json({ message: 'internal server error' });
    }

    /* calculate total time taken by all time intervals */
    let timeTotal = 0;
    if (task.timeIntervals.length > 0) {
      task.timeIntervals.forEach((timeIntervalElement) => {
        if (timeIntervalElement.timeTotal) {
          timeTotal += timeIntervalElement.timeTotal;
        }
      });
    }
    /* current time interval time difference */
    const timeDifference =
      timeEnd.getTime() - Date.parse(timeInterval.timeStart);
    timeTotal += timeDifference;

    /* update time interval */
    timeInterval.timeEnd = timeEnd.toISOString();
    const timeTotalString = getFormattedTimestamp(timeDifference);
    timeInterval.timeTotalString = timeTotalString;
    /* saving accurate milliseconds value according timeTotalString generated */
    timeInterval.timeTotal = getMilliseconds(timeTotalString);
    await timeInterval.save();

    /* update task */
    task.timeIntervals.push(timeIntervalId);
    task.timeTook = getFormattedTimestamp(timeTotal);
    delete task.ongoingTimeInterval;
    delete task.ongoingTimeIntervalTimeStart;
    await task.save();
    await task.populate('timeIntervals');

    res
      .status(201)
      .json({ message: 'time interval stopped', timeInterval, task });
  },
  createManually: async (req, res) => {
    const { taskId, timeStart, timeEnd } = req.body;
    if (!taskId || !timeStart || !timeEnd) {
      return res.status(400).json({ message: 'mandatory fields missing' });
    }
    if (taskId.length !== 24) {
      return res.status(400).json({ message: 'invalid task id' });
    }

    const task = await Task.findById(taskId).populate('timeIntervals');
    if (!task) {
      return res.status(400).json({ message: 'task id is not valid' });
    }

    /* calculate total time taken by all time intervals */
    let timeTotal = 0;
    if (task.timeIntervals.length > 0) {
      task.timeIntervals.forEach((timeIntervalElement) => {
        if (timeIntervalElement.timeTotal) {
          timeTotal += timeIntervalElement.timeTotal;
        }
      });
    }

    /* current time interval time difference */
    const requestTimeStart = Date.parse(timeStart);
    const requestTimeEnd = Date.parse(timeEnd);
    const timeDifference = Math.abs(requestTimeEnd - requestTimeStart);
    if (isNaN(timeDifference)) {
      return res.status(400).json({ message: 'date provided not valid' });
    }
    timeTotal += timeDifference;

    /* create time interval */
    const timeInterval = await TimeInterval.create({
      timeStart: new Date(requestTimeStart).toISOString(),
      timeEnd: new Date(requestTimeEnd).toISOString(),
      timeTotal: timeDifference,
      timeTotalString: getFormattedTimestamp(timeDifference),
      taskId,
    });

    /* update task */
    task.timeIntervals.push(timeInterval.id);
    task.timeTook = getFormattedTimestamp(timeTotal);
    if (task.status === 'notStarted') {
      task.status = 'paused';
    }
    await task.save();
    await task.populate('timeIntervals');

    res
      .status(201)
      .json({ message: 'created time interval for task', timeInterval, task });
  },
  remove: async (req, res) => {
    const { taskId, timeIntervalId } = req.body;
    if (!taskId || !timeIntervalId) {
      return res.status(400).json({ message: 'mandatory fields missing' });
    }
    if (taskId.length !== 24 || timeIntervalId.length !== 24) {
      return res.status(400).json({ message: 'invalid id in request' });
    }

    const timeInterval = await TimeInterval.findById(timeIntervalId);
    if (!timeInterval) {
      return res.status(404).json({ message: 'time interval id is not valid' });
    }
    if (!timeInterval.timeEnd) {
      return res
        .status(400)
        .json({ message: 'can not delete a running timer' });
    }
    if (timeInterval.taskId.toString() !== taskId) {
      return res
        .status(400)
        .json({ message: 'time interval id does not belong to this task' });
    }

    const task = await Task.findById(taskId).populate('timeIntervals');
    if (!task) {
      return res.status(400).json({ message: 'task id is not valid' });
    }

    /* calculate total time taken by all time intervals */
    let timeTotal = 0;
    if (task.timeIntervals.length > 0) {
      task.timeIntervals.forEach((timeIntervalElement) => {
        if (timeIntervalElement.timeTotal) {
          timeTotal += timeIntervalElement.timeTotal;
        }
      });
    }

    /* subtract current time interval time total */
    timeTotal -= timeInterval.timeTotal;

    /* delete time interval */
    await timeInterval.deleteOne();

    /* update task array to remove time interval and update time took */
    task.timeIntervals.pull({ _id: timeIntervalId });
    task.timeTook = getFormattedTimestamp(timeTotal);
    if (task.timeTook === '00h 00m 00s') {
      task.status = 'notStarted';
    }

    await task.save();
    await task.populate('timeIntervals');

    res.status(200).json({ message: 'deleted time interval', task });
  },
};
