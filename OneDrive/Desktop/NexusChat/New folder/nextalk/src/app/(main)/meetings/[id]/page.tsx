'use client';

import { useParams } from 'next/navigation';
import MeetingsPage from '@/app/(main)/meetings/page';

export default function MeetingDetailPage() {
  const params = useParams();
  const meetingId = params.id as string;

  return <MeetingsPage meetingId={meetingId} />;
}