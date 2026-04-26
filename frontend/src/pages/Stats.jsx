import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, FormControl,
  InputLabel, Select, MenuItem, LinearProgress, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  ToggleButton, ToggleButtonGroup, Tabs, Tab, Alert, IconButton,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, ReferenceLine,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { statsService } from '../services/api';
import {
  School, People, Person, AttachMoney, TrendingUp, TrendingDown,
  EmojiEvents, CompareArrows, BarChart as BarIcon, ShowChart,
  PieChart as PieIcon, CheckCircle, HourglassEmpty, Add, Remove,
  CalendarToday, Assessment,
} from '@mui/icons-material';

// ── Palette couleurs ──────────────────────────────────────────────────────────
const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];
const YEAR_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
const YEAR_COLORS_LIGHT = ['#EEF2FF', '#DCFCE7', '#FEF3C7', '#FEE2E2', '#F5F3FF'];

// ── Génération données démo sur 5 ans ────────────────────────────────────────
const generateDemoData = (year) => {
  const base = year - 2020; // offset depuis 2020
  const growth = 1 + base * 0.12; // ~12% growth par an
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  return {
    totalFormations: Math.round(15 * growth) + rand(-1, 2),
    totalParticipants: Math.round(187 * growth) + rand(-5, 10),
    totalFormateurs: Math.round(11 * growth) + rand(0, 2),
    budgetTotal: Math.round(52100 * growth) + rand(-2000, 3000),
    tauxPresence: Math.min(99, Math.round(82 + base * 2.5) + rand(-2, 2)),
    formateursInternes: Math.round(6 * growth),
    formateursExternes: Math.round(5 * growth),
    noteMoyenneGlobale: Math.min(19, Math.round((12.5 + base * 0.5) * 10) / 10),
    formationsParDomaine: [
      { name: 'Informatique', value: Math.round(5 * growth) + rand(0, 2), budget: Math.round(22000 * growth) },
      { name: 'Management',   value: Math.round(3 * growth) + rand(0, 1), budget: Math.round(15000 * growth) },
      { name: 'Finance',      value: Math.round(4 * growth) + rand(0, 1), budget: Math.round(12000 * growth) },
      { name: 'Langues',      value: Math.round(2 * growth) + rand(0, 1), budget: Math.round(7000 * growth) },
      { name: 'Juridique',    value: Math.round(1 * growth) + rand(0, 1), budget: Math.round(12200 * growth) },
    ],
    evolutionMensuelle: ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'].map((mois, i) => ({
      mois,
      formations: Math.max(0, Math.floor(Math.sin(i / 2) * 2 + Math.round(2.5 * growth) + Math.random() * 1.5)),
      participants: Math.max(0, Math.floor(Math.sin(i / 2) * 15 + Math.round(20 * growth) + Math.random() * 8)),
      budget: Math.floor(Math.round(4200 * growth) + Math.random() * 2000),
    })),
    formationsParStatut: [
      { name: 'Terminées',  value: Math.round(10 * growth), color: '#10B981' },
      { name: 'En cours',   value: Math.round(1.5 * growth), color: '#F59E0B' },
      { name: 'Planifiées', value: Math.round(3 * growth), color: '#6366F1' },
      { name: 'Annulées',   value: Math.round(0.5 * growth) || 1, color: '#EF4444' },
    ],
    topFormateurs: [
      { nom: 'Ahmed Ben Ali', type: 'INTERNE', nbFormations: Math.round(5 * growth), satisfaction: 4.9, noteMoyenne: Math.min(19, 15.2 + base * 0.2) },
      { nom: 'Karim Mrabet',  type: 'INTERNE', nbFormations: Math.round(4 * growth), satisfaction: 4.8, noteMoyenne: Math.min(19, 14.8 + base * 0.2) },
      { nom: 'Sonia Hamdi',   type: 'EXTERNE', nbFormations: Math.round(3 * growth), satisfaction: 4.7, noteMoyenne: Math.min(19, 14.5 + base * 0.2) },
      { nom: 'Rania Gharbi',  type: 'EXTERNE', nbFormations: Math.round(3 * growth), satisfaction: 4.6, noteMoyenne: Math.min(19, 14.1 + base * 0.2) },
    ],
    participantsParStructure: [
      { name: 'Dir. Centrale IT', participants: Math.round(95 * growth) },
      { name: 'Dir. Financière',  participants: Math.round(62 * growth) },
      { name: 'Dir. Nord',        participants: Math.round(48 * growth) },
      { name: 'Dir. RH',          participants: Math.round(43 * growth) },
    ],
    budgetParTrimestre: [
      { trimestre: 'T1', budget: Math.round(17000 * growth), objectif: Math.round(52100 * growth * 0.27) },
      { trimestre: 'T2', budget: Math.round(18500 * growth), objectif: Math.round(52100 * growth * 0.27) },
      { trimestre: 'T3', budget: Math.round(16500 * growth), objectif: Math.round(52100 * growth * 0.25) },
      { trimestre: 'T4', budget: Math.round(16200 * growth), objectif: Math.round(52100 * growth * 0.25) },
    ],
    notesMoyennesParDomaine: [
      { domaine: 'Informatique', note: Math.min(20, 14.5 + base * 0.2 + Math.random() * 0.3), pourcentage: Math.min(100, Math.round((14.5 + base * 0.2) / 20 * 100)) },
      { domaine: 'Management',   note: Math.min(20, 14.0 + base * 0.2 + Math.random() * 0.3), pourcentage: Math.min(100, Math.round((14.0 + base * 0.2) / 20 * 100)) },
      { domaine: 'Finance',      note: Math.min(20, 13.2 + base * 0.2 + Math.random() * 0.3), pourcentage: Math.min(100, Math.round((13.2 + base * 0.2) / 20 * 100)) },
      { domaine: 'Langues',      note: Math.min(20, 15.5 + base * 0.2 + Math.random() * 0.3), pourcentage: Math.min(100, Math.round((15.5 + base * 0.2) / 20 * 100)) },
      { domaine: 'Juridique',    note: Math.min(20, 13.8 + base * 0.2 + Math.random() * 0.3), pourcentage: Math.min(100, Math.round((13.8 + base * 0.2) / 20 * 100)) },
    ],
  };
};

