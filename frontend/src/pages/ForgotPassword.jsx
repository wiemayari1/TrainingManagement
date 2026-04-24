import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const API_BASE = 'http://localhost:8081/api';

// ── Champ stylisé ─────────────────────────────────────────────────────────────
function GlassInput({ label, value, onChange, type = 'text', placeholder, endAdornment }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px',
        fontFamily: '"DM Sans", sans-serif',
      }}>{label}</p>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '14px 16px',
            paddingRight: endAdornment ? '50px' : '16px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px', color: '#fff',
            fontSize: '0.95rem', fontFamily: '"DM Sans", sans-serif',
            outline: 'none', boxSizing: 'border-box',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(139,92,246,0.8)';
            e.target.style.boxShadow = '0 0 0 4px rgba(139,92,246,0.15)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(255,255,255,0.15)';
            e.target.style.boxShadow = 'none';
          }}
        />
        {endAdornment && (
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            {endAdornment}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page Forgot Password ───────────────────────────────────────────────────────
export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setMsg('Veuillez entrer votre email.');
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setStatus('success');
      setMsg(data.message || 'Si cet email existe, vous recevrez un lien.');
    } catch {
      setStatus('error');
      setMsg('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        <Card>
          <BackButton onClick={() => navigate('/login')} />

          <h2 style={{
            color: '#fff', fontWeight: 800, fontSize: '1.5rem',
            fontFamily: '"Syne", sans-serif', letterSpacing: '-0.02em',
            margin: '0 0 8px',
          }}>Mot de passe oublié ?</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', margin: '0 0 28px', fontFamily: '"DM Sans", sans-serif', lineHeight: 1.6 }}>
            Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>

          {status === 'success' ? (
            <SuccessBox message={msg} onBack={() => navigate('/login')} />
          ) : (
            <form onSubmit={handleSubmit}>
              <GlassInput
                label="Adresse email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                placeholder="votre.email@exemple.com"
              />
              {msg && <ErrorBox message={msg} />}
              <SubmitButton loading={loading} label="Envoyer le lien →" />
            </form>
          )}
        </Card>
      </motion.div>
    </PageWrapper>
  );
}

// ── Page Reset Password ────────────────────────────────────────────────────────
export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return setMsg('Le mot de passe doit contenir au moins 6 caractères.');
    if (password !== confirm) return setMsg('Les mots de passe ne correspondent pas.');
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
      } else {
        setMsg(data.message || 'Erreur lors de la réinitialisation.');
      }
    } catch {
      setMsg('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <PageWrapper>
        <Card>
          <ErrorBox message="Lien invalide. Veuillez refaire une demande de réinitialisation." />
          <BackButton onClick={() => navigate('/forgot-password')} label="← Refaire une demande" />
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        <Card>
          <h2 style={{
            color: '#fff', fontWeight: 800, fontSize: '1.5rem',
            fontFamily: '"Syne", sans-serif', margin: '0 0 8px',
          }}>Nouveau mot de passe</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', margin: '0 0 28px', fontFamily: '"DM Sans", sans-serif' }}>
            Choisissez un mot de passe fort (minimum 6 caractères).
          </p>

          {status === 'success' ? (
            <SuccessBox
              message="Mot de passe réinitialisé avec succès !"
              onBack={() => navigate('/login')}
              backLabel="Se connecter →"
            />
          ) : (
            <form onSubmit={handleSubmit}>
              <GlassInput
                label="Nouveau mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                type={showPwd ? 'text' : 'password'}
                placeholder="Minimum 6 caractères"
                endAdornment={
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                }
              />
              <GlassInput
                label="Confirmer le mot de passe"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                type="password"
                placeholder="Répétez le mot de passe"
              />

              {/* Force du mot de passe */}
              <PasswordStrength password={password} />

              {msg && <ErrorBox message={msg} />}
              <SubmitButton loading={loading} label="Réinitialiser →" />
            </form>
          )}
        </Card>
      </motion.div>
    </PageWrapper>
  );
}

// ── Composants partagés ────────────────────────────────────────────────────────
function PageWrapper({ children }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      padding: '24px', fontFamily: '"DM Sans", sans-serif',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        input::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>
      {children}
    </div>
  );
}

function Card({ children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '28px',
      backdropFilter: 'blur(40px)',
      padding: '44px',
      boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
      width: '100%', maxWidth: 420,
    }}>
      {children}
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div style={{
      background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
      borderRadius: '12px', padding: '12px 16px', marginBottom: 16,
      color: '#fca5a5', fontSize: '0.85rem', fontFamily: '"DM Sans", sans-serif',
    }}>
      ⚠️ {message}
    </div>
  );
}

function SuccessBox({ message, onBack, backLabel = '← Retour à la connexion' }) {
  return (
    <div>
      <div style={{
        background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: 24,
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
        <p style={{ color: '#6ee7b7', margin: 0, fontFamily: '"DM Sans", sans-serif', lineHeight: 1.6 }}>
          {message}
        </p>
      </div>
      <button onClick={onBack} style={{
        width: '100%', padding: '14px', borderRadius: '12px',
        background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
        border: 'none', color: '#fff', fontSize: '0.95rem', fontWeight: 700,
        fontFamily: '"DM Sans", sans-serif', cursor: 'pointer',
      }}>
        {backLabel}
      </button>
    </div>
  );
}

function BackButton({ onClick, label = '← Retour à la connexion' }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem',
      fontFamily: '"DM Sans", sans-serif', marginBottom: 24, display: 'block',
      padding: 0,
    }}>
      {label}
    </button>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <button type="submit" disabled={loading} style={{
      width: '100%', padding: '15px', borderRadius: '14px',
      background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #8B5CF6, #6366F1)',
      border: 'none', color: '#fff', fontSize: '0.95rem', fontWeight: 700,
      fontFamily: '"DM Sans", sans-serif', cursor: loading ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: loading ? 'none' : '0 8px 24px rgba(139,92,246,0.4)',
      marginTop: 8,
    }}>
      {loading ? '⏳ Envoi...' : label}
    </button>
  );
}

function PasswordStrength({ password }) {
  if (!password) return null;
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const labels = ['Trop court', 'Faible', 'Correct', 'Bon', 'Fort'];
  const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981'];

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 4,
            background: i < score ? colors[score] : 'rgba(255,255,255,0.1)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <p style={{ color: colors[score], fontSize: '0.75rem', margin: 0, fontFamily: '"DM Sans", sans-serif' }}>
        Force : {labels[score]}
      </p>
    </div>
  );
}

export default ForgotPassword;
