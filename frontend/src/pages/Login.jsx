import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Box, TextField, Button, Typography, InputAdornment,
  IconButton, Alert, CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// ── Particules flottantes ──────────────────────────────────────────────────────
const Particle = ({ x, y, delay }) => (
  <motion.div
    style={{
      position: 'absolute', left: `${x}%`, top: `${y}%`,
      width: 4, height: 4, borderRadius: '50%',
      background: 'rgba(255,255,255,0.3)',
      pointerEvents: 'none',
    }}
    animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
    transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay, ease: 'easeInOut' }}
  />
);

const particles = Array.from({ length: 20 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 4,
}));

// ── Composant champ de saisie stylisé ─────────────────────────────────────────
function GlassInput({ label, value, onChange, type = 'text', endAdornment }) {
  return (
    <Box sx={{ position: 'relative', mb: 2 }}>
      <Typography sx={{
        fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1,
        fontFamily: '"DM Sans", sans-serif',
      }}>
        {label}
      </Typography>
      <Box sx={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          style={{
            width: '100%',
            padding: '14px 16px',
            paddingRight: endAdornment ? '50px' : '16px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '0.95rem',
            fontFamily: '"DM Sans", sans-serif',
            outline: 'none',
            transition: 'all 0.2s',
            boxSizing: 'border-box',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(139, 92, 246, 0.8)';
            e.target.style.background = 'rgba(139, 92, 246, 0.1)';
            e.target.style.boxShadow = '0 0 0 4px rgba(139,92,246,0.15)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(255,255,255,0.15)';
            e.target.style.background = 'rgba(255,255,255,0.07)';
            e.target.style.boxShadow = 'none';
          }}
          autoComplete="off"
        />
        {endAdornment && (
          <Box sx={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            {endAdornment}
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ── Page Login ─────────────────────────────────────────────────────────────────
export default function Login() {
  const [form, setForm] = useState({ login: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedDemo, setFocusedDemo] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.login.trim() || !form.password.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await login(form.login, form.password);
      if (result.success) {
        navigate(result.user.role === 'ROLE_RESPONSABLE' ? '/stats' : '/dashboard');
      } else {
        setError(result.error || 'Identifiants incorrects.');
      }
    } catch {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'Admin', login: 'admin', desc: 'Accès complet', color: '#EF4444', icon: '🔐' },
    { role: 'Responsable', login: 'responsable', desc: 'Statistiques', color: '#F59E0B', icon: '📊' },
    { role: 'Utilisateur', login: 'user', desc: 'Formations', color: '#10B981', icon: '📚' },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      fontFamily: '"DM Sans", sans-serif',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Import Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        input::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>

      {/* Particules */}
      {particles.map((p, i) => <Particle key={i} {...p} />)}

      {/* Blobs décoratifs */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
            top: '-200px', right: '-200px', filter: 'blur(40px)',
          }}
        />
        <motion.div
          animate={{ scale: [1, 0.9, 1], rotate: [0, -8, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            position: 'absolute', width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
            bottom: '-150px', left: '-150px', filter: 'blur(60px)',
          }}
        />
      </Box>

      {/* ── Côté gauche — Branding ──────────────────────────────── */}
      <Box sx={{
        flex: 1.2,
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        px: 10,
        position: 'relative',
        zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
            <Box sx={{
              width: 52, height: 52,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
            }}>
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', fontFamily: '"Syne", sans-serif' }}>
                ET
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem', fontFamily: '"DM Sans", sans-serif', letterSpacing: '-0.01em' }}>
                Excellent Training
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
                Green Building · Centre de Formation
              </Typography>
            </Box>
          </Box>

          <Typography sx={{
            fontSize: '3.8rem', fontWeight: 800,
            fontFamily: '"Syne", sans-serif',
            color: '#fff',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            mb: 2,
          }}>
            Gérez vos
            <Box component="span" sx={{
              display: 'block',
              background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              formations
            </Box>
            avec précision.
          </Typography>

          <Typography sx={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '1.05rem',
            lineHeight: 1.7,
            maxWidth: 420,
            mb: 8,
            fontFamily: '"DM Sans", sans-serif',
          }}>
            Plateforme complète de gestion : sessions, participants, formateurs
            et statistiques détaillées.
          </Typography>

          {/* Stats cards */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {[
              { number: '500+', label: 'Participants', color: '#a78bfa' },
              { number: '24', label: 'Formations/an', color: '#60a5fa' },
              { number: '94%', label: 'Présence moy.', color: '#34d399' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
              >
                <Box sx={{
                  p: '16px 20px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  minWidth: 110,
                }}>
                  <Typography sx={{ color: s.color, fontWeight: 800, fontSize: '1.6rem', fontFamily: '"Syne", sans-serif', lineHeight: 1 }}>
                    {s.number}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', mt: 0.5, fontFamily: '"DM Sans", sans-serif' }}>
                    {s.label}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Box>

      {/* ── Côté droit — Formulaire ─────────────────────────────── */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 3, md: 6 },
        position: 'relative',
        zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          {/* Carte formulaire */}
          <Box sx={{
            p: { xs: 4, md: '44px' },
            borderRadius: '28px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Glow top */}
            <Box sx={{
              position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
              width: 300, height: 300, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
              filter: 'blur(40px)', pointerEvents: 'none',
            }} />

            {/* Mobile logo */}
            <Box sx={{ display: { xs: 'block', lg: 'none' }, textAlign: 'center', mb: 3 }}>
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem', fontFamily: '"Syne", sans-serif' }}>
                Excellent Training
              </Typography>
            </Box>

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography sx={{
                color: '#fff', fontWeight: 700, fontSize: '1.5rem',
                fontFamily: '"Syne", sans-serif', letterSpacing: '-0.02em', mb: 0.5,
              }}>
                Connexion
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', mb: 4, fontFamily: '"DM Sans", sans-serif' }}>
                Accédez à votre espace de gestion
              </Typography>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginBottom: 16 }}
                  >
                    <Box sx={{
                      p: 1.5, borderRadius: '12px',
                      bgcolor: 'rgba(239,68,68,0.12)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      color: '#fca5a5', fontSize: '0.85rem',
                      fontFamily: '"DM Sans", sans-serif',
                    }}>
                      ⚠️ {error}
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Formulaire */}
              <form onSubmit={handleSubmit}>
                <GlassInput
                  label="Nom d'utilisateur"
                  value={form.login}
                  onChange={e => setForm({ ...form, login: e.target.value })}
                />
                <GlassInput
                  label="Mot de passe"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  type={showPwd ? 'text' : 'password'}
                  endAdornment={
                    <IconButton
                      onClick={() => setShowPwd(!showPwd)}
                      size="small"
                      sx={{ color: 'rgba(255,255,255,0.4)', p: 0.5 }}
                    >
                      {showPwd
                        ? <VisibilityOff sx={{ fontSize: 18 }} />
                        : <Visibility sx={{ fontSize: 18 }} />
                      }
                    </IconButton>
                  }
                />

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: '14px',
                    background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    fontFamily: '"DM Sans", sans-serif',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: loading ? 'none' : '0 8px 24px rgba(139,92,246,0.4)',
                    transition: 'box-shadow 0.2s',
                    marginTop: 8,
                  }}
                >
                  {loading ? (
                    <CircularProgress size={20} sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  ) : (
                    <>Se connecter <span>→</span></>
                  )}
                </motion.button>
              </form>

              {/* Séparateur */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(255,255,255,0.08)' }} />
                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', fontFamily: '"DM Sans", sans-serif', whiteSpace: 'nowrap' }}>
                  COMPTES DE DÉMONSTRATION
                </Typography>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(255,255,255,0.08)' }} />
              </Box>

              {/* Comptes démo */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {demoAccounts.map((acc, i) => (
                  <motion.button
                    key={acc.login}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setForm({ login: acc.login, password: 'password123' })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      background: focusedDemo === i ? `${acc.color}15` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${focusedDemo === i ? acc.color + '40' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={() => setFocusedDemo(i)}
                    onMouseLeave={() => setFocusedDemo(null)}
                  >
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: acc.color + '20', fontSize: '1rem',
                    }}>
                      {acc.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.855rem', fontFamily: '"DM Sans", sans-serif', lineHeight: 1.3 }}>
                        {acc.role}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', fontFamily: '"DM Sans", sans-serif' }}>
                        {acc.desc}
                      </Typography>
                    </Box>
                    <Box sx={{ px: 1.5, py: 0.4, borderRadius: '6px', bgcolor: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Typography sx={{ color: acc.color, fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 700 }}>
                        {acc.login}
                      </Typography>
                    </Box>
                  </motion.button>
                ))}
              </Box>
            </Box>
          </Box>

          <Typography sx={{
            textAlign: 'center', mt: 3,
            color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem',
            fontFamily: '"DM Sans", sans-serif',
          }}>
            © 2026 Excellent Training — Green Building
          </Typography>
        </motion.div>
      </Box>
    </Box>
  );
}
