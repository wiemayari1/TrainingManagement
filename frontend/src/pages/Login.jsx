import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import {
    Box, TextField, Button, Typography, Paper, Alert,
    InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

// ── Icônes SVG inline ───────────────────────────────────────────
const MailIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
);

const LockIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);

const GraduationCapIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
);

// ── Formes animées en arrière-plan ──────────────────────────────
const FloatingShape = ({ delay, duration, size, top, left, right, bottom, color }) => (
    <motion.div
        animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            rotate: [0, 5, -5, 0],
        }}
        transition={{
            duration: duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay,
        }}
        style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: '50%',
            background: color,
            top,
            left,
            right,
            bottom,
            filter: 'blur(1px)',
            opacity: 0.15,
            pointerEvents: 'none',
        }}
    />
);

// ── Variantes d'animation ───────────────────────────────────────
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.15,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
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
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #6366F1 0%, #7C3AED 50%, #8B5CF6 100%)',
            fontFamily: '"Inter", "Poppins", sans-serif',
        }}>
            {/* ── Formes flottantes animées en arrière-plan ───────── */}
            <FloatingShape delay={0} duration={8} size={300} top="-10%" left="-10%" color="rgba(255,255,255,0.08)" />
            <FloatingShape delay={2} duration={10} size={200} top="60%" right="-5%" color="rgba(255,255,255,0.06)" />
            <FloatingShape delay={1} duration={12} size={150} bottom="10%" left="10%" color="rgba(255,255,255,0.05)" />
            <FloatingShape delay={3} duration={9} size={100} top="20%" right="15%" color="rgba(255,255,255,0.07)" />

            {/* ── Motif de points subtil ──────────────────────────── */}
            <Box sx={{
                position: 'absolute',
                inset: 0,
                opacity: 0.04,
                backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                backgroundSize: '32px 32px',
                pointerEvents: 'none',
            }} />

            {/* ── Carte de connexion ──────────────────────────────── */}
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                style={{ width: '100%', maxWidth: 420, padding: '0 20px', position: 'relative', zIndex: 2 }}
            >
                <Paper elevation={0} sx={{
                    width: '100%',
                    p: { xs: 4, sm: 5 },
                    borderRadius: '16px',
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                }}>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* ── Header : Logo + Titre ───────────────────── */}
                        <motion.div variants={itemVariants}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                                <Box sx={{
                                    width: 42, height: 42, borderRadius: '10px',
                                    bgcolor: '#6366F1',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                                }}>
                                    <GraduationCapIcon />
                                </Box>
                                <Box>
                                    <Typography sx={{
                                        fontWeight: 700, fontSize: '1.05rem', color: '#111827', lineHeight: 1.2,
                                    }}>
                                        Excellent Training
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                                        Centre de Formation Professionnelle
                                    </Typography>
                                </Box>
                            </Box>
                        </motion.div>

                        {/* ── Titre ───────────────────────────────────── */}
                        <motion.div variants={itemVariants}>
                            <Box sx={{ textAlign: 'center', mb: 3.5 }}>
                                <Typography sx={{
                                    fontWeight: 800, fontSize: '1.6rem', color: '#111827', mb: 0.5, letterSpacing: '-0.02em',
                                }}>
                                    Bienvenue
                                </Typography>
                                <Typography sx={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
                                    Connectez-vous à votre espace
                                </Typography>
                            </Box>
                        </motion.div>

                        {/* ── Message d'erreur ────────────────────────── */}
                        {error && (
                            <motion.div variants={itemVariants}>
                                <Alert severity="error" sx={{
                                    mb: 2.5, borderRadius: '10px', fontSize: '0.82rem',
                                    animation: 'shake 0.4s ease-in-out',
                                    '@keyframes shake': {
                                        '0%, 100%': { transform: 'translateX(0)' },
                                        '25%': { transform: 'translateX(-4px)' },
                                        '75%': { transform: 'translateX(4px)' },
                                    },
                                }}>
                                    {error}
                                </Alert>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* ── Champ Email ───────────────────────────── */}
                            <motion.div variants={itemVariants}>
                                <Box sx={{ mb: 2.2 }}>
                                    <Typography sx={{
                                        fontSize: '0.8rem', fontWeight: 600, color: '#374151', mb: 0.8,
                                    }}>
                                        User name
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        value={form.login}
                                        onChange={e => setForm({ ...form, login: e.target.value })}
                                        placeholder="Entrez votre e-mail"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <MailIcon />
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                borderRadius: '10px',
                                                bgcolor: '#F9FAFB',
                                                fontSize: '0.9rem',
                                                transition: 'all 0.2s',
                                                '& fieldset': { borderColor: '#E5E7EB', transition: 'all 0.2s' },
                                                '&:hover fieldset': { borderColor: '#C4B5FD' },
                                                '&.Mui-focused fieldset': { borderColor: '#6366F1', borderWidth: 2 },
                                            },
                                        }}
                                    />
                                </Box>
                            </motion.div>

                            {/* ── Champ Mot de passe ────────────────────── */}
                            <motion.div variants={itemVariants}>
                                <Box sx={{ mb: 1.5 }}>
                                    <Typography sx={{
                                        fontSize: '0.8rem', fontWeight: 600, color: '#374151', mb: 0.8,
                                    }}>
                                        Mot de passe
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type={showPwd ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        placeholder="Entrez votre mot de passe"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPwd(!showPwd)}
                                                        size="small"
                                                        sx={{ color: '#9CA3AF', transition: 'color 0.2s', '&:hover': { color: '#6366F1' } }}
                                                    >
                                                        {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                borderRadius: '10px',
                                                bgcolor: '#F9FAFB',
                                                fontSize: '0.9rem',
                                                transition: 'all 0.2s',
                                                '& fieldset': { borderColor: '#E5E7EB', transition: 'all 0.2s' },
                                                '&:hover fieldset': { borderColor: '#C4B5FD' },
                                                '&.Mui-focused fieldset': { borderColor: '#6366F1', borderWidth: 2 },
                                            },
                                        }}
                                    />
                                </Box>
                            </motion.div>

                            {/* ── Mot de passe oublié ───────────────────── */}
                            <motion.div variants={itemVariants}>
                                <Box sx={{ textAlign: 'right', mb: 3 }}>
                                    <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                                        <Typography sx={{
                                            fontSize: '0.8rem', color: '#6366F1', fontWeight: 600,
                                            cursor: 'pointer', display: 'inline-block',
                                            transition: 'all 0.2s',
                                            '&:hover': { color: '#4F46E5', textDecoration: 'underline' },
                                        }}>
                                            Mot de passe oublié ?
                                        </Typography>
                                    </Link>
                                </Box>
                            </motion.div>

                            {/* ── Bouton Se connecter ───────────────────── */}
                            <motion.div variants={itemVariants}>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                >
                                    <Button
                                        type="submit"
                                        fullWidth
                                        disabled={loading}
                                        sx={{
                                            py: 1.5,
                                            borderRadius: '10px',
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            fontSize: '0.95rem',
                                            bgcolor: loading ? '#C4B5FD' : '#6366F1',
                                            color: '#fff',
                                            boxShadow: loading ? 'none' : '0 8px 24px rgba(99,102,241,0.35)',
                                            '&:hover': {
                                                bgcolor: loading ? '#C4B5FD' : '#4F46E5',
                                                boxShadow: '0 12px 32px rgba(99,102,241,0.45)',
                                            },
                                            transition: 'all 0.25s ease',
                                            display: 'flex', gap: 1,
                                            letterSpacing: '0.01em',
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <motion.span
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                    style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                                                />
                                                Connexion en cours...
                                            </>
                                        ) : (
                                            <>Se connecter →</>
                                        )}
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </form>
                    </motion.div>
                </Paper>
            </motion.div>

            {/* ── Footer ──────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                style={{
                    position: 'absolute',
                    bottom: 24,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    zIndex: 1,
                }}
            >
                <Typography sx={{
                    fontSize: '0.72rem',
                    color: 'rgba(255,255,255,0.55)',
                    letterSpacing: '0.02em',
                }}>
                    © 2026 Excellent Training — Green Building
                </Typography>
            </motion.div>
        </Box>
    );
}