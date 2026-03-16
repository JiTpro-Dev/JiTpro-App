import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../layouts/AuthLayout';

export function ResetPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">Reset Password</h2>

        {submitted ? (
          <div>
            <p className="mb-4 text-sm text-slate-600">
              If an account exists for <strong>{email}</strong>, you will receive a
              password reset email shortly.
            </p>
            <Link
              to="/login"
              className="text-sm text-slate-700 underline hover:text-slate-900"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