// ── Tooltip personnalisé ──────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
      <Box sx={{
        bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: 2,
        p: 1.5, boxShadow: '0 20px 40px rgba(0,0,0,0.3)', minWidth: 180,
      }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#94A3B8', mb: 0.5 }}>{label}</Typography>
        {payload.map((p, i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 0.3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
                <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8' }}>{p.name}</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>
                {typeof p.value === 'number' && p.value > 1000
                    ? `${p.value.toLocaleString()} DT`
                    : typeof p.value === 'number' && String(p.name).toLowerCase().includes('note')
                        ? `${p.value.toFixed(1)}/20 (${Math.round(p.value / 20 * 100)}%)`
                        : p.value}
              </Typography>
            </Box>
        ))}
      </Box>
  );
};

// ── Tooltip Notes avec pourcentage ───────────────────────────────────────────
const NotesTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
      <Box sx={{
        bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: 2,
        p: 1.5, boxShadow: '0 20px 40px rgba(0,0,0,0.3)', minWidth: 200,
      }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#94A3B8', mb: 0.5 }}>{label}</Typography>
        {payload.map((p, i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 0.3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
                <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8' }}>{p.name}</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>
                {Number(p.value).toFixed(1)}/20
                <Typography component="span" sx={{ fontSize: '0.72rem', color: '#10B981', ml: 0.5 }}>
                  ({Math.round(p.value / 20 * 100)}%)
                </Typography>
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
  const trendNum = trend ? parseFloat(trend.replace('+', '')) : null;
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
                      icon={isPositive
                          ? <TrendingUp sx={{ fontSize: '11px !important' }} />
                          : <TrendingDown sx={{ fontSize: '11px !important' }} />}
                      label={trend}
                      sx={{
                        bgcolor: isPositive ? '#DCFCE7' : '#FEE2E2',
                        color: isPositive ? '#15803D' : '#DC2626',
                        fontWeight: 700, fontSize: '0.67rem', height: 22,
                      }}
                  />
              )}
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.9rem', color: '#0F172A', lineHeight: 1, mb: 0.5 }}>
              {value}
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>{title}</Typography>
            {sub && <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', mt: 0.5 }}>{sub}</Typography>}
          </CardContent>
        </Card>
      </motion.div>
  );
}

// ── Barre note avec pourcentage ───────────────────────────────────────────────
function NoteBar({ domaine, note, pourcentage, color, index }) {
  return (
      <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.07 }}
      >
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>{domaine}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                {note.toFixed(1)}<Typography component="span" sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>/20</Typography>
              </Typography>
              <Chip
                  label={`${pourcentage}%`}
                  size="small"
                  sx={{
                    height: 20, fontSize: '0.68rem', fontWeight: 700,
                    bgcolor: pourcentage >= 80 ? '#DCFCE7' : pourcentage >= 65 ? '#FEF3C7' : '#FEE2E2',
                    color: pourcentage >= 80 ? '#15803D' : pourcentage >= 65 ? '#92400E' : '#DC2626',
                  }}
              />
            </Box>
          </Box>
          <Box sx={{ position: 'relative', height: 8, borderRadius: 4, bgcolor: '#F1F5F9' }}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pourcentage}%` }}
                transition={{ delay: index * 0.07 + 0.3, duration: 0.6, ease: 'easeOut' }}
                style={{
                  position: 'absolute', height: '100%', borderRadius: 4,
                  background: `linear-gradient(90deg, ${color}80, ${color})`,
                }}
            />
            {/* Ligne de référence à 70% (barre admissibilité) */}
            <Box sx={{
              position: 'absolute', left: '70%', top: -4, bottom: -4,
              width: 1.5, bgcolor: '#CBD5E1', borderRadius: 1,
            }} />
          </Box>
          <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', mt: 0.3 }}>
            Admissibilité : 70%
          </Typography>
        </Box>
      </motion.div>
  );
}

// ── Construire données comparaison multi-années ───────────────────────────────
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

// ── Construire évolution annuelle (tous les ans en 1 ligne) ───────────────────
function buildAnnualEvolution(allStats, allYears) {
  return allYears.map(year => ({
    year: String(year),
    formations: (allStats[year] || generateDemoData(year)).totalFormations || 0,
    participants: (allStats[year] || generateDemoData(year)).totalParticipants || 0,
    budget: (allStats[year] || generateDemoData(year)).budgetTotal || 0,
    taux: (allStats[year] || generateDemoData(year)).tauxPresence || 0,
    note: (allStats[year] || generateDemoData(year)).noteMoyenneGlobale || 14,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function Stats() {
  const currentYear = new Date().getFullYear();
  // 5 dernières années
  const availableYears = [currentYear, currentYear-1, currentYear-2, currentYear-3, currentYear-4];

  const [primaryYear, setPrimaryYear] = useState(currentYear);
  const [compareYears, setCompareYears] = useState([]);
  const [allStats, setAllStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [chartMode, setChartMode] = useState('formations');
  const [error, setError] = useState(null);

  const loadYearStats = useCallback(async (year) => {
    if (allStats[year]) return;
    try {
      const res = await statsService.getDashboard(year);
      // Enrichir avec noteMoyenneGlobale si absent
      const data = res.data;
      if (!data.noteMoyenneGlobale && data.notesMoyennesParDomaine) {
        const notes = data.notesMoyennesParDomaine.map(d => d.note).filter(Boolean);
        data.noteMoyenneGlobale = notes.length ? notes.reduce((a, b) => a + b, 0) / notes.length : 14;
      }
      setAllStats(prev => ({ ...prev, [year]: data }));
    } catch {
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
  const annualEvolution = buildAnnualEvolution(allStats, [...availableYears].reverse());

  const toggleCompareYear = (year) => {
    if (year === primaryYear) return;
    setCompareYears(prev =>
        prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year].slice(0, 4)
    );
  };

  // Tendances vs année précédente
  const prevStats = allStats[primaryYear - 1] || generateDemoData(primaryYear - 1);
  const calcTrend = (cur, prev) => {
    if (!prev || prev === 0) return null;
    const pct = Math.round((cur - prev) / prev * 100);
    return `${pct >= 0 ? '+' : ''}${pct}%`;
  };
  const trendFormations = calcTrend(stats.totalFormations, prevStats?.totalFormations);
  const trendParticipants = calcTrend(stats.totalParticipants, prevStats?.totalParticipants);
  const trendBudget = calcTrend(stats.budgetTotal, prevStats?.budgetTotal);
  const trendPresence = calcTrend(stats.tauxPresence, prevStats?.tauxPresence);

  // Note moyenne globale
  const noteGlobale = stats.noteMoyenneGlobale ||
      (stats.notesMoyennesParDomaine?.length
          ? stats.notesMoyennesParDomaine.reduce((s, d) => s + (d.note || 0), 0) / stats.notesMoyennesParDomaine.length
          : 14);
  const notePct = Math.round(noteGlobale / 20 * 100);

  return (
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Assessment sx={{ color: '#6366F1', fontSize: 28 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
                Statistiques & Rapports
              </Typography>
            </Box>
            <Typography sx={{ color: '#64748B', fontSize: '0.875rem', ml: 5 }}>
              Suivi multi-annuel · {availableYears[availableYears.length - 1]} – {availableYears[0]}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Sélecteur année principale */}
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>Année</InputLabel>
              <Select
                  value={primaryYear}
                  onChange={(e) => { setPrimaryYear(e.target.value); setCompareYears([]); }}
                  label="Année"
              >
                {availableYears.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </Select>
            </FormControl>

            {/* Boutons comparaison — jusqu'à 4 années en plus */}
            <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>vs:</Typography>
              {availableYears.filter(y => y !== primaryYear).map(y => {
                const idx = availableYears.indexOf(y);
                const active = compareYears.includes(y);
                return (
                    <Chip
                        key={y}
                        label={y}
                        size="small"
                        onClick={() => toggleCompareYear(y)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: active ? YEAR_COLORS[compareYears.indexOf(y) + 1] + '20' : '#F1F5F9',
                          color: active ? YEAR_COLORS[compareYears.indexOf(y) + 1] : '#64748B',
                          border: `1px solid ${active ? YEAR_COLORS[compareYears.indexOf(y) + 1] : 'transparent'}`,
                          fontWeight: 700, fontSize: '0.78rem', height: 26,
                          transition: 'all 0.2s',
                          '&:hover': { opacity: 0.85, transform: 'scale(1.03)' },
                        }}
                    />
                );
              })}
            </Box>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
        {error && <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        {/* ── KPIs ────────────────────────────────────────────────── */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { icon: School,      title: 'Formations',      value: stats.totalFormations,                      color: '#6366F1', bg: '#EEF2FF', trend: trendFormations },
            { icon: People,      title: 'Participants',     value: stats.totalParticipants,                    color: '#10B981', bg: '#DCFCE7', trend: trendParticipants },
            { icon: Person,      title: 'Formateurs',       value: stats.totalFormateurs,                      color: '#F59E0B', bg: '#FEF3C7', trend: null },
            { icon: AttachMoney, title: 'Budget Total',     value: `${(stats.budgetTotal || 0).toLocaleString()} DT`, color: '#EF4444', bg: '#FEE2E2', trend: trendBudget },
            { icon: CheckCircle, title: 'Taux présence',   value: `${stats.tauxPresence || 0}%`,              color: '#8B5CF6', bg: '#F5F3FF', trend: trendPresence },
            {
              icon: Assessment, title: 'Note moy. globale',
              value: `${noteGlobale.toFixed(1)}/20`,
              color: '#06B6D4', bg: '#ECFEFF',
              sub: `${notePct}% de réussite`,
              trend: null,
            },
          ].map((kpi, i) => (
              <Grid item xs={6} md={4} lg={2} key={i}>
                <KpiCard {...kpi} delay={i * 0.05} />
              </Grid>
          ))}
        </Grid>

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 3, borderBottom: '1px solid #E2E8F0',
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.845rem', minHeight: 44 },
              '& .Mui-selected': { color: '#6366F1' },
              '& .MuiTabs-indicator': { bgcolor: '#6366F1', height: 3, borderRadius: '3px 3px 0 0' },
            }}
        >
          <Tab label="📈 Évolution mensuelle" />
          <Tab label="📊 Multi-années (courbes)" />
          <Tab label="🍩 Répartition" />
          <Tab label="🎯 Notes & Résultats" />
          <Tab label="🏆 Performance" />
          <Tab label="💰 Budget" />
        </Tabs>

        {/* ══════════════════════════════════════════════════════════
          TAB 0 : Évolution mensuelle
      ══════════════════════════════════════════════════════════ */}
        {activeTab === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
                        Évolution mensuelle {primaryYear}
                        {compareYears.length > 0 && ` vs ${compareYears.join(', ')}`}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>Courbes de tendance par mois</Typography>
                    </Box>
                    <ToggleButtonGroup value={chartMode} exclusive onChange={(_, v) => v && setChartMode(v)} size="small">
                      <ToggleButton value="formations"   sx={{ fontSize: '0.75rem', textTransform: 'none' }}>Formations</ToggleButton>
                      <ToggleButton value="participants" sx={{ fontSize: '0.75rem', textTransform: 'none' }}>Participants</ToggleButton>
                      <ToggleButton value="budget"       sx={{ fontSize: '0.75rem', textTransform: 'none' }}>Budget</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  <ResponsiveContainer width="100%" height={310}>
                    <AreaChart data={comparisonData} margin={{ top: 5, right: 20, bottom: 0, left: -10 }}>
                      <defs>
                        {activeYears.map((year, idx) => (
                            <linearGradient key={year} id={`grad_${year}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor={YEAR_COLORS[idx]} stopOpacity={0.18} />
                              <stop offset="95%" stopColor={YEAR_COLORS[idx]} stopOpacity={0.02} />
                            </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {activeYears.map((year, idx) => (
                          <Area
                              key={year}
                              type="monotone"
                              dataKey={`${chartMode}_${year}`}
                              name={String(year)}
                              stroke={YEAR_COLORS[idx]}
                              fill={`url(#grad_${year})`}
                              strokeWidth={2.5}
                              dot={{ fill: YEAR_COLORS[idx], r: 3 }}
                              activeDot={{ r: 6 }}
                              strokeDasharray={idx > 0 ? '6 3' : undefined}
                          />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>

                  {compareYears.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 3, mt: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {activeYears.map((year, idx) => (
                            <Box key={year} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{
                                width: 28, height: 3, borderRadius: 2,
                                bgcolor: YEAR_COLORS[idx],
                                border: idx > 0 ? `1.5px dashed ${YEAR_COLORS[idx]}` : undefined,
                              }} />
                              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: YEAR_COLORS[idx] }}>{year}</Typography>
                            </Box>
                        ))}
                      </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════
          TAB 1 : Comparaison multi-années (courbe annuelle)
      ══════════════════════════════════════════════════════════ */}
        {activeTab === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Courbe évolution sur 5 ans */}
              <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', mb: 3 }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 0.5 }}>
                    Tendance sur {availableYears.length} ans ({availableYears[availableYears.length-1]} → {availableYears[0]})
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mb: 2 }}>
                    Vue d'ensemble de la progression annuelle
                  </Typography>
                  <ToggleButtonGroup value={chartMode} exclusive onChange={(_, v) => v && setChartMode(v)} size="small" sx={{ mb: 2 }}>
                    <ToggleButton value="formations"   sx={{ fontSize: '0.75rem', textTransform: 'none' }}>Formations</ToggleButton>
                    <ToggleButton value="participants" sx={{ fontSize: '0.75rem', textTransform: 'none' }}>Participants</ToggleButton>
                    <ToggleButton value="budget"       sx={{ fontSize: '0.75rem', textTransform: 'none' }}>Budget</ToggleButton>
                    <ToggleButton value="taux"         sx={{ fontSize: '0.75rem', textTransform: 'none' }}>Taux présence</ToggleButton>
                    <ToggleButton value="note"         sx={{ fontSize: '0.75rem', textTransform: 'none' }}>Note moy.</ToggleButton>
                  </ToggleButtonGroup>

                  <ResponsiveContainer width="100%" height={290}>
                    <ComposedChart data={annualEvolution} margin={{ top: 5, right: 20, bottom: 0, left: -10 }}>
                      <defs>
                        <linearGradient id="annualGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                          type="monotone" dataKey={chartMode}
                          name={chartMode === 'formations' ? 'Formations' : chartMode === 'participants' ? 'Participants' : chartMode === 'budget' ? 'Budget (DT)' : chartMode === 'taux' ? 'Taux présence (%)' : 'Note /20'}
                          stroke="#6366F1" fill="url(#annualGrad)" strokeWidth={3}
                          dot={{ fill: '#6366F1', r: 6, strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 8 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Tableau comparatif enrichi */}
              <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', mb: 3 }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>
                    Tableau comparatif — {availableYears.length} années
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                          <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem' }}>Indicateur</TableCell>
                          {[...availableYears].reverse().map((year, idx) => (
                              <TableCell key={year} align="center" sx={{
                                fontWeight: 700,
                                color: year === primaryYear ? '#6366F1' : '#64748B',
                                fontSize: '0.82rem',
                                bgcolor: year === primaryYear ? '#EEF2FF' : 'transparent',
                              }}>
                                {year}
                                {year === primaryYear && <Chip label="actuel" size="small" sx={{ ml: 0.5, height: 16, fontSize: '0.6rem', bgcolor: '#6366F1', color: '#fff' }} />}
                              </TableCell>
                          ))}
                          <TableCell align="center" sx={{ fontWeight: 700, color: '#64748B', fontSize: '0.78rem' }}>
                            Évolution {availableYears[availableYears.length-1]}→{availableYears[0]}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          { label: 'Formations',      key: 'totalFormations',   fmt: v => v },
                          { label: 'Participants',     key: 'totalParticipants', fmt: v => v },
                          { label: 'Budget total',     key: 'budgetTotal',       fmt: v => `${(v||0).toLocaleString()} DT` },
                          { label: 'Taux présence',    key: 'tauxPresence',      fmt: v => `${v}%` },
                          { label: 'Note moy.',        key: 'noteMoyenneGlobale',fmt: v => v ? `${Number(v).toFixed(1)}/20 (${Math.round(v/20*100)}%)` : '—' },
                        ].map((row, i) => {
                          const years = [...availableYears].reverse();
                          const vals = years.map(y => (allStats[y] || generateDemoData(y))[row.key] || 0);
                          const first = vals[0], last = vals[vals.length - 1];
                          const evolPct = first > 0 ? Math.round((last - first) / first * 100) : null;
                          return (
                              <TableRow key={i} sx={{ '&:hover': { bgcolor: '#FAFBFF' } }}>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.855rem', color: '#0F172A' }}>{row.label}</TableCell>
                                {vals.map((v, vi) => (
                                    <TableCell key={vi} align="center" sx={{
                                      fontSize: '0.855rem',
                                      fontWeight: years[vi] === primaryYear ? 800 : 600,
                                      color: years[vi] === primaryYear ? '#6366F1' : '#0F172A',
                                      bgcolor: years[vi] === primaryYear ? '#EEF2FF' : 'transparent',
                                    }}>
                                      {row.fmt(v)}
                                    </TableCell>
                                ))}
                                <TableCell align="center">
                                  {evolPct !== null && (
                                      <Chip
                                          label={`${evolPct >= 0 ? '+' : ''}${evolPct}%`}
                                          size="small"
                                          icon={evolPct >= 0 ? <TrendingUp sx={{ fontSize: '11px !important' }} /> : <TrendingDown sx={{ fontSize: '11px !important' }} />}
                                          sx={{
                                            bgcolor: evolPct >= 0 ? '#DCFCE7' : '#FEE2E2',
                                            color: evolPct >= 0 ? '#15803D' : '#DC2626',
                                            fontWeight: 700, fontSize: '0.72rem',
                                          }}
                                      />
                                  )}
                                </TableCell>
                              </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* Barres groupées par domaine */}
              {activeYears.length >= 2 && (
                  <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                    <CardContent>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>
                        Formations par domaine — {activeYears.join(' vs ')}
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
                            barGap={2}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          {activeYears.map((year, idx) => (
                              <Bar key={year} dataKey={String(year)} name={String(year)} fill={YEAR_COLORS[idx]} radius={[4, 4, 0, 0]} />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
              )}
            </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════
          TAB 2 : Répartition
      ══════════════════════════════════════════════════════════ */}
        {activeTab === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Grid container spacing={2.5}>
                {/* Donut statuts */}
                <Grid item xs={12} md={5}>
                  <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', height: '100%' }}>
                    <CardContent>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>
                        Statuts des formations — {primaryYear}
                      </Typography>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={stats.formationsParStatut || []} cx="50%" cy="50%"
                               innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
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

                {/* Barres + courbe budget par domaine */}
                <Grid item xs={12} md={7}>
                  <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', height: '100%' }}>
                    <CardContent>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>
                        Formations & Budget par domaine — {primaryYear}
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

        {/* ══════════════════════════════════════════════════════════
          TAB 3 : Notes & Résultats — AMÉLIORÉ
      ══════════════════════════════════════════════════════════ */}
        {activeTab === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Grid container spacing={2.5}>
                {/* Jauge note globale */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', height: '100%' }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>
                        Note moyenne globale — {primaryYear}
                      </Typography>
                      {/* Jauge circulaire SVG */}
                      <Box sx={{ position: 'relative', width: 160, height: 160, mb: 2 }}>
                        <svg viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="80" cy="80" r="60" fill="none" stroke="#F1F5F9" strokeWidth="14" />
                          <circle cx="80" cy="80" r="60" fill="none"
                                  stroke={notePct >= 80 ? '#10B981' : notePct >= 65 ? '#F59E0B' : '#EF4444'}
                                  strokeWidth="14"
                                  strokeDasharray={`${notePct / 100 * 376.8} 376.8`}
                                  strokeLinecap="round" />
                          {/* Ligne de seuil admissibilité à 70% */}
                          <circle cx="80" cy="80" r="60" fill="none"
                                  stroke="#CBD5E1" strokeWidth="3"
                                  strokeDasharray={`2 ${376.8 - 2}`}
                                  strokeDashoffset={-(70 / 100 * 376.8)}
                                  strokeLinecap="round" />
                        </svg>
                        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '1.8rem', color: notePct >= 80 ? '#10B981' : notePct >= 65 ? '#F59E0B' : '#EF4444', lineHeight: 1 }}>
                            {noteGlobale.toFixed(1)}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>/20</Typography>
                        </Box>
                      </Box>
                      <Chip
                          label={`${notePct}% de réussite`}
                          sx={{
                            fontWeight: 700, fontSize: '0.9rem', height: 32, px: 1,
                            bgcolor: notePct >= 80 ? '#DCFCE7' : notePct >= 65 ? '#FEF3C7' : '#FEE2E2',
                            color: notePct >= 80 ? '#15803D' : notePct >= 65 ? '#92400E' : '#DC2626',
                          }}
                      />
                      <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mt: 1.5, textAlign: 'center' }}>
                        Seuil admissibilité : 70%
                      </Typography>

                      {/* Mini-comparaison vs année précédente */}
                      {prevStats?.noteMoyenneGlobale && (
                          <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', width: '100%', textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>vs {primaryYear - 1}</Typography>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: noteGlobale >= (prevStats.noteMoyenneGlobale || 14) ? '#10B981' : '#EF4444' }}>
                              {noteGlobale >= (prevStats.noteMoyenneGlobale || 14) ? '+' : ''}
                              {(noteGlobale - (prevStats.noteMoyenneGlobale || 14)).toFixed(1)} pts
                            </Typography>
                          </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Barres notes par domaine avec % */}
                <Grid item xs={12} md={8}>
                  <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
                          Notes par domaine — {primaryYear}
                        </Typography>
                        <Chip label="Note /20 + %" size="small" sx={{ bgcolor: '#EEF2FF', color: '#6366F1', fontWeight: 600 }} />
                      </Box>
                      {(stats.notesMoyennesParDomaine || []).map((d, i) => (
                          <NoteBar
                              key={i}
                              domaine={d.domaine}
                              note={d.note}
                              pourcentage={d.pourcentage || Math.round(d.note / 20 * 100)}
                              color={COLORS[i % COLORS.length]}
                              index={i}
                          />
                      ))}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Graphique notes par domaine avec axe % */}
                <Grid item xs={12}>
                  <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                    <CardContent>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 0.5 }}>
                        Comparaison notes par domaine
                        {compareYears.length > 0 ? ` — ${activeYears.join(' vs ')}` : ` — ${primaryYear}`}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mb: 2 }}>
                        Axe gauche : note /20 · Axe droit : % de réussite · Ligne rouge = seuil 70%
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart
                            data={(stats.notesMoyennesParDomaine || []).map(d => {
                              const row = { domaine: d.domaine };
                              activeYears.forEach(y => {
                                const yStats = allStats[y] || generateDemoData(y);
                                const found = (yStats.notesMoyennesParDomaine || []).find(x => x.domaine === d.domaine);
                                row[`note_${y}`] = found ? Math.round(found.note * 10) / 10 : 0;
                                row[`pct_${y}`] = found ? Math.round(found.note / 20 * 100) : 0;
                              });
                              return row;
                            })}
                            barSize={22}
                            margin={{ top: 5, right: 30, bottom: 0, left: -10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                          <XAxis dataKey="domaine" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} />
                          <YAxis yAxisId="left"  domain={[0, 20]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} label={{ value: '/20', position: 'insideTop', fontSize: 10, fill: '#94A3B8' }} />
                          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickFormatter={v => `${v}%`} />
                          <Tooltip content={<NotesTooltip />} />
                          <Legend />
                          {/* Ligne seuil admissibilité à 14/20 = 70% */}
                          <ReferenceLine yAxisId="left" y={14} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5}
                                         label={{ value: '70% (14/20)', position: 'right', fontSize: 10, fill: '#EF4444' }} />
                          {activeYears.map((year, idx) => (
                              <Bar key={year} yAxisId="left" dataKey={`note_${year}`}
                                   name={`Note ${year}`}
                                   fill={YEAR_COLORS[idx]} radius={[4, 4, 0, 0]} opacity={0.85} />
                          ))}
                          {/* Courbe pourcentage sur axe droit */}
                          {activeYears.map((year, idx) => (
                              <Line key={`pct_${year}`} yAxisId="right" type="monotone"
                                    dataKey={`pct_${year}`}
                                    name={`% réussite ${year}`}
                                    stroke={YEAR_COLORS[idx]}
                                    strokeWidth={2} strokeDasharray={idx > 0 ? '5 3' : undefined}
                                    dot={{ fill: YEAR_COLORS[idx], r: 4, strokeWidth: 2, stroke: '#fff' }}
                              />
                          ))}
                        </ComposedChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════
          TAB 4 : Performance formateurs
      ══════════════════════════════════════════════════════════ */}
        {activeTab === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Grid container spacing={2.5}>
                <Grid item xs={12} md={8}>
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
                              {['#', 'Formateur', 'Type', 'Sessions', 'Note moy.', '% réussite', 'Satisfaction'].map(h => (
                                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#94A3B8', py: 1 }}>{h}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(stats.topFormateurs || []).map((f, i) => {
                              const notePct = f.noteMoyenne ? Math.round(f.noteMoyenne / 20 * 100) : null;
                              return (
                                  <TableRow key={i} sx={{ '&:hover': { bgcolor: '#FAFBFF' } }}>
                                    <TableCell sx={{ py: 1.5 }}>
                                      <Avatar sx={{
                                        width: 26, height: 26, fontSize: '0.7rem', fontWeight: 800,
                                        bgcolor: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7F32' : '#E2E8F0',
                                        color: i < 3 ? '#fff' : '#475569',
                                      }}>{i + 1}</Avatar>
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
                                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                                        {f.noteMoyenne ? `${Number(f.noteMoyenne).toFixed(1)}/20` : '—'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      {notePct && (
                                          <Chip label={`${notePct}%`} size="small" sx={{
                                            height: 18, fontSize: '0.68rem', fontWeight: 700,
                                            bgcolor: notePct >= 80 ? '#DCFCE7' : notePct >= 65 ? '#FEF3C7' : '#FEE2E2',
                                            color: notePct >= 80 ? '#15803D' : notePct >= 65 ? '#92400E' : '#DC2626',
                                          }} />
                                      )}
                                    </TableCell>
                                    <TableCell align="center">
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#F59E0B' }}>
                                          ⭐ {f.satisfaction?.toFixed(1)}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', height: '100%' }}>
                    <CardContent>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>
                        Taux de présence — {primaryYear}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                        <Box sx={{ position: 'relative', width: 150, height: 150 }}>
                          <svg viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="80" cy="80" r="60" fill="none" stroke="#F1F5F9" strokeWidth="14" />
                            <circle cx="80" cy="80" r="60" fill="none"
                                    stroke="#10B981" strokeWidth="14"
                                    strokeDasharray={`${(stats.tauxPresence || 0) / 100 * 376.8} 376.8`}
                                    strokeLinecap="round" />
                          </svg>
                          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <Typography sx={{ fontWeight: 800, fontSize: '1.9rem', color: '#10B981', lineHeight: 1 }}>
                              {stats.tauxPresence || 0}%
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>Présence</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                          {[
                            { label: 'Internes', value: stats.formateursInternes || 0, color: '#10B981' },
                            { label: 'Externes', value: stats.formateursExternes || 0, color: '#8B5CF6' },
                          ].map((item, i) => (
                              <Box key={i} sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: item.color + '10', border: `1px solid ${item.color}30`, minWidth: 80 }}>
                                <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: item.color }}>{item.value}</Typography>
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

        {/* ══════════════════════════════════════════════════════════
          TAB 5 : Budget
      ══════════════════════════════════════════════════════════ */}
        {activeTab === 5 && (
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
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>Synthèse Budget</Typography>
                      {[
                        { label: 'Budget total', value: `${(stats.budgetTotal || 0).toLocaleString()} DT`, color: '#6366F1' },
                        { label: 'Budget moy./formation', value: stats.totalFormations > 0 ? `${Math.round(stats.budgetTotal / stats.totalFormations).toLocaleString()} DT` : '—', color: '#10B981' },
                        { label: 'Objectif annuel', value: `${(100000).toLocaleString()} DT`, color: '#F59E0B' },
                        { label: 'Taux réalisation', value: `${Math.round((stats.budgetTotal || 0) / 100000 * 100)}%`, color: stats.budgetTotal >= 100000 ? '#10B981' : '#EF4444' },
                      ].map((item, i) => (
                          <Box key={i} sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: item.color + '08', border: `1px solid ${item.color}20` }}>
                            <Typography sx={{ fontSize: '0.75rem', color: '#64748B', mb: 0.5 }}>{item.label}</Typography>
                            <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: item.color }}>{item.value}</Typography>
                          </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Évolution budget sur 5 ans */}
                <Grid item xs={12}>
                  <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                    <CardContent>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 0.5 }}>
                        Évolution du budget sur {availableYears.length} ans
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mb: 2 }}>
                        Tendance annuelle {availableYears[availableYears.length-1]} → {availableYears[0]}
                      </Typography>
                      <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={annualEvolution} margin={{ top: 5, right: 20, bottom: 0, left: -10 }}>
                          <defs>
                            <linearGradient id="budgetGrad5" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                          <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} axisLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="budget" name="Budget (DT)"
                                stroke="#6366F1" fill="url(#budgetGrad5)" strokeWidth={3}
                                dot={{ fill: '#6366F1', r: 6, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 8 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </motion.div>
        )}
      </Box>
  );
}