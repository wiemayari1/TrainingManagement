import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, TextField, Button, Avatar, Chip, Alert,
    Snackbar, IconButton, Stack, Paper, Grid,
} from '@mui/material';
import {
    ArrowBack, Lock, Visibility, VisibilityOff, Save,
    CameraAlt, AdminPanelSettings, Badge, Person,
    MailOutline, Fingerprint, Edit,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

const roleConfig = {
    ROLE_ADMIN: { label: 'Administrateur', color: '#10B981', bg: '#ECFDF5', icon: AdminPanelSettings },
    ROLE_RESPONSABLE: { label: 'Responsable', color: '#10B981', bg: '#ECFDF5', icon: Badge },
    ROLE_USER: { label: 'Utilisateur', color: '#10B981', bg: '#ECFDF5', icon: Person },
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
            const res = await api.post('/auth/change-password', {
                oldPassword: pwdForm.oldPassword,
                newPassword: pwdForm.newPassword,
            });
            if (res.data.success) {
                setSuccess(true);
                setPwdForm({ oldPassword: '', newPassword: '', confirm: '' });
                setSnack({ open: true, msg: 'Mot de passe mis à jour', severity: 'success' });
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setSnack({ open: true, msg: res.data.message || 'Erreur', severity: 'error' });
            }
        } catch (err) {
            setSnack({ open: true, msg: err.response?.data?.message || 'Erreur de connexion', severity: 'error' });
        }
        setPwdLoading(false);
    };

    const getPasswordStrength = (pwd) => {
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 10) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return score;
    };

    const strength = getPasswordStrength(pwdForm.newPassword);
    const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
    const strengthColors = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#059669'];

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1280, mx: 'auto', bgcolor: '#F8FAFC', minHeight: '100vh' }}>

            {/* ─── Flèche de retour simple ─── */}
            <IconButton
                onClick={() => navigate('/dashboard')}
                sx={{
                    mb: 2,
                    color: '#64748B',
                    '&:hover': { color: '#4F46E5', bgcolor: '#EEF2FF' },
                }}
            >
                <ArrowBack sx={{ fontSize: 24 }} />
            </IconButton>

            <motion.div variants={containerVariants} initial="hidden" animate="visible">

                {/* ─── Header ─── */}
                <motion.div variants={itemVariants}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" sx={{
                            fontWeight: 700, color: '#111827', fontSize: '1.5rem', mb: 0.5
                        }}>
                            Mon profil
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
                            Gérez vos informations et votre sécurité
                        </Typography>
                    </Box>
                </motion.div>

                {/* ─── Content Grid ─── */}
                <Grid container spacing={3}>
                    {/* Left Column - Profile Info */}
                    <Grid item xs={12} lg={5}>
                        <motion.div variants={itemVariants}>
                            <Paper elevation={0} sx={{
                                borderRadius: 4,
                                bgcolor: '#fff',
                                overflow: 'hidden',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            }}>
                                {/* Banner violet */}
                                <Box sx={{
                                    height: 140,
                                    bgcolor: '#7C3AED',
                                    position: 'relative',
                                    borderRadius: '16px 16px 0 0',
                                }}>
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: '40%',
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.1), transparent)',
                                    }} />
                                </Box>

                                {/* Avatar + Info */}
                                <Box sx={{ px: 3, pb: 3, position: 'relative' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: -7, mb: 3 }}>
                                        <Box
                                            onMouseEnter={() => setPhotoHover(true)}
                                            onMouseLeave={() => setPhotoHover(false)}
                                            onClick={() => fileInputRef.current?.click()}
                                            sx={{ cursor: 'pointer', position: 'relative' }}
                                        >
                                            <Avatar
                                                src={avatar || undefined}
                                                sx={{
                                                    width: 90,
                                                    height: 90,
                                                    bgcolor: avatar ? 'transparent' : '#4F46E5',
                                                    color: '#fff',
                                                    fontSize: '1.75rem',
                                                    fontWeight: 600,
                                                    border: '4px solid #fff',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                }}
                                            >
                                                {!avatar && initials}
                                            </Avatar>
                                            {photoHover && (
                                                <Box sx={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    borderRadius: '50%',
                                                    bgcolor: 'rgba(0,0,0,0.5)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.2s',
                                                }}>
                                                    <CameraAlt sx={{ color: '#fff', fontSize: 24 }} />
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

                                        <Box sx={{ ml: 2.5, flex: 1 }}>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 700,
                                                color: '#111827',
                                                fontSize: '1.25rem',
                                                mb: 1,
                                            }}>
                                                {user?.login || user?.username}
                                            </Typography>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Chip
                                                    icon={<RoleIcon sx={{ fontSize: 14, color: '#10B981' }} />}
                                                    label={rc.label}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: '#ECFDF5',
                                                        color: '#10B981',
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                        height: 26,
                                                        borderRadius: 5,
                                                        '& .MuiChip-icon': { ml: '6px' },
                                                    }}
                                                />
                                                <Chip
                                                    icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981', mr: 0.5 }} />}
                                                    label="Actif"
                                                    size="small"
                                                    sx={{
                                                        bgcolor: '#ECFDF5',
                                                        color: '#10B981',
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                        height: 26,
                                                        borderRadius: 5,
                                                    }}
                                                />
                                            </Stack>
                                        </Box>
                                    </Box>

                                    {/* Informations personnelles */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{
                                            fontWeight: 600,
                                            color: '#111827',
                                            fontSize: '0.9375rem',
                                            mb: 0.5,
                                        }}>
                                            Informations personnelles
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                                            Ces informations ne peuvent pas être modifiées.
                                        </Typography>
                                    </Box>

                                    <Stack spacing={2}>
                                        <Box sx={{
                                            p: 2.5,
                                            bgcolor: '#F9FAFB',
                                            borderRadius: 3,
                                            border: '1px solid #F3F4F6',
                                        }}>
                                            <Typography variant="caption" sx={{
                                                color: '#9CA3AF',
                                                fontWeight: 600,
                                                fontSize: '0.6875rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: 0.5,
                                                display: 'block',
                                                mb: 1,
                                            }}>
                                                Nom d'utilisateur
                                            </Typography>
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                <Fingerprint sx={{ fontSize: 18, color: '#9CA3AF' }} />
                                                <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600, fontSize: '0.875rem' }}>
                                                    {user?.login || user?.username}
                                                </Typography>
                                            </Stack>
                                        </Box>

                                        <Box sx={{
                                            p: 2.5,
                                            bgcolor: '#F9FAFB',
                                            borderRadius: 3,
                                            border: '1px solid #F3F4F6',
                                        }}>
                                            <Typography variant="caption" sx={{
                                                color: '#9CA3AF',
                                                fontWeight: 600,
                                                fontSize: '0.6875rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: 0.5,
                                                display: 'block',
                                                mb: 1,
                                            }}>
                                                Adresse email
                                            </Typography>
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                <MailOutline sx={{ fontSize: 18, color: '#9CA3AF' }} />
                                                <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600, fontSize: '0.875rem' }}>
                                                    {user?.email || 'Non renseignée'}
                                                </Typography>
                                            </Stack>
                                        </Box>

                                        <Box sx={{
                                            p: 2.5,
                                            bgcolor: '#F9FAFB',
                                            borderRadius: 3,
                                            border: '1px solid #F3F4F6',
                                        }}>
                                            <Typography variant="caption" sx={{
                                                color: '#9CA3AF',
                                                fontWeight: 600,
                                                fontSize: '0.6875rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: 0.5,
                                                display: 'block',
                                                mb: 1,
                                            }}>
                                                Rôle
                                            </Typography>
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                <RoleIcon sx={{ fontSize: 18, color: '#10B981' }} />
                                                <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600, fontSize: '0.875rem' }}>
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
                                borderRadius: 4,
                                bgcolor: '#fff',
                                overflow: 'hidden',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                p: 3.5,
                            }}>
                                <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
                                    <Box sx={{
                                        p: 1,
                                        bgcolor: '#EEF2FF',
                                        borderRadius: 2,
                                        display: 'flex',
                                    }}>
                                        <Lock sx={{ fontSize: 20, color: '#4F46E5' }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: '#111827',
                                            fontSize: '1rem',
                                        }}>
                                            Sécurité du compte
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>
                                            Modifiez votre mot de passe
                                        </Typography>
                                    </Box>
                                </Stack>

                                {success && (
                                    <Alert severity="success" sx={{
                                        mt: 2,
                                        borderRadius: 2,
                                        bgcolor: '#ECFDF5',
                                        color: '#059669',
                                        border: '1px solid #A7F3D0',
                                        '& .MuiAlert-icon': { color: '#059669' },
                                        fontWeight: 500,
                                    }}>
                                        Mot de passe mis à jour avec succès
                                    </Alert>
                                )}

                                <Stack spacing={3} sx={{ mt: 3 }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500, fontSize: '0.8125rem', mb: 1 }}>
                                            Mot de passe actuel
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            type={showOld ? 'text' : 'password'}
                                            placeholder="Entrez votre mot de passe actuel"
                                            value={pwdForm.oldPassword}
                                            onChange={e => setPwdForm({ ...pwdForm, oldPassword: e.target.value })}
                                            InputProps={{
                                                startAdornment: (
                                                    <Lock sx={{ fontSize: 18, color: '#9CA3AF', mr: 1 }} />
                                                ),
                                                endAdornment: (
                                                    <IconButton onClick={() => setShowOld(!showOld)} size="small" sx={{ color: '#9CA3AF' }}>
                                                        {showOld ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                    </IconButton>
                                                ),
                                                sx: {
                                                    borderRadius: 3,
                                                    bgcolor: '#F9FAFB',
                                                    fontSize: '0.875rem',
                                                    '& fieldset': { borderColor: '#E5E7EB' },
                                                    '&:hover fieldset': { borderColor: '#D1D5DB' },
                                                    '&.Mui-focused fieldset': { borderColor: '#4F46E5' },
                                                },
                                            }}
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500, fontSize: '0.8125rem', mb: 1 }}>
                                            Nouveau mot de passe
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            type={showNew ? 'text' : 'password'}
                                            placeholder="Minimum 6 caractères"
                                            value={pwdForm.newPassword}
                                            onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                                            InputProps={{
                                                startAdornment: (
                                                    <Lock sx={{ fontSize: 18, color: '#9CA3AF', mr: 1 }} />
                                                ),
                                                endAdornment: (
                                                    <IconButton onClick={() => setShowNew(!showNew)} size="small" sx={{ color: '#9CA3AF' }}>
                                                        {showNew ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                    </IconButton>
                                                ),
                                                sx: {
                                                    borderRadius: 3,
                                                    bgcolor: '#F9FAFB',
                                                    fontSize: '0.875rem',
                                                    '& fieldset': { borderColor: '#E5E7EB' },
                                                    '&:hover fieldset': { borderColor: '#D1D5DB' },
                                                    '&.Mui-focused fieldset': { borderColor: '#4F46E5' },
                                                },
                                            }}
                                        />

                                        {/* Barre de force */}
                                        {pwdForm.newPassword.length > 0 && (
                                            <Box sx={{ mt: 1.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ flex: 1, display: 'flex', gap: 0.5 }}>
                                                        {[0, 1, 2, 3, 4].map((i) => (
                                                            <Box
                                                                key={i}
                                                                sx={{
                                                                    flex: 1,
                                                                    height: 3,
                                                                    borderRadius: 1,
                                                                    bgcolor: i < strength ? strengthColors[strength - 1] : '#E5E7EB',
                                                                    transition: 'all 0.3s',
                                                                }}
                                                            />
                                                        ))}
                                                    </Box>
                                                    <Typography variant="caption" sx={{
                                                        color: strengthColors[strength - 1] || '#9CA3AF',
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                    }}>
                                                        Force du mot de passe : {strengthLabels[strength - 1] || 'Très faible'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500, fontSize: '0.8125rem', mb: 1 }}>
                                            Confirmer le mot de passe
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            type={showConfirm ? 'text' : 'password'}
                                            placeholder="Répétez le mot de passe"
                                            value={pwdForm.confirm}
                                            onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                                            error={pwdForm.confirm.length > 0 && pwdForm.newPassword !== pwdForm.confirm}
                                            helperText={
                                                pwdForm.confirm.length > 0
                                                    ? pwdForm.newPassword === pwdForm.confirm
                                                        ? '✓ Les mots de passe correspondent'
                                                        : '✗ Les mots de passe ne correspondent pas'
                                                    : ''
                                            }
                                            FormHelperTextProps={{
                                                sx: {
                                                    color: pwdForm.newPassword === pwdForm.confirm && pwdForm.confirm.length > 0 ? '#059669' : '#DC2626',
                                                    fontWeight: 500,
                                                    fontSize: '0.75rem',
                                                }
                                            }}
                                            InputProps={{
                                                startAdornment: (
                                                    <Lock sx={{ fontSize: 18, color: '#9CA3AF', mr: 1 }} />
                                                ),
                                                endAdornment: (
                                                    <IconButton onClick={() => setShowConfirm(!showConfirm)} size="small" sx={{ color: '#9CA3AF' }}>
                                                        {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                    </IconButton>
                                                ),
                                                sx: {
                                                    borderRadius: 3,
                                                    bgcolor: '#F9FAFB',
                                                    fontSize: '0.875rem',
                                                    '& fieldset': { borderColor: '#E5E7EB' },
                                                    '&:hover fieldset': { borderColor: '#D1D5DB' },
                                                    '&.Mui-focused fieldset': { borderColor: '#4F46E5' },
                                                },
                                            }}
                                        />
                                    </Box>
                                </Stack>

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleChangePassword}
                                        disabled={pwdLoading || !pwdForm.oldPassword || !pwdForm.newPassword || !pwdForm.confirm || pwdForm.newPassword !== pwdForm.confirm}
                                        startIcon={!pwdLoading && <Save sx={{ fontSize: 18 }} />}
                                        sx={{
                                            bgcolor: '#6366F1',
                                            '&:hover': { bgcolor: '#4F46E5' },
                                            '&:disabled': { bgcolor: '#C7D2FE', color: '#fff' },
                                            borderRadius: 3,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            px: 4,
                                            py: 1.2,
                                            boxShadow: 'none',
                                        }}
                                    >
                                        {pwdLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                    </Button>
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
                    sx={{ borderRadius: 2, fontSize: '0.8125rem', fontWeight: 500 }}
                >
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}