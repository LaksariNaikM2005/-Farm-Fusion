const express = require('express');
const router = express.Router();
const { getWeather, getNews, getExperts } = require('../controllers/externalController');

router.get('/weather', getWeather);
router.get('/news', getNews);
router.get('/experts', getExperts);

module.exports = router;
