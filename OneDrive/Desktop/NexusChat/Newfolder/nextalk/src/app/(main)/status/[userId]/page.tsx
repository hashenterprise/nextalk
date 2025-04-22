'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import StatusViewer from '@/components/status/StatusViewer';

// Mock status data
const usersWithStatus = {
  'me': {
    id: 'me',
    name: 'My Status',
    avatar: '/avatars/me.jpg',
    stories: [
      {
        id: 'mystory1',
        image: '/status/my-status-1.jpg',
        timestamp: '22 minutes ago',
        seen: true,
      }
    ]
  },
  'user1': {
    id: 'user1',
    name: 'Sarah Johnson',
    avatar: '/avatars/sarah.jpg',
    stories: [
      {
        id: 'user1story1',
        image: '/status/sarah-1.jpg',
        timestamp: '15 minutes ago',
        seen: false,
      },
      {
        id: 'user1story2',
        text: 'Just finished my new project! 🎉',
        timestamp: '10 minutes ago',
        seen: false,
      }
    ]
  },
  'user2': {
    id: 'user2',
    name: 'Alex Chen',
    avatar: '/avatars/alex.jpg',
    stories: [
      {
        id: 'user2story1',
        image: '/status/alex-1.jpg',
        timestamp: '25 minutes ago',
        seen: true,
      }
    ]
  },
  'user3': {
    id: 'user3',
    name: 'Jordan Taylor',
    avatar: '/avatars/jordan.jpg',
    stories: [
      {
        id: 'user3story1',
        image: '/status/jordan-1.jpg',
        timestamp: '45 minutes ago',
        seen: false,
      },
      {
        id: 'user3story2',
        image: '/status/jordan-2.jpg',
        timestamp: '40 minutes ago',
        seen: false,
      },
      {
        id: 'user3story3',
        text: 'What a beautiful day! ☀️',
        timestamp: '35 minutes ago',
        seen: false,
      }
    ]
  }
};

export default function StatusView() {
  const { userId } = useParams();
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userIds, setUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof userId === 'string') {
      setCurrentUserId(userId);
      // Get all user IDs with status
      setUserIds(Object.keys(usersWithStatus));
    }
  }, [userId]);

  const handleClose = () => {
    router.push('/status');
  };

  const goToPrevUser = () => {
    if (currentUserId && userIds.length > 0) {
      const currentIndex = userIds.indexOf(currentUserId);
      if (currentIndex > 0) {
        const prevUserId = userIds[currentIndex - 1];
        router.push(`/status/${prevUserId}`);
      }
    }
  };

  const goToNextUser = () => {
    if (currentUserId && userIds.length > 0) {
      const currentIndex = userIds.indexOf(currentUserId);
      if (currentIndex < userIds.length - 1) {
        const nextUserId = userIds[currentIndex + 1];
        router.push(`/status/${nextUserId}`);
      } else {
        // If we're at the last user, go back to the status list
        handleClose();
      }
    }
  };

  if (!currentUserId || !usersWithStatus[currentUserId]) {
    return null;
  }

  const currentUser = usersWithStatus[currentUserId];

  return (
    <StatusViewer
      user={currentUser}
      stories={currentUser.stories}
      onClose={handleClose}
      onPrev={userIds.indexOf(currentUserId) > 0 ? goToPrevUser : undefined}
      onNext={userIds.indexOf(currentUserId) < userIds.length - 1 ? goToNextUser : undefined}
    />
  );
}