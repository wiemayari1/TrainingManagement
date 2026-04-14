import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, FormControl,
  InputLabel, Select, MenuItem, LinearProgress, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import { motion } from 'framer-motion';
import { statsService } from '../services/api';
import {
  School, People, Person, AttachMoney, TrendingUp, EmojiEvents,
} from '@mui/icons-material';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];

// ── Carte statistique ─────────────────────────────────────────────────────────
function StatCard({ icon, title, value, color, bg, sub, delay = 0 }) {
  const Icon = icon;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: bg }}>
              <Icon sx={{ color, fontSize: 22 }} />
            </Box>
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

// ── Tooltip personnalisé ──────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: '#fff', border: '1px solid #E2E8F0', borderRadius: 2, p: 1.5, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', mb: 0.5 }}>{label}</Typography>
      {payload.map((p, i) => (
        <Typography key={i} sx={{ fontSize: '0.8rem', color: p.color, fontWeight: 600 }}>
          {p.name} : {p.value}
        </Typography>
      ))}
    </Box>
  );
};

// ── Page principale Stats ─────────────────────────────────────────────────────
export default function Stats() {
  const currentYear = new Date().getFullYear();
  const [annee, setAnnee]   = useState(currentYear);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => { loadStats(); }, [annee]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await statsService.getDashboard(annee);
      setStats(res.data);
    } catch {
      // Données démo si le backend n'est pas disponible
      setStats({
        totalFormations: 24,
        totalParticipants: 312,
        totalFormateurs: 18,
        budgetTotal: 87450,
        tauxPresence: 94,
        satisfactionMoyenne: 4.8,
        formationsParDomaine: [
          { name: 'Informatique', value: 8 },
          { name: 'Management',   value: 6 },
          { name: 'Finance',      value: 5 },
          { name: 'Langues',      value: 3 },
          { name: 'Technique',    value: 2 },
        ],
        participantsParStructure: [
          { name: 'Direction Centrale',  participants: 120, formations: 10 },
          { name: 'Direction Nord',       participants: 80,  formations: 7  },
          { name: 'Direction Sud',        participants: 60,  formations: 5  },
          { name: 'Direction Est',        participants: 52,  formations: 2  },
        ],
        evolutionMensuelle: [
          { mois: 'Jan', formations: 4, participants: 45, budget: 12000 },
          { mois: 'Fév', formations: 6, participants: 62, budget: 15000 },
          { mois: 'Mar', formations: 8, participants: 89, budget: 18500 },
          { mois: 'Avr', formations: 3, participants: 34, budget: 9000  },
          { mois: 'Mai', formations: 5, participants: 56, budget: 13000 },
          { mois: 'Juin', formations: 7, participants: 78, budget: 17500 },
        ],
        topFormateurs: [
          { nom: 'Ahmed Ben Ali', type: 'INTERNE', nbFormations: 6, satisfaction: 4.9 },
          { nom: 'Karim Mrabet',  type: 'EXTERNE', nbFormations: 5, satisfaction: 4.7 },
          { nom: 'Sonia Hamdi',   type: 'INTERNE', nbFormations: 4, satisfaction: 4.8 },
          { nom: 'Youssef Rezgui', type: 'EXTERNE', nbFormations: 3, satisfaction: 4.6 },
        ],
      });
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
            Statistiques & Rapports
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.875rem' }}>
            Vue d'ensemble des activités de formation
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Année</InputLabel>
          <Select value={annee} onChange={(e) => setAnnee(e.target.value)} label="Année">
            {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {stats && (
        <>
          {/* KPIs */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <StatCard icon={School} title="Formations" value={stats.totalFormations} color="#6366F1" bg="#EEF2FF" delay={0} />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard icon={People} title="Participants" value={stats.totalParticipants} color="#10B981" bg="#DCFCE7" delay={0.05} />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard icon={Person} title="Formateurs" value={stats.totalFormateurs} color="#F59E0B" bg="#FEF3C7" delay={0.1} />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                icon={AttachMoney}
                title="Budget Total"
                value={`${(stats.budgetTotal || 0).toLocaleString()} DT`}
                color="#EF4444"
                bg="#FEE2E2"
                delay={0.15}
              />
            </Grid>
          </Grid>

          {/* Graphiques ligne 1 */}
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            {/* Évolution mensuelle */}
            <Grid item xs={12} md={8}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                  <CardContent>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', mb: 2 }}>
                      Évolution mensuelle
                    </Typography>
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={stats.evolutionMensuelle || []}>
                        <defs>
                          <linearGradient id="colorFormations" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorParticipants" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area type="monotone" dataKey="formations" name="Formations" stroke="#6366F1" fill="url(#colorFormations)" strokeWidth={2} />
                        <Area type="monotone" dataKey="participants" name="Participants" stroke="#10B981" fill="url(#colorParticipants)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Répartition par domaine */}
            <Grid item xs={12} md={4}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', height: '100%' }}>
                  <CardContent>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', mb: 2 }}>
                      Répartition par Domaine
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={stats.formationsParDomaine || []}
                          cx="50%" cy="50%"
                          innerRadius={55} outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {(stats.formationsParDomaine || []).map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <Box sx={{ mt: 1 }}>
                      {(stats.formationsParDomaine || []).map((d, i) => (
                        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.4 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                            <Typography sx={{ fontSize: '0.78rem', color: '#475569' }}>{d.name}</Typography>
                          </Box>
                          <Chip label={d.value} size="small" sx={{ height: 18, fontSize: '0.7rem', fontWeight: 700 }} />
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          {/* Graphiques ligne 2 */}
          <Grid container spacing={2.5}>
            {/* Participants par structure */}
            <Grid item xs={12} md={7}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                  <CardContent>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', mb: 2 }}>
                      Participants par Structure
                    </Typography>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={stats.participantsParStructure || []} barSize={28}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="participants" name="Participants" radius={[6, 6, 0, 0]}>
                          {(stats.participantsParStructure || []).map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Top formateurs */}
            <Grid item xs={12} md={5}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <EmojiEvents sx={{ color: '#F59E0B', fontSize: 20 }} />
                      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
                        Top Formateurs
                      </Typography>
                    </Box>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#94A3B8', py: 1 }}>#</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#94A3B8' }}>Formateur</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#94A3B8' }} align="center">Sessions</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#94A3B8' }} align="center">Note</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(stats.topFormateurs || []).map((f, i) => (
                            <TableRow key={i} sx={{ '&:hover': { bgcolor: '#FAFBFF' } }}>
                              <TableCell sx={{ py: 1 }}>
                                <Avatar sx={{
                                  width: 22, height: 22, fontSize: '0.65rem', fontWeight: 800,
                                  bgcolor: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7F32' : '#E2E8F0',
                                  color: i < 3 ? '#fff' : '#475569',
                                }}>
                                  {i + 1}
                                </Avatar>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#0F172A' }}>
                                  {f.nom}
                                </Typography>
                                <Chip label={f.type} size="small" sx={{
                                  height: 16, fontSize: '0.62rem',
                                  bgcolor: f.type === 'INTERNE' ? '#DCFCE7' : '#EDE9FE',
                                  color: f.type === 'INTERNE' ? '#15803D' : '#7C3AED',
                                }} />
                              </TableCell>
                              <TableCell align="center">
                                <Chip label={f.nbFormations} size="small" variant="outlined" sx={{ fontSize: '0.72rem', fontWeight: 700 }} />
                              </TableCell>
                              <TableCell align="center">
                                <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#F59E0B' }}>
                                  ⭐ {f.satisfaction?.toFixed(1)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
