import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.jsx';
import { tokenStore } from '../api/client.js';

// Opens one socket while someone is logged in. It never shows anything itself:
// when the server says something changed, it tells the query cache to refetch.
export default function LiveUpdates() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token: tokenStore.get() },
    });

    const refreshChats = () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    };

    socket.on('message:new', ({ conversationId }) => {
      refreshChats();
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    });

    socket.on('listing:status', ({ listingId }) => {
      refreshChats();
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    });

    // after the connection drops and comes back, catch up on anything missed
    socket.io.on('reconnect', () => {
      refreshChats();
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    });

    socket.on('connect_error', (err) => console.warn('Live updates unavailable:', err.message));

    return () => socket.disconnect();
  }, [user, queryClient]);

  return null;
}