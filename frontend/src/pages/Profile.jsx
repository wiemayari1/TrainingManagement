import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, TextField, Button, Avatar, Chip, Alert,
    Snackbar, InputAdornment, IconButton, LinearProgress,
} from '@mui/material';
import {
    ArrowBack, Lock, Visibility, VisibilityOff, Save, Cancel,
    CameraAlt, AdminPanelSettings, Badge, Person, CheckCircle,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const API_BASE = 'http://localhost:8081/api';

const roleConfig = {
    ROLE_ADMIN:       { label: 'Administrateur', color: '#EF4444', bg: '#FEF2F2', gradient: 'linear-gradient(135deg,#EF4444,#DC2626)', icon: AdminPanelSettings },
    ROLE_RESPONSABLE: { label: 'Responsable',    color: '#F59E0B', bg: '#FFFBEB', gradient: 'linear-gradient(135deg,#F59E0B,#D97706)', icon: Badge },
    ROLE_USER:        { label: 'Utilisateur',    color: '#10B981', bg: '#ECFDF5', gradient: 'linear-gradient(135deg,#10B981,#059669)', icon: Person },
};

function StrengthBar({ password }) {
    if (!password) return null;
    const score = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
    const colors = ['#EF4444','#F59E0B','#F59E0B','#10B981','#10B981'];
    const labels = ['','Faible','Moyen','Bon','Fort'];
    return (
        <Box sx={{ mt: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                {[0,1,2,3].map(i => (
                    <Box key={i} sx={{ flex: 1, height: 3, borderRadius: 2, bgcolor: i < score ? colors[score] : '#E2E8F0', transition: 'background 0.3s' }} />
                ))}
            </Box>
            <Typography sx={{ fontSize: '0.7rem', color: colors[score] || '#94A3B8', fontWeight: 600 }}>
                {labels[score] || 'Trop court'}
            </Typography>
        </Box>
    );
}

export default function Profile() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const fileInputRef = useRef();

    const [avatar, setAvatar] = useState(() => localStorage.getItem('profilePhoto_' + user?.id) || null);
    const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pwdLoading, setPwdLoading] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
    const [photoHover, setPhotoHover] = useState(false);
    const [success, setSuccess] = useState(false);

    const rc = roleConfig[user?.role] || roleConfig.ROLE_USER;
    const RoleIcon = rc.icon;
    const initials = ((user?.login || user?.username || 'U').charAt(0)).toUpperCase();

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setSnack({ open: true, msg: 'Image trop lourde (max 2 MB)', severity: 'error' });
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            setAvatar(dataUrl);
            localStorage.setItem('profilePhoto_' + user?.id, dataUrl);
            setSnack({ open: true, msg: 'Photo mise à jour !', severity: 'success' });
        };
        reader.readAsDataURL(file);
    };

    const handleRemovePhoto = () => {
        setAvatar(null);
        localStorage.removeItem('profilePhoto_' + user?.id);
    };

    const handleChangePassword = async () => {
        if (!pwdForm.oldPassword) return setSnack({ open: true, msg: "L'ancien mot de passe est requis", severity: 'error' });
        if (pwdForm.newPassword.length < 6) return setSnack({ open: true, msg: 'Minimum 6 caractères', severity: 'error' });
        if (pwdForm.newPassword !== pwdForm.confirm) return setSnack({ open: true, msg: 'Les mots de passe ne correspondent pas', severity: 'error' });

        setPwdLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setSuccess(true);
                setPwdForm({ oldPassword: '', newPassword: '', confirm: '' });
                setSnack({ open: true, msg: 'Mot de passe mis à jour !', severity: 'success' });
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setSnack({ open: true, msg: data.message || 'Erreur', severity: 'error' });
            }
        } catch { setSnack({ open: true, msg: 'Erreur de connexion', severity: 'error' }); }
        setPwdLoading(false);
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#F0F2F8',
            fontFamily: '"Inter", sans-serif',
        }}>
            {/* ── TOP BAR ── */}
            <Box sx={{
                position: 'sticky', top: 0, zIndex: 100,
                bgcolor: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid #E8EAF0',
                px: { xs: 2, md: 5 }, py: 1.5,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => navigate('/dashboard')} sx={{
                        bgcolor: '#F0F2F8', color: '#475569',
                        '&:hover': { bgcolor: '#E2E8F0' },
                        borderRadius: 2, width: 36, height: 36,
                    }}>
                        <ArrowBack sx={{ fontSize: 18 }} />
                    </IconButton>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', lineHeight: 1.2 }}>
                            Mon Profil
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                            Gérez vos informations personnelles
                        </Typography>
                    </Box>
                </Box>

                {/* Logo compact */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 32, height: 32, borderRadius: '9px',
                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 800, fontSize: 11,
                    }}>ET</Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', display: { xs: 'none', sm: 'block' } }}>
                        Excellent Training
                    </Typography>
                </Box>
            </Box>

            {/* ── MAIN CONTENT ── */}
            <Box sx={{ maxWidth: 880, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>

                {/* ── HERO CARD ── */}
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Box sx={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
                        mb: 3,
                    }}>
                        {/* Banner */}
                        <Box sx={{
                            height: 110,
                            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4C1D95 100%)',
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                            {/* Pattern */}
                            <Box sx={{ position: 'absolute', inset: 0, opacity: 0.12 }}>
                                <svg width="100%" height="100%">
                                    {[...Array(8)].map((_, i) => (
                                        <circle key={i} cx={60 + i * 110} cy={55} r={35 + i * 5} fill="none" stroke="white" strokeWidth="1" />
                                    ))}
                                </svg>
                            </Box>
                            <Box sx={{
                                position: 'absolute', top: 16, right: 20,
                                width: 80, height: 80, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.06)',
                            }} />
                        </Box>

                        {/* Profile body */}
                        <Box sx={{ bgcolor: '#fff', px: { xs: 3, md: 4 }, pb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                                {/* Avatar with upload */}
                                <Box sx={{ mt: -5, position: 'relative', flexShrink: 0 }}>
                                    <Box
                                        onMouseEnter={() => setPhotoHover(true)}
                                        onMouseLeave={() => setPhotoHover(false)}
                                        onClick={() => fileInputRef.current?.click()}
                                        sx={{ cursor: 'pointer', position: 'relative', width: 88, height: 88 }}
                                    >
                                        <Avatar
                                            src={avatar}
                                            sx={{
                                                width: 88, height: 88,
                                                border: '4px solid #fff',
                                                boxShadow: '0 4px 20px rgba(99,102,241,0.25)',
                                                background: avatar ? 'transparent' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                                fontSize: '2rem', fontWeight: 800, color: '#fff',
                                                transition: 'opacity 0.2s',
                                                opacity: photoHover ? 0.75 : 1,
                                            }}
                                        >
                                            {!avatar && initials}
                                        </Avatar>
                                        <AnimatePresence>
                                            {photoHover && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    style={{
                                                        position: 'absolute', inset: 0,
                                                        borderRadius: '50%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: 'rgba(0,0,0,0.35)',
                                                        border: '4px solid #fff',
                                                    }}
                                                >
                                                    <CameraAlt sx={{ color: '#fff', fontSize: 22 }} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Box>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handlePhotoChange}
                                    />
                                </Box>

                                {/* Name + role */}
                                <Box sx={{ flex: 1, pt: 1, minWidth: 180 }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#0F172A' }}>
                                        {user?.login || user?.username}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                        <Chip
                                            icon={<RoleIcon sx={{ fontSize: '13px !important' }} />}
                                            label={rc.label}
                                            size="small"
                                            sx={{ bgcolor: rc.bg, color: rc.color, fontWeight: 700, fontSize: '0.72rem' }}
                                        />
                                        <Chip
                                            icon={<CheckCircle sx={{ fontSize: '13px !important' }} />}
                                            label="Compte actif"
                                            size="small"
                                            sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 600, fontSize: '0.72rem' }}
                                        />
                                    </Box>
                                </Box>

                                {/* Actions */}
                                <Box sx={{ display: 'flex', gap: 1, pb: 0.5 }}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => fileInputRef.current?.click()}
                                        startIcon={<CameraAlt sx={{ fontSize: 15 }} />}
                                        sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.78rem', borderColor: '#E2E8F0', color: '#475569', '&:hover': { borderColor: '#6366F1', color: '#6366F1', bgcolor: '#EEF2FF' } }}
                                    >
                                        Changer la photo
                                    </Button>
                                    {avatar && (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={handleRemovePhoto}
                                            sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.78rem', borderColor: '#FCA5A5', color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
                                        >
                                            Supprimer
                                        </Button>
                                    )}
                                </Box>
                            </Box>

                            {/* Info row */}
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                                gap: 2, mt: 3,
                            }}>
                                {[
                                    { label: "Nom d'utilisateur", value: user?.login || user?.username },
                                    { label: 'Email', value: user?.email || 'Non renseigné' },
                                    { label: 'Rôle', value: rc.label, color: rc.color },
                                ].map((item, i) => (
                                    <Box key={i} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #E8EAF0' }}>
                                        <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.4 }}>
                                            {item.label}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: item.color || '#0F172A' }}>
                                            {item.value}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </motion.div>

                {/* ── PASSWORD CARD ── */}
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }}>
                    <Box sx={{
                        bgcolor: '#fff',
                        borderRadius: 4,
                        boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
                        overflow: 'hidden',
                    }}>
                        {/* Header */}
                        <Box sx={{
                            px: { xs: 3, md: 4 }, py: 2.5,
                            borderBottom: '1px solid #F1F5F9',
                            display: 'flex', alignItems: 'center', gap: 1.5,
                        }}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#EEF2FF' }}>
                                <Lock sx={{ color: '#6366F1', fontSize: 18 }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
                                    Sécurité du compte
                                </Typography>
                                <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                                    Modifiez votre mot de passe
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ px: { xs: 3, md: 4 }, py: 3 }}>
                            <AnimatePresence>
                                {success && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                        <Alert
                                            severity="success"
                                            icon={<CheckCircle />}
                                            sx={{ mb: 3, borderRadius: 2.5, bgcolor: '#ECFDF5', border: '1px solid #6EE7B7' }}
                                        >
                                            Mot de passe mis à jour avec succès !
                                        </Alert>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                                gap: 2.5,
                                alignItems: 'start',
                            }}>
                                {/* Old password */}
                                <Box>
                                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Mot de passe actuel *
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type={showOld ? 'text' : 'password'}
                                        value={pwdForm.oldPassword}
                                        onChange={e => setPwdForm({ ...pwdForm, oldPassword: e.target.value })}
                                        placeholder="Mot de passe actuel"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton size="small" onClick={() => setShowOld(!showOld)} sx={{ color: '#94A3B8' }}>
                                                        {showOld ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                            sx: { borderRadius: 2.5, bgcolor: '#F8FAFC', '& fieldset': { borderColor: '#E2E8F0' }, '&:hover fieldset': { borderColor: '#6366F1' } },
                                        }}
                                    />
                                </Box>

                                {/* New password */}
                                <Box>
                                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Nouveau mot de passe *
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type={showNew ? 'text' : 'password'}
                                        value={pwdForm.newPassword}
                                        onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                                        placeholder="Nouveau mot de passe"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton size="small" onClick={() => setShowNew(!showNew)} sx={{ color: '#94A3B8' }}>
                                                        {showNew ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                            sx: { borderRadius: 2.5, bgcolor: '#F8FAFC', '& fieldset': { borderColor: '#E2E8F0' }, '&:hover fieldset': { borderColor: '#6366F1' } },
                                        }}
                                    />
                                    <StrengthBar password={pwdForm.newPassword} />
                                </Box>

                                {/* Confirm */}
                                <Box>
                                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Confirmer *
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type={showConfirm ? 'text' : 'password'}
                                        value={pwdForm.confirm}
                                        onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                                        placeholder="Répétez le mot de passe"
                                        error={pwdForm.confirm.length > 0 && pwdForm.newPassword !== pwdForm.confirm}
                                        helperText={
                                            pwdForm.confirm.length > 0
                                                ? pwdForm.newPassword === pwdForm.confirm
                                                    ? '✓ Identiques'
                                                    : '✗ Différents'
                                                : ''
                                        }
                                        FormHelperTextProps={{
                                            sx: { color: pwdForm.newPassword === pwdForm.confirm && pwdForm.confirm.length > 0 ? '#10B981' : '#EF4444', fontWeight: 600 }
                                        }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton size="small" onClick={() => setShowConfirm(!showConfirm)} sx={{ color: '#94A3B8' }}>
                                                        {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                            sx: { borderRadius: 2.5, bgcolor: '#F8FAFC', '& fieldset': { borderColor: '#E2E8F0' }, '&:hover fieldset': { borderColor: '#6366F1' } },
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* Actions */}
                            <Box sx={{ display: 'flex', gap: 1.5, mt: 3, pt: 3, borderTop: '1px solid #F1F5F9' }}>
                                <Button
                                    onClick={handleChangePassword}
                                    disabled={pwdLoading || !pwdForm.oldPassword || pwdForm.newPassword.length < 6 || pwdForm.newPassword !== pwdForm.confirm}
                                    variant="contained"
                                    startIcon={<Save sx={{ fontSize: 16 }} />}
                                    sx={{
                                        borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 3,
                                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                        boxShadow: 'none',
                                        '&:hover': { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' },
                                        '&:disabled': { background: '#E2E8F0', color: '#94A3B8' },
                                    }}
                                >
                                    {pwdLoading ? 'Enregistrement...' : 'Enregistrer'}
                                </Button>
                                <Button
                                    onClick={() => setPwdForm({ oldPassword: '', newPassword: '', confirm: '' })}
                                    variant="outlined"
                                    startIcon={<Cancel sx={{ fontSize: 16 }} />}
                                    sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600, borderColor: '#E2E8F0', color: '#64748B', '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' } }}
                                >
                                    Annuler
                                </Button>
                            </Box>

                            {pwdLoading && <LinearProgress sx={{ mt: 1, borderRadius: 1, bgcolor: '#EEF2FF', '& .MuiLinearProgress-bar': { bgcolor: '#6366F1' } }} />}
                        </Box>
                    </Box>
                </motion.div>

                {/* Footer */}
                <Typography sx={{ textAlign: 'center', mt: 4, fontSize: '0.72rem', color: '#CBD5E1' }}>
                    Excellent Training — Green Building © 2026
                </Typography>
            </Box>

            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack({ ...snack, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: 2 }}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}