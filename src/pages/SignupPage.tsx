// src/pages/SignupPage.tsx
import { useSignUp, useUser } from '@clerk/clerk-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, X, Upload } from 'lucide-react';

// ─── Password strength calculator ─────────────────────────────────────────
const getStrength = (p: string) => {
  if (!p) return null;
  const checks = {
    length: p.length >= 8,
    upper: /[A-Z]/.test(p),
    number: /[0-9]/.test(p),
    special: /[^A-Za-z0-9]/.test(p),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const map = [
    null,
    { label: 'Weak',   color: 'bg-red-500',    textColor: 'text-red-400',    width: '25%'  },
    { label: 'Fair',   color: 'bg-orange-500',  textColor: 'text-orange-400', width: '50%'  },
    { label: 'Good',   color: 'bg-yellow-500',  textColor: 'text-yellow-400', width: '75%'  },
    { label: 'Strong', color: 'bg-green-500',   textColor: 'text-green-400',  width: '100%' },
  ];
  return { ...map[score], checks };
};

type Step = 'form' | 'verify' | 'avatar';

export default function SignupPage() {
  const navigate = useNavigate();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { user } = useUser();

  const [step, setStep]                         = useState<Step>('form');
  const [username, setUsername]                 = useState('');
  const [email, setEmail]                       = useState('');
  const [password, setPassword]                 = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword]         = useState(false);
  const [submitting, setSubmitting]             = useState(false);
  const [error, setError]                       = useState('');
  const [fieldErrors, setFieldErrors]           = useState<Record<string, string>>({});
  const [mounted, setMounted]                   = useState(false);

  // ── Avatar state ──
  const [avatarFile, setAvatarFile]             = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview]       = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading]   = useState(false);
  const [avatarError, setAvatarError]           = useState('');
  const [dragOver, setDragOver]                 = useState(false);
  const fileInputRef                            = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const strength = getStrength(password);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!username.trim())             errs.username = 'Username is required';
    else if (username.length < 3)     errs.username = 'At least 3 characters';
    if (!email.trim())                errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password)                    errs.password = 'Password is required';
    else if (password.length < 8)     errs.password = 'At least 8 characters';
    if (password !== confirmPassword) errs.confirmPassword = "Passwords don't match";
    return errs;
  };

  // ─── Avatar file handler ───────────────────────────────────────────────
  const handleAvatarFile = (file: File) => {
    setAvatarError('');

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setAvatarError('Image must be under 10MB');
      return;
    }

    // Revoke old preview
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAvatarFile(file);
    // Reset input so same file can be reselected
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleAvatarFile(file);
  };

  const removeAvatar = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarError('');
  };

  // ─── Step 1: Create account ────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) {
      setError('Auth not ready yet, please wait');
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setFieldErrors({});
    setError('');
    setSubmitting(true);

    try {
      const result = await signUp.create({ username, emailAddress: email, password });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        setStep('avatar');
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStep('verify');
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      setError(clerkError?.longMessage || clerkError?.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Step 2: Verify email ──────────────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setError('');
    setSubmitting(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verificationCode });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        // Move to avatar step — user object now available
        setStep('avatar');
      } else {
        setError('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      setError(clerkError?.longMessage || clerkError?.message || 'Invalid code');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Step 3: Upload avatar then go home ───────────────────────────────
  const handleAvatarUpload = async () => {
    if (!user || !avatarFile) {
      // No avatar chosen — skip to home
      navigate('/');
      return;
    }

    setAvatarError('');
    setAvatarUploading(true);

    try {
      // This is the Clerk method to set a profile image
      await user.setProfileImage({ file: avatarFile });
      navigate('/');
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      setAvatarError(clerkError?.longMessage || clerkError?.message || 'Upload failed');
    } finally {
      setAvatarUploading(false);
    }
  };

  const inputClass = (field: string) => `
    w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-800/80 text-white
    placeholder-zinc-600 border transition-all duration-200 outline-none
    focus:bg-zinc-800 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20
    ${fieldErrors[field]
      ? 'border-red-500/70 ring-2 ring-red-500/20'
      : 'border-zinc-700/80 hover:border-zinc-600'
    }
  `;

  // ── Step indicator ─────────────────────────────────────────────────────
  const steps = [
    { id: 'form',   label: 'Account'  },
    { id: 'verify', label: 'Verify'   },
    { id: 'avatar', label: 'Avatar'   },
  ];
  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4 py-10 relative overflow-hidden">

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-800/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-900/10 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div
        className={`
          relative w-full max-w-md transition-all duration-700 ease-out
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/50">
                <span className="text-2xl">⚔️</span>
              </div>
              <div className="absolute inset-0 rounded-xl bg-red-500/20 blur-md -z-10 scale-125" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-black text-white tracking-wider leading-none">SAMURAI</h1>
              <p className="text-red-400 text-xs font-medium tracking-widest uppercase">Anime Universe</p>
            </div>
          </Link>
        </div>

        {/* ── Step indicator ── */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    transition-all duration-300
                    ${i < currentStepIndex
                      ? 'bg-red-600 text-white'
                      : i === currentStepIndex
                      ? 'bg-red-600 text-white ring-4 ring-red-500/20'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                    }
                  `}
                >
                  {i < currentStepIndex ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-xs transition-colors ${i === currentStepIndex ? 'text-red-400' : 'text-zinc-600'}`}>
                  {s.label}
                </span>
              </div>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className={`w-12 h-px mb-5 transition-colors duration-300 ${i < currentStepIndex ? 'bg-red-600' : 'bg-zinc-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="relative">
          <div className="absolute -inset-[1px] bg-gradient-to-b from-red-500/30 via-zinc-800/50 to-zinc-900/30 rounded-2xl blur-sm" />
          <div className="relative bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 shadow-2xl">

            {/* ════════════════════════════════
                STEP 1 — ACCOUNT FORM
            ════════════════════════════════ */}
            {step === 'form' && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white">Create account</h2>
                  <p className="text-zinc-500 text-sm mt-1">Join thousands of anime fans</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                    <span className="text-red-400 text-lg leading-none mt-0.5">⚠</span>
                    <p className="text-red-400 text-sm leading-relaxed">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSignup} noValidate className="space-y-5">

                  {/* Username */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-zinc-300">Username</label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={e => { setUsername(e.target.value); setFieldErrors(p => ({ ...p, username: '' })); setError(''); }}
                        placeholder="SamuraiWatcher"
                        className={inputClass('username')}
                      />
                    </div>
                    {fieldErrors.username && <p className="text-xs text-red-400 flex items-center gap-1"><span>•</span>{fieldErrors.username}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-zinc-300">Email</label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); setError(''); }}
                        placeholder="you@example.com"
                        className={inputClass('email')}
                      />
                    </div>
                    {fieldErrors.email && <p className="text-xs text-red-400 flex items-center gap-1"><span>•</span>{fieldErrors.email}</p>}
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-zinc-300">Password</label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); setError(''); }}
                        placeholder="••••••••"
                        className={`${inputClass('password')} pr-12`}
                      />
                      <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                        {showPassword ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>

                    {/* Strength meter */}
                    {strength && (
                      <div className="space-y-1.5 mt-2">
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${strength.color}`} style={{ width: strength.width }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-medium ${strength.textColor}`}>{strength.label}</p>
                          <div className="flex items-center gap-2">
                            {[{ key: 'length', label: '8+' }, { key: 'upper', label: 'A-Z' }, { key: 'number', label: '0-9' }, { key: 'special', label: '!@#' }].map(({ key, label }) => (
                              <span key={key} className={`text-xs px-1.5 py-0.5 rounded font-mono transition-colors ${strength!.checks[key as keyof typeof strength.checks] ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-600'}`}>{label}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {fieldErrors.password && <p className="text-xs text-red-400 flex items-center gap-1"><span>•</span>{fieldErrors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-zinc-300">Confirm Password</label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => { setConfirmPassword(e.target.value); setFieldErrors(p => ({ ...p, confirmPassword: '' })); setError(''); }}
                        placeholder="••••••••"
                        className={inputClass('confirmPassword')}
                      />
                      {confirmPassword && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                          {password === confirmPassword ? (
                            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          )}
                        </div>
                      )}
                    </div>
                    {fieldErrors.confirmPassword && <p className="text-xs text-red-400 flex items-center gap-1"><span>•</span>{fieldErrors.confirmPassword}</p>}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting || !isLoaded}
                    className="relative w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-red-900/30 hover:shadow-red-900/50 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden group mt-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating account...
                      </span>
                    ) : 'Continue →'}
                  </button>
                </form>

                <div className="my-6 flex items-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-zinc-700" />
                  <span className="text-zinc-600 text-xs font-medium">OR</span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-zinc-700" />
                </div>
                <p className="text-center text-zinc-500 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-red-400 hover:text-red-300 font-semibold transition-colors hover:underline underline-offset-2">
                    Sign in →
                  </Link>
                </p>
              </>
            )}

            {/* ════════════════════════════════
                STEP 2 — EMAIL VERIFY
            ════════════════════════════════ */}
            {step === 'verify' && (
              <>
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Check your email</h2>
                  <p className="text-zinc-500 text-sm mt-2">
                    We sent a 6-digit code to{' '}
                    <span className="text-zinc-300 font-medium">{email}</span>
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                    <span className="text-red-400 text-lg leading-none mt-0.5">⚠</span>
                    <p className="text-red-400 text-sm leading-relaxed">{error}</p>
                  </div>
                )}

                <form onSubmit={handleVerify} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-zinc-300 text-center">Verification Code</label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      autoFocus
                      className="w-full px-4 py-4 rounded-xl bg-zinc-800/80 text-white text-center text-2xl font-mono tracking-[0.5em] placeholder-zinc-700 border border-zinc-700/80 hover:border-zinc-600 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 transition-all duration-200 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || verificationCode.length !== 6}
                    className="relative w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-red-900/30 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying...
                      </span>
                    ) : 'Verify & Continue →'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep('form'); setError(''); setVerificationCode(''); }}
                    className="w-full text-center text-zinc-500 text-sm hover:text-zinc-300 transition-colors py-2"
                  >
                    ← Back to signup
                  </button>
                </form>
              </>
            )}

            {/* ════════════════════════════════
                STEP 3 — AVATAR UPLOAD
            ════════════════════════════════ */}
            {step === 'avatar' && (
              <>
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold text-white">Add a profile photo</h2>
                  <p className="text-zinc-500 text-sm mt-1">
                    Make your profile stand out — or skip for now
                  </p>
                </div>

                {/* Avatar preview + drop zone */}
                <div className="flex flex-col items-center gap-5 mb-6">

                  {/* Preview circle */}
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-zinc-700 bg-zinc-800 flex items-center justify-center">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-zinc-600">
                          <Camera className="w-10 h-10" />
                          <span className="text-xs">No photo</span>
                        </div>
                      )}
                    </div>

                    {/* Remove button */}
                    {avatarPreview && (
                      <button
                        onClick={removeAvatar}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors shadow-lg"
                      >
                        <X className="w-3.5 h-3.5 text-white" />
                      </button>
                    )}
                  </div>

                  {/* Username display */}
                  <p className="text-white font-semibold text-lg">
                    {username}
                  </p>

                  {/* Drop zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`
                      w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                      transition-all duration-200
                      ${dragOver
                        ? 'border-red-500/70 bg-red-500/10'
                        : 'border-zinc-700 hover:border-zinc-500 hover:bg-white/[0.02]'
                      }
                    `}
                  >
                    <Upload className="w-6 h-6 text-zinc-500 mx-auto mb-2" />
                    <p className="text-zinc-400 text-sm font-medium">
                      {avatarFile ? avatarFile.name : 'Click or drag & drop an image'}
                    </p>
                    <p className="text-zinc-600 text-xs mt-1">
                      PNG, JPG, GIF, WEBP — max 10MB
                    </p>
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>

                {avatarError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2">
                    <span className="text-red-400 text-sm">⚠</span>
                    <p className="text-red-400 text-sm">{avatarError}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleAvatarUpload}
                    disabled={avatarUploading}
                    className="relative w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-red-900/30 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    {avatarUploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Uploading...
                      </span>
                    ) : avatarFile ? (
                      <span className="flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload & Finish
                      </span>
                    ) : (
                      'Set Up Profile Photo'
                    )}
                  </button>

                  <button
                    onClick={() => navigate('/')}
                    disabled={avatarUploading}
                    className="w-full py-3 rounded-xl text-sm text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
                  >
                    Skip for now — I'll add one later
                  </button>
                </div>
              </>
            )}

          </div>
        </div>

        <p className="text-center text-zinc-700 text-xs mt-6">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
