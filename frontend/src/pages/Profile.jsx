import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, TextField, Button, Typography, Paper, IconButton,
    InputAdornment, Avatar, Chip, Alert, Snackbar,
    Divider, CircularProgress, Tooltip,
} from '@mui/material';
import {
    ArrowBack, Visibility, VisibilityOff, Lock,
    Person, Email, Shield, Save, CameraAlt, CheckCircle,
    DeleteOutline,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

function PasswordStrength({ password }) {
    if (!password) return null;
    const checks = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ];
    const score = checks.filter(Boolean).length;
    const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981'];
    const labels = ['Tres faible', 'Faible', 'Moyen', 'Fort', 'Tres fort'];
    return (
        <Box sx={{ mt: 1, mb: 0.5 }}>
            <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                {[0, 1, 2, 3, 4].map(i => (
                    <Box key={i} sx={{
                        flex: 1, height: 3, borderRadius: 2,
                        bgcolor: i < score ? colors[score - 1] : '#E2E8F0',
                        transition: 'background 0.3s',
                    }} />
                ))}
            </Box>
            <Typography sx={{ fontSize: '0.7rem', color: colors[score - 1] || '#94A3B8', fontWeight: 600 }}>
                {score > 0 ? labels[score - 1] : 'Entrez un mot de passe'}
            </Typography>
        </Box>
    );
}

