import { Request, Response } from 'express';
import { WeatherService } from '../services/weather.service';

const service = new WeatherService();

export class WeatherController {
  async getBulkAnalytics(req: Request, res: Response) {
    const { cities } = req.body;
    if (!cities || !Array.isArray(cities)) {
      return res.status(400).json({ error: 'Please enter some city names first.' });
    }

    try {
      const data = await service.getBulkAnalytics(cities);
      if (!data) return res.status(404).json({ error: "We couldn't get weather data for those cities right now." });
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: 'Something went wrong on our end. Please try again.' });
    }
  }

  async getCityAnalytics(req: Request, res: Response) {
    const { name } = req.params;
    try {
      const data = await service.getCityAnalytics(name as string);
      res.json(data);
    } catch (e) {
      res.status(404).json({ error: "Sorry, we couldn't find that city." });
    }
  }
}
