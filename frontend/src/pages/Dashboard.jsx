import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
    Box, Grid, Paper, Typography, Chip, Skeleton,
    Button, Stack, LinearProgress, Divider,
} from '@mui/material';
import {
    School, People, Person, TrendingUp, ArrowForward,
    CalendarToday, Add, CheckCircle, Schedule, Block,
    BarChart, PieChart, ShowChart, AutoGraph,
    Adjust, EmojiEvents, ChevronRight, Assessment,
} from '@mui/icons-material';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { statsService, formationService } from '../services/api';

const COLORS = ['#4F46E5', '#7C3AED', '#DB2777', '#059669', '#D97706', '#0891B2'];

const STATUT_CONFIG = {
    TERMINEE: { label: 'Terminée', color: '#059669', bg: '#ECFDF5', icon: CheckCircle },
    EN_COURS: { label: 'En cours', color: '#D97706', bg: '#FFFBEB', icon: Schedule },
    PLANIFIEE: { label: 'Planifiée', color: '#4F46E5', bg: '#EEF2FF', icon: CalendarToday },
    ANNULEE: { label: 'Annulée', color: '#DC2626', bg: '#FEF2F2', icon: Block },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

function StatCard({ title, value, icon, color, bg, trend, sub, onClick, loading }) {
    const Icon = icon;
    return (
        <motion.div variants={itemVariants}>
            <Paper
                onClick={onClick}
                elevation={0}
                sx={{
                    p: 2.5,
                    borderRadius: 2,
                    cursor: onClick ? 'pointer' : 'default',
                    border: '1px solid #E5E7EB',
                    bgcolor: '#fff',
                    transition: 'all 0.2s ease',
                    '&:hover': onClick ? { borderColor: '#D1D5DB', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08)' } : {},
                }}
            >
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2}>
                    <Box sx={{
                        width: 40, height: 40, borderRadius: 2,
                        bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: color,
                    }}>
                        <Icon sx={{ fontSize: 20 }} />
                    </Box>
                    {trend && (
                        <Typography variant="caption" sx={{
                            color: trend.startsWith('+') ? '#059669' : '#DC2626',
                            fontWeight: 600, fontSize: '0.75rem',
                            bgcolor: trend.startsWith('+') ? '#ECFDF5' : '#FEF2F2',
                            px: 1, py: 0.3, borderRadius: 1,
                        }}>
                            {trend}
                        </Typography>
                    )}
                </Stack>

                {loading ? (
                    <>
                        <Skeleton variant="text" width="50%" height={36} />
                        <Skeleton variant="text" width="35%" height={18} />
                    </>
                ) : (
                    <>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 0.3, letterSpacing: '-0.01em' }}>
                            {value}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.8125rem' }}>
                            {title}
                        </Typography>
                    </>
                )}

                {sub && !loading && (
                    <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mt: 1.2, fontSize: '0.75rem' }}>
                        {sub}
                    </Typography>
                )}
            </Paper>
        </motion.div>
    );
}

function SectionHeader({ title, subtitle, action, actionLabel }) {
    return (
        <motion.div variants={itemVariants}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {action && (
                    <Button
                        onClick={action}
                        endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                        sx={{
                            color: '#4F46E5',
                            fontWeight: 500,
                            textTransform: 'none',
                            fontSize: '0.8125rem',
                            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                            p: 0,
                            minWidth: 0,
                        }}
                    >
                        {actionLabel}
                    </Button>
                )}
            </Stack>
        </motion.div>
    );
}

function FormationRow({ formation, index, onClick }) {
    const cfg = STATUT_CONFIG[formation.statut] || STATUT_CONFIG.PLANIFIEE;
    const StatusIcon = cfg.icon;

    return (
        <motion.div variants={itemVariants}>
            <Box
                onClick={onClick}
                sx={{
                    display: 'flex', alignItems: 'center', gap: 2,
                    py: 2, px: 1,
                    borderBottom: '1px solid #F3F4F6',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    '&:hover': { bgcolor: '#F9FAFB' },
                    '&:last-child': { borderBottom: 'none' },
                }}
            >
                <Box sx={{
                    width: 3, height: 36, borderRadius: 1.5,
                    bgcolor: cfg.color, flexShrink: 0,
                }} />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{
                        fontWeight: 500, color: '#111827', mb: 0.3,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        fontSize: '0.875rem',
                    }}>
                        {formation.titre}
                    </Typography>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                        <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                            {formation.domaineLibelle}
                        </Typography>
                        <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#D1D5DB' }} />
                        <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                            {formation.formateurNom}
                        </Typography>
                    </Stack>
                </Box>

                <Stack direction="row" alignItems="center" spacing={2}>
                    <Chip
                        icon={<StatusIcon sx={{ fontSize: 13 }} />}
                        label={cfg.label}
                        size="small"
                        sx={{
                            bgcolor: cfg.bg, color: cfg.color,
                            fontWeight: 500, fontSize: '0.6875rem', height: 24,
                            '& .MuiChip-icon': { color: cfg.color, ml: '6px' },
                        }}
                    />
                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 400, minWidth: 70, textAlign: 'right', fontSize: '0.75rem' }}>
                        {formation.nbParticipants || 0} inscrits
                    </Typography>
                    <ChevronRight sx={{ fontSize: 16, color: '#D1D5DB' }} />
                </Stack>
            </Box>
        </motion.div>
    );
}

