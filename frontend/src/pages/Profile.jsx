import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, TextField, Button, Avatar, Chip, Alert,
    Snackbar, IconButton, Divider, Stack, Paper, Grid,
} from '@mui/material';
import {
    ArrowBack, Lock, Visibility, VisibilityOff, Save,
    CameraAlt, AdminPanelSettings, Badge, Person,
    MailOutline, Fingerprint, Edit,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const API_BASE = 'http://localhost:8081/api';

const roleConfig = {
    ROLE_ADMIN: { label: 'Administrateur', color: '#DC2626', bg: '#FEF2F2', icon: AdminPanelSettings },
    ROLE_RESPONSABLE: { label: 'Responsable', color: '#D97706', bg: '#FFFBEB', icon: Badge },
    ROLE_USER: { label: 'Utilisateur', color: '#059669', bg: '#ECFDF5', icon: Person },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

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
            setSnack({ open: true, msg: 'Photo mise à jour', severity: 'success' });
        };
        reader.readAsDataURL(file);
    };

    const handleRemovePhoto = () => {
        setAvatar(null);
        localStorage.removeItem('profilePhoto_' + user?.id);
        setSnack({ open: true, msg: 'Photo supprimée', severity: 'success' });
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
                setSnack({ open: true, msg: 'Mot de passe mis à jour', severity: 'success' });
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setSnack({ open: true, msg: data.message || 'Erreur', severity: 'error' });
            }
        } catch { setSnack({ open: true, msg: 'Erreur de connexion', severity: 'error' }); }
        setPwdLoading(false);
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1280, mx: 'auto' }}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">

                {/* ─── Header ─── */}
                <motion.div variants={itemVariants}>
                    <Box sx={{ mb: 3.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
                            <Typography variant="h5" sx={{
                                fontWeight: 600, color: '#111827', letterSpacing: '-0.02em', fontSize: '1.25rem'
                            }}>
                                Mon profil
                            </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.8125rem' }}>
                            Gérez vos informations et votre sécurité
                        </Typography>
                    </Box>
                </motion.div>

                {/* ─── Content Grid ─── */}
                <Grid container spacing={2.5}>
                    {/* Left Column - Profile Info */}
                    <Grid item xs={12} lg={5}>
                        <motion.div variants={itemVariants}>
                            <Paper elevation={0} sx={{
                                borderRadius: 2, border: '1px solid #E5E7EB', bgcolor: '#fff', overflow: 'hidden',
                            }}>
                                {/* Banner */}
                                <Box sx={{
                                    height: 100,
                                    bgcolor: '#F3F4F6',
                                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.03) 1px, transparent 0)',
                                    backgroundSize: '24px 24px',
                                    position: 'relative',
                                }} />

                                {/* Avatar + Info */}
                                <Box sx={{ px: 3, pb: 3, position: 'relative' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: -5, mb: 2.5 }}>
                                        <Box
                                            onMouseEnter={() => setPhotoHover(true)}
                                            onMouseLeave={() => setPhotoHover(false)}
                                            onClick={() => fileInputRef.current?.click()}
                                            sx={{ cursor: 'pointer', position: 'relative' }}
                                        >
                                            <Avatar
                                                src={avatar || undefined}
                                                sx={{
                                                    width: 80, height: 80,
                                                    bgcolor: avatar ? 'transparent' : '#4F46E5',
                                                    color: '#fff',
                                                    fontSize: '1.75rem',
                                                    fontWeight: 600,
                                                    border: '3px solid #fff',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                }}
                                            >
                                                {!avatar && initials}
                                            </Avatar>
                                            {photoHover && (
                                                <Box sx={{
                                                    position: 'absolute', inset: 0,
                                                    borderRadius: '50%',
                                                    bgcolor: 'rgba(0,0,0,0.4)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <CameraAlt sx={{ color: '#fff', fontSize: 20 }} />
                                                </Box>
                                            )}
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                onChange={handlePhotoChange}
                                            />
                                        </Box>

                                        <Box sx={{ ml: 2, mb: 0.5, flex: 1 }}>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 600, color: '#111827', fontSize: '1.125rem', mb: 0.5,
                                            }}>
                                                {user?.login || user?.username}
                                            </Typography>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Chip
                                                    icon={<RoleIcon sx={{ fontSize: 14 }} />}
                                                    label={rc.label}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: rc.bg, color: rc.color,
                                                        fontWeight: 600, fontSize: '0.6875rem', height: 24,
                                                        '& .MuiChip-icon': { color: rc.color, ml: '6px' },
                                                    }}
                                                />
                                                <Chip
                                                    label="Actif"
                                                    size="small"
                                                    sx={{
                                                        bgcolor: '#ECFDF5', color: '#059669',
                                                        fontWeight: 500, fontSize: '0.6875rem', height: 24,
                                                    }}
                                                />
                                            </Stack>
                                        </Box>

                                        {avatar && (
                                            <Button
                                                onClick={handleRemovePhoto}
                                                size="small"
                                                sx={{
                                                    color: '#6B7280',
                                                    textTransform: 'none',
                                                    fontWeight: 500,
                                                    fontSize: '0.8125rem',
                                                    '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' },
                                                    mb: 0.5,
                                                }}
                                            >
                                                Supprimer
                                            </Button>
                                        )}
                                    </Box>

                                    <Divider sx={{ borderColor: '#F3F4F6', mb: 2.5 }} />

                                    {/* Info fields */}
                                    <Stack spacing={2.5}>
                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: '#6B7280', fontWeight: 500, fontSize: '0.75rem',
                                                textTransform: 'uppercase', letterSpacing: 0.5,
                                                display: 'block', mb: 0.8,
                                            }}>
                                                Nom d'utilisateur
                                            </Typography>
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                <Fingerprint sx={{ fontSize: 18, color: '#9CA3AF' }} />
                                                <Typography variant="body2" sx={{ color: '#111827', fontWeight: 500, fontSize: '0.875rem' }}>
                                                    {user?.login || user?.username}
                                                </Typography>
                                            </Stack>
                                        </Box>

                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: '#6B7280', fontWeight: 500, fontSize: '0.75rem',
                                                textTransform: 'uppercase', letterSpacing: 0.5,
                                                display: 'block', mb: 0.8,
                                            }}>
                                                Adresse email
                                            </Typography>
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                <MailOutline sx={{ fontSize: 18, color: '#9CA3AF' }} />
                                                <Typography variant="body2" sx={{ color: '#111827', fontWeight: 500, fontSize: '0.875rem' }}>
                                                    {user?.email || 'Non renseignée'}
                                                </Typography>
                                            </Stack>
                                        </Box>

                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: '#6B7280', fontWeight: 500, fontSize: '0.75rem',
                                                textTransform: 'uppercase', letterSpacing: 0.5,
                                                display: 'block', mb: 0.8,
                                            }}>
                                                Rôle
                                            </Typography>
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                <RoleIcon sx={{ fontSize: 18, color: rc.color }} />
                                                <Typography variant="body2" sx={{ color: '#111827', fontWeight: 500, fontSize: '0.875rem' }}>
                                                    {rc.label}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Paper>
                        </motion.div>
                    </Grid>

                    {/* Right Column - Password */}
                    <Grid item xs={12} lg={7}>
                        <motion.div variants={itemVariants}>
                            <Paper elevation={0} sx={{
                                borderRadius: 2, border: '1px solid #E5E7EB', bgcolor: '#fff', overflow: 'hidden',
                            }}>
                                <Box sx={{ p: 3 }}>
                                    <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
                                        <Lock sx={{ fontSize: 18, color: '#6B7280' }} />
                                        <Typography variant="h6" sx={{
                                            fontWeight: 600, color: '#111827', fontSize: '0.9375rem', letterSpacing: '-0.01em'
                                        }}>
                                            Sécurité du compte
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.8125rem', mb: 2.5, ml: 3.8 }}>
                                        Modifiez votre mot de passe
                                    </Typography>

                                    {success && (
                                        <Alert severity="success" sx={{
                                            mb: 2.5, borderRadius: 1.5,
                                            bgcolor: '#ECFDF5', color: '#059669',
                                            border: '1px solid #A7F3D0',
                                            '& .MuiAlert-icon': { color: '#059669' },
                                        }}>
                                            Mot de passe mis à jour avec succès
                                        </Alert>
                                    )}

                                    <Stack spacing={2.5}>
                                        <TextField
                                            fullWidth
                                            type={showOld ? 'text' : 'password'}
                                            label="Mot de passe actuel"
                                            value={pwdForm.oldPassword}
                                            onChange={e => setPwdForm({ ...pwdForm, oldPassword: e.target.value })}
                                            placeholder="Entrez votre mot de passe actuel"
                                            InputProps={{
                                                endAdornment: (
                                                    <IconButton onClick={() => setShowOld(!showOld)} size="small" sx={{ color: '#9CA3AF' }}>
                                                        {showOld ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                    </IconButton>
                                                ),
                                                sx: {
                                                    borderRadius: 2,
                                                    bgcolor: '#F9FAFB',
                                                    fontSize: '0.875rem',
                                                    '& fieldset': { borderColor: '#E5E7EB', transition: 'all 0.2s' },
                                                    '&:hover fieldset': { borderColor: '#D1D5DB' },
                                                    '&.Mui-focused fieldset': { borderColor: '#4F46E5', borderWidth: '1.5px' },
                                                },
                                            }}
                                            InputLabelProps={{
                                                sx: { color: '#6B7280', fontSize: '0.8125rem', fontWeight: 500 },
                                            }}
                                        />

                                        <TextField
                                            fullWidth
                                            type={showNew ? 'text' : 'password'}
                                            label="Nouveau mot de passe"
                                            value={pwdForm.newPassword}
                                            onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                                            placeholder="Minimum 6 caractères"
                                            InputProps={{
                                                endAdornment: (
                                                    <IconButton onClick={() => setShowNew(!showNew)} size="small" sx={{ color: '#9CA3AF' }}>
                                                        {showNew ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                    </IconButton>
                                                ),
                                                sx: {
                                                    borderRadius: 2,
                                                    bgcolor: '#F9FAFB',
                                                    fontSize: '0.875rem',
                                                    '& fieldset': { borderColor: '#E5E7EB', transition: 'all 0.2s' },
                                                    '&:hover fieldset': { borderColor: '#D1D5DB' },
                                                    '&.Mui-focused fieldset': { borderColor: '#4F46E5', borderWidth: '1.5px' },
                                                },
                                            }}
                                            InputLabelProps={{
                                                sx: { color: '#6B7280', fontSize: '0.8125rem', fontWeight: 500 },
                                            }}
                                        />

                                        <TextField
                                            fullWidth
                                            type={showConfirm ? 'text' : 'password'}
                                            label="Confirmer le mot de passe"
                                            value={pwdForm.confirm}
                                            onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                                            placeholder="Répétez le mot de passe"
                                            error={pwdForm.confirm.length > 0 && pwdForm.newPassword !== pwdForm.confirm}
                                            helperText={
                                                pwdForm.confirm.length > 0
                                                    ? pwdForm.newPassword === pwdForm.confirm
                                                        ? 'Mots de passe identiques'
                                                        : 'Les mots de passe ne correspondent pas'
                                                    : ''
                                            }
                                            FormHelperTextProps={{
                                                sx: {
                                                    color: pwdForm.newPassword === pwdForm.confirm && pwdForm.confirm.length > 0 ? '#059669' : '#DC2626',
                                                    fontWeight: 500, fontSize: '0.75rem', ml: 0,
                                                }
                                            }}
                                            InputProps={{
                                                endAdornment: (
                                                    <IconButton onClick={() => setShowConfirm(!showConfirm)} size="small" sx={{ color: '#9CA3AF' }}>
                                                        {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                    </IconButton>
                                                ),
                                                sx: {
                                                    borderRadius: 2,
                                                    bgcolor: '#F9FAFB',
                                                    fontSize: '0.875rem',
                                                    '& fieldset': { borderColor: '#E5E7EB', transition: 'all 0.2s' },
                                                    '&:hover fieldset': { borderColor: '#D1D5DB' },
                                                    '&.Mui-focused fieldset': { borderColor: '#4F46E5', borderWidth: '1.5px' },
                                                },
                                            }}
                                            InputLabelProps={{
                                                sx: { color: '#6B7280', fontSize: '0.8125rem', fontWeight: 500 },
                                            }}
                                        />
                                    </Stack>

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                        <Button
                                            variant="contained"
                                            onClick={handleChangePassword}
                                            disabled={pwdLoading}
                                            startIcon={!pwdLoading && <Save sx={{ fontSize: 18 }} />}
                                            sx={{
                                                bgcolor: '#4F46E5',
                                                '&:hover': { bgcolor: '#4338CA' },
                                                '&:disabled': { bgcolor: '#C7D2FE', color: '#fff' },
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 500,
                                                fontSize: '0.8125rem',
                                                px: 3,
                                                py: 0.9,
                                                boxShadow: 'none',
                                            }}
                                        >
                                            {pwdLoading ? 'Enregistrement...' : 'Enregistrer'}
                                        </Button>
                                    </Box>
                                </Box>
                            </Paper>
                        </motion.div>
                    </Grid>
                </Grid>
            </motion.div>

            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack({ ...snack, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity={snack.severity}
                    onClose={() => setSnack({ ...snack, open: false })}
                    sx={{ borderRadius: 2, fontSize: '0.8125rem' }}
                >
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}