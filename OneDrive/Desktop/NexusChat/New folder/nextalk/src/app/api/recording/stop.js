// pages/api/recording/stop.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { appId, resourceId, sid, channelName, uid } = req.body;
  
  try {
    // Your Agora App Certificate from environment variable
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    
    // Stop recording
    await axios.post(
      `https://api.agora.io/v1/apps/${appId}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`,
      {
        cname: channelName,
        uid: uid || "1",
        clientRequest: {}
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${appId}:${appCertificate}`).toString('base64')}`
        }
      }
    );
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error stopping recording:', error);
    res.status(500).json({ error: error.message });
  }
}