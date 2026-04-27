import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, TextField, Button, Typography, Paper, Alert,
  InputAdornment, IconButton, Chip, LinearProgress, Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Visibility, VisibilityOff, Email, Lock, ArrowBack,
  CheckCircle, Warning, Security, ErrorOutline,
} from '@mui/icons-material';
import api from '../services/api';

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
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
        {[0, 1, 2, 3].map(i => (
          <Box key={i} sx={{
            flex: 1, height: 4, borderRadius: 2,
            bgcolor: i < score ? colors[score - 1] : '#E2E8F0',
            transition: 'all 0.3s',
          }} />
        ))}
      </Box>
      <Typography variant="caption" sx={{ color: colors[score - 1] || '#94A3B8', fontWeight: 600 }}>
        Force : {labels[score] || labels[0]}
      </Typography>
    </Box>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setMsg('Veuillez entrer votre email.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setMsg('Adresse email invalide.');
    setLoading(true);
    setMsg('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setStatus('success');
      setMsg(res.data.message || 'Si cet email existe, vous recevrez un lien de réinitialisation.');
    } catch {
      setStatus('error');
      setMsg('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <BackButton onClick={() => navigate('/login')} />
      <Avatar sx={{ width: 56, height: 56, mx: 'auto', mb: 2, bgcolor: '#6366F1' }}>
        <Security />
      </Avatar>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', textAlign: 'center', mb: 1 }}>
        Mot de passe oublié ?
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748B', textAlign: 'center', mb: 3 }}>
        Entrez votre email et nous vous enverrons un lien de réinitialisation.
      </Typography>

      {status === 'success' ? (
        <SuccessBox
          message={msg}
          onBack={() => navigate('/login')}
          backLabel="Retour à la connexion →"
        />
      ) : (
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Adresse email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="votre.email@exemple.com"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><Email sx={{ color: '#94A3B8' }} /></InputAdornment>
              ),
              sx: {
                borderRadius: 2.5, bgcolor: '#F8FAFC',
                '& fieldset': { borderColor: '#E2E8F0' },
                '&:hover fieldset': { borderColor: '#CBD5E1' },
                '&.Mui-focused fieldset': { borderColor: '#6366F1' },
              },
            }}
            sx={{ mb: 2 }}
          />

          {msg && status === 'error' && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{msg}</Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.3, borderRadius: 2.5, textTransform: 'none', fontWeight: 600,
              bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' },
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Envoyer le lien'}
          </Button>
        </form>
      )}
    </PageWrapper>
  );
}

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState('');
  const [tokenStatus, setTokenStatus] = useState('checking');
  const [tokenMsg, setTokenMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setTokenStatus('invalid');
      setTokenMsg('Aucun token trouvé. Veuillez refaire une demande de réinitialisation.');
      return;
    }

    const verifyToken = async () => {
      setTokenStatus('checking');
      try {
        const res = await api.get(`/auth/reset-password/verify?token=${encodeURIComponent(token)}`);
        if (res.data.success) {
          setTokenStatus('valid');
        } else {
          setTokenStatus('invalid');
          setTokenMsg(res.data.message || 'Ce lien est invalide ou a expiré.');
        }
      } catch {
        setTokenStatus('invalid');
        setTokenMsg('Impossible de vérifier le lien. Vérifiez votre connexion et réessayez.');
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return setMsg('Le mot de passe doit contenir au moins 6 caractères.');
    if (password !== confirm) return setMsg('Les mots de passe ne correspondent pas.');
    setLoading(true);
    setMsg('');
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      if (res.data.success) {
        setStatus('success');
      } else {
        setMsg(res.data.message || 'Erreur lors de la réinitialisation.');
        if (res.data.message?.toLowerCase().includes('expir') || res.data.message?.toLowerCase().includes('invalide')) {
          setTokenStatus('invalid');
          setTokenMsg(res.data.message);
        }
      }
    } catch {
      setMsg('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  if (tokenStatus === 'checking') {
    return (
      <PageWrapper>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#6366F1', mb: 2 }} />
          <Typography>Vérification du lien en cours...</Typography>
        </Box>
      </PageWrapper>
    );
  }

  if (tokenStatus === 'invalid') {
    return (
      <PageWrapper>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <ErrorOutline sx={{ fontSize: 48, color: '#EF4444', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#0F172A', fontWeight: 600, mb: 1 }}>
            Lien invalide ou expiré
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
            {tokenMsg || 'Ce lien de réinitialisation est invalide ou a expiré.'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
            Les liens de réinitialisation expirent après 1 heure pour des raisons de sécurité.
          </Typography>
          <Button onClick={() => navigate('/forgot-password')} sx={{ mt: 2, textTransform: 'none', color: '#6366F1' }}>
            Refaire une demande
          </Button>
        </Box>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <BackButton onClick={() => navigate('/login')} />
      <Avatar sx={{ width: 56, height: 56, mx: 'auto', mb: 2, bgcolor: '#6366F1' }}>
        <Lock />
      </Avatar>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', textAlign: 'center', mb: 1 }}>
        Nouveau mot de passe
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748B', textAlign: 'center', mb: 3 }}>
        Choisissez un mot de passe fort (minimum 6 caractères).
      </Typography>

      {status === 'success' ? (
        <SuccessBox
          message="Votre mot de passe a été réinitialisé avec succès."
          onBack={() => navigate('/login')}
          backLabel="Se connecter →"
        />
      ) : (
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type={showPwd ? 'text' : 'password'}
            label="Nouveau mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 6 caractères"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><Lock sx={{ color: '#94A3B8' }} /></InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPwd(!showPwd)} sx={{ color: '#94A3B8' }}>
                    {showPwd ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: 2.5, bgcolor: '#F8FAFC', '& fieldset': { borderColor: '#E2E8F0' } },
            }}
            sx={{ mb: 1.5 }}
          />

          <PasswordStrength password={password} />

          <TextField
            fullWidth
            type={showConfirm ? 'text' : 'password'}
            label="Confirmer le mot de passe"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Répétez le mot de passe"
            error={confirm.length > 0 && password !== confirm}
            helperText={confirm.length > 0 && password !== confirm ? 'Les mots de passe ne correspondent pas' : confirm.length > 0 && password === confirm ? '✓ Les mots de passe correspondent' : ''}
            FormHelperTextProps={{
              sx: { color: confirm.length > 0 && password === confirm ? '#10B981' : undefined }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><Lock sx={{ color: '#94A3B8' }} /></InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirm(!showConfirm)} sx={{ color: '#94A3B8' }}>
                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: 2.5, bgcolor: '#F8FAFC', '& fieldset': { borderColor: '#E2E8F0' } },
            }}
            sx={{ mb: 2 }}
          />

          {msg && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{msg}</Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.3, borderRadius: 2.5, textTransform: 'none', fontWeight: 600,
              bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' },
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Réinitialiser le mot de passe'}
          </Button>
        </form>
      )}
    </PageWrapper>
  );
}

function PageWrapper({ children }) {
  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)', p: 2,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        <Paper elevation={0} sx={{
          p: { xs: 3, sm: 4 }, borderRadius: 3.5,
          bgcolor: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }}>
          {children}
        </Paper>
      </motion.div>
    </Box>
  );
}

function SuccessBox({ message, onBack, backLabel = '← Retour à la connexion' }) {
  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <CheckCircle sx={{ fontSize: 48, color: '#10B981', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#0F172A', fontWeight: 600, mb: 1 }}>
          {message}
        </Typography>
        <Button onClick={onBack} sx={{ textTransform: 'none', color: '#6366F1', fontWeight: 600 }}>
          {backLabel}
        </Button>
      </Box>
    </motion.div>
  );
}

function BackButton({ onClick, label = '← Retour à la connexion' }) {
  return (
    <Button onClick={onClick} sx={{ mb: 2, textTransform: 'none', color: '#64748B', fontSize: '0.8rem' }} startIcon={<ArrowBack fontSize="small" />}>
      {label}
    </Button>
  );
}

export default ForgotPassword;
