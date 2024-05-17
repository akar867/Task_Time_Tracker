const mongoose = require('mongoose');

const timeIntervalSchema = mongoose.Schema(
  {
    timeStart: {
      type: String,
      required: true,
    },
    timeEnd: {
      type: String,
      required: false,
    },
    timeTotal: {
      type: Number,
    },
    timeTotalString: {
      type: String,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TimeInterval', timeIntervalSchema);