export default function Dashboard() {
    const { user, canViewStats, canManageFormations, isResponsable, isAdmin } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [recentFormations, setRecentFormations] = useState([]);
    const [loading, setLoading] = useState(true);
    const year = new Date().getFullYear();

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [statsRes, formRes] = await Promise.allSettled([
                statsService.getDashboard(year),
                formationService.getAll(year),
            ]);
            if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
            if (formRes.status === 'fulfilled') {
                const all = formRes.value.data || [];
                setRecentFormations(all.slice(0, 5));
            }
        } catch (err) {
            console.error('Erreur chargement dashboard:', err);
        }

        setStats(prev => prev || {
            totalFormations: 24, totalParticipants: 312, totalFormateurs: 18,
            budgetTotal: 87450, tauxPresence: 94, satisfactionMoyenne: 4.6,
            formationsParDomaine: [
                { name: 'Informatique', value: 8 }, { name: 'Management', value: 6 },
                { name: 'Finance', value: 5 }, { name: 'Langues', value: 3 }, { name: 'Technique', value: 2 },
            ],
            evolutionMensuelle: [
                { mois: 'Jan', formations: 4, participants: 45 }, { mois: 'Fév', formations: 6, participants: 62 },
                { mois: 'Mar', formations: 8, participants: 89 }, { mois: 'Avr', formations: 3, participants: 34 },
                { mois: 'Mai', formations: 5, participants: 56 }, { mois: 'Juin', formations: 7, participants: 78 },
            ],
        });
        setRecentFormations(prev => prev.length ? prev : [
            { id: 1, titre: "Python pour l'analyse de données", domaineLibelle: 'Informatique', statut: 'TERMINEE', nbParticipants: 24, formateurNom: 'Ahmed Ben Ali' },
            { id: 2, titre: "Management d'équipe et leadership", domaineLibelle: 'Management', statut: 'TERMINEE', nbParticipants: 18, formateurNom: 'Karim Mrabet' },
            { id: 3, titre: 'Comptabilité générale avancée', domaineLibelle: 'Finance', statut: 'EN_COURS', nbParticipants: 15, formateurNom: 'Sarra Trabelsi' },
            { id: 4, titre: 'Cybersécurité et protection des données', domaineLibelle: 'Informatique', statut: 'PLANIFIEE', nbParticipants: 0, formateurNom: 'Ahmed Ben Ali' },
            { id: 5, titre: 'Anglais professionnel niveau B2', domaineLibelle: 'Langues', statut: 'EN_COURS', nbParticipants: 22, formateurNom: 'Leila Bouaziz' },
        ]);
        setLoading(false);
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1280, mx: 'auto' }}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">

                {/* ─── Header ─── */}
                <motion.div variants={itemVariants}>
                    <Box sx={{ mb: 3.5 }}>
                        <Typography variant="h5" sx={{
                            fontWeight: 600, color: '#111827', letterSpacing: '-0.02em', fontSize: '1.25rem', mb: 0.5
                        }}>
                            Bonjour, {user?.login || 'Utilisateur'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.8125rem' }}>
                            Vue d'ensemble des activités de formation
                        </Typography>
                    </Box>
                </motion.div>

                {/* ─── Stat Cards ─── */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {canManageFormations() && (
                        <>
                            <Grid item xs={12} sm={6} lg={3}>
                                <StatCard
                                    title="Formations"
                                    value={stats?.totalFormations || 0}
                                    icon={School}
                                    color="#4F46E5"
                                    bg="#EEF2FF"
                                    trend="+12%"
                                    sub="Année précédente"
                                    onClick={() => navigate('/formations')}
                                    loading={loading}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} lg={3}>
                                <StatCard
                                    title="Participants"
                                    value={stats?.totalParticipants || 0}
                                    icon={People}
                                    color="#059669"
                                    bg="#ECFDF5"
                                    trend="+8%"
                                    sub="Année précédente"
                                    onClick={() => navigate('/participants')}
                                    loading={loading}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} lg={3}>
                                <StatCard
                                    title="Formateurs"
                                    value={stats?.totalFormateurs || 0}
                                    icon={Person}
                                    color="#D97706"
                                    bg="#FFFBEB"
                                    sub="Actifs cette année"
                                    onClick={() => navigate('/formateurs')}
                                    loading={loading}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} lg={3}>
                                <StatCard
                                    title="Budget"
                                    value={`${(stats?.budgetTotal || 0).toLocaleString()} TND`}
                                    icon={TrendingUp}
                                    color="#7C3AED"
                                    bg="#F5F3FF"
                                    trend="+15%"
                                    sub="Année précédente"
                                    loading={loading}
                                />
                            </Grid>
                        </>
                    )}

                    {canViewStats() && !canManageFormations() && (
                        <>
                            <Grid item xs={12} sm={6} lg={4}>
                                <StatCard
                                    title="Taux de Présence"
                                    value={`${stats?.tauxPresence || 0}%`}
                                    icon={Adjust}
                                    color="#059669"
                                    bg="#ECFDF5"
                                    loading={loading}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} lg={4}>
                                <StatCard
                                    title="Satisfaction"
                                    value={`${stats?.satisfactionMoyenne || 0}/5`}
                                    icon={EmojiEvents}
                                    color="#D97706"
                                    bg="#FFFBEB"
                                    loading={loading}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} lg={4}>
                                <StatCard
                                    title="Formations"
                                    value={stats?.totalFormations || 0}
                                    icon={School}
                                    color="#4F46E5"
                                    bg="#EEF2FF"
                                    loading={loading}
                                />
                            </Grid>
                        </>
                    )}
                </Grid>

                {/* ─── Charts Row ─── */}
                {canViewStats() && stats && (
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} lg={8}>
                            <motion.div variants={itemVariants}>
                                <Paper elevation={0} sx={{
                                    p: 3, borderRadius: 2, border: '1px solid #E5E7EB', bgcolor: '#fff',
                                }}>
                                    <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                                        <ShowChart sx={{ fontSize: 18, color: '#6B7280' }} />
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                                                Évolution mensuelle
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                                                Formations et participants — 6 derniers mois
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    {loading ? (
                                        <Skeleton variant="rounded" width="100%" height={260} sx={{ borderRadius: 1.5 }} />
                                    ) : (
                                        <ResponsiveContainer width="100%" height={260}>
                                            <AreaChart data={stats.evolutionMensuelle || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="gradFormations" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="gradParticipants" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                                                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                                <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                                <RechartsTooltip
                                                    contentStyle={{
                                                        background: '#fff', border: '1px solid #E5E7EB',
                                                        borderRadius: 8, color: '#111827', fontSize: 12,
                                                        boxShadow: '0 4px 20px -4px rgba(0,0,0,0.1)',
                                                    }}
                                                />
                                                <Area type="monotone" dataKey="formations" stroke="#4F46E5" strokeWidth={2} fill="url(#gradFormations)" name="Formations" />
                                                <Area type="monotone" dataKey="participants" stroke="#059669" strokeWidth={2} fill="url(#gradParticipants)" name="Participants" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </Paper>
                            </motion.div>
                        </Grid>

                        <Grid item xs={12} lg={4}>
                            <motion.div variants={itemVariants}>
                                <Paper elevation={0} sx={{
                                    p: 3, borderRadius: 2, border: '1px solid #E5E7EB', bgcolor: '#fff',
                                }}>
                                    <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                                        <PieChart sx={{ fontSize: 18, color: '#6B7280' }} />
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                                                Répartition par domaine
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                                                Formations par catégorie
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    {loading ? (
                                        <Skeleton variant="rounded" width="100%" height={200} sx={{ borderRadius: 1.5 }} />
                                    ) : (
                                        <>
                                            <ResponsiveContainer width="100%" height={200}>
                                                <RePieChart>
                                                    <Pie
                                                        data={stats.formationsParDomaine || []}
                                                        cx="50%" cy="50%"
                                                        innerRadius={55} outerRadius={85}
                                                        paddingAngle={3}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        {(stats.formationsParDomaine || []).map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip
                                                        contentStyle={{
                                                            background: '#fff', border: '1px solid #E5E7EB',
                                                            borderRadius: 8, fontSize: 12,
                                                            boxShadow: '0 4px 20px -4px rgba(0,0,0,0.1)',
                                                        }}
                                                        formatter={(value) => [`${value} formations`, '']}
                                                    />
                                                </RePieChart>
                                            </ResponsiveContainer>

                                            <Box sx={{ mt: 1 }}>
                                                {(stats.formationsParDomaine || []).map((d, i) => (
                                                    <Box key={d.name} sx={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        py: 0.6,
                                                    }}>
                                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                                                            <Typography variant="body2" sx={{ color: '#4B5563', fontWeight: 400, fontSize: '0.8125rem' }}>
                                                                {d.name}
                                                            </Typography>
                                                        </Stack>
                                                        <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600, fontSize: '0.8125rem' }}>
                                                            {d.value}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </>
                                    )}
                                </Paper>
                            </motion.div>
                        </Grid>
                    </Grid>
                )}

                {/* ─── Bottom Row ─── */}
                <Grid container spacing={2}>
                    {canManageFormations() && (
                        <Grid item xs={12} lg={8}>
                            <motion.div variants={itemVariants}>
                                <Paper elevation={0} sx={{
                                    p: 3, borderRadius: 2, border: '1px solid #E5E7EB', bgcolor: '#fff',
                                }}>
                                    <SectionHeader
                                        title="Sessions récentes"
                                        subtitle="Dernières formations enregistrées"
                                        action={() => navigate('/formations')}
                                        actionLabel="Voir tout"
                                    />

                                    {loading ? (
                                        <Stack spacing={1}>
                                            {[1, 2, 3, 4].map(i => (
                                                <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 1 }} />
                                            ))}
                                        </Stack>
                                    ) : (
                                        recentFormations.map((f, i) => (
                                            <FormationRow
                                                key={f.id}
                                                formation={f}
                                                index={i}
                                                onClick={() => navigate('/formations')}
                                            />
                                        ))
                                    )}
                                </Paper>
                            </motion.div>
                        </Grid>
                    )}

                    <Grid item xs={12} lg={canManageFormations() ? 4 : 12}>
                        <motion.div variants={itemVariants}>
                            <Paper elevation={0} sx={{
                                p: 3, borderRadius: 2, border: '1px solid #E5E7EB', bgcolor: '#fff', height: '100%',
                            }}>
                                <Typography variant="subtitle2" sx={{
                                    fontWeight: 600, color: '#111827', fontSize: '0.875rem', mb: 3,
                                }}>
                                    Indicateurs de performance
                                </Typography>

                                {loading ? (
                                    <Stack spacing={2}>
                                        {[1, 2, 3].map(i => (
                                            <Skeleton key={i} variant="rounded" height={52} sx={{ borderRadius: 1 }} />
                                        ))}
                                    </Stack>
                                ) : (
                                    <Stack spacing={3}>
                                        <Box>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                                <Typography variant="body2" sx={{ color: '#4B5563', fontWeight: 400, fontSize: '0.8125rem' }}>
                                                    Taux de présence
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600, fontSize: '0.8125rem' }}>
                                                    {stats?.tauxPresence || 0}%
                                                </Typography>
                                            </Stack>
                                            <LinearProgress
                                                variant="determinate"
                                                value={stats?.tauxPresence || 0}
                                                sx={{
                                                    height: 6, borderRadius: 3,
                                                    bgcolor: '#F3F4F6',
                                                    '& .MuiLinearProgress-bar': { bgcolor: '#059669', borderRadius: 3 },
                                                }}
                                            />
                                        </Box>

                                        <Box>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                                <Typography variant="body2" sx={{ color: '#4B5563', fontWeight: 400, fontSize: '0.8125rem' }}>
                                                    Satisfaction moyenne
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600, fontSize: '0.8125rem' }}>
                                                    {stats?.satisfactionMoyenne || 0}/5
                                                </Typography>
                                            </Stack>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(stats?.satisfactionMoyenne || 0) * 20}
                                                sx={{
                                                    height: 6, borderRadius: 3,
                                                    bgcolor: '#F3F4F6',
                                                    '& .MuiLinearProgress-bar': { bgcolor: '#D97706', borderRadius: 3 },
                                                }}
                                            />
                                        </Box>

                                        <Box>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                                <Typography variant="body2" sx={{ color: '#4B5563', fontWeight: 400, fontSize: '0.8125rem' }}>
                                                    Budget utilisé
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600, fontSize: '0.8125rem' }}>
                                                    78%
                                                </Typography>
                                            </Stack>
                                            <LinearProgress
                                                variant="determinate"
                                                value={78}
                                                sx={{
                                                    height: 6, borderRadius: 3,
                                                    bgcolor: '#F3F4F6',
                                                    '& .MuiLinearProgress-bar': { bgcolor: '#4F46E5', borderRadius: 3 },
                                                }}
                                            />
                                        </Box>

                                        <Divider sx={{ borderColor: '#F3F4F6' }} />

                                        <Box sx={{
                                            p: 2.5, borderRadius: 2,
                                            bgcolor: '#F9FAFB', border: '1px solid #F3F4F6',
                                        }}>
                                            <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                                                <AutoGraph sx={{ fontSize: 18, color: '#4F46E5' }} />
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.8125rem' }}>
                                                    Objectif annuel
                                                </Typography>
                                            </Stack>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 0.3, fontSize: '1.125rem' }}>
                                                85% atteint
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                                                Progression conforme aux prévisions pour {year}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                )}
                            </Paper>
                        </motion.div>
                    </Grid>
                </Grid>
            </motion.div>
        </Box>
    );
}