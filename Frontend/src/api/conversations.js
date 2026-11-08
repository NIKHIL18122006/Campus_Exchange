import { api } from './client.js';

export const expressInterest = (listingId) =>
  api(`/listings/${listingId}/interest`, { method: 'POST' });

export const listConversations = () => api('/conversations');
export const getUnreadCount = () => api('/conversations/unread-count');
export const getMessages = (id) => api(`/conversations/${id}/messages`);
export const sendMessage = ({ id, body }) =>
  api(`/conversations/${id}/messages`, { method: 'POST', body: { body } });