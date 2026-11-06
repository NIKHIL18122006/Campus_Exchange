import { api } from './client.js';

export const PAGE_SIZE = 12;

export function browseListings({ q, category, minPrice, maxPrice, page }) {
  const params = new URLSearchParams({ limit: PAGE_SIZE });
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  if (minPrice) params.set('minPrice', minPrice);
  if (maxPrice) params.set('maxPrice', maxPrice);
  if (page > 1) params.set('page', page);
  return api(`/listings?${params}`);
}

export const getListing = (id) => api(`/listings/${id}`);

export const createListing = (formData) => api('/listings', { method: 'POST', body: formData });
export const getMyListings = () => api('/listings/mine');
export const updateListingStatus = ({ id, status }) =>
  api(`/listings/${id}/status`, { method: 'PATCH', body: { status } });
export const deleteListing = (id) => api(`/listings/${id}`, { method: 'DELETE' });