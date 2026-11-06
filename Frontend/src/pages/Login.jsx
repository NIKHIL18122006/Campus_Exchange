import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { loginRequest } from '../api/auth.js';
import { useAuth } from '../context/AuthContext.jsx';
import Field from '../components/Field.jsx';
import Button from '../components/Button.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });

  const from = location.state?.from?.pathname || '/';

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      login(data.token, data.user);
      navigate(from, { replace: true });
    },
    onError: (err) => {
      // Correct password but the email was never verified
      if (err.status === 403 && err.data?.userId) {
        navigate('/verify', {
          state: { userId: err.data.userId, email: form.email, justSent: false },
        });
      }
    },
  });

  if (user) return <Navigate to="/" replace />;

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function handleSubmit(e) {
    e.preventDefault();
    mutation.mutate(form);
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-semibold">Log in</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded border border-line bg-white p-5">
        <Field label="College email" id="email" name="email" type="email" value={form.email}
               onChange={update} required autoComplete="email" />
        <Field label="Password" id="password" name="password" type="password" value={form.password}
               onChange={update} required autoComplete="current-password" />

        {mutation.error && mutation.error.status !== 403 && (
          <p role="alert" className="text-sm text-danger">{mutation.error.message}</p>
        )}

        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? 'Logging in…' : 'Log in'}
        </Button>
      </form>

      <p className="mt-4 text-sm text-muted">
        New here?{' '}
        <Link to="/signup" className="text-brand underline">Create an account</Link>
      </p>
    </div>
  );
}