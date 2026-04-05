const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const feedRoutes = require('./routes/feed');

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/users', userRoutes);
app.use('/feed', feedRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