export default function Profile() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const fileInputRef = useRef(null);

    const [showPwd, setShowPwd] = useState({ current: false, newPwd: false, confirm: false });
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
    const [photo, setPhoto] = useState(null);
    const [photoLoading, setPhotoLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const stored = localStorage.getItem('profilePhoto_' + user?.id);
        if (stored) setPhoto(stored);
    }, [user?.id]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setSnack({ open: true, msg: 'Image trop volumineuse (max 2 Mo)', severity: 'error' });
            return;
        }
        setPhotoLoading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            setPhoto(base64);
            localStorage.setItem('profilePhoto_' + user?.id, base64);
            setPhotoLoading(false);
            setSnack({ open: true, msg: 'Photo mise a jour', severity: 'success' });
        };
        reader.readAsDataURL(file);
    };

    const handlePhotoDelete = () => {
        setPhoto(null);
        localStorage.removeItem('profilePhoto_' + user?.id);
        setSnack({ open: true, msg: 'Photo de profil supprimee', severity: 'success' });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const validate = () => {
        const errs = {};
        if (!form.currentPassword) errs.currentPassword = 'Mot de passe actuel requis';
        if (!form.newPassword) errs.newPassword = 'Nouveau mot de passe requis';
        else if (form.newPassword.length < 8) errs.newPassword = 'Minimum 8 caracteres';
        if (!form.confirmPassword) errs.confirmPassword = 'Confirmation requise';
        else if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Les mots de passe ne correspondent pas';
        return errs;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);
        try {
            const res = await api.post('/auth/change-password', {
                oldPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            if (res.data?.success) {
                setSnack({ open: true, msg: 'Mot de passe modifie avec succes. Reconnectez-vous.', severity: 'success' });
                setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => {
                    useAuthStore.getState().logout();
                    navigate('/login');
                }, 2500);
            } else {
                setSnack({ open: true, msg: res.data?.message || 'Erreur', severity: 'error' });
            }
        } catch (e) {
            setSnack({ open: true, msg: e.response?.data?.message || 'Erreur serveur', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const roleLabel = (role) => {
        if (role === 'ROLE_ADMIN') return 'Administrateur';
        if (role === 'ROLE_RESPONSABLE') return 'Responsable';
        return 'Utilisateur';
    };
    const roleColor = (role) => {
        if (role === 'ROLE_ADMIN') return { color: '#DC2626', bg: '#FEE2E2' };
        if (role === 'ROLE_RESPONSABLE') return { color: '#D97706', bg: '#FEF3C7' };
        return { color: '#059669', bg: '#DCFCE7' };
    };
    const rc = roleColor(user?.role);

    const inputSx = {
        borderRadius: '12px',
        bgcolor: '#F8FAFC',
        '& fieldset': { borderColor: '#E2E8F0', borderWidth: '1.5px' },
        '&:hover fieldset': { borderColor: '#C4B5FD' },
        '&.Mui-focused fieldset': { borderColor: '#6366F1', borderWidth: '1.5px', boxShadow: '0 0 0 3px rgba(99,102,241,0.1)' },
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F1F5F9', p: { xs: 2, md: 3 } }}>
            <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ color: '#475569', bgcolor: '#fff', border: '1px solid #E2E8F0', '&:hover': { bgcolor: '#EEF2FF', color: '#6366F1' } }}>
                        <ArrowBack fontSize="small" />
                    </IconButton>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '1.4rem', color: '#0F172A', letterSpacing: '-0.02em' }}>Mon Profil</Typography>
                        <Typography sx={{ color: '#64748B', fontSize: '0.8rem' }}>Gestion de votre compte et securite</Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>

                    {/* Colonne gauche */}
                    <Box sx={{ width: { xs: '100%', lg: 360 }, flexShrink: 0 }}>
                        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <Box sx={{
                                background: 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 50%, #6366F1 100%)',
                                p: 4, textAlign: 'center', position: 'relative', overflow: 'hidden',
                            }}>
                                <Box sx={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', top: -60, right: -40 }} />
                                <Box sx={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', bottom: -40, left: -20 }} />

                                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                                    <Avatar sx={{
                                        width: 88, height: 88, mx: 'auto',
                                        border: '3px solid rgba(255,255,255,0.3)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                        bgcolor: '#4F46E5', fontSize: '2rem', fontWeight: 700,
                                    }}>
                                        {photo
                                            ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                            : (user?.login || 'U').charAt(0).toUpperCase()
                                        }
                                    </Avatar>

                                    {/* Bouton changer photo */}
                                    <Tooltip title="Changer la photo">
                                        <Box
                                            onClick={() => fileInputRef.current?.click()}
                                            sx={{
                                                position: 'absolute', bottom: -2, right: -2,
                                                width: 30, height: 30, borderRadius: '50%',
                                                bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                                border: '2px solid #6366F1',
                                                transition: 'transform 0.2s',
                                                '&:hover': { transform: 'scale(1.1)' },
                                            }}
                                        >
                                            {photoLoading ? <CircularProgress size={14} sx={{ color: '#6366F1' }} /> : <CameraAlt sx={{ fontSize: 14, color: '#6366F1' }} />}
                                        </Box>
                                    </Tooltip>

                                    {/* Bouton supprimer photo */}
                                    {photo && (
                                        <Tooltip title="Supprimer la photo">
                                            <Box
                                                onClick={handlePhotoDelete}
                                                sx={{
                                                    position: 'absolute', bottom: -2, left: -2,
                                                    width: 30, height: 30, borderRadius: '50%',
                                                    bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                                    border: '2px solid #EF4444',
                                                    transition: 'transform 0.2s',
                                                    '&:hover': { transform: 'scale(1.1)', bgcolor: '#FEF2F2' },
                                                }}
                                            >
                                                <DeleteOutline sx={{ fontSize: 14, color: '#EF4444' }} />
                                            </Box>
                                        </Tooltip>
                                    )}
                                </Box>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />

                                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', mb: 0.5 }}>
                                    {user?.login || 'Utilisateur'}
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', mb: 2 }}>
                                    {user?.email || 'Email non renseigne'}
                                </Typography>
                                <Chip
                                    icon={<Shield sx={{ fontSize: '13px !important', color: `${rc.color} !important` }} />}
                                    label={roleLabel(user?.role)}
                                    size="small"
                                    sx={{ bgcolor: rc.bg, color: rc.color, fontWeight: 700, fontSize: '0.75rem', height: 26 }}
                                />
                            </Box>

                            <Box sx={{ p: 3 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569', mb: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Informations du compte
                                </Typography>
                                {[
                                    { icon: Person, label: 'Identifiant', value: user?.login },
                                    { icon: Email, label: 'Email', value: user?.email || 'Non renseigne' },
                                    { icon: Shield, label: 'Role', value: roleLabel(user?.role) },
                                ].map((item, i) => (
                                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: i < 2 ? '1px solid #F1F5F9' : 'none' }}>
                                        <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <item.icon sx={{ fontSize: 16, color: '#6366F1' }} />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</Typography>
                                            <Typography sx={{ fontSize: '0.875rem', color: '#0F172A', fontWeight: 600 }}>{item.value}</Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    </Box>

                    {/* Colonne droite */}
                    <Box sx={{ flex: 1 }}>
                        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                            <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Lock sx={{ color: '#6366F1', fontSize: 20 }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>Modifier le mot de passe</Typography>
                                    <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>Securisez votre compte avec un mot de passe fort</Typography>
                                </Box>
                            </Box>

                            <Box sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    <Box>
                                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', mb: 1 }}>
                                            Mot de passe actuel <span style={{ color: '#EF4444' }}>*</span>
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            type={showPwd.current ? 'text' : 'password'}
                                            value={form.currentPassword}
                                            onChange={e => { setForm({ ...form, currentPassword: e.target.value }); setErrors({ ...errors, currentPassword: '' }); }}
                                            placeholder="Votre mot de passe actuel"
                                            error={!!errors.currentPassword}
                                            helperText={errors.currentPassword}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#94A3B8', fontSize: 18 }} /></InputAdornment>,
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowPwd(p => ({ ...p, current: !p.current }))} size="small">
                                                            {showPwd.current ? <VisibilityOff sx={{ color: '#94A3B8', fontSize: 18 }} /> : <Visibility sx={{ color: '#94A3B8', fontSize: 18 }} />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                                sx: inputSx,
                                            }}
                                        />
                                    </Box>

                                    <Divider sx={{ borderColor: '#F1F5F9' }} />

                                    <Box>
                                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', mb: 1 }}>
                                            Nouveau mot de passe <span style={{ color: '#EF4444' }}>*</span>
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            type={showPwd.newPwd ? 'text' : 'password'}
                                            value={form.newPassword}
                                            onChange={e => { setForm({ ...form, newPassword: e.target.value }); setErrors({ ...errors, newPassword: '' }); }}
                                            placeholder="Minimum 8 caracteres"
                                            error={!!errors.newPassword}
                                            helperText={errors.newPassword}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#94A3B8', fontSize: 18 }} /></InputAdornment>,
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowPwd(p => ({ ...p, newPwd: !p.newPwd }))} size="small">
                                                            {showPwd.newPwd ? <VisibilityOff sx={{ color: '#94A3B8', fontSize: 18 }} /> : <Visibility sx={{ color: '#94A3B8', fontSize: 18 }} />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                                sx: inputSx,
                                            }}
                                        />
                                        <PasswordStrength password={form.newPassword} />
                                    </Box>

                                    <Box>
                                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', mb: 1 }}>
                                            Confirmer le nouveau mot de passe <span style={{ color: '#EF4444' }}>*</span>
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            type={showPwd.confirm ? 'text' : 'password'}
                                            value={form.confirmPassword}
                                            onChange={e => { setForm({ ...form, confirmPassword: e.target.value }); setErrors({ ...errors, confirmPassword: '' }); }}
                                            placeholder="Repetez le mot de passe"
                                            error={!!errors.confirmPassword}
                                            helperText={errors.confirmPassword}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#94A3B8', fontSize: 18 }} /></InputAdornment>,
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowPwd(p => ({ ...p, confirm: !p.confirm }))} size="small">
                                                            {showPwd.confirm ? <VisibilityOff sx={{ color: '#94A3B8', fontSize: 18 }} /> : <Visibility sx={{ color: '#94A3B8', fontSize: 18 }} />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    ...inputSx,
                                                    ...(form.confirmPassword && form.newPassword === form.confirmPassword ? { '& fieldset': { borderColor: '#10B981 !important' } } : {}),
                                                },
                                            }}
                                        />
                                        {form.confirmPassword && form.newPassword === form.confirmPassword && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                <CheckCircle sx={{ fontSize: 14, color: '#10B981' }} />
                                                <Typography sx={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>Les mots de passe correspondent</Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            variant="contained"
                                            startIcon={loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <Save />}
                                            sx={{
                                                py: 1.4, px: 4, borderRadius: '12px',
                                                textTransform: 'none', fontWeight: 700, fontSize: '0.9rem',
                                                background: loading ? '#CBD5E1' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                                boxShadow: loading ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
                                                '&:hover': { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' },
                                                '&:disabled': { background: '#CBD5E1', color: '#fff' },
                                            }}
                                        >
                                            {loading ? 'Modification en cours...' : 'Enregistrer le nouveau mot de passe'}
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            </Box>

            <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}