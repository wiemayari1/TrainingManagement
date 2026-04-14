import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Box, TextField, Button, Typography, InputAdornment,
  IconButton, Alert, CircularProgress, Chip,
} from '@mui/material';
import { 
  Visibility, VisibilityOff, Lock, Person, 
  ArrowForward, School, People, Shield 
} from '@mui/icons-material';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [form, setForm] = useState({ login: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    } catch (err) {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
      // Dégradé violet-bleu profond et riche
      background: `
        radial-gradient(ellipse at 0% 0%, rgba(88, 28, 135, 0.8) 0%, transparent 50%),
        radial-gradient(ellipse at 100% 0%, rgba(49, 46, 129, 0.8) 0%, transparent 50%),
        radial-gradient(ellipse at 100% 100%, rgba(124, 58, 237, 0.6) 0%, transparent 50%),
        radial-gradient(ellipse at 0% 100%, rgba(59, 130, 246, 0.6) 0%, transparent 50%),
        linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4c1d95 50%, #581c87 75%, #1e3a8a 100%)
      `,
      backgroundAttachment: 'fixed',
    }}>
      {/* Overlay subtil pour la texture */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=%23ffffff fill-opacity=%270.03\' fill-rule=%27evenodd\'/%3E%3C/svg%3E")',
        opacity: 0.5,
      }} />

      {/* Lumière qui suit la souris */}
      <Box sx={{
        position: 'absolute',
        left: mousePosition.x - 400,
        top: mousePosition.y - 400,
        width: 800,
        height: 800,
        background: 'radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, rgba(99, 102, 241, 0.05) 40%, transparent 70%)',
        pointerEvents: 'none',
        transition: 'left 0.4s ease-out, top 0.4s ease-out',
        zIndex: 0,
      }} />

      {/* Cercles décoratifs flottants */}
      <Box sx={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', zIndex: 0 }}>
        <motion.div
          animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 100%)',
            filter: 'blur(60px)',
            top: '10%',
            right: '-10%',
          }}
        />
        <motion.div
          animate={{ y: [0, 30, 0], scale: [1, 0.95, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(236, 72, 153, 0.1) 100%)',
            filter: 'blur(80px)',
            bottom: '10%',
            left: '-5%',
          }}
        />
      </Box>

      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Partie gauche - Branding */}
        <Box sx={{
          flex: 1,
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          p: 8,
        }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge moderne */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Chip 
                icon={<Sparkles size={16} color="#c4b5fd" />}
                label="Plateforme de Formation"
                sx={{
                  mb: 4,
                  height: 32,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: '#e0e7ff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                  fontSize: '0.8rem',
                  backdropFilter: 'blur(10px)',
                  '& .MuiChip-icon': { color: '#c4b5fd' }
                }}
              />
            </motion.div>

            {/* Titre avec typographie douce */}
            <Typography sx={{
              fontSize: '3.5rem',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.2,
              mb: 3,
              letterSpacing: '-0.02em',
              textShadow: '0 4px 20px rgba(0,0,0,0.2)',
              fontFamily: '"Inter", "Segoe UI", sans-serif',
            }}>
              Centre de Formation
              <Box component="span" sx={{
                display: 'block',
                background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #60a5fa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mt: 1,
              }}>
                Excellent Training
              </Box>
            </Typography>

            <Typography sx={{
              fontSize: '1.15rem',
              color: 'rgba(224, 231, 255, 0.8)',
              maxWidth: 480,
              lineHeight: 1.7,
              mb: 8,
              fontWeight: 400,
              fontFamily: '"Inter", sans-serif',
            }}>
              Solution complète de gestion pour le centre de formation 
              <strong style={{ color: '#fff', fontWeight: 600 }}> Green Building</strong>. 
              Suivez vos sessions, participants et progrès en temps réel.
            </Typography>

            {/* Cartes statistiques */}
            <Box sx={{ display: 'flex', gap: 3 }}>
              {[
                { icon: <School sx={{ fontSize: 24 }} />, label: 'Formations actives', count: '24', color: '#8b5cf6' },
                { icon: <People sx={{ fontSize: 24 }} />, label: 'Participants', count: '500+', color: '#3b82f6' },
                { icon: <Shield sx={{ fontSize: 24 }} />, label: 'Sécurité', count: '100%', color: '#ec4899' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Box sx={{
                    p: 3,
                    borderRadius: '20px',
                    bgcolor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    minWidth: 120,
                    textAlign: 'center',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.12)',
                      borderColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)',
                      boxShadow: `0 10px 30px -10px ${item.color}40`,
                    }
                  }}>
                    <Box sx={{ 
                      color: item.color, 
                      mb: 1.5,
                      display: 'flex',
                      justifyContent: 'center',
                    }}>
                      {item.icon}
                    </Box>
                    <Typography sx={{ 
                      color: '#fff', 
                      fontWeight: 700, 
                      fontSize: '1.5rem',
                      lineHeight: 1,
                      mb: 0.5,
                    }}>
                      {item.count}
                    </Typography>
                    <Typography sx={{ 
                      color: 'rgba(224, 231, 255, 0.6)', 
                      fontSize: '0.8rem',
                      fontWeight: 500,
                    }}>
                      {item.label}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Box>

        {/* Partie droite - Formulaire */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, md: 6 },
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ width: '100%', maxWidth: 420 }}
          >
            {/* Carte glassmorphism */}
            <Box sx={{
              position: 'relative',
              p: { xs: 4, md: 5 },
              borderRadius: '28px',
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: `
                0 25px 50px -12px rgba(0, 0, 0, 0.25),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.1)
              `,
              overflow: 'hidden',
            }}>
              {/* Glow interne */}
              <Box sx={{
                position: 'absolute',
                top: -100,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 400,
                height: 400,
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
                filter: 'blur(80px)',
                pointerEvents: 'none',
              }} />

              {/* Header mobile */}
              <Box sx={{ display: { xs: 'block', lg: 'none' }, textAlign: 'center', mb: 4 }}>
                <Typography sx={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#fff',
                  mb: 1,
                  fontFamily: '"Inter", sans-serif',
                }}>
                  Excellent Training
                </Typography>
                <Typography sx={{ color: 'rgba(224, 231, 255, 0.6)', fontSize: '0.9rem' }}>
                  Green Building
                </Typography>
              </Box>

              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography sx={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  mb: 1,
                  fontFamily: '"Inter", sans-serif',
                }}>
                  Bienvenue 👋
                </Typography>
                <Typography sx={{
                  color: 'rgba(224, 231, 255, 0.7)',
                  mb: 4,
                  fontSize: '0.95rem',
                  lineHeight: 1.5,
                }}>
                  Connectez-vous pour accéder à votre espace de gestion
                </Typography>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert 
                      severity="error" 
                      sx={{
                        mb: 3,
                        borderRadius: '12px',
                        bgcolor: 'rgba(239, 68, 68, 0.15)',
                        color: '#fca5a5',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        '& .MuiAlert-icon': { color: '#ef4444' }
                      }}
                    >
                      {error}
                    </Alert>
                  </motion.div>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    fullWidth
                    label="Nom d'utilisateur"
                    value={form.login}
                    onChange={(e) => setForm({ ...form, login: e.target.value })}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#fff',
                        borderRadius: '14px',
                        bgcolor: 'rgba(0,0,0,0.15)',
                        fontFamily: '"Inter", sans-serif',
                        '& fieldset': { 
                          borderColor: 'rgba(255,255,255,0.15)',
                          borderWidth: '1.5px',
                        },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&.Mui-focused fieldset': { 
                          borderColor: '#a78bfa',
                          boxShadow: '0 0 0 4px rgba(167, 139, 250, 0.15)',
                        },
                      },
                      '& .MuiInputLabel-root': { 
                        color: 'rgba(224, 231, 255, 0.6)',
                        fontFamily: '"Inter", sans-serif',
                        '&.Mui-focused': { color: '#c4b5fd' }
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: 'rgba(196, 181, 253, 0.6)', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Mot de passe"
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#fff',
                        borderRadius: '14px',
                        bgcolor: 'rgba(0,0,0,0.15)',
                        fontFamily: '"Inter", sans-serif',
                        '& fieldset': { 
                          borderColor: 'rgba(255,255,255,0.15)',
                          borderWidth: '1.5px',
                        },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&.Mui-focused fieldset': { 
                          borderColor: '#a78bfa',
                          boxShadow: '0 0 0 4px rgba(167, 139, 250, 0.15)',
                        },
                      },
                      '& .MuiInputLabel-root': { 
                        color: 'rgba(224, 231, 255, 0.6)',
                        fontFamily: '"Inter", sans-serif',
                        '&.Mui-focused': { color: '#c4b5fd' }
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: 'rgba(196, 181, 253, 0.6)', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton 
                            onClick={() => setShowPwd(!showPwd)}
                            sx={{ color: 'rgba(196, 181, 253, 0.6)' }}
                          >
                            {showPwd ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    disabled={loading}
                    endIcon={!loading && <ArrowForward />}
                    sx={{
                      mt: 1,
                      py: 1.6,
                      borderRadius: '14px',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      color: '#1e1b4b',
                      bgcolor: '#ffffff',
                      fontFamily: '"Inter", sans-serif',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                      '&:hover': {
                        bgcolor: '#f3f4f6',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                      },
                      '&:disabled': {
                        bgcolor: 'rgba(255,255,255,0.3)',
                        color: 'rgba(30, 27, 75, 0.5)',
                      }
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: '#1e1b4b' }} />
                    ) : (
                      'Se connecter'
                    )}
                  </Button>
                </Box>

                {/* Comptes démo */}
                <Box sx={{ mt: 4 }}>
                  <Typography sx={{
                    fontSize: '0.75rem',
                    color: 'rgba(224, 231, 255, 0.5)',
                    mb: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}>
                    Comptes de démonstration
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      { role: 'Administrateur', login: 'admin', color: '#8b5cf6', desc: 'Accès complet' },
                      { role: 'Responsable', login: 'responsable', color: '#3b82f6', desc: 'Statistiques & rapports' },
                      { role: 'Utilisateur', login: 'user', color: '#ec4899', desc: 'Gestion formations' },
                    ].map((account) => (
                      <motion.button
                        key={account.login}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setForm({ login: account.login, password: 'password123' })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 16px',
                          background: 'rgba(255,255,255,0.05)',
                          border: `1px solid ${account.color}30`,
                          borderRadius: '12px',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                        }}
                      >
                        <Box sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '10px',
                          background: `linear-gradient(135deg, ${account.color}20 0%, ${account.color}40 100%)`,
                          border: `1px solid ${account.color}50`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: account.color,
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}>
                          {account.role[0]}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ 
                            color: '#fff', 
                            fontWeight: 600, 
                            fontSize: '0.9rem',
                            lineHeight: 1.2,
                            fontFamily: '"Inter", sans-serif',
                          }}>
                            {account.role}
                          </Typography>
                          <Typography sx={{ 
                            color: 'rgba(224, 231, 255, 0.5)', 
                            fontSize: '0.75rem',
                          }}>
                            {account.desc}
                          </Typography>
                        </Box>
                        <Box sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '6px',
                          bgcolor: 'rgba(0,0,0,0.2)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}>
                          <Typography sx={{ 
                            color: 'rgba(224, 231, 255, 0.7)', 
                            fontSize: '0.7rem',
                            fontFamily: 'monospace',
                            fontWeight: 600,
                          }}>
                            {account.login}
                          </Typography>
                        </Box>
                      </motion.button>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>

            <Typography sx={{
              textAlign: 'center',
              mt: 3,
              fontSize: '0.75rem',
              color: 'rgba(224, 231, 255, 0.4)',
            }}>
              © 2026 Excellent Training — Green Building
            </Typography>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
