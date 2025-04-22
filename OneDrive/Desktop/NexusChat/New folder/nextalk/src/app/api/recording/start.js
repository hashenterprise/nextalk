// pages/api/recording/start.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { appId, channelName, uid } = req.body;
  
  try {
    // Your Agora App Certificate from environment variable
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    
    // Get resource ID
    const resourceResponse = await axios.post(
      `https://api.agora.io/v1/apps/${appId}/cloud_recording/acquire`,
      {
        cname: channelName,
        uid: uid.toString(),
        clientRequest: {
          resourceExpiredHour: 24
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${appId}:${appCertificate}`).toString('base64')}`
        }
      }
    );
    
    const resourceId = resourceResponse.data.resourceId;
    
    // Start recording
    const startResponse = await axios.post(
      `https://api.agora.io/v1/apps/${appId}/cloud_recording/resourceid/${resourceId}/mode/mix/start`,
      {
        cname: channelName,
        uid: uid.toString(),
        clientRequest: {
          recordingConfig: {
            channelType: 0,
            streamTypes: 2,
            audioProfile: 1,
            videoStreamType: 0,
            maxIdleTime: 30,
            transcodingConfig: {
              width: 640,
              height: 360,
              fps: 15,
              bitrate: 500,
              mixedVideoLayout: 1
            }
          },
          recordingFileConfig: {
            avFileType: ["hls"]
          },
          storageConfig: {
            vendor: 1, // Cloud storage vendor: 0 (Qiniu Cloud), 1 (AWS S3), 2 (Alibaba Cloud), or 3 (Tencent Cloud)
            region: 1, // Cloud storage region: 0 to 15
            bucket: process.env.AWS_S3_BUCKET,
            accessKey: process.env.AWS_ACCESS_KEY,
            secretKey: process.env.AWS_SECRET_KEY
          }
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${appId}:${appCertificate}`).toString('base64')}`
        }
      }
    );
    
    res.status(200).json({
      resourceId,
      sid: startResponse.data.sid
    });
  } catch (error) {
    console.error('Error starting recording:', error);
    res.status(500).json({ error: error.message });
  }
}