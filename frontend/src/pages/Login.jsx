import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Box, TextField, Button, Typography, Paper, Alert,
  InputAdornment, IconButton, Checkbox, FormControlLabel,
  Avatar, useMediaQuery, useTheme, Chip, Divider,
} from '@mui/material';
import {
  Visibility, VisibilityOff, Person, Lock,
  School, ArrowForward, Email as EmailIcon,
  AutoAwesome, Sparkles, Bolt, GppGood,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// ── Particules flottantes animées ───────────────────────────────────────────
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 2,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.3 + 0.1,
  }));

  return (
    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.4)',
            filter: 'blur(1px)',
          }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 15, -10, 5, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </Box>
  );
}

// ── Cercles concentriques animés ────────────────────────────────────────────
function RippleCircles() {
  return (
    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 300 + i * 200,
            height: 300 + i * 200,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.06)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
        />
      ))}
    </Box>
  );
}

// ── Input stylisé avec focus glow ───────────────────────────────────────────
function StyledInput({ label, value, onChange, type = 'text', placeholder, icon: Icon, endAdornment, error }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={{
        fontSize: '0.78rem', fontWeight: 600, color: '#475569', mb: 1,
        display: 'flex', alignItems: 'center', gap: 0.5,
      }}>
        {label}
      </Typography>
      <TextField
        fullWidth
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={!!error}
        helperText={error}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        InputProps={{
          startAdornment: Icon && (
            <InputAdornment position="start">
              <motion.div animate={{ scale: isFocused ? 1.1 : 1, color: isFocused ? '#6366F1' : '#94A3B8' }}>
                <Icon sx={{ fontSize: 20, transition: 'color 0.2s' }} />
              </motion.div>
            </InputAdornment>
          ),
          endAdornment,
          sx: {
            borderRadius: 3,
            bgcolor: '#F8FAFC',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              borderColor: isFocused ? '#6366F1' : '#E2E8F0',
              borderWidth: isFocused ? '2px' : '1px',
              transition: 'all 0.3s',
            },
            '&:hover fieldset': { borderColor: isFocused ? '#6366F1' : '#CBD5E1' },
            '&.Mui-focused': {
              bgcolor: '#FFFFFF',
              boxShadow: '0 0 0 4px rgba(99,102,241,0.12), 0 4px 20px rgba(99,102,241,0.08)',
            },
          },
        }}
      />
    </Box>
  );
}

// ── Badge feature avec icône animée ─────────────────────────────────────────
function FeatureBadge({ icon: Icon, label, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, type: 'spring' }}
      whileHover={{ scale: 1.05, y: -2 }}
    >
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 2, py: 1, borderRadius: 2,
        bgcolor: `${color}08`,
        border: `1px solid ${color}18`,
        cursor: 'default',
        transition: 'all 0.2s',
      }}>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay }}
        >
          <Icon sx={{ fontSize: 16, color }} />
        </motion.div>
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color }}>
          {label}
        </Typography>
      </Box>
    </motion.div>
  );
}

