import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listConversations } from '../api/conversations.js';
import { timeAgo } from '../lib/format.js';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'buyer', label: 'Buying' },
  { key: 'seller', label: 'Selling' },
];

export default function Messages() {
  const [tab, setTab] = useState('all');

  const { data, isPending, error } = useQuery({
    queryKey: ['conversations'],
    queryFn: listConversations,
  });

  if (isPending) return <p className="text-muted">Loading…</p>;
  if (error) return <p role="alert" className="text-danger">{error.message}</p>;

  const rows = data.conversations.filter((c) => tab === 'all' || c.my_role === tab);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">Messages</h1>

      <div className="mt-4 flex gap-5 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 pb-2 text-[15px] ${
              tab === t.key ? 'border-brand font-semibold' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 rounded border border-line bg-white p-6">
          <p className="font-semibold">No messages here yet.</p>
          <p className="mt-1 text-muted">
            Tap "I'm interested" on an item, or wait for a buyer to message you about yours.
          </p>
          <Link to="/" className="mt-3 inline-block text-brand underline">Browse listings</Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded border border-line bg-white">
          {rows.map((c) => {
            const unread = c.unread_count > 0;
            return (
              <li key={c.id}>
                <Link to={`/messages/${c.id}`} className="flex gap-4 p-4 hover:bg-page">
                  <img
                    src={c.cover_image}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded border border-line object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className={`truncate ${unread ? 'font-semibold' : 'font-medium'}`}>
                        {c.other_user_name}
                      </p>
                      <span className="shrink-0 text-xs text-muted">{timeAgo(c.last_message_at)}</span>
                    </div>
                    <p className="truncate text-sm text-muted">
                      {c.listing_title}
                      {c.listing_status === 'sold' && <span className="ml-2 text-ink">Sold</span>}
                    </p>
                    <p className={`truncate text-sm ${unread ? 'font-semibold' : 'text-muted'}`}>
                      {c.last_message}
                    </p>
                  </div>

                  {unread && (
                    <span className="self-center rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white">
                      {c.unread_count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}