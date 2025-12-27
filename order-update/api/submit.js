// Vercel Serverless Function
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { order_code, token, stage, updated_by } = req.body;

    // Validate
    if (!order_code || !token || !stage || !updated_by) {
      return res.status(400).json({ 
        success: false, 
        error: 'Thiếu thông tin bắt buộc' 
      });
    }

    // Call n8n webhook để verify token và update
    const n8nWebhookUrl = 'https://n8nkalix.online/webhook/100c57d1-5b4c-43a5-ac98-3b97fb9398da/order/' + order_code;
    
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_code,
        token,
        stage,
        updated_by,
        updated_at: new Date().toISOString()
      })
    });

    if (!n8nResponse.ok) {
      throw new Error('n8n webhook error');
    }

    const result = await n8nResponse.json();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thành công',
      data: result
    });

  } catch (error) {
    console.error('Submit error:', error);
    return res.status(500).json({
      success: false,
      error: 'Lỗi server: ' + error.message
    });
  }
}