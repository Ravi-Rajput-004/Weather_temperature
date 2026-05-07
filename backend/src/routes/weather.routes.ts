import { Router } from 'express';
import { WeatherController } from '../controllers/weather.controller';

const router = Router();
const controller = new WeatherController();

router.post('/cities', (req, res) => controller.getBulkAnalytics(req, res));
router.get('/city/:name', (req, res) => controller.getCityAnalytics(req, res));

export default router;
