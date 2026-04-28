import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import {
  Box, TextField, Button, Typography, Paper, Alert,
  InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const MailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
);

const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);

const GraduationCapIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#gradCapGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id="gradCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5"/>
    </svg>
);

const Particle = ({ delay, left, top, size }) => (
    <motion.div
        animate={{
          opacity: [0, 1, 0],
          scale: [0, 1, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          left: `${left}%`,
          top: `${top}%`,
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'rgba(168, 85, 247, 0.6)',
          boxShadow: '0 0 10px rgba(168, 85, 247, 0.8)',
          zIndex: 0,
        }}
    />
);

const WaveBackground = () => (
    <Box sx={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      zIndex: 0,
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a103c 50%, #0f172a 100%)',
    }}>
      {/* Animated mesh/wave lines */}
      <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.4 }}>
        <defs>
          <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="waveGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <motion.path
            d="M0,200 Q300,100 600,200 T1200,200"
            fill="none"
            stroke="url(#waveGrad1)"
            strokeWidth="1"
            animate={{ d: [
                "M0,200 Q300,100 600,200 T1200,200",
                "M0,180 Q300,220 600,180 T1200,180",
                "M0,200 Q300,100 600,200 T1200,200"
              ]}}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
            d="M0,400 Q400,300 800,400 T1600,400"
            fill="none"
            stroke="url(#waveGrad2)"
            strokeWidth="1.5"
            animate={{ d: [
                "M0,400 Q400,300 800,400 T1600,400",
                "M0,420 Q400,380 800,420 T1600,420",
                "M0,400 Q400,300 800,400 T1600,400"
              ]}}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
          <Particle
              key={i}
              delay={i * 0.5}
              left={Math.random() * 100}
              top={Math.random() * 100}
              size={Math.random() * 4 + 2}
          />
      ))}

      {/* Glow effects */}
      <Box sx={{
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        top: '10%',
        left: '-10%',
        filter: 'blur(60px)',
      }} />
      <Box sx={{
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
        bottom: '10%',
        right: '-5%',
        filter: 'blur(60px)',
      }} />
    </Box>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function Login() {
  const [form, setForm] = useState({ login: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        p: 2,
      }}>
        <WaveBackground />

        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}
        >
          <Paper elevation={0} sx={{
            p: { xs: 4, sm: 5 },
            borderRadius: 4,
            bgcolor: '#ffffff',
            boxShadow: '0 25px 80px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Subtle top gradient line */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #6366F1, #A855F7)',
            }} />

            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {/* Logo Section */}
              <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: 32 }}>
                <Box sx={{
                  width: 72,
                  height: 72,
                  mx: 'auto',
                  mb: 2.5,
                  borderRadius: '50%',
                  bgcolor: '#F5F3FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #E0E7FF',
                }}>
                  <GraduationCapIcon />
                </Box>
                <Typography variant="h5" sx={{
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  fontSize: '1.5rem',
                  mb: 0.5
                }}>
                  Excellent Training
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.875rem' }}>
                  Centre de Formation Professionnelle
                </Typography>
              </motion.div>

              {/* Welcome Section */}
              <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: 28 }}>
                <Typography variant="h4" sx={{
                  fontWeight: 700,
                  color: '#0F172A',
                  mb: 1,
                  fontSize: '1.75rem'
                }}>
                  Bienvenue
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.9rem' }}>
                  Connectez-vous à votre espace
                </Typography>
              </motion.div>

              {error && (
                  <motion.div variants={itemVariants}>
                    <Alert severity="error" sx={{
                      mb: 3,
                      borderRadius: 2,
                      bgcolor: '#FEF2F2',
                      color: '#991B1B',
                      border: '1px solid #FECACA',
                      fontSize: '0.875rem'
                    }}>
                      {error}
                    </Alert>
                  </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Username Field */}
                <motion.div variants={itemVariants}>
                  <Typography variant="body2" sx={{
                    color: '#374151',
                    fontWeight: 500,
                    mb: 1,
                    fontSize: '0.875rem'
                  }}>
                    Nom d'utilisateur
                  </Typography>
                  <TextField
                      fullWidth
                      value={form.login}
                      onChange={e => setForm({ ...form, login: e.target.value })}
                      placeholder="Entrez votre nom d'utilisateur"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                            <InputAdornment position="start" sx={{ color: '#9CA3AF', mr: 1 }}>
                              <MailIcon />
                            </InputAdornment>
                        ),
                        sx: {
                          borderRadius: '12px',
                          bgcolor: '#F9FAFB',
                          fontSize: '0.9rem',
                          py: 0.5,
                          '& fieldset': {
                            borderColor: '#E5E7EB',
                            borderWidth: '1.5px',
                            transition: 'all 0.2s'
                          },
                          '&:hover fieldset': { borderColor: '#C4B5FD' },
                          '&.Mui-focused fieldset': {
                            borderColor: '#6366F1',
                            borderWidth: '1.5px',
                            boxShadow: '0 0 0 3px rgba(99,102,241,0.1)'
                          },
                        },
                      }}
                      sx={{ mb: 2.5 }}
                  />
                </motion.div>

                {/* Password Field */}
                <motion.div variants={itemVariants}>
                  <Typography variant="body2" sx={{
                    color: '#374151',
                    fontWeight: 500,
                    mb: 1,
                    fontSize: '0.875rem'
                  }}>
                    Mot de passe
                  </Typography>
                  <TextField
                      fullWidth
                      type={showPwd ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="Entrez votre mot de passe"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                            <InputAdornment position="start" sx={{ color: '#9CA3AF', mr: 1 }}>
                              <LockIcon />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                  onClick={() => setShowPwd(!showPwd)}
                                  size="small"
                                  sx={{ color: '#9CA3AF', '&:hover': { color: '#6366F1' } }}
                              >
                                {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                        ),
                        sx: {
                          borderRadius: '12px',
                          bgcolor: '#F9FAFB',
                          fontSize: '0.9rem',
                          py: 0.5,
                          '& fieldset': {
                            borderColor: '#E5E7EB',
                            borderWidth: '1.5px',
                            transition: 'all 0.2s'
                          },
                          '&:hover fieldset': { borderColor: '#C4B5FD' },
                          '&.Mui-focused fieldset': {
                            borderColor: '#6366F1',
                            borderWidth: '1.5px',
                            boxShadow: '0 0 0 3px rgba(99,102,241,0.1)'
                          },
                        },
                      }}
                      sx={{ mb: 1.5 }}
                  />
                </motion.div>

                {/* Forgot Password */}
                <motion.div variants={itemVariants} style={{ textAlign: 'right', marginBottom: 24 }}>
                  <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" sx={{
                      color: '#6366F1',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      '&:hover': { color: '#4F46E5' }
                    }}>
                      Mot de passe oublié ?
                    </Typography>
                  </Link>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      sx={{
                        py: 1.5,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '1rem',
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%)',
                          boxShadow: '0 8px 25px rgba(99,102,241,0.4)'
                        },
                        boxShadow: '0 4px 15px rgba(99,102,241,0.35)',
                        transition: 'all 0.3s ease',
                      }}
                  >
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </motion.div>
              </form>

              {/* Footer */}
              <motion.div variants={itemVariants}>
                <Typography variant="caption" sx={{
                  display: 'block',
                  textAlign: 'center',
                  mt: 4,
                  color: '#94A3B8',
                  fontSize: '0.75rem'
                }}>
                  © 2026 Excellent Training — Green Building
                </Typography>
              </motion.div>
            </motion.div>
          </Paper>
        </motion.div>
      </Box>
  );
}