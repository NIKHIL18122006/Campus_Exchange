import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { signup } from '../api/auth.js';
import { useAuth } from '../context/AuthContext.jsx';
import Field from '../components/Field.jsx';
import Button from '../components/Button.jsx';

const domain = import.meta.env.VITE_COLLEGE_DOMAIN;

export default function Signup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: (data) =>
      navigate('/verify', {
        state: { userId: data.userId, email: form.email, justSent: true },
      }),
  });

  if (user) return <Navigate to="/" replace />;

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function handleSubmit(e) {
    e.preventDefault();
    mutation.mutate(form);
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="mt-1 text-muted">You need a college email ending in @{domain}.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded border border-line bg-white p-5">
        <Field label="Name" id="name" name="name" value={form.name} onChange={update}
               required maxLength={100} autoComplete="name" />
        <Field label="College email" id="email" name="email" type="email" value={form.email}
               onChange={update} required placeholder={`you@${domain}`} autoComplete="email" />
        <Field label="Password" id="password" name="password" type="password" value={form.password}
               onChange={update} required minLength={8} autoComplete="new-password"
               hint="At least 8 characters." />

        {mutation.error && (
          <p role="alert" className="text-sm text-danger">{mutation.error.message}</p>
        )}

        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-4 text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-brand underline">Log in</Link>
      </p>
    </div>
  );
}