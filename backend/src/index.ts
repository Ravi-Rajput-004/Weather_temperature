import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import weatherRoutes from './routes/weather.routes';

const app = express();
// Using 5001 as default if PORT is not in env
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/analytics', weatherRoutes);

app.get('/', (req, res) => {
  res.send('Weather API is running...');
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
