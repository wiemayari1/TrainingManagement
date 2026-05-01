import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import {
    Box, TextField, Button, Typography, Paper, Alert,
    IconButton, InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const UserLabelIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
);

const LockLabelIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);

const Background = () => (
    <Box sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: 'linear-gradient(160deg, #0f0c29 0%, #1a103c 40%, #0f172a 70%, #1e1b4b 100%)',
    }}>
        {[...Array(25)].map((_, i) => (
            <motion.div
                key={i}
                animate={{ opacity: [0, 0.8, 0], scale: [0, 1, 0] }}
                transition={{
                    duration: 2 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                    ease: "easeInOut",
                }}
                style={{
                    position: 'absolute',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: Math.random() * 3 + 2,
                    height: Math.random() * 3 + 2,
                    borderRadius: '50%',
                    background: i % 2 === 0
                        ? 'rgba(168, 85, 247, 0.7)'
                        : 'rgba(99, 102, 241, 0.6)',
                }}
            />
        ))}
        <Box sx={{
            position: 'absolute', width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
            top: '5%', left: '-5%', filter: 'blur(80px)',
        }} />
        <Box sx={{
            position: 'absolute', width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
            bottom: '5%', right: '-5%', filter: 'blur(80px)',
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
                if (result.user?.firstLogin) {
                    navigate('/first-login');
                } else {
                    // Tous les rôles vont vers /dashboard
                    // Le Dashboard affiche le bon contenu selon le rôle
                    navigate('/dashboard');
                }
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
            p: { xs: 2, md: 4 },
        }}>
            <Background />

            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 900 }}
            >
                <Paper elevation={0} sx={{
                    borderRadius: '24px',
                    bgcolor: '#ffffff',
                    boxShadow: '0 25px 80px -20px rgba(0,0,0,0.6)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    minHeight: 520,
                }}>
                    {/* Barre de couleur en haut */}
                    <Box sx={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #6366F1, #A855F7)',
                        zIndex: 2,
                    }} />

                    {/* Panneau gauche — Logo */}
                    <Box sx={{
                        width: { xs: '100%', md: '46%' },
                        bgcolor: '#F5F3FF',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: { xs: 3, md: 3 },
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <Box sx={{
                            position: 'absolute', width: 300, height: 300, borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
                            top: '-8%', left: '-30%',
                        }} />
                        <Box sx={{
                            position: 'absolute', width: 260, height: 260, borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
                            bottom: '-8%', right: '-25%',
                        }} />

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            style={{ width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}
                        >
                            <motion.div variants={itemVariants}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img
                                        src="/assets/logo.png"
                                        alt="Logo Excellent Training"
                                        style={{
                                            width: '78%',
                                            maxWidth: '380px',
                                            height: 'auto',
                                            maxHeight: '380px',
                                            objectFit: 'contain',
                                            filter: 'drop-shadow(0 8px 16px rgba(99,102,241,0.2))',
                                        }}
                                    />
                                </Box>
                            </motion.div>
                        </motion.div>
                    </Box>

                    {/* Panneau droit — Formulaire */}
                    <Box sx={{
                        width: { xs: '100%', md: '54%' },
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        p: { xs: 3, md: 5 },
                    }}>
                        <motion.div variants={containerVariants} initial="hidden" animate="visible">

                            <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: 28 }}>
                                <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.7rem', mb: 0.5 }}>
                                    Bienvenue !
                                </Typography>
                                <Typography sx={{ color: '#64748B', fontSize: '0.9rem' }}>
                                    Connectez-vous à votre espace
                                </Typography>
                            </motion.div>

                            {error && (
                                <motion.div variants={itemVariants}>
                                    <Alert severity="error" sx={{
                                        mb: 2.5, borderRadius: 2,
                                        bgcolor: '#FEF2F2', color: '#991B1B',
                                        border: '1px solid #FECACA', fontSize: '0.875rem', py: 0.5,
                                    }}>
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
                                        variant="outlined"
                                        sx={{ mb: 2.5 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <UserLabelIcon />
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                borderRadius: '12px', bgcolor: '#F9FAFB', fontSize: '0.95rem', py: 0.1,
                                                '& fieldset': { borderColor: '#E5E7EB', borderWidth: '1.5px' },
                                                '&:hover fieldset': { borderColor: '#C4B5FD' },
                                                '&.Mui-focused fieldset': { borderColor: '#6366F1', borderWidth: '1.5px', boxShadow: '0 0 0 3px rgba(99,102,241,0.1)' },
                                            },
                                        }}
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <TextField
                                        fullWidth
                                        label="Mot de passe"
                                        type={showPwd ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        placeholder="Entrez votre mot de passe"
                                        variant="outlined"
                                        sx={{ mb: 1.5 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockLabelIcon />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPwd(!showPwd)}
                                                        size="small"
                                                        sx={{ color: '#9CA3AF', '&:hover': { color: '#6366F1' } }}
                                                    >
                                                        {showPwd
                                                            ? <VisibilityOff fontSize="small" />
                                                            : <Visibility fontSize="small" />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                borderRadius: '12px', bgcolor: '#F9FAFB', fontSize: '0.95rem', py: 0.1,
                                                '& fieldset': { borderColor: '#E5E7EB', borderWidth: '1.5px' },
                                                '&:hover fieldset': { borderColor: '#C4B5FD' },
                                                '&.Mui-focused fieldset': { borderColor: '#6366F1', borderWidth: '1.5px', boxShadow: '0 0 0 3px rgba(99,102,241,0.1)' },
                                            },
                                        }}
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} style={{ textAlign: 'right', marginBottom: 24 }}>
                                    <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                                        <Typography sx={{
                                            color: '#6366F1', fontWeight: 600, fontSize: '0.85rem',
                                            '&:hover': { color: '#4F46E5' },
                                        }}>
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
                                            py: 1.4, borderRadius: '12px',
                                            textTransform: 'none', fontWeight: 700, fontSize: '1rem',
                                            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%)',
                                                boxShadow: '0 8px 25px rgba(99,102,241,0.4)',
                                            },
                                            boxShadow: '0 4px 15px rgba(99,102,241,0.35)',
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        {loading ? 'Connexion...' : 'Se connecter'}
                                    </Button>
                                </motion.div>
                            </form>

                            <motion.div variants={itemVariants}>
                                <Typography sx={{
                                    display: 'block', textAlign: 'center', mt: 4,
                                    color: '#94A3B8', fontSize: '0.75rem',
                                }}>
                                    © 2026 Excellent Training — Green Building
                                </Typography>
                            </motion.div>

                        </motion.div>
                    </Box>
                </Paper>
            </motion.div>
        </Box>
    );
}
