import React, { useState } from 'react';
import {
    Box, TextField, Button, Typography, Paper, Alert,
    InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

// ── Mock auth store (remplace par ton vrai import) ─────────────
const useAuthStore = () => ({
    login: async (login, password) => {
        await new Promise(r => setTimeout(r, 1000));
        if (!login || !password) return { success: false, error: 'Champs requis.' };
        return {
            success: true,
            user: {
                firstLogin: false,
                role: login === 'admin' ? 'ROLE_ADMIN' : login === 'responsable' ? 'ROLE_RESPONSABLE' : 'ROLE_USER'
            }
        };
    }
});

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
const UsersIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);
const TrendingUpIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
    </svg>
);
const ShieldIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
);
const GraduationCapIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
);

// ── Dots pattern SVG ────────────────────────────────────────────
const DotsPattern = ({ color = '#6366F1', opacity = 0.15 }) => (
    <svg style={{ position: 'absolute', top: 20, right: 20, opacity }} width="120" height="120">
        {Array.from({ length: 8 }).map((_, row) =>
            Array.from({ length: 8 }).map((_, col) => (
                <circle key={`${row}-${col}`} cx={col * 15 + 7} cy={row * 15 + 7} r="2" fill={color} />
            ))
        )}
    </svg>
);

// ── Curved separator SVG ────────────────────────────────────────
const CurvedAccent = () => (
    <svg style={{ position: 'absolute', bottom: 80, right: -20, opacity: 0.6 }}
         width="120" height="200" viewBox="0 0 120 200">
        <path d="M100 10 Q20 100 100 190" stroke="#6366F1" strokeWidth="4" fill="none" strokeLinecap="round"/>
    </svg>
);

