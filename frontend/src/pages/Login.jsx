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
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
);

const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);

const GraduationCapIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5"/>
    </svg>
);

const FloatingShape = ({ delay, duration, size, top, left, right, bottom, color }) => (
    <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
        style={{
          position: 'absolute', width: size, height: size, borderRadius: '50%',
          background: color, filter: 'blur(40px)', top, left, right, bottom, zIndex: 0,
        }}
    />
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
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)',
        position: 'relative', overflow: 'hidden', p: 2,
      }}>
        <FloatingShape delay={0} duration={6} size={300} top="-5%" left="-10%" color="rgba(99,102,241,0.25)" />
        <FloatingShape delay={2} duration={8} size={250} bottom="10%" right="-5%" color="rgba(16,185,129,0.2)" />
        <FloatingShape delay={1} duration={7} size={180} top="40%" left="60%" color="rgba(245,158,11,0.15)" />

        <Box sx={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
          backgroundSize: '32px 32px', zIndex: 0,
        }} />

        <motion.div variants={cardVariants} initial="hidden" animate="visible" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
          <Paper elevation={0} sx={{
            p: { xs: 3, sm: 4.5 }, borderRadius: 3.5,
            bgcolor: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)',
          }}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: 24 }}>
                <Box sx={{
                  width: 64, height: 64, mx: 'auto', mb: 2, borderRadius: 2.5,
                  bgcolor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1',
                }}>
                  <GraduationCapIcon />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  Excellent Training
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
                  Centre de Formation Professionnelle
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F172A', mb: 0.5 }}>
                  Bienvenue
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                  Connectez-vous à votre espace
                </Typography>
              </motion.div>

              {error && (
                  <motion.div variants={itemVariants}>
                    <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, bgcolor: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>
                      {error}
                    </Alert>
                  </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                <motion.div variants={itemVariants}>
                  <TextField
                      fullWidth
                      label="Nom d'utilisateur"
                      value={form.login}
                      onChange={e => setForm({ ...form, login: e.target.value })}
                      placeholder="Entrez votre nom d'utilisateur"
                      InputProps={{
                        startAdornment: (
                            <InputAdornment position="start" sx={{ color: '#94A3B8' }}>
                              <MailIcon />
                            </InputAdornment>
                        ),
                        sx: {
                          borderRadius: '10px', bgcolor: '#F9FAFB', fontSize: '0.9rem',
                          '& fieldset': { borderColor: '#E5E7EB', transition: 'all 0.2s' },
                          '&:hover fieldset': { borderColor: '#C4B5FD' },
                          '&.Mui-focused fieldset': { borderColor: '#6366F1', borderWidth: 2 },
                        },
                      }}
                      sx={{ mb: 2 }}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <TextField
                      fullWidth
                      type={showPwd ? 'text' : 'password'}
                      label="Mot de passe"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="Entrez votre mot de passe"
                      InputProps={{
                        startAdornment: (
                            <InputAdornment position="start" sx={{ color: '#94A3B8' }}>
                              <LockIcon />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPwd(!showPwd)} size="small" sx={{ color: '#9CA3AF', '&:hover': { color: '#6366F1' } }}>
                                {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                        ),
                        sx: {
                          borderRadius: '10px', bgcolor: '#F9FAFB', fontSize: '0.9rem',
                          '& fieldset': { borderColor: '#E5E7EB', transition: 'all 0.2s' },
                          '&:hover fieldset': { borderColor: '#C4B5FD' },
                          '&.Mui-focused fieldset': { borderColor: '#6366F1', borderWidth: 2 },
                        },
                      }}
                      sx={{ mb: 1.5 }}
                  />
                </motion.div>

                <motion.div variants={itemVariants} style={{ textAlign: 'right', marginBottom: 16 }}>
                  <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                    <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 500, '&:hover': { color: '#4F46E5' } }}>
                      Mot de passe oublié ?
                    </Typography>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      sx={{
                        py: 1.3, borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: '0.95rem',
                        bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' },
                        boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                      }}
                  >
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </motion.div>
              </form>

              <motion.div variants={itemVariants}>
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: '#94A3B8' }}>
                  © 2026 Excellent Training — Green Building
                </Typography>
              </motion.div>
            </motion.div>
          </Paper>
        </motion.div>
      </Box>
  );
}