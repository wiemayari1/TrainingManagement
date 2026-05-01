import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { setToken } from '../services/api';
import {
  Box, TextField, Button, Typography, Paper, Alert,
  InputAdornment, IconButton, LinearProgress, Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Visibility, VisibilityOff, Email, Lock, ArrowBack,
  CheckCircle, Security, ErrorOutline,
} from '@mui/icons-material';

const API_BASE = 'http://localhost:8081/api';

// ── Indicateur de force du mot de passe ──────────────────────────────────────
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
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
          {[0, 1, 2, 3].map(i => (
              <Box key={i} sx={{
                flex: 1, height: 4, borderRadius: 2,
                bgcolor: i < score ? colors[score] : '#E2E8F0',
                transition: 'background 0.3s',
              }} />
          ))}
        </Box>
        <Typography sx={{ color: colors[score] || '#94A3B8', fontSize: '0.75rem', fontWeight: 600 }}>
          Force : {labels[score] || 'Trop court'}
        </Typography>
      </Box>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Page Mot de passe oublié
export function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Veuillez entrer votre email.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Adresse email invalide.');

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      // ✅ On affiche toujours le succès (sécurité : ne pas révéler si l'email existe)
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Une erreur est survenue. Réessayez.');
      }
    } catch {
      setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <PageWrapper>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', maxWidth: 440 }}
        >
          <Paper elevation={0} sx={{
            p: { xs: 3, md: 5 }, borderRadius: 4,
            border: '1px solid #E2E8F0', bgcolor: '#FFFFFF',
            boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          }}>
            <BackButton onClick={() => navigate('/login')} />

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: '#EEF2FF', color: '#6366F1' }}>
                <Email sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0F172A', mb: 1 }}>
                Mot de passe oublié ?
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '0.9rem' }}>
                Entrez votre email et nous vous enverrons un lien de réinitialisation.
              </Typography>
            </Box>

            <AnimatePresence mode="wait">
              {sent ? (
                  <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <SuccessBox
                        message="Si cet email est associé à un compte, vous recevrez un lien de réinitialisation dans quelques instants. Pensez à vérifier vos spams."
                        onBack={() => navigate('/login')}
                    />
                  </motion.div>
              ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <form onSubmit={handleSubmit}>
                      <Box sx={{ mb: 3 }}>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Adresse email
                        </Typography>
                        <TextField
                            fullWidth
                            type="email"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError(''); }}
                            placeholder="votre.email@exemple.com"
                            disabled={loading}
                            InputProps={{
                              startAdornment: (
                                  <InputAdornment position="start">
                                    <Email sx={{ color: '#94A3B8', fontSize: 20 }} />
                                  </InputAdornment>
                              ),
                              sx: {
                                borderRadius: 2.5, bgcolor: '#F8FAFC',
                                '& fieldset': { borderColor: '#E2E8F0' },
                                '&:hover fieldset': { borderColor: '#CBD5E1' },
                                '&.Mui-focused fieldset': { borderColor: '#6366F1' },
                              },
                            }}
                        />
                      </Box>

                      {error && (
                          <Alert severity="error" sx={{ mb: 2, borderRadius: 2, bgcolor: '#FEF2F2', border: '1px solid #FECACA' }}>
                            {error}
                          </Alert>
                      )}

                      <Button
                          type="submit"
                          fullWidth
                          disabled={loading}
                          sx={{
                            py: 1.8, borderRadius: 2.5,
                            textTransform: 'none', fontWeight: 700, fontSize: '0.95rem',
                            background: loading ? '#CBD5E1' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                            color: '#fff',
                            boxShadow: loading ? 'none' : '0 8px 24px rgba(99,102,241,0.3)',
                            '&:hover': { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' },
                            '&:disabled': { background: '#CBD5E1', color: '#fff' },
                          }}
                      >
                        {loading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CircularProgress size={16} sx={{ color: '#fff' }} />
                              Envoi en cours...
                            </Box>
                        ) : 'Envoyer le lien'}
                      </Button>
                    </form>
                  </motion.div>
              )}
            </AnimatePresence>
          </Paper>
        </motion.div>
      </PageWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Page Réinitialisation du mot de passe
