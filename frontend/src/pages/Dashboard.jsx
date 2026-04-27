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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <Card onClick={onClick} sx={{
        cursor: onClick ? 'pointer' : 'default', borderRadius: 3, border: '1px solid #E2E8F0',
        bgcolor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        '&:hover': onClick ? { boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderColor: '#C7D2FE' } : {},
        transition: 'all 0.2s',
      }}>
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Avatar sx={{ bgcolor: bg, color, width: 40, height: 40 }}>
              <Icon fontSize="small" />
            </Avatar>
            {trend && (
              <Chip
                icon={<TrendingUp fontSize="small" />}
                label={trend}
                size="small"
                sx={{ bgcolor: `${color}18`, color, fontWeight: 700, fontSize: '0.65rem', height: 22 }}
              />
            )}
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
            {title}
          </Typography>
          {sub && (
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.5 }}>
              {sub}
            </Typography>
          )}
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
      { id: 1, titre: "Python pour l'analyse de données", domaineLibelle: 'Informatique', statut: 'TERMINEE', nbParticipants: 24, formateurNom: 'Ahmed Ben Ali' },
      { id: 2, titre: "Management d'équipe et leadership", domaineLibelle: 'Management', statut: 'TERMINEE', nbParticipants: 18, formateurNom: 'Karim Mrabet' },
      { id: 3, titre: 'Comptabilité générale avancée', domaineLibelle: 'Finance', statut: 'EN_COURS', nbParticipants: 15, formateurNom: 'Sarra Trabelsi' },
      { id: 4, titre: 'Cybersécurité et protection données', domaineLibelle: 'Informatique', statut: 'PLANIFIEE', nbParticipants: 0, formateurNom: 'Ahmed Ben Ali' },
    ]);
    setLoading(false);
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <LinearProgress sx={{ width: 200, borderRadius: 2 }} />
    </Box>
  );

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
            Bonjour, {user?.login} 👋
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Vue d'ensemble des activités de formation · {year}
          </Typography>
        </Box>
        <Chip
          label={new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          sx={{ bgcolor: '#fff', border: '1px solid #E2E8F0', fontWeight: 500, fontSize: '0.8rem', height: 32 }}
        />
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {canManageFormations() && (
          <>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Formations" value={stats?.totalFormations || 0} icon={School} color="#6366F1" bg="#EEF2FF" onClick={() => navigate('/formations')} delay={0} />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Participants" value={stats?.totalParticipants || 0} icon={People} color="#10B981" bg="#ECFDF5" onClick={() => navigate('/participants')} delay={0.08} />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Formateurs" value={stats?.totalFormateurs || 0} icon={Person} color="#F59E0B" bg="#FFFBEB" onClick={() => navigate('/formateurs')} delay={0.16} />
            </Grid>
          </>
        )}
        {canViewStats() && (
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard title="Budget Total" value={`${(stats?.budgetTotal || 0).toLocaleString('fr-TN')} DT`} icon={Assessment} color="#EC4899" bg="#FDF2F8" onClick={() => navigate('/stats')} delay={0.24} />
          </Grid>
        )}
        {canViewStats() && !canManageFormations() && (
          <>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Taux Présence" value={`${stats?.tauxPresence || 0}%`} icon={CheckCircle} color="#10B981" bg="#ECFDF5" delay={0.32} />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Satisfaction" value={`${stats?.satisfactionMoyenne || 0}/5`} icon={EmojiEvents} color="#F59E0B" bg="#FFFBEB" delay={0.4} />
            </Grid>
          </>
        )}
      </Grid>

      {canViewStats() && stats && (
        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0F172A', mb: 2 }}>
                Évolution des formations
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.evolutionMensuelle || []}>
                  <defs>
                    <linearGradient id="colorFormations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="mois" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                  <Area type="monotone" dataKey="formations" stroke="#6366F1" fillOpacity={1} fill="url(#colorFormations)" strokeWidth={2} />
                  <Area type="monotone" dataKey="participants" stroke="#10B981" fillOpacity={0.1} fill="#10B981" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0F172A', mb: 2 }}>
                Par Domaine
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.formationsParDomaine || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(stats.formationsParDomaine || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} formations`, '']} contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 1 }}>
                {(stats.formationsParDomaine || []).slice(0, 4).map((d, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                    <Typography variant="caption" sx={{ color: '#64748B', flex: 1 }}>{d.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 600 }}>{d.value} séances</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {canManageFormations() && (
        <Paper sx={{ mt: 3, p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0F172A' }}>
              Sessions récentes
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Dernières formations de l'année
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {recentFormations.map((f, i) => {
              const cfg = STATUT_CONFIG[f.statut] || STATUT_CONFIG.PLANIFIEE;
              const StatusIcon = cfg.icon;
              return (
                <Grid item xs={12} sm={6} lg={3} key={i}>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Paper sx={{
                      p: 2.5, borderRadius: 2.5, border: '1px solid #E2E8F0',
                      '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)', borderColor: '#C7D2FE' },
                      transition: 'all 0.2s', cursor: 'pointer',
                    }} onClick={() => navigate('/formations')}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Chip
                          icon={<StatusIcon fontSize="small" />}
                          label={cfg.label}
                          size="small"
                          sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.7rem', height: 24 }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', mb: 1, lineHeight: 1.3 }}>
                        {f.titre}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.5 }}>
                        {f.domaineLibelle}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                        {f.nbParticipants || 0} participants
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}

      {isResponsable() && !canManageFormations() && (
        <Paper sx={{ mt: 3, p: 4, borderRadius: 3, border: '1px solid #E2E8F0', textAlign: 'center' }}>
          <Assessment sx={{ fontSize: 48, color: '#6366F1', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F172A', mb: 1 }}>
            Accès Responsable
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            Consultez les statistiques et rapports détaillés pour évaluer les activités du centre.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/stats')} sx={{ bgcolor: '#6366F1', textTransform: 'none' }}>
            Voir les statistiques
          </Button>
        </Paper>
      )}
    </Box>
  );
}
