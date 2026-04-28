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
    <Box sx={{ mb: 2 }}>
      <LinearProgress
        variant="determinate"
        value={(score / 5) * 100}
        sx={{
          height: 6, borderRadius: 3, mb: 1,
          bgcolor: '#E2E8F0',
          '& .MuiLinearProgress-bar': { bgcolor: colors[score - 1] || '#EF4444', borderRadius: 3 }
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ color: colors[score - 1] || '#EF4444', fontWeight: 600 }}>
          {labels[score - 1] || 'Trop court'}
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748B' }}>{score}/5</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
        {checks.map((check, i) => (
          <Chip
            key={i}
            size="small"
            label={check.label}
            icon={check.pass ? <CheckCircle fontSize="small" /> : null}
            sx={{
              height: 22, fontSize: '0.7rem',
              bgcolor: check.pass ? '#ECFDF5' : '#F1F5F9',
              color: check.pass ? '#15803D' : '#64748B',
              border: `1px solid ${check.pass ? '#86EFAC' : '#E2E8F0'}`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default function FirstLogin() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user, logout, clearFirstLogin } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
      const res = await api.post('/auth/change-password', {
        oldPassword: '',
        newPassword: password,
      });

      if (res.data.success) {
        setSuccess(true);
        clearFirstLogin();
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError(res.data.message || 'Erreur lors du changement de mot de passe.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion au serveur.');
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
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
      p: 2,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper elevation={0} sx={{
          maxWidth: 460, width: '100%', p: { xs: 3, sm: 5 }, borderRadius: 4,
          bgcolor: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar sx={{ width: 56, height: 56, mx: 'auto', mb: 2, bgcolor: '#6366F1' }}>
              <Security />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
              Sécurisez votre compte
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Bonjour <strong>{user?.login || user?.username}</strong>, c'est votre première connexion.
              Veuillez définir un nouveau mot de passe.
            </Typography>
          </Box>

          <Alert severity="info" sx={{
            mb: 3, borderRadius: 2,
            bgcolor: '#EEF2FF', color: '#1E40AF', border: '1px solid #C7D2FE',
            '& .MuiAlert-icon': { color: '#6366F1' },
          }}>
            Pour des raisons de sécurité, vous devez changer votre mot de passe avant de continuer.
          </Alert>

          {success ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CheckCircle sx={{ fontSize: 56, color: '#10B981', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#0F172A', fontWeight: 600, mb: 1 }}>
                  Mot de passe changé avec succès !
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Redirection vers le tableau de bord...
                </Typography>
                <LinearProgress sx={{ mt: 3, borderRadius: 2, bgcolor: '#ECFDF5', '& .MuiLinearProgress-bar': { bgcolor: '#10B981' } }} />
              </Box>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label="Nouveau mot de passe *"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><Lock sx={{ color: '#94A3B8' }} /></InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#94A3B8' }}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2.5, bgcolor: '#F8FAFC', '& fieldset': { borderColor: '#E2E8F0' } },
                }}
                sx={{ mb: 2 }}
              />

              <PasswordStrengthIndicator password={password} />

              <TextField
                fullWidth
                type={showConfirm ? 'text' : 'password'}
                label="Confirmer le mot de passe *"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Répétez le mot de passe"
                disabled={loading}
                error={confirmPassword.length > 0 && password !== confirmPassword}
                helperText={confirmPassword.length > 0 && password !== confirmPassword ? 'Les mots de passe ne correspondent pas' : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><Lock sx={{ color: '#94A3B8' }} /></InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" sx={{ color: '#94A3B8' }}>
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2.5, bgcolor: '#F8FAFC', '& fieldset': { borderColor: '#E2E8F0' } },
                }}
                sx={{ mb: 2 }}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2, bgcolor: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.4, borderRadius: 2.5, textTransform: 'none', fontWeight: 600, fontSize: '0.95rem',
                  bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' },
                  boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                }}
              >
                {loading ? 'Changement en cours...' : 'Changer mon mot de passe'}
              </Button>

              <Button
                fullWidth
                onClick={handleLogout}
                sx={{ mt: 1.5, textTransform: 'none', color: '#64748B', fontSize: '0.85rem' }}
              >
                ou Déconnexion
              </Button>
            </form>
          )}

          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: '#94A3B8' }}>
            Excellent Training — Green Building © 2026
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
}