export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');

  // États vérification token
  const [tokenStatus, setTokenStatus] = useState('checking'); // 'checking' | 'valid' | 'invalid'
  const [tokenMsg, setTokenMsg]       = useState('');
  const navigate = useNavigate();

  // ── Vérification du token au montage ─────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setTokenStatus('invalid');
      setTokenMsg('Aucun token trouvé. Veuillez refaire une demande de réinitialisation.');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(
            `${API_BASE}/auth/reset-password/verify?token=${encodeURIComponent(token)}`
        );
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success) {
          setTokenStatus('valid');
        } else {
          setTokenStatus('invalid');
          setTokenMsg(data.message || 'Ce lien est invalide ou a expiré.');
        }
      } catch {
        setTokenStatus('invalid');
        setTokenMsg('Impossible de vérifier le lien. Vérifiez votre connexion.');
      }
    };

    verifyToken();
  }, [token]);

  // ── Soumission du nouveau mot de passe ───────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) return setError('Le mot de passe doit contenir au moins 6 caractères.');
    if (password !== confirm) return setError('Les mots de passe ne correspondent pas.');

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ✅ CORRECTION : le backend attend { token, password }
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.token) {
        setToken(data.token);
        useAuthStore.setState({
            user: {
                id: data.id,
                login: data.username,
                email: data.email,
                role: data.role || 'ROLE_USER',
                firstLogin: data.firstLogin === true,
            },
            isAuthenticated: true,
            error: null
        });
        setSuccess(true);
        // On redirige automatiquement après 2.5 secondes
        setTimeout(() => navigate('/dashboard'), 2500);
      } else {
        setError(data.message || 'Erreur lors de la réinitialisation.');
        // Si le token a expiré entre-temps
        if (data.message?.toLowerCase().includes('expir') ||
            data.message?.toLowerCase().includes('invalide') ||
            data.message?.toLowerCase().includes('utilisé')) {
          setTokenStatus('invalid');
          setTokenMsg(data.message);
        }
      }
    } catch {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  // ── 1. Vérification en cours ─────────────────────────────────────────────
  if (tokenStatus === 'checking') {
    return (
        <PageWrapper>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      style={{ width: '100%', maxWidth: 440 }}>
            <Paper elevation={0} sx={{
              p: 5, borderRadius: 4, border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF', boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
              textAlign: 'center',
            }}>
              <CircularProgress sx={{ color: '#6366F1', mb: 2 }} size={48} />
              <Typography sx={{ fontWeight: 600, color: '#475569', fontSize: '0.95rem' }}>
                Vérification du lien en cours...
              </Typography>
            </Paper>
          </motion.div>
        </PageWrapper>
    );
  }

  // ── 2. Token invalide ─────────────────────────────────────────────────────
  if (tokenStatus === 'invalid') {
    return (
        <PageWrapper>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      style={{ width: '100%', maxWidth: 440 }}>
            <Paper elevation={0} sx={{
              p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF', boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
            }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: '#FEF2F2', color: '#EF4444' }}>
                  <ErrorOutline sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: '#0F172A', mb: 1 }}>
                  Lien invalide ou expiré
                </Typography>
                <Typography sx={{ color: '#64748B', fontSize: '0.9rem', mb: 2 }}>
                  {tokenMsg}
                </Typography>
                <Alert severity="info" sx={{ borderRadius: 2, textAlign: 'left', mb: 3 }}>
                  Les liens de réinitialisation expirent après <strong>1 heure</strong> pour des raisons de sécurité.
                </Alert>
              </Box>

              <Button
                  onClick={() => navigate('/forgot-password')}
                  fullWidth
                  sx={{
                    py: 1.8, borderRadius: 2.5, mb: 1.5,
                    textTransform: 'none', fontWeight: 700, fontSize: '0.95rem',
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    color: '#fff',
                    boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
                    '&:hover': { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' },
                  }}
              >
                Faire une nouvelle demande
              </Button>
              <Button
                  onClick={() => navigate('/login')}
                  fullWidth
                  sx={{ py: 1.2, borderRadius: 2.5, textTransform: 'none', fontWeight: 600, color: '#94A3B8' }}
              >
                Retour à la connexion
              </Button>
            </Paper>
          </motion.div>
        </PageWrapper>
    );
  }

  // ── 3. Token valide — formulaire ─────────────────────────────────────────
  return (
      <PageWrapper>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', maxWidth: 440 }}
        >
          <Paper elevation={0} sx={{
            p: { xs: 3, md: 5 }, borderRadius: 4,
            border: '1px solid #E2E8F0', bgcolor: '#FFFFFF',
            boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: '#ECFDF5', color: '#10B981' }}>
                <Security sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0F172A', mb: 1 }}>
                Nouveau mot de passe
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '0.9rem' }}>
                Choisissez un mot de passe fort (minimum 6 caractères).
              </Typography>
            </Box>

            <AnimatePresence mode="wait">
              {success ? (
                  <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <SuccessBox
                        message="Mot de passe réinitialisé avec succès ! Connexion en cours..."
                        onBack={() => navigate('/dashboard')}
                        backLabel="Accéder au tableau de bord"
                    />
                  </motion.div>
              ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <form onSubmit={handleSubmit}>
                      {/* Nouveau mot de passe */}
                      <Box sx={{ mb: 2.5 }}>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Nouveau mot de passe
                        </Typography>
                        <TextField
                            fullWidth
                            type={showPwd ? 'text' : 'password'}
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError(''); }}
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
                                    <IconButton onClick={() => setShowPwd(!showPwd)} sx={{ color: '#94A3B8' }}>
                                      {showPwd ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                              ),
                              sx: {
                                borderRadius: 2.5, bgcolor: '#F8FAFC',
                                '& fieldset': { borderColor: '#E2E8F0' },
                                '&:hover fieldset': { borderColor: '#CBD5E1' },
                                '&.Mui-focused fieldset': { borderColor: '#6366F1' },
                              },
                            }}
                        />
                        <PasswordStrength password={password} />
                      </Box>

                      {/* Confirmation */}
                      <Box sx={{ mb: 3 }}>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Confirmer le mot de passe
                        </Typography>
                        <TextField
                            fullWidth
                            type={showConfirm ? 'text' : 'password'}
                            value={confirm}
                            onChange={e => { setConfirm(e.target.value); setError(''); }}
                            placeholder="Répétez le mot de passe"
                            disabled={loading}
                            error={confirm.length > 0 && password !== confirm}
                            helperText={
                              confirm.length > 0
                                  ? password === confirm
                                      ? '✓ Les mots de passe correspondent'
                                      : '✗ Les mots de passe ne correspondent pas'
                                  : ''
                            }
                            FormHelperTextProps={{
                              sx: { color: confirm.length > 0 && password === confirm ? '#10B981' : '#EF4444', fontWeight: 600 }
                            }}
                            InputProps={{
                              startAdornment: (
                                  <InputAdornment position="start">
                                    <Lock sx={{ color: '#94A3B8', fontSize: 20 }} />
                                  </InputAdornment>
                              ),
                              endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton onClick={() => setShowConfirm(!showConfirm)} sx={{ color: '#94A3B8' }}>
                                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                              ),
                              sx: {
                                borderRadius: 2.5, bgcolor: '#F8FAFC',
                                '& fieldset': { borderColor: '#E2E8F0' },
                                '&:hover fieldset': { borderColor: '#CBD5E1' },
                                '&.Mui-focused fieldset': { borderColor: '#6366F1' },
                              },
                            }}
                        />
                      </Box>

                      {error && (
                          <Alert severity="error" sx={{ mb: 2, borderRadius: 2, bgcolor: '#FEF2F2', border: '1px solid #FECACA' }}>
                            {error}
                          </Alert>
                      )}

                      <Button
                          type="submit"
                          fullWidth
                          disabled={loading || password !== confirm || password.length < 6}
                          sx={{
                            py: 1.8, borderRadius: 2.5,
                            textTransform: 'none', fontWeight: 700, fontSize: '0.95rem',
                            background: (loading || password !== confirm || password.length < 6)
                                ? '#CBD5E1'
                                : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                            color: '#fff',
                            boxShadow: (loading || password !== confirm || password.length < 6)
                                ? 'none' : '0 8px 24px rgba(99,102,241,0.3)',
                            '&:hover': { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' },
                            '&:disabled': { background: '#CBD5E1', color: '#fff' },
                          }}
                      >
                        {loading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CircularProgress size={16} sx={{ color: '#fff' }} />
                              Traitement...
                            </Box>
                        ) : 'Réinitialiser'}
                      </Button>
                    </form>
                  </motion.div>
              )}
            </AnimatePresence>
          </Paper>
        </motion.div>
      </PageWrapper>
  );
}