export default function Login() {
    const [form, setForm] = useState({ login: '', password: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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
                if (result.user?.firstLogin) window.location.href = '/first-login';
                else if (result.user?.role === 'ROLE_RESPONSABLE') window.location.href = '/stats';
                else window.location.href = '/dashboard';
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
            fontFamily: '"Poppins", "Inter", sans-serif',
            bgcolor: '#F9FAFB',
        }}>
            {/* ── PANNEAU GAUCHE ─────────────────────────────────────── */}
            <Box sx={{
                flex: 1,
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'center',
                px: { md: 6, lg: 10 },
                py: 6,
                position: 'relative',
                bgcolor: '#FFFFFF',
                overflow: 'hidden',
            }}>
                {/* Dots decorations */}
                <DotsPattern />
                <Box sx={{ position: 'absolute', bottom: 120, left: 20, opacity: 0.08 }}>
                    <svg width="100" height="100">
                        {Array.from({ length: 6 }).map((_, row) =>
                            Array.from({ length: 6 }).map((_, col) => (
                                <circle key={`${row}-${col}`} cx={col * 16 + 8} cy={row * 16 + 8} r="2.5" fill="#6366F1" />
                            ))
                        )}
                    </svg>
                </Box>
                <CurvedAccent />

                {/* Logo */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
                    <Box sx={{
                        width: 38, height: 38, borderRadius: '10px',
                        bgcolor: '#6366F1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <GraduationCapIcon />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#111827', lineHeight: 1.2 }}>
                            Excellent Training
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                            Centre de Formation Professionnelle
                        </Typography>
                    </Box>
                </Box>

                {/* Hero text */}
                <Box sx={{ mb: 5, maxWidth: 460 }}>
                    <Typography sx={{
                        fontWeight: 800, fontSize: { md: '2rem', lg: '2.5rem' },
                        color: '#111827', lineHeight: 1.15, letterSpacing: '-0.03em', mb: 2,
                    }}>
                        Développez vos compétences, accélérez votre{' '}
                        <Box component="span" sx={{ color: '#6366F1' }}>avenir</Box>
                    </Typography>
                    <Typography sx={{ color: '#6B7280', fontSize: '0.95rem', lineHeight: 1.7 }}>
                        Gérez vos formations, suivez les progrès de vos apprenants et développez l'excellence au sein de votre organisation.
                    </Typography>
                </Box>

                {/* Features list */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8, mb: 6 }}>
                    {[
                        { icon: <UsersIcon />, text: 'Plus de 500 participants actifs' },
                        { icon: <TrendingUpIcon />, text: 'Formations de qualité professionnelle' },
                        { icon: <ShieldIcon />, text: 'Plateforme sécurisée et fiable' },
                    ].map((item, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                                width: 32, height: 32, borderRadius: '8px',
                                bgcolor: '#F3F4F6',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#6B7280',
                                flexShrink: 0,
                            }}>
                                {item.icon}
                            </Box>
                            <Typography sx={{ fontSize: '0.88rem', color: '#374151', fontWeight: 500 }}>
                                {item.text}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* ── Woman illustration — CODE ORIGINAL EXACT ─────────── */}
                <Box sx={{
                    position: 'absolute',
                    bottom: 0, right: 0,
                    width: { md: 220, lg: 280 },
                    height: { md: 280, lg: 340 },
                    overflow: 'hidden',
                }}>
                    <Box sx={{
                        width: '100%', height: '100%',
                        background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50% 50% 0 0 / 40% 40% 0 0',
                    }}>
                        {/* Accent arc */}
                        <Box sx={{
                            position: 'absolute',
                            left: -30, bottom: 60,
                            width: 100, height: 100,
                            borderRadius: '50%',
                            border: '8px solid #6366F1',
                            borderBottom: 'none',
                            borderRight: 'none',
                            transform: 'rotate(-45deg)',
                            opacity: 0.7,
                        }} />
                        <img
                            src="/assets/login-illustration.png"
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* ── PANNEAU DROIT ──────────────────────────────────────── */}
            <Box sx={{
                width: { xs: '100%', md: '45%', lg: '42%' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: { xs: 3, md: 5, lg: 8 },
                py: 5,
                background: 'linear-gradient(150deg, #6366F1 0%, #7C3AED 55%, #8B5CF6 100%)',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Wavy lines background */}
                <Box sx={{ position: 'absolute', inset: 0, opacity: 0.06 }}>
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <path
                                key={i}
                                d={`M-100 ${80 + i * 60} Q 200 ${60 + i * 60} 500 ${80 + i * 60} T 1100 ${80 + i * 60}`}
                                stroke="white" strokeWidth="1.5" fill="none"
                            />
                        ))}
                    </svg>
                </Box>

                <Box sx={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
                    {/* Card */}
                    <Paper elevation={0} sx={{
                        p: { xs: 3.5, md: 4.5 },
                        borderRadius: '20px',
                        bgcolor: 'rgba(255,255,255,0.97)',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
                    }}>
                        {/* Graduation cap icon */}
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Box sx={{
                                width: 64, height: 64, borderRadius: '50%',
                                bgcolor: '#6366F1',
                                display: 'inline-flex',
                                alignItems: 'center', justifyContent: 'center',
                                mb: 2,
                                boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
                            }}>
                                <GraduationCapIcon />
                            </Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#111827', mb: 0.5 }}>
                                Bienvenue
                            </Typography>
                            <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                                Connectez-vous à votre espace
                            </Typography>
                        </Box>

                        {/* Error */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.82rem' }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Email field */}
                            <Box sx={{ mb: 2 }}>
                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', mb: 0.8 }}>
                                    Adresse e-mail
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
                                            '& fieldset': { borderColor: '#E5E7EB' },
                                            '&:hover fieldset': { borderColor: '#6366F1' },
                                            '&.Mui-focused fieldset': { borderColor: '#6366F1', borderWidth: 2 },
                                        },
                                    }}
                                />
                            </Box>

                            {/* Password field */}
                            <Box sx={{ mb: 1.5 }}>
                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', mb: 0.8 }}>
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
                                                <IconButton onClick={() => setShowPwd(!showPwd)} size="small" sx={{ color: '#9CA3AF' }}>
                                                    {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: '10px',
                                            bgcolor: '#F9FAFB',
                                            fontSize: '0.9rem',
                                            '& fieldset': { borderColor: '#E5E7EB' },
                                            '&:hover fieldset': { borderColor: '#6366F1' },
                                            '&.Mui-focused fieldset': { borderColor: '#6366F1', borderWidth: 2 },
                                        },
                                    }}
                                />
                            </Box>

                            {/* Forgot password */}
                            <Box sx={{ textAlign: 'right', mb: 3 }}>
                                <a href="/forgot-password" style={{ textDecoration: 'none' }}>
                                    <Typography sx={{ fontSize: '0.8rem', color: '#6366F1', fontWeight: 600, cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' } }}>
                                        Mot de passe oublié ?
                                    </Typography>
                                </a>
                            </Box>

                            {/* Submit */}
                            <Button
                                type="submit"
                                fullWidth
                                disabled={loading}
                                sx={{
                                    py: 1.6,
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.95rem',
                                    bgcolor: loading ? '#9CA3AF' : '#6366F1',
                                    color: '#fff',
                                    boxShadow: '0 8px 20px rgba(99,102,241,0.35)',
                                    '&:hover': { bgcolor: '#4F46E5', boxShadow: '0 12px 28px rgba(99,102,241,0.45)' },
                                    transition: 'all 0.25s',
                                    display: 'flex', gap: 1,
                                }}
                            >
                                {loading ? 'Connexion en cours...' : 'Se connecter'}
                            </Button>
                        </form>
                    </Paper>

                    <Typography sx={{ textAlign: 'center', mt: 2.5, fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>
                        © 2026 Excellent Training — Green Building
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}