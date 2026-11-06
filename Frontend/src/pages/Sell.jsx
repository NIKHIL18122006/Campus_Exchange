import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createListing } from '../api/listings.js';
import { CATEGORIES, CONDITIONS } from '../lib/format.js';
import Field, { Select, Textarea } from '../components/Field.jsx';
import Button from '../components/Button.jsx';

const MAX_PHOTOS = 4;
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB, same limit as the server

export default function Sell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInput = useRef(null);

  const [form, setForm] = useState({
    title: '', description: '', price: '', negotiable: false, category: '', condition: '',
  });
  const [photos, setPhotos] = useState([]); // [{ file, url }]
  const [photoError, setPhotoError] = useState('');

  // free the preview URLs when leaving the page
  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  const mutation = useMutation({
    mutationFn: createListing,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      navigate(`/listings/${data.listing.id}`);
    },
  });

  function update(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : name === 'price' ? value.replace(/\D/g, '') : value,
    }));
  }

  function addPhotos(e) {
    const picked = Array.from(e.target.files);
    e.target.value = ''; // lets the same file be picked again later
    setPhotoError('');

    const accepted = [];
    for (const file of picked) {
      if (!file.type.startsWith('image/')) {
        setPhotoError('Only image files can be added.');
      } else if (file.size > MAX_SIZE) {
        setPhotoError('Each photo must be under 5 MB.');
      } else {
        accepted.push({ file, url: URL.createObjectURL(file) });
      }
    }

    const room = MAX_PHOTOS - photos.length;
    if (accepted.length > room) {
      setPhotoError(`You can add up to ${MAX_PHOTOS} photos.`);
      accepted.slice(room).forEach((p) => URL.revokeObjectURL(p.url));
    }
    setPhotos([...photos, ...accepted.slice(0, room)]);
  }

  function removePhoto(index) {
    URL.revokeObjectURL(photos[index].url);
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoError('');
  }

  function makeCover(index) {
    const picked = photos[index];
    setPhotos([picked, ...photos.filter((_, i) => i !== index)]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (photos.length === 0) {
      setPhotoError('Add at least one photo.');
      return;
    }

    const body = new FormData();
    body.append('title', form.title.trim());
    body.append('description', form.description.trim());
    body.append('price', form.price);
    body.append('negotiable', String(form.negotiable));
    body.append('category', form.category);
    body.append('condition', form.condition);
    photos.forEach((p) => body.append('images', p.file)); // order = display order

    mutation.mutate(body);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Post an item</h1>
      <p className="mt-1 text-muted">
        Clear photos and an honest description sell faster. Buyers will message you in the app.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 rounded border border-line bg-white p-5">
        <div>
          <p className="mb-1 text-sm font-medium">Photos</p>
          <div className="grid grid-cols-4 gap-2">
            {photos.map((p, i) => (
              <div key={p.url}>
                <div className="relative">
                  <img
                    src={p.url}
                    alt={`Photo ${i + 1}`}
                    className="aspect-square w-full rounded border border-line object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-white px-1.5 py-0.5 text-xs font-semibold">
                      Cover
                    </span>
                  )}
                </div>
                <div className="mt-1 flex justify-between text-xs">
                  {i > 0 ? (
                    <button type="button" onClick={() => makeCover(i)} className="text-brand underline">
                      Make cover
                    </button>
                  ) : (
                    <span />
                  )}
                  <button type="button" onClick={() => removePhoto(i)} className="text-danger underline">
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInput.current.click()}
                className="flex aspect-square items-center justify-center rounded border border-dashed border-ink/40 bg-white text-sm text-muted hover:border-brand hover:text-brand"
              >
                Add photo
              </button>
            )}
          </div>
          <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={addPhotos} />
          <p className="mt-2 text-sm text-muted">Up to 4 photos, 5 MB each. The first one is the cover.</p>
          {photoError && <p role="alert" className="mt-1 text-sm text-danger">{photoError}</p>}
        </div>

        <Field
          label="Title" id="title" name="title" value={form.title} onChange={update}
          required maxLength={120} placeholder="For example: Engineering Mathematics textbook"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Category" id="category" name="category" value={form.category} onChange={update} required>
            <option value="" disabled>Choose a category</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>

          <div className="flex items-end gap-4">
            <Field
              label="Price (₹)" id="price" name="price" value={form.price} onChange={update}
              required inputMode="numeric" className="tabular-nums"
            />
            <label className="mb-2 flex shrink-0 items-center gap-2 text-[15px]">
              <input
                type="checkbox" name="negotiable" checked={form.negotiable} onChange={update}
                className="h-4 w-4 accent-[var(--color-brand)]"
              />
              Negotiable
            </label>
          </div>
        </div>

        <fieldset>
          <legend className="mb-1 text-sm font-medium">Condition</legend>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map((c) => (
              <label
                key={c.value}
                className={`cursor-pointer rounded border px-3 py-1.5 text-[15px] focus-within:ring-2 focus-within:ring-brand/40 ${
                  form.condition === c.value ? 'border-brand bg-brand text-white' : 'border-line bg-white'
                }`}
              >
                <input
                  type="radio" name="condition" value={c.value} required className="sr-only"
                  checked={form.condition === c.value} onChange={update}
                />
                {c.label}
              </label>
            ))}
          </div>
        </fieldset>

        <Textarea
          label="Description" id="description" name="description" value={form.description}
          onChange={update} rows={5} maxLength={2000}
          hint="Mention the edition, any marks or damage, and where on campus you can meet."
        />

        {mutation.error && (
          <p role="alert" className="text-sm text-danger">{mutation.error.message}</p>
        )}

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Posting…' : 'Post listing'}
          </Button>
          {mutation.isPending && (
            <span className="text-sm text-muted">Uploading photos can take a few seconds.</span>
          )}
        </div>
      </form>
    </div>
  );
}