// ── Composants partagés ──────────────────────────────────────────────────────
function PageWrapper({ children }) {
  return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #F5F3FF 100%)',
        p: 2,
      }}>
        {children}
      </Box>
  );
}

function SuccessBox({ message, onBack, backLabel = '← Retour à la connexion' }) {
  return (
      <Box>
        <Box sx={{
          textAlign: 'center', p: 3, borderRadius: 3, mb: 3,
          bgcolor: '#ECFDF5', border: '1px solid #86EFAC',
        }}>
          <CheckCircle sx={{ fontSize: 48, color: '#10B981', mb: 1.5 }} />
          <Typography sx={{ color: '#065F46', fontWeight: 600, fontSize: '0.95rem' }}>
            {message}
          </Typography>
        </Box>
        <Button
            onClick={onBack}
            fullWidth
            sx={{
              py: 1.5, borderRadius: 2.5,
              textTransform: 'none', fontWeight: 700, fontSize: '0.95rem',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#fff',
              boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
              '&:hover': { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' },
            }}
        >
          {backLabel}
        </Button>
      </Box>
  );
}

function BackButton({ onClick }) {
  return (
      <Button
          onClick={onClick}
          startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
          sx={{
            mb: 3, color: '#94A3B8',
            textTransform: 'none', fontSize: '0.82rem', fontWeight: 600,
            '&:hover': { color: '#6366F1', bgcolor: '#F8FAFC' },
          }}
      >
        Retour à la connexion
      </Button>
  );
}

export default ForgotPassword;