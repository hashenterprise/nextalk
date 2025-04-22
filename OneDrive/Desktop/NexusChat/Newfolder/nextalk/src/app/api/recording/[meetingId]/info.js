// pages/api/recording/[meetingId]/info.js
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { meetingId } = req.query;
  
  try {
    // Get recording info from your database or directly from Agora
    // This is a simplified example - you might need to query Agora API for recording details
    const meetingDoc = await getDoc(doc(db, 'meetings', meetingId));
    
    if (!meetingDoc.exists()) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Format the S3 URL based on Agora's naming convention
    // NOTE: This is a simplified example - actual URLs will depend on your storage configuration
    const recordingUrl = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/recordings/${meetingId}/recording.m3u8`;
    
    // In a real app, you'd calculate actual duration from recording metadata
    const duration = 300; // 5 minutes as an example
    
    res.status(200).json({
      url: recordingUrl,
      duration: duration
    });
  } catch (error) {
    console.error('Error getting recording info:', error);
    res.status(500).json({ error: error.message });
  }
}