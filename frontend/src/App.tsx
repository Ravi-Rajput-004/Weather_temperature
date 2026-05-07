import React, { useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const API = 'http://localhost:5001/analytics';

function App() {
  const [list, setList] = useState('');
  const [single, setSingle] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleBulk = async () => {
    setLoading(true);
    setErr('');
    try {
      const cities = list.split(',').map(c => c.trim()).filter(c => c);
      const res = await axios.post(`${API}/cities`, { cities });
      setStats(res.data);
    } catch (e: any) {
      setErr(e.response?.data?.error || "Oops! Something went wrong while checking those cities.");
    } finally {
      setLoading(false);
    }
  };

  const handleSingle = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await axios.get(`${API}/city/${single}`);
      setDetail(res.data);
    } catch (e: any) {
      setErr("We couldn't find details for that city. Try checking the spelling!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Weather Analytics</h1>
        <p className="subtitle">Real-time data aggregation and forecasting</p>
      </header>

      <div className="card">
        <div className="card-title">Bulk City Analysis</div>
        <div className="input-group">
          <input 
            placeholder="e.g. London, Mumbai, Tokyo" 
            value={list} 
            onChange={e => setList(e.target.value)}
          />
          <button onClick={handleBulk} disabled={loading}>
            {loading ? 'Processing...' : 'Analyze'}
          </button>
        </div>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Average Temperature</span>
              <span className="stat-value">{stats.averageTemperature}°</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Highest Temperature</span>
              <span className="stat-value">{stats.highestTemperature.temp}°</span>
              <span className="city-tag">{stats.highestTemperature.city}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Lowest Temperature</span>
              <span className="stat-value">{stats.lowestTemperature.temp}°</span>
              <span className="city-tag">{stats.lowestTemperature.city}</span>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">5-Day Forecast</div>
        <div className="input-group">
          <input 
            placeholder="Search city name..." 
            value={single} 
            onChange={e => setSingle(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSingle()}
          />
          <button onClick={handleSingle} disabled={loading}>View Details</button>
        </div>

        {detail && (
          <div style={{ marginTop: 32 }}>
            {detail.warning && (
              <div className="warning-banner">
                ⚠️ {detail.warning}
              </div>
            )}

            <div className="detail-header">
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{detail.city}</h2>
                <div style={{ color: '#64748b' }}>Current Conditions</div>
              </div>
              <div className="current-temp">{detail.currentTemperature}°</div>
            </div>

            <div style={{ height: 240, width: '100%', marginBottom: 32 }}>
              <ResponsiveContainer>
                <LineChart data={detail.forecast}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 11}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 11}} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="maxTemp" stroke="#2563eb" strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="minTemp" stroke="#94a3b8" strokeWidth={2} dot={{r: 4}} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="forecast-row">
              {detail.forecast.map((day: any) => {
                const date = new Date(day.date);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <div key={day.date} className="forecast-day">
                    <div className="day-name">{dayName}</div>
                    <div className="day-temp">{Math.round(day.maxTemp)}°</div>
                    <div className="day-cond">{day.condition}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {err && <div className="error-text">❌ {err}</div>}
    </div>
  );
}

export default App;
