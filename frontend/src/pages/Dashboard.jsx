import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
    Box, Grid, Typography, Card, CardContent,
    Button, Avatar, Chip, LinearProgress,
} from '@mui/material';
import {
    ArrowForward, Assessment, CalendarToday, Add,
    CheckCircle, Schedule, Block, TrendingUp,
    AdminPanelSettings, Badge, EmojiEvents,
    School, People, Person,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formationService, participantService, formateurService } from '../services/api';

/* ─── Statut config ─────────────────────────────────────────────── */
const STATUT_CONFIG = {
    TERMINEE:  { label: 'Terminée',  color: '#10B981', bg: '#ECFDF5', icon: CheckCircle },
    EN_COURS:  { label: 'En cours',  color: '#F59E0B', bg: '#FFFBEB', icon: Schedule },
    PLANIFIEE: { label: 'Planifiée', color: '#6366F1', bg: '#EEF2FF', icon: CalendarToday },
    ANNULEE:   { label: 'Annulée',   color: '#EF4444', bg: '#FEF2F2', icon: Block },
};

const DOMAIN_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

/* ─── Animation variants ─────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

/* ─── Simple Greeting Header ─────────────────────────────────────── */
function SimpleGreeting({ user }) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
    const date = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <motion.div {...fadeUp(0)} style={{ marginBottom: 24 }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{
                    color: '#94A3B8',
                    mb: 0.5,
                    textTransform: 'capitalize',
                    display: 'block'
                }}>
                    {date}
                </Typography>
                <Typography variant="h2" sx={{
                    color: '#0F172A',
                    letterSpacing: '-0.02em',
                }}>
                    {greeting}, {user?.login}
                </Typography>
            </Box>
            <Box sx={{ height: 1, bgcolor: '#F1F5F9', width: '100%' }} />
        </motion.div>
    );
}