// ── Compteur animé ──────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = '', duration = 2 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;
    const incrementTime = (duration / end) * 1000;
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <Typography component="span" sx={{ fontWeight: 800, fontSize: 'inherit' }}>
      {count}{suffix}
    </Typography>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function Login() {
  const [form, setForm] = useState({ login: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
        if (result.user?.firstLogin) navigate('/first-login');
        else if (result.user?.role === 'ROLE_RESPONSABLE') navigate('/stats');
        else navigate('/dashboard');
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
    { role: 'Admin', login: 'admin', desc: 'Accès complet', color: '#EF4444', icon: GppGood },
    { role: 'Responsable', login: 'responsable', desc: 'Statistiques', color: '#F59E0B', icon: Bolt },
    { role: 'Utilisateur', login: 'user', desc: 'Formations', color: '#10B981', icon: School },
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', overflow: 'hidden' }}>
      {/* ═══════════════════ PANNEAU GAUCHE ═══════════════════ */}
      {!isMobile && (
        <Box sx={{
          flex: 1.15,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          bgcolor: '#FAFBFF',
          overflow: 'hidden',
        }}>
          {/* Motif de points subtil */}
          <Box sx={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, #E2E8F0 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            opacity: 0.5,
          }} />

          {/* Glow décoratif */}
          <Box sx={{
            position: 'absolute', top: '-20%', right: '-20%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }} />
          <Box sx={{
            position: 'absolute', bottom: '-10%', left: '-10%',
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }} />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', p: 5 }}
          >
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6, pt: 3, px: 5 }}>
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Avatar sx={{
                  width: 44, height: 44,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  boxShadow: '0 8px 24px rgba(99,102,241,0.25)',
                }}>
                  <School sx={{ color: '#fff', fontSize: 22 }} />
                </Avatar>
              </motion.div>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
                  Excellent Training
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', letterSpacing: '0.02em' }}>
                  Centre de Formation Professionnelle
                </Typography>
              </Box>
            </Box>

            {/* Contenu central */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: 5 }}>
              {/* Badges features */}
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 4 }}>
                <FeatureBadge icon={AutoAwesome} label="IA-Powered" color="#8B5CF6" delay={0.2} />
                <FeatureBadge icon={Sparkles} label="Temps réel" color="#6366F1" delay={0.3} />
                <FeatureBadge icon={Bolt} label="Rapide" color="#F59E0B" delay={0.4} />
              </Box>

              {/* Titre */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <Typography sx={{
                  fontSize: '2.6rem', fontWeight: 800,
                  color: '#0F172A', lineHeight: 1.1,
                  letterSpacing: '-0.03em', mb: 3,
                }}>
                  Développez vos{' '}
                  <br />
                  compétences,
                  <br />
                  accélérez votre{' '}
                  <Box component="span" sx={{
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    avenir
                  </Box>
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Typography sx={{
                  color: '#64748B', fontSize: '1rem',
                  lineHeight: 1.7, maxWidth: 400, mb: 5,
                }}>
                  Gérez vos formations, suivez les progrès de vos apprenants et développez l'excellence au sein de votre organisation.
                </Typography>
              </motion.div>

              {/* Stats avec compteurs animés */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <Box sx={{
                  display: 'flex', gap: 4, p: 3, borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(226,232,240,0.6)',
                  maxWidth: 420,
                }}>
                  {[
                    { value: 500, suffix: '+', label: 'Participants', color: '#6366F1' },
                    { value: 24, suffix: '', label: 'Formations', color: '#10B981' },
                    { value: 98, suffix: '%', label: 'Satisfaction', color: '#F59E0B' },
                  ].map((stat, i) => (
                    <Box key={i} sx={{ textAlign: 'center' }}>
                      <Typography sx={{
                        fontSize: '1.6rem', fontWeight: 800, color: stat.color, lineHeight: 1,
                      }}>
                        <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={2 + i * 0.5} />
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', mt: 0.5, fontWeight: 500 }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </motion.div>
            </Box>

            {/* Image en bas avec effet */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7 }}
              style={{ padding: '0 40px 40px' }}
            >
              <Box sx={{
                position: 'relative',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(99,102,241,0.15)',
              }}>
                {/* Overlay gradient */}
                <Box sx={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(99,102,241,0.1), transparent 50%)',
                  zIndex: 1,
                }} />
                <img
                  src="/assets/login-illustration.png"
                  alt="Formation professionnelle"
                  style={{
                    width: '100%',
                    height: 280,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = 'linear-gradient(135deg, #EEF2FF, #F5F3FF)';
                    e.target.parentElement.style.height = '280px';
                    e.target.parentElement.style.display = 'flex';
                    e.target.parentElement.style.alignItems = 'center';
                    e.target.parentElement.style.justifyContent = 'center';
                  }}
                />
                {/* Badge flottant sur l'image */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3, type: 'spring' }}
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    zIndex: 2,
                  }}
                >
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    px: 2, py: 1, borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}>
                    <Box sx={{
                      width: 8, height: 8, borderRadius: '50%',
                      bgcolor: '#10B981',
                      animation: 'pulse 2s infinite',
                    }} />
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#0F172A' }}>
                      Plateforme active
                    </Typography>
                  </Box>
                </motion.div>
              </Box>
            </motion.div>
          </motion.div>
        </Box>
      )}

      {/* ═══════════════════ PANNEAU DROIT ═══════════════════ */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, md: 6 },
        position: 'relative',
        background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 25%, #8B5CF6 60%, #A78BFA 100%)',
        overflow: 'hidden',
      }}>
        <FloatingParticles />
        <RippleCircles />

        {/* Glow spots */}
        <Box sx={{
          position: 'absolute', top: '5%', right: '15%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: '10%', left: '10%',
          width: 250, height: 250, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
        >
          {/* Card principale avec glassmorphism */}
          <Paper elevation={0} sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1) inset',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Lueur en haut de la card */}
            <Box sx={{
              position: 'absolute', top: 0, left: '10%', right: '10%',
              height: 2,
              background: 'linear-gradient(90deg, transparent, #6366F1, #8B5CF6, transparent)',
              opacity: 0.5,
            }} />

            {/* Mobile logo */}
            {isMobile && (
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar sx={{
                  width: 48, height: 48, mx: 'auto', mb: 1.5,
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                }}>
                  <School sx={{ color: '#fff' }} />
                </Avatar>
                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
                  Excellent Training
                </Typography>
              </Box>
            )}

            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <Avatar sx={{
                  width: 60, height: 60, mx: 'auto', mb: 2.5,
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  boxShadow: '0 12px 32px rgba(99,102,241,0.3)',
                }}>
                  <School sx={{ color: '#fff', fontSize: 28 }} />
                </Avatar>
              </motion.div>
              <Typography sx={{
                fontWeight: 800, fontSize: '1.6rem', color: '#0F172A',
                mb: 0.5, letterSpacing: '-0.02em',
              }}>
                Bienvenue
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '0.9rem' }}>
                Connectez-vous à votre espace
              </Typography>
            </Box>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                >
                  <Alert
                    severity="error"
                    sx={{
                      borderRadius: 2,
                      bgcolor: '#FEF2F2', color: '#DC2626',
                      border: '1px solid #FECACA',
                      '& .MuiAlert-icon': { color: '#EF4444' },
                    }}
                  >
                    {error}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              <StyledInput
                label="Adresse e-mail"
                value={form.login}
                onChange={e => setForm({ ...form, login: e.target.value })}
                placeholder="Entrez votre e-mail"
                icon={EmailIcon}
              />

              <StyledInput
                label="Mot de passe"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                type={showPwd ? 'text' : 'password'}
                placeholder="Entrez votre mot de passe"
                icon={Lock}
                endAdornment={
                  <IconButton
                    onClick={() => setShowPwd(!showPwd)}
                    edge="end"
                    sx={{ color: '#94A3B8', '&:hover': { color: '#6366F1' } }}
                  >
                    {showPwd ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                }
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{
                        color: '#CBD5E1',
                        '&.Mui-checked': { color: '#6366F1' },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                      Se souvenir de moi
                    </Typography>
                  }
                />
                <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                  <Typography sx={{
                    fontSize: '0.82rem', color: '#6366F1', fontWeight: 600,
                    '&:hover': { color: '#4F46E5', textDecoration: 'underline' },
                  }}>
                    Mot de passe oublié ?
                  </Typography>
                </Link>
              </Box>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.8,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    background: loading
                      ? '#CBD5E1'
                      : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    color: '#fff',
                    boxShadow: loading ? 'none' : '0 8px 28px rgba(99,102,241,0.35)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                      boxShadow: '0 12px 36px rgba(99,102,241,0.45)',
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Box sx={{
                          width: 16, height: 16, borderRadius: '50%',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: '#fff',
                        }} />
                      </motion.div>
                      Connexion en cours...
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      Se connecter
                      <ArrowForward sx={{ fontSize: 18 }} />
                    </Box>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Divider */}
            <Divider sx={{ my: 3, borderColor: '#F1F5F9' }}>
              <Typography sx={{
                fontSize: '0.7rem', color: '#94A3B8', px: 1.5,
                fontWeight: 600, letterSpacing: '0.08em',
              }}>
                COMPTES DE DÉMONSTRATION
              </Typography>
            </Divider>

            {/* Demo accounts */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {demoAccounts.map((acc, i) => (
                <motion.button
                  key={acc.login}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  whileHover={{ x: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setForm({ login: acc.login, password: 'password123' })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    background: '#F8FAFC',
                    border: '1px solid #F1F5F9',
                    borderRadius: 14,
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <Avatar sx={{
                    width: 36, height: 36,
                    bgcolor: `${acc.color}12`,
                    color: acc.color,
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}>
                    <acc.icon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{
                      fontWeight: 600, fontSize: '0.85rem', color: '#0F172A', lineHeight: 1.3,
                    }}>
                      {acc.role}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                      {acc.desc}
                    </Typography>
                  </Box>
                  <Chip
                    label={acc.login}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      bgcolor: `${acc.color}10`,
                      color: acc.color,
                      border: `1px solid ${acc.color}20`,
                      borderRadius: 1.5,
                    }}
                  />
                </motion.button>
              ))}
            </Box>
          </Paper>

          {/* Footer */}
          <Typography sx={{
            textAlign: 'center', mt: 3,
            fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)',
          }}>
            © 2026 Excellent Training — Green Building
          </Typography>
        </motion.div>
      </Box>
    </Box>
  );
}
