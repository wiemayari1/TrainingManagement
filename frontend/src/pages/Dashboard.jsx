import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Box, Grid, Paper, Typography, Card, CardContent,
  Button, Avatar, Chip, LinearProgress, IconButton,
} from '@mui/material';
import {
  School, People, Person, TrendingUp, ArrowForward,
  EmojiEvents, Assessment, CalendarToday, Add,
  CheckCircle, Schedule, Block,
} from '@mui/icons-material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { motion } from 'framer-motion';
import { statsService, formationService } from '../services/api';

const COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#06B6D4', '#8B5CF6'];

const STATUT_CONFIG = {
  TERMINEE: { label: 'Terminée', color: '#10B981', bg: '#ECFDF5', icon: CheckCircle },
  EN_COURS: { label: 'En cours', color: '#F59E0B', bg: '#FFFBEB', icon: Schedule },
  PLANIFIEE: { label: 'Planifiée', color: '#6366F1', bg: '#EEF2FF', icon: CalendarToday },
  ANNULEE: { label: 'Annulée', color: '#EF4444', bg: '#FEF2F2', icon: Block },
};

function StatCard({ title, value, icon, color, bg, trend, sub, onClick, delay = 0 }) {
  const Icon = icon;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
      <Card onClick={onClick} sx={{
        cursor: onClick ? 'pointer' : 'default', border: '1px solid #E2E8F0',
        borderRadius: 3, boxShadow: 'none', height: '100%',
        '&:hover': onClick ? { borderColor: color, boxShadow: `0 0 0 3px ${color}18` } : {},
        transition: 'all 0.2s',
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
            <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: bg }}>
              <Icon sx={{ color, fontSize: 22 }} />
            </Box>
            {trend && (
              <Chip size="small" icon={<TrendingUp sx={{ fontSize: '12px !important', color: 'inherit' }} />}
                label={trend}
                sx={{ bgcolor: `${color}18`, color, fontWeight: 700, fontSize: '0.67rem', height: 22 }} />
            )}
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '2rem', color: '#0F172A', lineHeight: 1, mb: 0.5 }}>
            {value}
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>{title}</Typography>
          {sub && <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', mt: 0.5 }}>{sub}</Typography>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, canViewStats, canManageFormations, isResponsable } = useAuthStore();
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
        setRecentFormations(all.slice(0, 4));
      }
    } catch {}
    // Fallback données démo
    setStats(prev => prev || {
      totalFormations: 24, totalParticipants: 312, totalFormateurs: 18,
      budgetTotal: 87450, tauxPresence: 94, satisfactionMoyenne: 4.8,
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
      { id: 1, titre: 'Python pour l\'analyse de données', domaineLibelle: 'Informatique', statut: 'TERMINEE', nbParticipants: 24, formateurNom: 'Ahmed Ben Ali' },
      { id: 2, titre: 'Management d\'équipe et leadership', domaineLibelle: 'Management', statut: 'TERMINEE', nbParticipants: 18, formateurNom: 'Karim Mrabet' },
      { id: 3, titre: 'Comptabilité générale avancée', domaineLibelle: 'Finance', statut: 'EN_COURS', nbParticipants: 15, formateurNom: 'Sarra Trabelsi' },
      { id: 4, titre: 'Cybersécurité et protection données', domaineLibelle: 'Informatique', statut: 'PLANIFIEE', nbParticipants: 0, formateurNom: 'Ahmed Ben Ali' },
    ]);
    setLoading(false);
  };

  if (loading) return <LinearProgress sx={{ '& .MuiLinearProgress-bar': { bgcolor: '#6366F1' } }} />;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.75rem', color: '#0F172A', letterSpacing: '-0.03em', mb: 0.5 }}>
            Bonjour, {user?.login} 👋
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.9rem' }}>
            Vue d'ensemble des activités de formation · {year}
          </Typography>
        </Box>
        <Chip icon={<CalendarToday sx={{ fontSize: 14 }} />}
          label={new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          sx={{ bgcolor: '#fff', border: '1px solid #E2E8F0', fontWeight: 500, fontSize: '0.8rem', height: 32 }} />
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {canManageFormations() && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Formations" value={stats?.totalFormations || 0} icon={School}
                color="#6366F1" bg="#EEF2FF" trend="+18%" sub={`Année ${year}`}
                onClick={() => navigate('/formations')} delay={0} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Participants" value={stats?.totalParticipants || 0} icon={People}
                color="#10B981" bg="#ECFDF5" trend="+12%" sub="inscrits aux formations"
                onClick={() => navigate('/participants')} delay={0.08} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Formateurs" value={stats?.totalFormateurs || 0} icon={Person}
                color="#F59E0B" bg="#FFFBEB" sub="internes et externes"
                onClick={() => navigate('/formateurs')} delay={0.16} />
            </Grid>
          </>
        )}
        {canViewStats() && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Satisfaction" value={`${stats?.satisfactionMoyenne || 0}/5`}
              icon={EmojiEvents} color="#EC4899" bg="#FDF2F8" trend="Excellent"
              sub="note moyenne" onClick={() => navigate('/stats')} delay={0.24} />
          </Grid>
        )}
        {canViewStats() && !canManageFormations() && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Total Formations" value={stats?.totalFormations || 0} icon={School}
                color="#6366F1" bg="#EEF2FF" trend="+18%" delay={0} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Total Participants" value={stats?.totalParticipants || 0} icon={People}
                color="#10B981" bg="#ECFDF5" trend="+12%" delay={0.08} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Taux de présence" value={`${stats?.tauxPresence || 0}%`}
                icon={CheckCircle} color="#8B5CF6" bg="#F5F3FF" delay={0.16} />
            </Grid>
          </>
        )}
      </Grid>

      {/* Charts zone */}
      {canViewStats() && stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
                      Évolution des formations
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>Formations et participants par mois</Typography>
                  </Box>
                  <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                    onClick={() => navigate('/stats')}
                    sx={{ textTransform: 'none', fontSize: '0.8rem', color: '#6366F1', fontWeight: 600 }}>
                    Détails
                  </Button>
                </Box>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={stats.evolutionMensuelle || []} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                    <defs>
                      <linearGradient id="cf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="cp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                    <Area type="monotone" dataKey="formations" stroke="#6366F1" strokeWidth={2.5} fill="url(#cf)" dot={false} name="Formations" />
                    <Area type="monotone" dataKey="participants" stroke="#10B981" strokeWidth={2.5} fill="url(#cp)" dot={false} name="Participants" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 0.5 }}>Par Domaine</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mb: 2 }}>Répartition des formations</Typography>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={stats.formationsParDomaine || []} cx="50%" cy="50%"
                      innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {(stats.formationsParDomaine || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v}`, n]} contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mt: 1 }}>
                  {(stats.formationsParDomaine || []).slice(0, 4).map((d, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[i] }} />
                        <Typography sx={{ fontSize: '0.78rem', color: '#475569' }}>{d.name}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>{d.value} séances</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Sessions récentes */}
      {canManageFormations() && (
        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>Sessions récentes</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>Dernières formations de l'année</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button size="small" variant="contained" startIcon={<Add sx={{ fontSize: 14 }} />}
                  onClick={() => navigate('/formations')}
                  sx={{ textTransform: 'none', fontSize: '0.8rem', borderRadius: 2, fontWeight: 600,
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: 'none' }}>
                  Nouvelle
                </Button>
                <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                  onClick={() => navigate('/formations')}
                  sx={{ textTransform: 'none', fontSize: '0.8rem', color: '#6366F1', fontWeight: 600 }}>
                  Voir tout
                </Button>
              </Box>
            </Box>
            <Grid container spacing={2}>
              {recentFormations.map((f, i) => {
                const cfg = STATUT_CONFIG[f.statut] || STATUT_CONFIG.PLANIFIEE;
                const StatusIcon = cfg.icon;
                return (
                  <Grid item xs={12} sm={6} lg={3} key={f.id || i}>
                    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.15 }}>
                      <Card sx={{ border: '1px solid #F1F5F9', borderRadius: 2.5, boxShadow: 'none', cursor: 'pointer',
                        '&:hover': { borderColor: '#C7D2FE', bgcolor: '#FAFBFF' }, transition: 'all 0.2s' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                            <Chip label={f.domaineLibelle || 'N/A'} size="small"
                              sx={{ bgcolor: `${COLORS[i % COLORS.length]}18`, color: COLORS[i % COLORS.length],
                                fontWeight: 600, fontSize: '0.65rem', height: 20 }} />
                            <Box sx={{ p: 0.4, borderRadius: 1, bgcolor: cfg.bg }}>
                              <StatusIcon sx={{ color: cfg.color, fontSize: 14 }} />
                            </Box>
                          </Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', mb: 0.8,
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                            {f.titre}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                              {f.nbParticipants || 0} participants
                            </Typography>
                            <Chip label={cfg.label} size="small"
                              sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.65rem', height: 18 }} />
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Responsable CTA */}
      {isResponsable() && !canManageFormations() && (
        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none',
          background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Assessment sx={{ fontSize: 48, color: '#6366F1', mb: 2 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#0F172A', mb: 1 }}>
              Accès Responsable
            </Typography>
            <Typography sx={{ color: '#64748B', mb: 3, fontSize: '0.9rem' }}>
              Consultez les statistiques et rapports détaillés pour évaluer les activités du centre.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/stats')}
              sx={{ borderRadius: 2.5, textTransform: 'none', px: 4, fontWeight: 600,
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: 'none' }}>
              Voir les statistiques
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
