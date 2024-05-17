const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdDate: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    comments: {
      type: String,
    },
    status: {
      type: String,
      enum: ['notStarted', 'inProgress', 'paused', 'completed'],
      default: 'notStarted',
    },
    timeIntervals: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'TimeInterval',
      default: [],
    },
    ongoingTimeInterval: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimeInterval',
    },
    ongoingTimeIntervalTimeStart: {
      type: String,
    },
    timeTook: {
      type: String,
      default: '00h 00m 00s',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);
