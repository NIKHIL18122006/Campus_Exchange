import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMessages, sendMessage } from '../api/conversations.js';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';

const timeOf = (iso) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

function dayLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function Chat() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const listRef = useRef(null);
  const [text, setText] = useState('');

  const { data, isPending, error } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => getMessages(id),
  });

  const send = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const messages = data?.messages ?? [];
  const count = messages.length;

  // keep the view at the newest message when the count changes
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [count]);

  // fetching a chat marks it as read on the server, so refresh the badge and the inbox
  useEffect(() => {
    if (data === undefined) return;
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    queryClient.invalidateQueries({ queryKey: ['unread-count'] });
  }, [count, data === undefined, queryClient]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isPending) return <p className="text-muted">Loading…</p>;

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <p role="alert" className="text-danger">
          {error.status === 404 || error.status === 400
            ? "We couldn't find that conversation."
            : error.message}
        </p>
        <Link to="/messages" className="mt-2 inline-block text-brand underline">Back to messages</Link>
      </div>
    );
  }

  const { conversation } = data;

  function handleSend(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    send.mutate({ id, body });
  }

  let lastDay = '';

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex h-[calc(100vh-15rem)] min-h-[26rem] flex-col rounded border border-line bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <p className="font-semibold">{conversation.otherUser.name}</p>
            <Link
              to={`/listings/${conversation.listing.id}`}
              className="block truncate text-sm text-brand underline"
            >
              {conversation.listing.title}
            </Link>
          </div>
          <Link to="/messages" className="shrink-0 text-sm text-brand underline">All messages</Link>
        </div>

        <div ref={listRef} className="flex-1 space-y-1.5 overflow-y-auto bg-page/50 p-4">
          {messages.map((m) => {
            const mine = m.sender_id === user.id;
            const day = new Date(m.created_at).toDateString();
            const showDay = day !== lastDay;
            lastDay = day;

            return (
              <div key={m.id}>
                {showDay && (
                  <p className="my-3 text-center text-xs text-muted">{dayLabel(m.created_at)}</p>
                )}
                <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 ${
                      mine ? 'bg-brand text-white' : 'border border-line bg-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-[15px]">{m.body}</p>
                    <p className={`mt-0.5 text-right text-xs ${mine ? 'text-white/70' : 'text-muted'}`}>
                      {timeOf(m.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {send.error && (
          <p role="alert" className="border-t border-line px-4 pt-2 text-sm text-danger">
            {send.error.message}
          </p>
        )}

        {conversation.canSend ? (
          <form onSubmit={handleSend} className="flex gap-2 border-t border-line p-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={1000}
              aria-label="Message"
              placeholder="Write a message"
              className="flex-1 rounded border border-line bg-white px-3 py-2 text-[15px] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
            <Button type="submit" disabled={!text.trim() || send.isPending}>Send</Button>
          </form>
        ) : (
          <p className="border-t border-line p-4 text-sm text-muted">
            This item has been sold, so the chat is read-only.
          </p>
        )}
      </div>
    </div>
  );
}