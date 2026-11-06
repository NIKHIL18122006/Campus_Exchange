import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { verifyOtp, resendOtp } from '../api/auth.js';
import { useAuth } from '../context/AuthContext.jsx';
import Field from '../components/Field.jsx';
import Button from '../components/Button.jsx';

const RESEND_SECONDS = 60; // keep in sync with OTP_RESEND_COOLDOWN_SECONDS on the server

export default function VerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(state?.justSent ? RESEND_SECONDS : 0);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const verify = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      login(data.token, data.user);
      navigate('/', { replace: true });
    },
  });

  const resend = useMutation({
    mutationFn: resendOtp,
    onSuccess: () => {
      setCooldown(RESEND_SECONDS);
      setNotice('We sent you a new code.');
      setOtp('');
    },
  });

  // Opened directly without coming from signup or login
  if (!state?.userId) return <Navigate to="/signup" replace />;

  function handleSubmit(e) {
    e.preventDefault();
    setNotice('');
    verify.mutate({ userId: state.userId, otp });
  }

  const error = verify.error || resend.error;

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-semibold">Check your email</h1>
      <p className="mt-1 text-muted">
        We sent a 6-digit code to <span className="font-medium text-ink">{state.email}</span>.
        It expires in 10 minutes.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded border border-line bg-white p-5">
        <Field
          label="Verification code" id="otp" value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          inputMode="numeric" maxLength={6} autoComplete="one-time-code"
          className="tracking-widest"
        />

        {notice && <p className="text-sm text-muted">{notice}</p>}
        {error && <p role="alert" className="text-sm text-danger">{error.message}</p>}

        <Button type="submit" disabled={otp.length !== 6 || verify.isPending} className="w-full">
          {verify.isPending ? 'Verifying…' : 'Verify email'}
        </Button>
      </form>

      <p className="mt-4 text-sm text-muted">
        Didn't get it?{' '}
        <button
          type="button"
          onClick={() => resend.mutate({ userId: state.userId })}
          disabled={cooldown > 0 || resend.isPending}
          className="text-brand underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </button>
      </p>
    </div>
  );
}