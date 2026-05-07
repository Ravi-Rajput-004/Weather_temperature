import axios from 'axios';
import prisma from '../config/db';

const BASE_URL = 'http://api.weatherapi.com/v1';
const cache = new Map<string, { data: any; timestamp: number }>();
const TTL = 15 * 60 * 1000;

export class WeatherService {
  async getBulkAnalytics(cities: string[]) {
    const results = await Promise.all(
      cities.map(async (city) => {
        try {
          const key = `w:${city.toLowerCase()}`;
          const cached = cache.get(key);
          
          let data;
          if (cached && Date.now() - cached.timestamp < TTL) {
            data = cached.data;
          } else {
            const key = process.env.WEATHER_API_KEY || 'a0f0605ca8fc4830aa6135434260705';
            const res = await axios.get(`${BASE_URL}/current.json`, {
              params: { key, q: city }
            });
            data = res.data;
            cache.set(key, { data, timestamp: Date.now() });
          }

          const cityData = {
            name: data.location.name,
            temp: data.current.temp_c
          };

          // Database is optional - don't crash if it fails
          try {
            await prisma.weatherLog.create({
              data: {
                city: cityData.name,
                temp: cityData.temp,
                humidity: data.current.humidity,
                condition: data.current.condition.text
              }
            });
          } catch (dbError) {
            console.log('DB log skipped');
          }

          return cityData;
        } catch (e) {
          return null;
        }
      })
    );

    const valid = results.filter(r => r !== null) as any[];
    if (valid.length === 0) return null;

    const temps = valid.map(v => v.temp);
    const highest = valid.reduce((a, b) => a.temp > b.temp ? a : b);
    const lowest = valid.reduce((a, b) => a.temp < b.temp ? a : b);

    return {
      averageTemperature: parseFloat((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)),
      highestTemperature: { city: highest.name, temp: highest.temp },
      lowestTemperature: { city: lowest.name, temp: lowest.temp },
      hotCities: valid.filter(v => v.temp > 30).map(v => v.name)
    };
  }

  async getCityAnalytics(name: string) {
    const key = `f:${name.toLowerCase()}`;
    const cached = cache.get(key);
    
    let data;
    if (cached && Date.now() - cached.timestamp < TTL) {
      data = cached.data;
    } else {
      const key = process.env.WEATHER_API_KEY || 'a0f0605ca8fc4830aa6135434260705';
      const res = await axios.get(`${BASE_URL}/forecast.json`, {
        params: { key, q: name, days: 5 }
      });
      data = res.data;
      cache.set(key, { data, timestamp: Date.now() });
    }

    return {
      city: data.location.name,
      currentTemperature: data.current.temp_c,
      forecast: data.forecast.forecastday.map((d: any) => ({
        date: d.date,
        minTemp: d.day.mintemp_c,
        maxTemp: d.day.maxtemp_c,
        condition: d.day.condition.text
      })),
      warning: data.current.temp_c > 35 ? "Heat warning!" : null
    };
  }
}
