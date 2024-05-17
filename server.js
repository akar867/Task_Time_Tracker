require('dotenv').config();
const express = require('express');
const connectDb = require('./config/dbConnection');
const errorHandler = require('./middlewares/errorHandler');
const cors = require('cors');

connectDb();
const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use('/', require('./routes'));
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
