import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box, TextField, Button, Typography, Paper, Alert,
  InputAdornment, IconButton, LinearProgress, Chip,
  Stepper, Step, StepLabel, Avatar, Divider,
} from '@mui/material';
import {
  Visibility, VisibilityOff, Lock, Security, CheckCircle,
  ArrowForward, Shield, Warning,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

const API_BASE = 'http://localhost:8081/api';

// ── Indicateur de force du mot de passe ──────────────────────────────────────
function PasswordStrengthIndicator({ password }) {
  if (!password) return null;

  const checks = [
    { label: '6+ caractères', pass: password.length >= 6 },
    { label: 'Majuscule', pass: /[A-Z]/.test(password) },
    { label: 'Minuscule', pass: /[a-z]/.test(password) },
    { label: 'Chiffre', pass: /[0-9]/.test(password) },
    { label: 'Spécial', pass: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter(c => c.pass).length;
  const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981'];
  const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];

  return (
    <Box sx={{ mt: 2, mb: 1 }}>
      <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <Box key={i} sx={{
            flex: 1, height: 4, borderRadius: 2,
            bgcolor: i < score ? colors[score - 1] : '#E2E8F0',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '0.75rem', color: colors[score - 1] || '#94A3B8', fontWeight: 600 }}>
          {labels[score - 1] || 'Trop court'}
        </Typography>
        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>
          {score}/5
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 1 }}>
        {checks.map((check, i) => (
          <Chip
            key={i}
            size="small"
            label={check.label}
            sx={{
              height: 22,
              fontSize: '0.68rem',
              fontWeight: 500,
              bgcolor: check.pass ? '#DCFCE7' : '#F1F5F9',
              color: check.pass ? '#15803D' : '#94A3B8',
              border: `1px solid ${check.pass ? '#86EFAC' : '#E2E8F0'}`,
              transition: 'all 0.2s',
            }}
            icon={check.pass ? <CheckCircle sx={{ fontSize: 12, color: '#15803D' }} /> : null}
          />
        ))}
      </Box>
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function FirstLogin() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: '', // Pas besoin car firstLogin
          newPassword: password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        // Mettre à jour le store
        useAuthStore.setState(state => ({
          user: { ...state.user, firstLogin: false }
        }));
        // Rediriger après 2 secondes
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Erreur lors du changement de mot de passe.');
      }
    } catch {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #F5F3FF 100%)',
      p: 2,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Éléments décoratifs subtils */}
      <Box sx={{
        position: 'absolute', top: -100, right: -100,
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />
      <Box sx={{
        position: 'absolute', bottom: -80, left: -80,
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
        filter: 'blur(50px)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}
      >
        <Paper elevation={0} sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.5) inset',
        }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Avatar sx={{
                width: 72, height: 72,
                mx: 'auto', mb: 2,
                bgcolor: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
              }}>
                <Security sx={{ fontSize: 32, color: '#fff' }} />
              </Avatar>
            </motion.div>

            <Typography sx={{
              fontWeight: 800, fontSize: '1.5rem',
              color: '#0F172A', mb: 1,
              fontFamily: '"Inter", sans-serif',
            }}>
              Sécurisez votre compte
            </Typography>

            <Typography sx={{
              color: '#64748B', fontSize: '0.9rem',
              lineHeight: 1.6, maxWidth: 320, mx: 'auto',
            }}>
              Bonjour <strong style={{ color: '#6366F1' }}>{user?.login || user?.username}</strong>,
              c'est votre première connexion. Veuillez définir un nouveau mot de passe pour sécuriser votre compte.
            </Typography>
          </Box>

          {/* Alerte info */}
          <Alert
            severity="info"
            icon={<Warning sx={{ fontSize: 20 }} />}
            sx={{
              mb: 3, borderRadius: 2,
              bgcolor: '#EEF2FF', color: '#1E40AF',
              border: '1px solid #C7D2FE',
              '& .MuiAlert-icon': { color: '#6366F1' },
            }}
          >
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
              Pour des raisons de sécurité, vous devez changer votre mot de passe avant de continuer.
            </Typography>
          </Alert>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Box sx={{
                textAlign: 'center', p: 4,
                borderRadius: 3,
                bgcolor: '#ECFDF5',
                border: '1px solid #86EFAC',
              }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                >
                  <CheckCircle sx={{ fontSize: 56, color: '#10B981', mb: 2 }} />
                </motion.div>
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#065F46', mb: 1 }}>
                  Mot de passe changé avec succès !
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#059669' }}>
                  Redirection vers le tableau de bord...
                </Typography>
                <LinearProgress sx={{
                  mt: 2, borderRadius: 1,
                  bgcolor: '#D1FAE5',
                  '& .MuiLinearProgress-bar': { bgcolor: '#10B981' },
                }} />
              </Box>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Nouveau mot de passe */}
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{
                  fontSize: '0.8rem', fontWeight: 700,
                  color: '#475569', mb: 1,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  Nouveau mot de passe *
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#94A3B8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#94A3B8' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: '#F8FAFC',
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#CBD5E1' },
                      '&.Mui-focused fieldset': { borderColor: '#6366F1' },
                    },
                  }}
                />
                <PasswordStrengthIndicator password={password} />
              </Box>

              {/* Confirmation */}
              <Box sx={{ mb: 3 }}>
                <Typography sx={{
                  fontSize: '0.8rem', fontWeight: 700,
                  color: '#475569', mb: 1,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  Confirmer le mot de passe *
                </Typography>
                <TextField
                  fullWidth
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  disabled={loading}
                  error={confirmPassword.length > 0 && password !== confirmPassword}
                  helperText={confirmPassword.length > 0 && password !== confirmPassword 
                    ? 'Les mots de passe ne correspondent pas' 
                    : ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Shield sx={{ color: '#94A3B8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirm(!showConfirm)}
                          edge="end"
                          sx={{ color: '#94A3B8' }}
                        >
                          {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: '#F8FAFC',
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#CBD5E1' },
                      '&.Mui-focused fieldset': { borderColor: '#6366F1' },
                    },
                  }}
                />
              </Box>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <Alert
                    severity="error"
                    sx={{
                      mb: 2, borderRadius: 2,
                      bgcolor: '#FEF2F2', color: '#DC2626',
                      border: '1px solid #FECACA',
                    }}
                  >
                    {error}
                  </Alert>
                </motion.div>
              )}

              <Button
                type="submit"
                fullWidth
                disabled={loading || !password || password !== confirmPassword || password.length < 6}
                sx={{
                  py: 1.8,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  background: loading 
                    ? '#CBD5E1' 
                    : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  color: '#fff',
                  boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                    boxShadow: '0 12px 32px rgba(99,102,241,0.4)',
                  },
                  '&:disabled': {
                    background: '#E2E8F0',
                    color: '#94A3B8',
                    boxShadow: 'none',
                  },
                  transition: 'all 0.2s',
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress sx={{ width: 20, height: 2, bgcolor: 'rgba(255,255,255,0.3)' }} />
                    Traitement...
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Changer mon mot de passe
                    <ArrowForward sx={{ fontSize: 18 }} />
                  </Box>
                )}
              </Button>

              <Divider sx={{ my: 3, borderColor: '#F1F5F9' }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', px: 1 }}>
                  ou
                </Typography>
              </Divider>

              <Button
                onClick={handleLogout}
                fullWidth
                variant="outlined"
                sx={{
                  py: 1.2,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#64748B',
                  borderColor: '#E2E8F0',
                  '&:hover': {
                    borderColor: '#EF4444',
                    color: '#EF4444',
                    bgcolor: '#FEF2F2',
                  },
                }}
              >
                Se déconnecter
              </Button>
            </form>
          )}

          {/* Footer */}
          <Typography sx={{
            textAlign: 'center', mt: 3,
            fontSize: '0.75rem', color: '#94A3B8',
          }}>
            Excellent Training — Green Building © 2026
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
}
