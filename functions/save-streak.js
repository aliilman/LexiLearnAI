const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    
    // Veri doğrulama
    if (typeof data.dailyStreak !== 'number' || typeof data.totalWords !== 'number') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid data format' })
      };
    }

    // Dosya yolunu belirle
    const filePath = path.join(process.cwd(), 'streak_data.json');
    
    // Veriyi dosyaya yaz
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    console.log('Streak data saved successfully:', data);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Streak data saved successfully',
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Error saving streak data:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to save streak data',
        details: error.message
      })
    };
  }
};