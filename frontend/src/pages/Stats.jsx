import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, FormControl,
  InputLabel, Select, MenuItem, LinearProgress, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  ToggleButton, ToggleButtonGroup, Tabs, Tab, Alert,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart,
} from 'recharts';
import { motion } from 'framer-motion';
import { statsService } from '../services/api';
import {
  School, People, Person, AttachMoney, TrendingUp, EmojiEvents,
  CompareArrows, BarChart as BarIcon, ShowChart, PieChart as PieIcon,
  CheckCircle, HourglassEmpty,
} from '@mui/icons-material';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];
const YEAR_COLORS = { 0: '#6366F1', 1: '#10B981', 2: '#F59E0B' };

// ── Tooltip personnalisé ──────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: 2,
      p: 1.5, boxShadow: '0 20px 40px rgba(0,0,0,0.3)', minWidth: 160,
    }}>
      <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#94A3B8', mb: 0.5 }}>{label}</Typography>
      {payload.map((p, i) => (
        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Typography sx={{ fontSize: '0.8rem', color: p.color || '#fff' }}>{p.name}</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>
            {typeof p.value === 'number' && p.value > 1000
              ? `${p.value.toLocaleString()} DT`
              : p.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ── Carte KPI ─────────────────────────────────────────────────────────────────
function KpiCard({ icon, title, value, color, bg, sub, trend, delay = 0 }) {
  const Icon = icon;
  const isPositive = trend && !trend.startsWith('-');
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: bg }}>
              <Icon sx={{ color, fontSize: 22 }} />
            </Box>
            {trend && (
              <Chip
                size="small"
                icon={<TrendingUp sx={{ fontSize: '11px !important', transform: isPositive ? 'none' : 'scaleY(-1)' }} />}
                label={trend}
                sx={{
                  bgcolor: isPositive ? '#DCFCE7' : '#FEE2E2',
                  color: isPositive ? '#15803D' : '#DC2626',
                  fontWeight: 700, fontSize: '0.67rem', height: 22,
                }}
              />
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

// ── Données démo enrichies ─────────────────────────────────────────────────────
const generateDemoData = (year) => ({
  totalFormations: year === 2025 ? 24 : year === 2024 ? 19 : 15,
  totalParticipants: year === 2025 ? 312 : year === 2024 ? 248 : 187,
  totalFormateurs: year === 2025 ? 18 : year === 2024 ? 14 : 11,
  budgetTotal: year === 2025 ? 87450 : year === 2024 ? 68200 : 52100,
  tauxPresence: year === 2025 ? 94 : year === 2024 ? 89 : 85,
  formationsParDomaine: [
    { name: 'Informatique', value: year === 2025 ? 8 : year === 2024 ? 6 : 5, budget: year === 2025 ? 28000 : 22000 },
    { name: 'Management', value: year === 2025 ? 6 : year === 2024 ? 5 : 3, budget: year === 2025 ? 18000 : 15000 },
    { name: 'Finance', value: year === 2025 ? 5 : year === 2024 ? 4 : 4, budget: year === 2025 ? 16000 : 12000 },
    { name: 'Langues', value: year === 2025 ? 3 : year === 2024 ? 2 : 2, budget: year === 2025 ? 9000 : 7000 },
    { name: 'Juridique', value: year === 2025 ? 2 : year === 2024 ? 2 : 1, budget: year === 2025 ? 16450 : 12200 },
  ],
  evolutionMensuelle: ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'].map((mois, i) => ({
    mois,
    formations: Math.max(0, Math.floor(Math.sin(i / 2) * 3 + (year === 2025 ? 4 : year === 2024 ? 3 : 2) + Math.random() * 2)),
    participants: Math.max(0, Math.floor(Math.sin(i / 2) * 20 + (year === 2025 ? 35 : year === 2024 ? 28 : 20) + Math.random() * 10)),
    budget: Math.floor((year === 2025 ? 7000 : year === 2024 ? 5500 : 4200) + Math.random() * 3000),
  })),
  formationsParStatut: [
    { name: 'Terminées', value: year === 2025 ? 14 : year === 2024 ? 12 : 10, color: '#10B981' },
    { name: 'En cours', value: year === 2025 ? 4 : year === 2024 ? 2 : 1, color: '#F59E0B' },
    { name: 'Planifiées', value: year === 2025 ? 5 : year === 2024 ? 4 : 3, color: '#6366F1' },
    { name: 'Annulées', value: year === 2025 ? 1 : year === 2024 ? 1 : 1, color: '#EF4444' },
  ],
  topFormateurs: [
    { nom: 'Ahmed Ben Ali', type: 'INTERNE', nbFormations: year === 2025 ? 6 : 5, satisfaction: 4.9 },
    { nom: 'Karim Mrabet', type: 'INTERNE', nbFormations: year === 2025 ? 5 : 4, satisfaction: 4.8 },
    { nom: 'Sonia Hamdi', type: 'EXTERNE', nbFormations: year === 2025 ? 4 : 3, satisfaction: 4.7 },
    { nom: 'Rania Gharbi', type: 'EXTERNE', nbFormations: year === 2025 ? 3 : 3, satisfaction: 4.6 },
  ],
  participantsParStructure: [
    { name: 'Dir. Centrale IT', participants: year === 2025 ? 120 : 95 },
    { name: 'Dir. Financière', participants: year === 2025 ? 80 : 62 },
    { name: 'Dir. Nord', participants: year === 2025 ? 60 : 48 },
    { name: 'Dir. RH', participants: year === 2025 ? 52 : 43 },
  ],
  budgetParTrimestre: [
    { trimestre: 'T1', budget: year === 2025 ? 22000 : 17000, objectif: 25000 },
    { trimestre: 'T2', budget: year === 2025 ? 24500 : 18500, objectif: 25000 },
    { trimestre: 'T3', budget: year === 2025 ? 21000 : 16500, objectif: 20000 },
    { trimestre: 'T4', budget: year === 2025 ? 19950 : 16200, objectif: 20000 },
  ],
  notesMoyennesParDomaine: [
    { domaine: 'Informatique', note: year === 2025 ? 15.2 : 14.5 },
    { domaine: 'Management', note: year === 2025 ? 14.8 : 14.0 },
    { domaine: 'Finance', note: year === 2025 ? 13.9 : 13.2 },
    { domaine: 'Langues', note: year === 2025 ? 16.1 : 15.5 },
    { domaine: 'Juridique', note: year === 2025 ? 14.3 : 13.8 },
  ],
});

// ── Comparaison multi-années ───────────────────────────────────────────────────
function buildComparisonData(allStats, selectedYears) {
  const months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'];
  return months.map((mois, i) => {
    const row = { mois };
    selectedYears.forEach(year => {
      const d = allStats[year]?.evolutionMensuelle?.[i];
      row[`formations_${year}`] = d?.formations || 0;
      row[`participants_${year}`] = d?.participants || 0;
      row[`budget_${year}`] = d?.budget || 0;
    });
    return row;
  });
}

function buildKpiComparison(allStats, selectedYears) {
  return selectedYears.map(year => ({
    year,
    formations: allStats[year]?.totalFormations || 0,
    participants: allStats[year]?.totalParticipants || 0,
    budget: allStats[year]?.budgetTotal || 0,
    presence: allStats[year]?.tauxPresence || 0,
  }));
}

// ═══════════════════════════════════════════════════════════════════
export default function Stats() {
  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear, currentYear - 1, currentYear - 2];

  const [primaryYear, setPrimaryYear] = useState(currentYear);
  const [compareYears, setCompareYears] = useState([]);
  const [allStats, setAllStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [chartMode, setChartMode] = useState('formations');
  const [error, setError] = useState(null);

  // Charger les stats pour une année
  const loadYearStats = useCallback(async (year) => {
    if (allStats[year]) return;
    try {
      const res = await statsService.getDashboard(year);
      setAllStats(prev => ({ ...prev, [year]: res.data }));
    } catch {
      // fallback démo
      setAllStats(prev => ({ ...prev, [year]: generateDemoData(year) }));
    }
  }, [allStats]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all(availableYears.map(y => loadYearStats(y)));
      setLoading(false);
    };
    load();
  }, []);

  const stats = allStats[primaryYear] || generateDemoData(primaryYear);
  const activeYears = [primaryYear, ...compareYears].filter((v, i, a) => a.indexOf(v) === i);
  const comparisonData = buildComparisonData(allStats, activeYears);
  const kpiComparison = buildKpiComparison(allStats, activeYears);

  const toggleCompareYear = (year) => {
    if (year === primaryYear) return;
    setCompareYears(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year].slice(0, 2)
    );
  };

  // Calcul tendance vs année précédente
  const prevStats = allStats[primaryYear - 1] || generateDemoData(primaryYear - 1);
  const trendFormations = prevStats.totalFormations > 0
    ? `+${Math.round((stats.totalFormations - prevStats.totalFormations) / prevStats.totalFormations * 100)}%`
    : null;
  const trendParticipants = prevStats.totalParticipants > 0
    ? `+${Math.round((stats.totalParticipants - prevStats.totalParticipants) / prevStats.totalParticipants * 100)}%`
    : null;
  const trendBudget = prevStats.budgetTotal > 0
    ? `+${Math.round((stats.budgetTotal - prevStats.budgetTotal) / prevStats.budgetTotal * 100)}%`
    : null;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
            Statistiques & Rapports
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.875rem' }}>
            Suivi et évaluation des activités de formation
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Sélecteur année principale */}
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel>Année</InputLabel>
            <Select value={primaryYear} onChange={(e) => setPrimaryYear(e.target.value)} label="Année">
              {availableYears.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </Select>
          </FormControl>

          {/* Boutons comparaison */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Comparer avec:</Typography>
            {availableYears.filter(y => y !== primaryYear).map(y => (
              <Chip
                key={y}
                label={y}
                size="small"
                onClick={() => toggleCompareYear(y)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: compareYears.includes(y) ? YEAR_COLORS[availableYears.indexOf(y)] + '20' : '#F1F5F9',
                  color: compareYears.includes(y) ? YEAR_COLORS[availableYears.indexOf(y)] : '#64748B',
                  border: `1px solid ${compareYears.includes(y) ? YEAR_COLORS[availableYears.indexOf(y)] : 'transparent'}`,
                  fontWeight: 700,
                  '&:hover': { opacity: 0.8 },
                }}
                icon={<CompareArrows sx={{ fontSize: '14px !important' }} />}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
      {error && <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      {/* ── KPIs ────────────────────────────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { icon: School, title: 'Formations', value: stats.totalFormations, color: '#6366F1', bg: '#EEF2FF', trend: trendFormations },
          { icon: People, title: 'Participants', value: stats.totalParticipants, color: '#10B981', bg: '#DCFCE7', trend: trendParticipants },
          { icon: Person, title: 'Formateurs', value: stats.totalFormateurs, color: '#F59E0B', bg: '#FEF3C7', trend: null },
          {
            icon: AttachMoney, title: 'Budget Total',
            value: `${(stats.budgetTotal || 0).toLocaleString()} DT`,
            color: '#EF4444', bg: '#FEE2E2', trend: trendBudget,
          },
          {
            icon: CheckCircle, title: "Taux de présence",
            value: `${stats.tauxPresence || 0}%`,
            color: '#8B5CF6', bg: '#F5F3FF',
            sub: 'participants présents',
          },
        ].map((kpi, i) => (
          <Grid item xs={6} md={12/5} key={i}>
            <KpiCard {...kpi} delay={i * 0.05} />
          </Grid>
        ))}
      </Grid>

      {/* ── Tabs Navigation ─────────────────────────────────────── */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{
          mb: 3, borderBottom: '1px solid #E2E8F0',
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.855rem', minHeight: 44 },
          '& .Mui-selected': { color: '#6366F1' },
          '& .MuiTabs-indicator': { bgcolor: '#6366F1', height: 3, borderRadius: '3px 3px 0 0' },
        }}
      >
        <Tab label="📈 Évolution temporelle" />
        <Tab label="🍩 Répartition" />
        <Tab label="📊 Comparaison multi-années" />
        <Tab label="🏆 Performance" />
        <Tab label="💰 Budget" />
      </Tabs>

      {/* ── TAB 0: Évolution mensuelle ───────────────────────────── */}
      {activeTab === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
                    Évolution mensuelle {primaryYear}
                    {compareYears.length > 0 && ` vs ${compareYears.join(' & ')}`}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    Courbes de tendance par mois
                  </Typography>
                </Box>
                <ToggleButtonGroup
                  value={chartMode}
                  exclusive
                  onChange={(_, v) => v && setChartMode(v)}
                  size="small"
                >
                  <ToggleButton value="formations" sx={{ fontSize: '0.75rem', textTransform: 'none' }}>
                    Formations
                  </ToggleButton>
                  <ToggleButton value="participants" sx={{ fontSize: '0.75rem', textTransform: 'none' }}>
                    Participants
                  </ToggleButton>
                  <ToggleButton value="budget" sx={{ fontSize: '0.75rem', textTransform: 'none' }}>
                    Budget
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={comparisonData} margin={{ top: 5, right: 20, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {activeYears.map((year, idx) => (
                    <Line
                      key={year}
                      type="monotone"
                      dataKey={`${chartMode}_${year}`}
                      name={String(year)}
                      stroke={YEAR_COLORS[idx] || COLORS[idx]}
                      strokeWidth={2.5}
                      dot={{ fill: YEAR_COLORS[idx] || COLORS[idx], r: 4 }}
                      activeDot={{ r: 6 }}
                      strokeDasharray={idx > 0 ? '6 3' : undefined}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>

              {/* Légende des années */}
              {compareYears.length > 0 && (
                <Box sx={{ display: 'flex', gap: 3, mt: 2, justifyContent: 'center' }}>
                  {activeYears.map((year, idx) => (
                    <Box key={year} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{
                        width: 24, height: 3, borderRadius: 2,
                        bgcolor: YEAR_COLORS[idx] || COLORS[idx],
                        borderBottom: idx > 0 ? `2px dashed ${YEAR_COLORS[idx]}` : undefined,
                      }} />
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: YEAR_COLORS[idx] || COLORS[idx] }}>
                        {year}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Évolution par domaine */}
          <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
            <CardContent>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>
                Notes moyennes par domaine — {primaryYear}
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.notesMoyennesParDomaine || []} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="domaine" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} />
                  <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="note" name="Note /20" radius={[6, 6, 0, 0]}>
                    {(stats.notesMoyennesParDomaine || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── TAB 1: Répartition ─────────────────────────────────── */}
      {activeTab === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Grid container spacing={2.5}>
            {/* Donut statuts */}
            <Grid item xs={12} md={5}>
              <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', height: '100%' }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>
                    Statuts des formations
                  </Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={stats.formationsParStatut || []}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {(stats.formationsParStatut || []).map((entry, i) => (
                          <Cell key={i} fill={entry.color || COLORS[i]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {(stats.formationsParStatut || []).map((d, i) => {
                      const total = (stats.formationsParStatut || []).reduce((s, x) => s + x.value, 0);
                      const pct = total > 0 ? Math.round(d.value / total * 100) : 0;
                      return (
                        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color }} />
                            <Typography sx={{ fontSize: '0.82rem', color: '#475569' }}>{d.name}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>{d.value}</Typography>
                            <Chip label={`${pct}%`} size="small" sx={{ height: 18, fontSize: '0.68rem', bgcolor: d.color + '20', color: d.color, fontWeight: 700 }} />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Répartition par domaine */}
            <Grid item xs={12} md={7}>
              <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', height: '100%' }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>
                    Formations & Budget par domaine
                  </Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={stats.formationsParDomaine || []} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="value" name="Formations" radius={[4, 4, 0, 0]}>
                        {(stats.formationsParDomaine || []).map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                      <Line yAxisId="right" type="monotone" dataKey="budget" name="Budget (DT)"
                        stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Participants par structure */}
            <Grid item xs={12}>
              <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>
                    Participants par Structure — {primaryYear}
                  </Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.participantsParStructure || []} layout="vertical" barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} width={130} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="participants" name="Participants" radius={[0, 6, 6, 0]}>
                        {(stats.participantsParStructure || []).map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* ── TAB 2: Comparaison multi-années ─────────────────────── */}
      {activeTab === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {compareYears.length === 0 && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              Sélectionnez une ou deux années à comparer via les boutons en haut de page.
            </Alert>
          )}

          {/* Tableau de comparaison KPIs */}
          <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', mb: 3 }}>
            <CardContent>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>
                Tableau comparatif — KPIs clés
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem' }}>Indicateur</TableCell>
                      {activeYears.map((year, idx) => (
                        <TableCell key={year} align="center" sx={{ fontWeight: 700, color: YEAR_COLORS[idx] || COLORS[idx], fontSize: '0.85rem' }}>
                          {year}
                        </TableCell>
                      ))}
                      {activeYears.length >= 2 && (
                        <TableCell align="center" sx={{ fontWeight: 700, color: '#64748B', fontSize: '0.78rem' }}>
                          Évolution
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { label: 'Formations', key: 'totalFormations', format: v => v },
                      { label: 'Participants', key: 'totalParticipants', format: v => v },
                      { label: 'Formateurs', key: 'totalFormateurs', format: v => v },
                      { label: 'Budget total', key: 'budgetTotal', format: v => `${(v || 0).toLocaleString()} DT` },
                      { label: 'Taux présence', key: 'tauxPresence', format: v => `${v}%` },
                    ].map((row, i) => {
                      const vals = activeYears.map(y => (allStats[y] || generateDemoData(y))[row.key] || 0);
                      const evol = vals.length >= 2 && vals[0] > 0
                        ? Math.round((vals[vals.length - 1] - vals[0]) / vals[0] * 100) : null;
                      return (
                        <TableRow key={i} sx={{ '&:hover': { bgcolor: '#FAFBFF' } }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.855rem', color: '#0F172A' }}>{row.label}</TableCell>
                          {vals.map((v, vi) => (
                            <TableCell key={vi} align="center" sx={{ fontSize: '0.855rem', fontWeight: 700, color: YEAR_COLORS[vi] || COLORS[vi] }}>
                              {row.format(v)}
                            </TableCell>
                          ))}
                          {activeYears.length >= 2 && (
                            <TableCell align="center">
                              {evol !== null && (
                                <Chip
                                  label={`${evol >= 0 ? '+' : ''}${evol}%`}
                                  size="small"
                                  sx={{
                                    bgcolor: evol >= 0 ? '#DCFCE7' : '#FEE2E2',
                                    color: evol >= 0 ? '#15803D' : '#DC2626',
                                    fontWeight: 700, fontSize: '0.72rem',
                                  }}
                                />
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Graphique barres groupées */}
          <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
            <CardContent>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>
                Comparaison formations par domaine
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={(stats.formationsParDomaine || []).map(d => {
                    const row = { name: d.name };
                    activeYears.forEach(y => {
                      const yStats = allStats[y] || generateDemoData(y);
                      const found = (yStats.formationsParDomaine || []).find(x => x.name === d.name);
                      row[String(y)] = found?.value || 0;
                    });
                    return row;
                  })}
                  barSize={20}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {activeYears.map((year, idx) => (
                    <Bar
                      key={year}
                      dataKey={String(year)}
                      name={String(year)}
                      fill={YEAR_COLORS[idx] || COLORS[idx]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── TAB 3: Performance formateurs ───────────────────────── */}
      {activeTab === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={7}>
              <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <EmojiEvents sx={{ color: '#F59E0B', fontSize: 22 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
                      Classement des Formateurs — {primaryYear}
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {['#', 'Formateur', 'Type', 'Sessions', 'Note moy.'].map(h => (
                            <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#94A3B8', py: 1 }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(stats.topFormateurs || []).map((f, i) => (
                          <TableRow key={i} sx={{ '&:hover': { bgcolor: '#FAFBFF' } }}>
                            <TableCell sx={{ py: 1.5 }}>
                              <Avatar sx={{
                                width: 26, height: 26, fontSize: '0.7rem', fontWeight: 800,
                                bgcolor: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7F32' : '#E2E8F0',
                                color: i < 3 ? '#fff' : '#475569',
                              }}>
                                {i + 1}
                              </Avatar>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontWeight: 600, fontSize: '0.855rem', color: '#0F172A' }}>{f.nom}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={f.type} size="small" sx={{
                                height: 18, fontSize: '0.65rem',
                                bgcolor: f.type === 'INTERNE' ? '#DCFCE7' : '#EDE9FE',
                                color: f.type === 'INTERNE' ? '#15803D' : '#7C3AED',
                                fontWeight: 700,
                              }} />
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={f.nbFormations} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.72rem' }} />
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#F59E0B' }}>
                                  ⭐ {f.satisfaction?.toFixed(1)}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', height: '100%' }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>
                    Taux de présence — {primaryYear}
                  </Typography>
                  {/* Jauge circulaire simulée */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                    <Box sx={{ position: 'relative', width: 160, height: 160 }}>
                      <svg viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="80" cy="80" r="60" fill="none" stroke="#F1F5F9" strokeWidth="14" />
                        <circle cx="80" cy="80" r="60" fill="none"
                          stroke="#10B981" strokeWidth="14"
                          strokeDasharray={`${(stats.tauxPresence || 0) / 100 * 376.8} 376.8`}
                          strokeLinecap="round" />
                      </svg>
                      <Box sx={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                      }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '2rem', color: '#10B981', lineHeight: 1 }}>
                          {stats.tauxPresence || 0}%
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>Présence</Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: '0.82rem', color: '#64748B', mt: 2, textAlign: 'center' }}>
                      Taux de présence moyen pour l'année {primaryYear}
                    </Typography>
                  </Box>

                  {/* Radar compétences */}
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#475569', mb: 1 }}>
                      Répartition formateurs
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                      {[
                        { label: 'Internes', value: stats.formateursInternes || 10, color: '#10B981' },
                        { label: 'Externes', value: stats.formateursExternes || 8, color: '#8B5CF6' },
                      ].map((item, i) => (
                        <Box key={i} sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: item.color + '10', border: `1px solid ${item.color}30`, minWidth: 90 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: item.color }}>{item.value}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>{item.label}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* ── TAB 4: Budget ───────────────────────────────────────── */}
      {activeTab === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={8}>
              <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>
                    Budget par trimestre — Réel vs Objectif {primaryYear}
                  </Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stats.budgetParTrimestre || []} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="trimestre" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="budget" name="Budget réel" fill="#6366F1" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="objectif" name="Objectif" fill="#E2E8F0" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', height: '100%' }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>
                    Synthèse Budget
                  </Typography>
                  {[
                    { label: 'Budget total', value: `${(stats.budgetTotal || 0).toLocaleString()} DT`, color: '#6366F1' },
                    { label: 'Budget moyen/formation', value: stats.totalFormations > 0 ? `${Math.round(stats.budgetTotal / stats.totalFormations).toLocaleString()} DT` : '—', color: '#10B981' },
                    { label: 'Objectif annuel', value: `${(100000).toLocaleString()} DT`, color: '#F59E0B' },
                    { label: 'Taux réalisation', value: `${Math.round((stats.budgetTotal || 0) / 100000 * 100)}%`, color: stats.budgetTotal >= 100000 ? '#10B981' : '#EF4444' },
                  ].map((item, i) => (
                    <Box key={i} sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: item.color + '08', border: `1px solid ${item.color}20` }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748B', mb: 0.5 }}>{item.label}</Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: item.color }}>{item.value}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Évolution budget multi-années */}
            {compareYears.length > 0 && (
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                  <CardContent>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>
                      Évolution budget — comparaison {activeYears.join(' vs ')}
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={comparisonData}>
                        <defs>
                          {activeYears.map((year, idx) => (
                            <linearGradient key={year} id={`budget_${year}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={YEAR_COLORS[idx] || COLORS[idx]} stopOpacity={0.2} />
                              <stop offset="95%" stopColor={YEAR_COLORS[idx] || COLORS[idx]} stopOpacity={0} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {activeYears.map((year, idx) => (
                          <Area
                            key={year}
                            type="monotone"
                            dataKey={`budget_${year}`}
                            name={String(year)}
                            stroke={YEAR_COLORS[idx] || COLORS[idx]}
                            fill={`url(#budget_${year})`}
                            strokeWidth={2}
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </motion.div>
      )}
    </Box>
  );
}
