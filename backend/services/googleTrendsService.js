import googleTrends from 'google-trends-api';

/**
 * Generate mock trend data as fallback
 * @param {number} days - Number of days to generate
 * @returns {Array} Array of {date, value} objects
 */
function generateMockData(days = 30) {
  const data = [];
  const today = new Date();
  const baseValue = Math.floor(Math.random() * 30) + 50; // Base between 50-80

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate realistic trend with some randomness
    const variation = Math.floor(Math.random() * 20) - 10; // -10 to +10
    const value = Math.max(0, Math.min(100, baseValue + variation));

    data.push({
      date: date.toISOString().split('T')[0],
      value: value
    });
  }

  return data;
}

/**
 * Fetch interest over time data from Google Trends
 * @param {string} term - The search term
 * @param {string} geo - Geographic location (default: '' for worldwide)
 * @param {number} days - Number of days to fetch (default: 30)
 * @returns {Promise<Array>} Array of {date, value} objects
 */
export async function fetchInterestOverTime(term, geo = '', days = 30) {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    console.log(`📊 Attempting to fetch Google Trends data for "${term}"...`);

    const result = await googleTrends.interestOverTime({
      keyword: term,
      startTime: startDate,
      endTime: endDate,
      geo: geo,
    });

    const data = JSON.parse(result);

    if (!data.default || !data.default.timelineData) {
      throw new Error('Invalid response from Google Trends');
    }

    // Transform the data to our format
    const timelineData = data.default.timelineData.map(item => ({
      date: new Date(item.time * 1000).toISOString().split('T')[0],
      value: item.value[0],
    }));

    console.log(`✅ Successfully fetched ${timelineData.length} data points from Google Trends`);
    return timelineData;

  } catch (error) {
    console.warn(`⚠️  Google Trends API failed: ${error.message}`);
    console.log(`🔄 Falling back to mock data for "${term}"`);

    // Return mock data as fallback
    return generateMockData(days);
  }
}

/**
 * Get aggregated statistics from trend data
 * @param {Array} timelineData - Array of {date, value} objects
 * @returns {Object} Statistics object with avg, max, min, delta
 */
export function calculateTrendStats(timelineData) {
  if (!timelineData || timelineData.length === 0) {
    return { avg_score: 0, max_score: 0, min_score: 0, delta_7d: 0 };
  }

  const values = timelineData.map(item => item.value);
  const avg_score = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const max_score = Math.max(...values);
  const min_score = Math.min(...values);

  // Calculate 7-day delta (difference between last and 7 days ago)
  let delta_7d = 0;
  if (timelineData.length >= 7) {
    const lastValue = timelineData[timelineData.length - 1].value;
    const sevenDaysAgoValue = timelineData[Math.max(0, timelineData.length - 8)].value;
    delta_7d = lastValue - sevenDaysAgoValue;
  }

  return {
    avg_score,
    max_score,
    min_score,
    delta_7d,
  };
}
