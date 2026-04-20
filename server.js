const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { initDB } = require('./models/schema');

dotenv.config();
connectDB().then(() => initDB());

const app = express();

// Configure CORS with frontend URL
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:3000']
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/test', require('./routes/test'));
app.use('/api/result', require('./routes/result'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
