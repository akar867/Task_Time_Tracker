const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error('All fields are mandatory!');
  }
  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error('User is already registered!');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    username,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      message: 'user created',
      user: { username: user.username, id: user.id, email: user.email },
    });
  } else {
    res.status(400);
    throw new Error('User data is not valid');
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('All fields are mandatory!');
  }

  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '48h' }
    );

    res.status(200).json({
      message: 'user logged in',
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } else {
    res.status(401);
    throw new Error('email or password is not valid');
  }
});

const updateReportsCount = async (req, res) => {
  const user = await User.findById(req.user.id);
  user.reportsGenerated = user.reportsGenerated + 1;
  await user.save();
  res.status(200).json({ message: 'updated reports generated count' });
};

const currentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: 'fetched current user',
    user: {
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
    },
  });
});

module.exports = { registerUser, loginUser, updateReportsCount, currentUser };
