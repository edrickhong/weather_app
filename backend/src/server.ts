import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import {
  initDB,
  insertWeather,
  getAllWeather,
  updateWeather,
  deleteWeather,
} from './db.js';

const app: Application = express();
const PORT = 3001;

initDB();

app.use(cors());
app.use(express.json());

app.post('/api/weather', async (req: Request, res: Response): Promise<void> => {
  console.log("Received payload:", req.body); // Debug log

  const { city, country, startDate, endDate, data } = req.body;
  if (!city || !country || !startDate || !endDate || !data) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    await insertWeather(city, country, startDate, endDate, data);
    res.json({ message: 'Saved' });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: 'Database insertion failed' });
  }
});

app.get('/api/weather', async (_req: Request, res: Response): Promise<void> => {
  const results = await getAllWeather();
  res.json(results);
});

app.put('/api/weather/:id', async (req: Request, res: Response): Promise<void> => {
	const id = Number(req.params.id);
	const { city, startDate, endDate, data } = req.body;
	if (!city || !startDate || !endDate || !data) {
		res.status(400).json({ error: 'Missing required fields' });
		return;
	}
	await updateWeather(id, city, startDate, endDate, data);
	res.json({ message: 'Updated' });
});


app.delete('/api/weather/:id', async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  await deleteWeather(id);
  res.json({ message: 'Deleted' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});

