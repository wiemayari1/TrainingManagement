import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, TextField, Button, Typography, Paper, IconButton,
    InputAdornment, Avatar, Chip,
} from '@mui/material';
import {
    ArrowBack, Visibility, VisibilityOff, Lock,
    Person, Email, Shield, Save
} from '@mui/icons-material';

export default function Profile() {
    const navigate = useNavigate();
    const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
    };

    const toggleShow = (field) => () => {
        setShowPwd(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#F8F9FB',
            p: { xs: 2, md: 4 },
        }}>
            {/* Header page */}
            <Box sx={{ maxWidth: 1200, mx: 'auto', mb: 3 }}>
                <IconButton
                    onClick={() => navigate(-1)}
                    sx={{
                        mb: 2,
                        color: '#64748B',
                        '&:hover': { bgcolor: 'rgba(99,102,241,0.08)', color: '#6366F1' }
                    }}
                >
                    <ArrowBack />
                </IconButton>
                <Typography sx={{
                    fontWeight: 700,
                    fontSize: '1.75rem',
                    color: '#0F172A',
                    mb: 0.5,
                }}>
                    Mon profil
                </Typography>
                <Typography sx={{ color: '#64748B', fontSize: '0.95rem' }}>
                    Gérez vos informations et votre sécurité
                </Typography>
            </Box>

            {/* Contenu principal */}
            <Box sx={{
                maxWidth: 1200,
                mx: 'auto',
                display: 'flex',
                gap: 3,
                flexDirection: { xs: 'column', lg: 'row' },
            }}>
                {/* ═════ COLONNE GAUCHE : Profil ═════ */}
                <Box sx={{ flex: { xs: '1 1 100%', lg: '0 0 420px' } }}>
                    <Paper elevation={0} sx={{
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                        border: '1px solid rgba(0,0,0,0.04)',
                    }}>
                        {/* Header violet */}
                        <Box sx={{
                            bgcolor: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
                            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
                            p: { xs: 3, md: 4 },
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                            {/* Cercles décoratifs subtils */}
                            <Box sx={{
                                position: 'absolute',
                                width: 200, height: 200,
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.06)',
                                top: '-60%', right: '-10%',
                            }} />
                            <Box sx={{
                                position: 'absolute',
                                width: 150, height: 150,
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.04)',
                                bottom: '-40%', left: '10%',
                            }} />

                            {/* Avatar */}
                            <Avatar sx={{
                                width: 72,
                                height: 72,
                                bgcolor: '#4F46E5',
                                color: '#fff',
                                fontSize: '1.75rem',
                                fontWeight: 700,
                                border: '3px solid rgba(255,255,255,0.3)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                flexShrink: 0,
                            }}>
                                A
                            </Avatar>

                            {/* Nom + Badges - CORRECTION ICI */}
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.2,
                                position: 'relative',
                                zIndex: 1,
                            }}>
                                <Typography sx={{
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '1.35rem',
                                    letterSpacing: '-0.01em',
                                    lineHeight: 1.2,
                                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                }}>
                                    admin
                                </Typography>

                                <Box sx={{
                                    display: 'flex',
                                    gap: 1.5,
                                    flexWrap: 'wrap',
                                }}>
                                    <Chip
                                        icon={<Shield sx={{ fontSize: 14, color: '#C4B5FD !important' }} />}
                                        label="Administrateur"
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.15)',
                                            color: '#fff',
                                            fontWeight: 600,
                                            fontSize: '0.8rem',
                                            height: 28,
                                            borderRadius: '8px',
                                            '& .MuiChip-label': { px: 1.2 },
                                            backdropFilter: 'blur(8px)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                        }}
                                    />
                                    <Chip
                                        icon={
                                            <Box sx={{
                                                width: 8, height: 8,
                                                borderRadius: '50%',
                                                bgcolor: '#4ADE80',
                                                boxShadow: '0 0 8px rgba(74,222,128,0.6)',
                                            }} />
                                        }
                                        label="Actif"
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.15)',
                                            color: '#fff',
                                            fontWeight: 600,
                                            fontSize: '0.8rem',
                                            height: 28,
                                            borderRadius: '8px',
                                            '& .MuiChip-label': { px: 1.2 },
                                            backdropFilter: 'blur(8px)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        {/* Informations personnelles */}
                        <Box sx={{ p: { xs: 3, md: 4 } }}>
                            <Typography sx={{
                                fontWeight: 700,
                                fontSize: '1.05rem',
                                color: '#0F172A',
                                mb: 0.5,
                            }}>
                                Informations personnelles
                            </Typography>
                            <Typography sx={{
                                color: '#94A3B8',
                                fontSize: '0.85rem',
                                mb: 3,
                            }}>
                                Ces informations ne peuvent pas être modifiées.
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                {/* Nom d'utilisateur */}
                                <Box sx={{
                                    bgcolor: '#F8F9FB',
                                    borderRadius: '16px',
                                    p: 2.5,
                                    border: '1px solid rgba(0,0,0,0.04)',
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Person sx={{ fontSize: 16, color: '#6366F1' }} />
                                        <Typography sx={{
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            color: '#94A3B8',
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                        }}>
                                            Nom d'utilisateur
                                        </Typography>
                                    </Box>
                                    <Typography sx={{
                                        fontWeight: 600,
                                        color: '#0F172A',
                                        fontSize: '0.95rem',
                                        pl: 0.5,
                                    }}>
                                        admin
                                    </Typography>
                                </Box>

                                {/* Email */}
                                <Box sx={{
                                    bgcolor: '#F8F9FB',
                                    borderRadius: '16px',
                                    p: 2.5,
                                    border: '1px solid rgba(0,0,0,0.04)',
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Email sx={{ fontSize: 16, color: '#6366F1' }} />
                                        <Typography sx={{
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            color: '#94A3B8',
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                        }}>
                                            Adresse email
                                        </Typography>
                                    </Box>
                                    <Typography sx={{
                                        fontWeight: 600,
                                        color: '#0F172A',
                                        fontSize: '0.95rem',
                                        pl: 0.5,
                                    }}>
                                        admin@excellent-training.tn
                                    </Typography>
                                </Box>

                                {/* Rôle */}
                                <Box sx={{
                                    bgcolor: '#F8F9FB',
                                    borderRadius: '16px',
                                    p: 2.5,
                                    border: '1px solid rgba(0,0,0,0.04)',
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Shield sx={{ fontSize: 16, color: '#10B981' }} />
                                        <Typography sx={{
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            color: '#94A3B8',
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                        }}>
                                            Rôle
                                        </Typography>
                                    </Box>
                                    <Typography sx={{
                                        fontWeight: 600,
                                        color: '#0F172A',
                                        fontSize: '0.95rem',
                                        pl: 0.5,
                                    }}>
                                        Administrateur
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Box>

                {/* ═════ COLONNE DROITE : Sécurité ═════ */}
                <Box sx={{ flex: 1 }}>
                    <Paper elevation={0} sx={{
                        borderRadius: '24px',
                        p: { xs: 3, md: 4 },
                        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                        border: '1px solid rgba(0,0,0,0.04)',
                        height: 'fit-content',
                    }}>
                        {/* Titre section */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                            <Box sx={{
                                width: 44, height: 44,
                                borderRadius: '12px',
                                bgcolor: 'rgba(99,102,241,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Lock sx={{ color: '#6366F1', fontSize: 22 }} />
                            </Box>
                            <Box>
                                <Typography sx={{
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    color: '#0F172A',
                                }}>
                                    Sécurité du compte
                                </Typography>
                                <Typography sx={{
                                    color: '#94A3B8',
                                    fontSize: '0.85rem',
                                }}>
                                    Modifiez votre mot de passe
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Mot de passe actuel */}
                            <Box>
                                <Typography sx={{
                                    fontWeight: 500,
                                    fontSize: '0.9rem',
                                    color: '#374151',
                                    mb: 1,
                                }}>
                                    Mot de passe actuel
                                </Typography>
                                <TextField
                                    fullWidth
                                    type={showPwd.current ? 'text' : 'password'}
                                    value={form.currentPassword}
                                    onChange={handleChange('currentPassword')}
                                    placeholder="Entrez votre mot de passe actuel"
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock sx={{ color: '#C4B5FD', fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={toggleShow('current')} size="small">
                                                    {showPwd.current ? <VisibilityOff sx={{ color: '#9CA3AF' }} /> : <Visibility sx={{ color: '#9CA3AF' }} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: '14px',
                                            bgcolor: '#F9FAFB',
                                            '& fieldset': {
                                                borderColor: '#E5E7EB',
                                                borderWidth: '1.5px',
                                            },
                                            '&:hover fieldset': { borderColor: '#C4B5FD' },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#6366F1',
                                                borderWidth: '1.5px',
                                                boxShadow: '0 0 0 3px rgba(99,102,241,0.1)',
                                            },
                                        },
                                    }}
                                />
                            </Box>

                            {/* Nouveau mot de passe */}
                            <Box>
                                <Typography sx={{
                                    fontWeight: 500,
                                    fontSize: '0.9rem',
                                    color: '#374151',
                                    mb: 1,
                                }}>
                                    Nouveau mot de passe
                                </Typography>
                                <TextField
                                    fullWidth
                                    type={showPwd.new ? 'text' : 'password'}
                                    value={form.newPassword}
                                    onChange={handleChange('newPassword')}
                                    placeholder="Minimum 6 caractères"
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock sx={{ color: '#C4B5FD', fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={toggleShow('new')} size="small">
                                                    {showPwd.new ? <VisibilityOff sx={{ color: '#9CA3AF' }} /> : <Visibility sx={{ color: '#9CA3AF' }} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: '14px',
                                            bgcolor: '#F9FAFB',
                                            '& fieldset': {
                                                borderColor: '#E5E7EB',
                                                borderWidth: '1.5px',
                                            },
                                            '&:hover fieldset': { borderColor: '#C4B5FD' },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#6366F1',
                                                borderWidth: '1.5px',
                                                boxShadow: '0 0 0 3px rgba(99,102,241,0.1)',
                                            },
                                        },
                                    }}
                                />
                            </Box>

                            {/* Confirmer */}
                            <Box>
                                <Typography sx={{
                                    fontWeight: 500,
                                    fontSize: '0.9rem',
                                    color: '#374151',
                                    mb: 1,
                                }}>
                                    Confirmer le mot de passe
                                </Typography>
                                <TextField
                                    fullWidth
                                    type={showPwd.confirm ? 'text' : 'password'}
                                    value={form.confirmPassword}
                                    onChange={handleChange('confirmPassword')}
                                    placeholder="Répétez le mot de passe"
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock sx={{ color: '#C4B5FD', fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={toggleShow('confirm')} size="small">
                                                    {showPwd.confirm ? <VisibilityOff sx={{ color: '#9CA3AF' }} /> : <Visibility sx={{ color: '#9CA3AF' }} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: '14px',
                                            bgcolor: '#F9FAFB',
                                            '& fieldset': {
                                                borderColor: '#E5E7EB',
                                                borderWidth: '1.5px',
                                            },
                                            '&:hover fieldset': { borderColor: '#C4B5FD' },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#6366F1',
                                                borderWidth: '1.5px',
                                                boxShadow: '0 0 0 3px rgba(99,102,241,0.1)',
                                            },
                                        },
                                    }}
                                />
                            </Box>

                            {/* Bouton */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<Save />}
                                    sx={{
                                        py: 1.4,
                                        px: 4,
                                        borderRadius: '14px',
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        fontSize: '0.95rem',
                                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%)',
                                            boxShadow: '0 8px 25px rgba(99,102,241,0.4)',
                                        },
                                        boxShadow: '0 4px 15px rgba(99,102,241,0.35)',
                                    }}
                                >
                                    Enregistrer les modifications
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}