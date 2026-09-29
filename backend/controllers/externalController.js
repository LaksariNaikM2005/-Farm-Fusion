const axios = require('axios');

// GET /api/v1/weather?city=
const getWeather = async (req, res) => {
  const { city = 'Delhi', lat, lon } = req.query;
  let url;
  if (lat && lon) {
    url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric&cnt=40`;
  } else {
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric&cnt=40`;
  }
  try {
    if (!process.env.WEATHER_API_KEY || process.env.WEATHER_API_KEY === 'your_openweathermap_api_key') {
      throw new Error('API Key Missing');
    }
    const response = await axios.get(url);
    const data = response.data;
    const daily = {};
    data.list.forEach((item) => {
      const date = item.dt_txt.split(' ')[0];
      if (!daily[date]) daily[date] = item;
    });
    res.json({ success: true, city: data.city, current: data.list[0], forecast: Object.values(daily).slice(0, 7) });
  } catch (err) {
    // Fallback for demo
    res.json({
      success: true,
      city: { name: city, country: 'IN' },
      current: { main: { temp: 28.5, humidity: 60 }, weather: [{ main: 'Sunny', description: 'Clear sky' }], wind: { speed: 5.2 } },
      forecast: [
        { dt_txt: '2026-04-27 12:00:00', main: { temp: 28.5 }, weather: [{ main: 'Sunny' }] },
        { dt_txt: '2026-04-28 12:00:00', main: { temp: 29.2 }, weather: [{ main: 'Clear' }] },
        { dt_txt: '2026-04-29 12:00:00', main: { temp: 30.1 }, weather: [{ main: 'Clouds' }] }
      ]
    });
  }
};

// GET /api/v1/news
const getNews = async (req, res) => {
  const { q = 'agriculture farming India', page = 1 } = req.query;
  try {
    if (!process.env.NEWS_API_KEY || process.env.NEWS_API_KEY === 'your_newsapi_org_key') {
      throw new Error('API Key Missing');
    }
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: { q, language: 'en', sortBy: 'publishedAt', pageSize: 12, page, apiKey: process.env.NEWS_API_KEY },
    });
    res.json({ success: true, articles: response.data.articles, totalResults: response.data.totalResults });
  } catch (err) {
    // Fallback for demo
    res.json({
      success: true,
      articles: [
        { title: 'New Irrigation Policy Announced', description: 'The government has announced a new subsidy for drip irrigation systems.', url: '#', urlToImage: 'https://via.placeholder.com/400x200?text=Irrigation+News' },
        { title: 'Market Trends for Organic Wheat', description: 'Demand for organic wheat is rising in urban centers across India.', url: '#', urlToImage: 'https://via.placeholder.com/400x200?text=Organic+Wheat' }
      ],
      totalResults: 2
    });
  }
};

// GET /api/v1/external/experts
const getExperts = async (req, res) => {
  try {
    const User = require('../models/User');
    const experts = await User.find({ role: 'expert', isActive: true }).select('-password -email');
    res.json({ success: true, users: experts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch experts' });
  }
};

module.exports = { getWeather, getNews, getExperts };