/* ─── Formation row card ─────────────────────────────────────────── */
function FormationRow({ formation, index, onClick }) {
    const cfg = STATUT_CONFIG[formation.statut] || STATUT_CONFIG.PLANIFIEE;
    const StatusIcon = cfg.icon;
    const color = DOMAIN_COLORS[index % DOMAIN_COLORS.length];

    return (
        <motion.div {...fadeUp(0.05 + index * 0.06)}>
            <Box
                onClick={onClick}
                sx={{
                    display: 'flex', alignItems: 'center', gap: 2, p: 2,
                    borderRadius: 2.5, cursor: 'pointer', border: '1px solid #F1F5F9',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: '#FAFBFF', borderColor: '#C7D2FE' },
                }}
            >
                <Avatar sx={{ width: 38, height: 38, bgcolor: `${color}18`, color, flexShrink: 0 }}>
                    <School sx={{ fontSize: 18 }} />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {formation.titre}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3, flexWrap: 'wrap' }}>
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                            {formation.domaineLibelle || '—'}
                        </Typography>
                        {formation.formateurNom && (
                            <>
                                <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#CBD5E1' }} />
                                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                                    {formation.formateurNom}
                                </Typography>
                            </>
                        )}
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
                    <Chip
                        icon={<StatusIcon sx={{ fontSize: '14px !important' }} />}
                        label={cfg.label}
                        size="small"
                        sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.75rem', height: 24 }}
                    />
                    {formation.nbParticipants > 0 && (
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                            {formation.nbParticipants} participant{formation.nbParticipants > 1 ? 's' : ''}
                        </Typography>
                    )}
                </Box>
            </Box>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function Dashboard() {
    const { user, canManageFormations, isAdmin, isResponsable } = useAuthStore();
    const navigate = useNavigate();

    const [formations, setFormations]   = useState([]);
    const [participants, setParticipants] = useState([]);
    const [formateurs, setFormateurs]   = useState([]);
    const [loading, setLoading]         = useState(true);
    const year = new Date().getFullYear();

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const results = await Promise.allSettled([
                canManageFormations() ? formationService.getAll(year) : Promise.resolve(null),
                canManageFormations() ? participantService.getAll()     : Promise.resolve(null),
                canManageFormations() ? formateurService.getAll()       : Promise.resolve(null),
            ]);
            if (results[0].status === 'fulfilled' && results[0].value)
                setFormations(results[0].value.data || []);
            if (results[1].status === 'fulfilled' && results[1].value)
                setParticipants(results[1].value.data || []);
            if (results[2].status === 'fulfilled' && results[2].value)
                setFormateurs(results[2].value.data || []);
        } catch {}
        setLoading(false);
    };

    /* Derived counts */
    const recentFormations = [...formations].slice(0, 5);

    if (loading) return (
        <Box sx={{ p: 4 }}>
            <LinearProgress sx={{ borderRadius: 2, bgcolor: '#EEF2FF', '& .MuiLinearProgress-bar': { bgcolor: '#6366F1' } }} />
        </Box>
    );

    /* ── VUE RESPONSABLE ──────────────────────────────────────────── */
    if (isResponsable() && !isAdmin()) {
        return (
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <SimpleGreeting user={user} />

                <motion.div {...fadeUp(0.1)}>
                    <Box sx={{
                        borderRadius: 3, p: 4, textAlign: 'center',
                        border: '2px dashed #C7D2FE', bgcolor: '#FAFBFF', mb: 3,
                    }}>
                        <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#EEF2FF', mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Assessment sx={{ color: '#6366F1', fontSize: 32 }} />
                        </Box>
                        <Typography variant="body1" sx={{ color: '#64748B', mb: 3, maxWidth: 400, mx: 'auto' }}>
                            Consultez les statistiques détaillées et les rapports d'activités du centre de formation Excellent Training.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<TrendingUp />}
                            onClick={() => navigate('/stats')}
                            sx={{
                                borderRadius: 2.5, px: 4, py: 1.2,
                                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: 'none',
                                '&:hover': { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' },
                            }}
                        >
                            Voir les statistiques
                        </Button>
                    </Box>
                </motion.div>
            </Box>
        );
    }

    /* ── VUE USER / ADMIN ─────────────────────────────────────────── */
    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <SimpleGreeting user={user} />

            <Grid container spacing={2.5}>
                <Grid item xs={12} lg={7}>
                    <motion.div {...fadeUp(0.1)}>
                        <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                            <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h4" sx={{ color: '#0F172A', mb: 0.5 }}>
                                        Formations récentes
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                                        Dernières sessions de l'année {year}
                                    </Typography>
                                </Box>
                                <Button
                                    size="small"
                                    endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                                    onClick={() => navigate('/formations')}
                                    sx={{ color: '#6366F1' }}
                                >
                                    Tout voir
                                </Button>
                            </Box>
                            <Box sx={{ px: 1.5, pb: 1.5 }}>
                                {recentFormations.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 4, color: '#94A3B8' }}>
                                        <School sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
                                        <Typography variant="body1">Aucune formation pour {year}</Typography>
                                        <Button
                                            size="small"
                                            startIcon={<Add />}
                                            onClick={() => navigate('/formations')}
                                            sx={{ mt: 1.5, color: '#6366F1' }}
                                        >
                                            Ajouter une formation
                                        </Button>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        {recentFormations.map((f, i) => (
                                            <FormationRow
                                                key={f.id}
                                                formation={f}
                                                index={i}
                                                onClick={() => navigate('/formations')}
                                            />
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Card>
                    </motion.div>
                </Grid>

                <Grid item xs={12} lg={5}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <motion.div {...fadeUp(0.15)}>
                            <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                                <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
                                    <Typography variant="h4" sx={{ color: '#0F172A', mb: 1.5 }}>
                                        Actions rapides
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {[
                                            { label: 'Nouvelle formation',   icon: School,  color: '#6366F1', bg: '#EEF2FF', path: '/formations' },
                                            { label: 'Nouveau participant',  icon: People,  color: '#10B981', bg: '#ECFDF5', path: '/participants' },
                                            { label: 'Nouveau formateur',    icon: Person,  color: '#F59E0B', bg: '#FFFBEB', path: '/formateurs' },
                                            ...(isAdmin() ? [{ label: 'Nouvel utilisateur', icon: AdminPanelSettings, color: '#EF4444', bg: '#FEF2F2', path: '/admin/users' }] : []),
                                        ].map((action, i) => (
                                            <Box
                                                key={i}
                                                onClick={() => navigate(action.path)}
                                                sx={{
                                                    display: 'flex', alignItems: 'center', gap: 1.5, p: 1.4,
                                                    borderRadius: 2, cursor: 'pointer', border: '1px solid #F1F5F9',
                                                    transition: 'all 0.15s',
                                                    '&:hover': { bgcolor: action.bg, borderColor: `${action.color}40` },
                                                }}
                                            >
                                                <Box sx={{ p: 0.8, borderRadius: 1.5, bgcolor: action.bg }}>
                                                    <action.icon sx={{ color: action.color, fontSize: 20 }} />
                                                </Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', flex: 1 }}>
                                                    {action.label}
                                                </Typography>
                                                <Add sx={{ fontSize: 18, color: '#CBD5E1' }} />
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                                <Box sx={{ height: 12 }} />
                            </Card>
                        </motion.div>

                        {formations.length > 0 && (
                            <motion.div {...fadeUp(0.2)}>
                                <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                                    <Box sx={{ p: 2.5 }}>
                                        <Typography variant="h4" sx={{ color: '#0F172A', mb: 1.8 }}>
                                            Répartition des formations
                                        </Typography>
                                        {Object.entries(STATUT_CONFIG).map(([key, cfg]) => {
                                            const count = formations.filter(f => f.statut === key).length;
                                            const pct   = formations.length > 0 ? Math.round(count / formations.length * 100) : 0;
                                            return (
                                                <Box key={key} sx={{ mb: 1.8 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cfg.color }} />
                                                            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>{cfg.label}</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A' }}>{count}</Typography>
                                                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>({pct}%)</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ height: 6, bgcolor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${pct}%` }}
                                                            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
                                                            style={{ height: '100%', borderRadius: 3, background: cfg.color }}
                                                        />
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Card>
                            </motion.div>
                        )}

                        {isAdmin() && (
                            <motion.div {...fadeUp(0.25)}>
                                <Card
                                    onClick={() => navigate('/stats')}
                                    sx={{
                                        borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none',
                                        cursor: 'pointer', overflow: 'hidden',
                                        '&:hover': { borderColor: '#C7D2FE', boxShadow: '0 4px 16px rgba(99,102,241,0.1)' },
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <Box sx={{ height: 3, background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #EC4899)' }} />
                                    <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: '#EEF2FF' }}>
                                            <Assessment sx={{ color: '#6366F1', fontSize: 22 }} />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                                                Statistiques & Analyses
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                                                Rapports détaillés · 2022–2026
                                            </Typography>
                                        </Box>
                                        <ArrowForward sx={{ fontSize: 18, color: '#6366F1' }} />
                                    </Box>
                                </Card>
                            </motion.div>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}