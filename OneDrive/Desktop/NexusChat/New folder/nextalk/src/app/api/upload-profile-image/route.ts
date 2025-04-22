import { storage } from '../../../lib/firebase';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function POST(req: Request) {
  console.log('POST request received');
  const userId = auth.currentUser?.uid;
  console.log('Auth User ID:', userId);

  if (!userId) {
    console.error('Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  console.log('Form data received:', formData);

  const file = formData.get('file') as File;
  if (!file) {
    console.error('No file provided');
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  try {
    const filePath = `profile-images/${userId}/${file.name}`;
    console.log('Uploading file to:', filePath);
    const storageRef = ref(storage, filePath);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log('File uploaded successfully:', downloadURL);

    return NextResponse.json({
      message: 'Profile image uploaded successfully',
      profile_image_url: downloadURL,
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
