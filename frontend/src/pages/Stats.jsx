import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, FormControl,
  Select, MenuItem, LinearProgress, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, Alert, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, ReferenceLine,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { statsService } from '../services/api';
import {
  School, People, Person, AttachMoney, TrendingUp, TrendingDown,
  EmojiEvents, CheckCircle, Assessment, Star,
  ShowChart, DonutLarge, CompareArrows, AutoGraph,
} from '@mui/icons-material';

// ── Palette cohérente ─────────────────────────────────────────────────────────
const C = {
  indigo:  '#6366F1',
  emerald: '#10B981',
  amber:   '#F59E0B',
  rose:    '#F43F5E',
  violet:  '#8B5CF6',
  cyan:    '#06B6D4',
  orange:  '#EA580C',
};
const YEAR_COLORS = [C.indigo, C.emerald, C.amber, C.rose, C.violet];
const DOMAIN_COLORS = [C.indigo, C.emerald, C.amber, C.rose, C.violet, C.cyan, C.orange];

// ── Tooltip sombre custom ─────────────────────────────────────────────────────
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
      <Box sx={{ bgcolor: '#0F172A', border: '1px solid #1E293B', borderRadius: 2, p: 1.5, minWidth: 150 }}>
        {label && <Typography sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#64748B', mb: 0.8 }}>{label}</Typography>}
        {payload.map((p, i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 0.3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: p.color || p.fill }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>{p.name}</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.78rem', color: '#F1F5F9', fontWeight: 700 }}>
                {typeof p.value === 'number' && p.value > 999
                    ? `${p.value.toLocaleString('fr-TN')} DT`
                    : typeof p.value === 'number'
                        ? Number(p.value).toFixed(1)
                        : p.value}
              </Typography>
            </Box>
        ))}
      </Box>
  );
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon, title, value, color, bg, sub, trend, delay = 0 }) {
  const Icon = icon;
  const isUp = trend && !String(trend).startsWith('-');
  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', height: '100%', position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', top: 0, right: 0, width: 70, height: 70, borderRadius: '0 0 0 100%', bgcolor: `${color}08` }} />
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: bg }}>
                <Icon sx={{ color, fontSize: 20 }} />
              </Box>
              {trend && (
                  <Chip
                      size="small"
                      icon={isUp ? <TrendingUp sx={{ fontSize: '11px !important' }} /> : <TrendingDown sx={{ fontSize: '11px !important' }} />}
                      label={trend}
                      sx={{ bgcolor: isUp ? '#DCFCE7' : '#FEE2E2', color: isUp ? '#15803D' : '#DC2626', fontWeight: 700, fontSize: '0.67rem', height: 20, '& .MuiChip-icon': { color: 'inherit' } }}
                  />
              )}
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.75rem', color: '#0F172A', lineHeight: 1, mb: 0.4 }}>
              {value}
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#475569' }}>{title}</Typography>
            {sub && <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', mt: 0.3 }}>{sub}</Typography>}
          </CardContent>
        </Card>
      </motion.div>
  );
}

// ── Jauge circulaire SVG ──────────────────────────────────────────────────────
function CircularGauge({ value, max, label, color, size = 130 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const r = 48;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.8 }}>
        <Box sx={{ position: 'relative', width: size, height: size }}>
          <svg viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)', width: size, height: size }}>
            <circle cx="55" cy="55" r={r} fill="none" stroke="#F1F5F9" strokeWidth="9" />
            <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="9"
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1.2s ease' }} />
            <circle cx="55" cy="55" r={r} fill="none" stroke="#E2E8F0" strokeWidth="1.5"
                    strokeDasharray={`2 ${circ - 2}`} strokeDashoffset={-(70 / 100) * circ} />
          </svg>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color, lineHeight: 1 }}>
              {typeof value === 'number' && value < 30 ? Number(value).toFixed(1) : value}
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', color: '#9CA3AF' }}>/{max}</Typography>
          </Box>
        </Box>
        <Chip label={`${pct}%`} size="small" sx={{
          fontWeight: 800, fontSize: '0.75rem', height: 22,
          bgcolor: pct >= 80 ? '#DCFCE7' : pct >= 65 ? '#FEF3C7' : '#FEE2E2',
          color: pct >= 80 ? '#14532D' : pct >= 65 ? '#78350F' : '#7F1D1D',
        }} />
        <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>{label}</Typography>
      </Box>
  );
}

// ── Barre de progression notes ────────────────────────────────────────────────
function NoteBar({ domaine, note, pourcentage, color, index }) {
  return (
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.07 }}>
        <Box sx={{ mb: 2.2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: color }} />
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#374151' }}>{domaine}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A' }}>
                {Number(note).toFixed(1)}<Typography component="span" sx={{ fontSize: '0.68rem', color: '#9CA3AF' }}>/20</Typography>
              </Typography>
              <Chip label={`${pourcentage}%`} size="small" sx={{
                height: 18, fontSize: '0.67rem', fontWeight: 700,
                bgcolor: pourcentage >= 80 ? '#DCFCE7' : pourcentage >= 65 ? '#FEF3C7' : '#FEE2E2',
                color: pourcentage >= 80 ? '#14532D' : pourcentage >= 65 ? '#78350F' : '#7F1D1D',
              }} />
            </Box>
          </Box>
          <Box sx={{ position: 'relative', height: 9, borderRadius: 5, bgcolor: '#F1F5F9', overflow: 'hidden' }}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pourcentage}%` }}
                transition={{ delay: index * 0.07 + 0.25, duration: 0.7, ease: 'easeOut' }}
                style={{ position: 'absolute', height: '100%', borderRadius: 5, background: `linear-gradient(90deg, ${color}70, ${color})` }}
            />
            {/* Ligne seuil 70% */}
            <Box sx={{ position: 'absolute', left: '70%', top: -2, bottom: -2, width: 2, bgcolor: '#CBD5E1', borderRadius: 1 }} />
          </Box>
          <Typography sx={{ fontSize: '0.63rem', color: '#9CA3AF', mt: 0.3, textAlign: 'right' }}>Seuil 70% = 14/20</Typography>
        </Box>
      </motion.div>
  );
}

// ── Tableau comparatif ────────────────────────────────────────────────────────
function ComparisonTable({ allStats, years, primaryYear }) {
  const indicators = [
    { label: 'Formations',     key: 'totalFormations',    fmt: v => String(v || 0) },
    { label: 'Participants',   key: 'totalParticipants',  fmt: v => String(v || 0) },
    { label: 'Formateurs',     key: 'totalFormateurs',    fmt: v => String(v || 0) },
    { label: 'Budget total',   key: 'budgetTotal',        fmt: v => `${((v || 0)).toLocaleString('fr-TN')} DT` },
    { label: 'Taux présence',  key: 'tauxPresence',       fmt: v => `${v || 0}%` },
    { label: 'Note moy. /20',  key: 'noteMoyenneGlobale', fmt: v => v ? `${Number(v).toFixed(1)}/20` : '—' },
  ];
  const sorted = [...years].sort();
  return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.77rem', py: 1.5, minWidth: 120 }}>Indicateur</TableCell>
              {sorted.map(year => (
                  <TableCell key={year} align="center" sx={{
                    fontWeight: 700, fontSize: '0.82rem', py: 1.5,
                    color: year === primaryYear ? C.indigo : '#64748B',
                    bgcolor: year === primaryYear ? `${C.indigo}08` : 'transparent',
                    borderBottom: year === primaryYear ? `2px solid ${C.indigo}` : undefined,
                  }}>
                    {year}
                    {year === primaryYear && <Chip label="actuel" size="small" sx={{ ml: 0.5, height: 14, fontSize: '0.57rem', bgcolor: C.indigo, color: '#fff' }} />}
                  </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.72rem', py: 1.5, minWidth: 80 }}>Évolution</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {indicators.map((ind, i) => {
              const vals = sorted.map(y => Number(allStats[y]?.[ind.key]) || 0);
              const first = vals[0], last = vals[vals.length - 1];
              const evolPct = first > 0 ? Math.round((last - first) / first * 100) : null;
              return (
                  <TableRow key={i} sx={{ '&:hover': { bgcolor: '#FAFBFF' } }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.84rem', color: '#0F172A' }}>{ind.label}</TableCell>
                    {sorted.map((year, vi) => {
                      const raw = Number(allStats[year]?.[ind.key]) || 0;
                      const prev = vi > 0 ? Number(allStats[sorted[vi - 1]]?.[ind.key]) || 0 : null;
                      const delta = prev !== null && prev > 0 ? Math.round((raw - prev) / prev * 100) : null;
                      return (
                          <TableCell key={year} align="center" sx={{
                            fontSize: '0.84rem', fontWeight: year === primaryYear ? 800 : 600,
                            color: year === primaryYear ? C.indigo : '#0F172A',
                            bgcolor: year === primaryYear ? `${C.indigo}05` : 'transparent',
                          }}>
                            {ind.fmt(raw)}
                            {delta !== null && vi > 0 && (
                                <Typography component="span" sx={{ ml: 0.5, fontSize: '0.62rem', fontWeight: 700, color: delta >= 0 ? '#15803D' : '#DC2626' }}>
                                  {delta >= 0 ? '▲' : '▼'}{Math.abs(delta)}%
                                </Typography>
                            )}
                          </TableCell>
                      );
                    })}
                    <TableCell align="center">
                      {evolPct !== null && (
                          <Chip
                              label={`${evolPct >= 0 ? '+' : ''}${evolPct}%`} size="small"
                              icon={evolPct >= 0 ? <TrendingUp sx={{ fontSize: '11px !important' }} /> : <TrendingDown sx={{ fontSize: '11px !important' }} />}
                              sx={{ bgcolor: evolPct >= 0 ? '#DCFCE7' : '#FEE2E2', color: evolPct >= 0 ? '#15803D' : '#DC2626', fontWeight: 700, fontSize: '0.7rem', height: 20, '& .MuiChip-icon': { color: 'inherit' } }}
                          />
                      )}
                    </TableCell>
                  </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function Stats() {
  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4];

  const [primaryYear, setPrimaryYear] = useState(currentYear);
  const [compareYears, setCompareYears] = useState([currentYear - 1]);
  const [allStats, setAllStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [chartMetric, setChartMetric] = useState('formations');

  const loadYear = useCallback(async (year) => {
    if (allStats[year]) return;
    try {
      const res = await statsService.getDashboard(year);
      const data = res.data;
      // Calcul note globale si non fournie
      if (!data.noteMoyenneGlobale && data.notesMoyennesParDomaine?.length) {
        const notes = data.notesMoyennesParDomaine.map(d => d.note).filter(Boolean);
        data.noteMoyenneGlobale = notes.length
            ? Math.round(notes.reduce((a, b) => a + b, 0) / notes.length * 10) / 10
            : null;
      }
      setAllStats(prev => ({ ...prev, [year]: data }));
      setError(null);
    } catch (e) {
      console.error(`Erreur chargement stats ${year}:`, e);
      setError(`Impossible de charger les données ${year}`);
    }
  }, [allStats]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.allSettled(availableYears.map(y => loadYear(y)));
      setLoading(false);
    };
    init();
  }, []);

  const toggleCompare = (year) => {
    if (year === primaryYear) return;
    setCompareYears(prev =>
        prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year].slice(0, 3)
    );
  };

  const stats = allStats[primaryYear] || {};
  const prevStats = allStats[primaryYear - 1] || {};

  const calcTrend = (cur, prev) => {
    if (!prev || prev === 0 || !cur) return null;
    const pct = Math.round((cur - prev) / prev * 100);
    return `${pct >= 0 ? '+' : ''}${pct}%`;
  };

  const activeYears = [primaryYear, ...compareYears].filter((v, i, a) => a.indexOf(v) === i).sort();

  // Données mensuelles comparées
  const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const monthlyComparison = MOIS.map((mois, i) => {
    const row = { mois };
    activeYears.forEach(year => {
      const m = (allStats[year]?.evolutionMensuelle || [])[i] || {};
      row[`val_${year}`] = m[chartMetric] || 0;
    });
    return row;
  });

  // Tendance annuelle 5 ans
  const annualTrend = [...availableYears].reverse().map(year => {
    const d = allStats[year] || {};
    return {
      year: String(year),
      formations: d.totalFormations || 0,
      participants: d.totalParticipants || 0,
      budget: d.budgetTotal || 0,
      tauxPresence: d.tauxPresence || 0,
      noteMoyenne: d.noteMoyenneGlobale || 0,
    };
  });

  // Notes par domaine multi-années
  const notesComparison = (stats.notesMoyennesParDomaine || []).map(d => {
    const row = { domaine: d.domaine?.substring(0, 9) || '' };
    activeYears.forEach(year => {
      const yd = allStats[year] || {};
      const found = (yd.notesMoyennesParDomaine || []).find(x => x.domaine === d.domaine);
      row[`note_${year}`] = found ? Math.round(found.note * 10) / 10 : 0;
      row[`pct_${year}`] = found ? Math.round(found.note / 20 * 100) : 0;
    });
    return row;
  });

  const noteGlobale = stats.noteMoyenneGlobale || 0;
  const notePct = Math.round(noteGlobale / 20 * 100);

  const tabs = [
    { label: 'Évolution mensuelle', icon: ShowChart },
    { label: 'Comparaison multi-années', icon: CompareArrows },
    { label: 'Répartition', icon: DonutLarge },
    { label: 'Notes & Résultats', icon: Assessment },
    { label: 'Performance', icon: EmojiEvents },
    { label: 'Budget', icon: AttachMoney },
  ];

  const hasData = Object.keys(allStats).length > 0;

  return (
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Box sx={{
            mb: 3, p: 3, borderRadius: 3,
            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 40%, #4C1D95 100%)',
            position: 'relative', overflow: 'hidden',
          }}>
            <Box sx={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(99,102,241,0.15)' }} />
            <Box sx={{ position: 'absolute', bottom: -20, left: '30%', width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(139,92,246,0.1)' }} />
            <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <AutoGraph sx={{ color: '#A5B4FC', fontSize: 26 }} />
                  <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#fff', letterSpacing: '-0.02em' }}>
                    Statistiques & Analyses
                  </Typography>
                </Box>
                <Typography sx={{ color: '#A5B4FC', fontSize: '0.85rem' }}>
                  Tableau de bord analytique · Données réelles · {availableYears[availableYears.length - 1]}–{availableYears[0]}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                <FormControl size="small">
                  <Select value={primaryYear} onChange={(e) => { setPrimaryYear(e.target.value); setCompareYears([]); }}
                          sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }, '& .MuiSvgIcon-root': { color: '#fff' }, fontSize: '0.875rem', fontWeight: 700 }}>
                    {availableYears.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>Comparer :</Typography>
                  {availableYears.filter(y => y !== primaryYear).map((y, idx) => {
                    const active = compareYears.includes(y);
                    const col = YEAR_COLORS[compareYears.indexOf(y) + 1] || YEAR_COLORS[idx + 1];
                    return (
                        <Chip key={y} label={y} size="small" onClick={() => toggleCompare(y)} sx={{
                          cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', height: 24,
                          bgcolor: active ? `${col}30` : 'rgba(255,255,255,0.08)',
                          color: active ? col : 'rgba(255,255,255,0.45)',
                          border: `1px solid ${active ? col + '60' : 'transparent'}`,
                          transition: 'all 0.2s',
                        }} />
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Box>
        </motion.div>

        {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1, bgcolor: '#EEF2FF', '& .MuiLinearProgress-bar': { bgcolor: C.indigo } }} />}

        {error && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              {error} — certaines données peuvent être incomplètes.
            </Alert>
        )}

        {!hasData && !loading && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              Aucune donnée disponible pour les années sélectionnées.
            </Alert>
        )}

        {/* ── KPIs ─────────────────────────────────────────────────────────── */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { icon: School,      title: 'Formations',    value: stats.totalFormations ?? '—',   color: C.indigo,  bg: '#EEF2FF', trend: calcTrend(stats.totalFormations, prevStats.totalFormations),   sub: `Année ${primaryYear}` },
            { icon: People,      title: 'Participants',  value: stats.totalParticipants ?? '—', color: C.emerald, bg: '#ECFDF5', trend: calcTrend(stats.totalParticipants, prevStats.totalParticipants), sub: 'ayant suivi une formation' },
            { icon: Person,      title: 'Formateurs',   value: stats.totalFormateurs ?? '—',   color: C.amber,   bg: '#FFFBEB', sub: `${stats.formateursInternes ?? 0} int. · ${stats.formateursExternes ?? 0} ext.` },
            { icon: AttachMoney, title: 'Budget Total', value: stats.budgetTotal ? `${Math.round(stats.budgetTotal).toLocaleString('fr-TN')} DT` : '—', color: C.rose, bg: '#FFF1F2', trend: calcTrend(stats.budgetTotal, prevStats.budgetTotal) },
            { icon: CheckCircle, title: 'Taux Présence',value: stats.tauxPresence ? `${stats.tauxPresence}%` : '—', color: C.violet, bg: '#F5F3FF', trend: calcTrend(stats.tauxPresence, prevStats.tauxPresence), sub: 'des inscrits présents' },
            { icon: Star,        title: 'Note Moy. /20', value: noteGlobale ? Number(noteGlobale).toFixed(1) : '—', color: C.cyan, bg: '#ECFEFF', sub: `${notePct || 0}% de réussite` },
          ].map((kpi, i) => (
              <Grid item xs={6} sm={4} lg={2} key={i}>
                <KpiCard {...kpi} delay={i * 0.06} />
              </Grid>
          ))}
        </Grid>

        {/* ── TABS ─────────────────────────────────────────────────────────── */}
        <Box sx={{ mb: 3, borderBottom: '1px solid #E2E8F0', overflowX: 'auto' }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', minHeight: 44, gap: 0.5 },
                  '& .Mui-selected': { color: C.indigo },
                  '& .MuiTabs-indicator': { bgcolor: C.indigo, height: 3, borderRadius: '3px 3px 0 0' },
                }}>
            {tabs.map((t, i) => <Tab key={i} icon={<t.icon sx={{ fontSize: 16 }} />} label={t.label} iconPosition="start" />)}
          </Tabs>
        </Box>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

            {/* ══════════════════════════════════════════════════
            TAB 0 : ÉVOLUTION MENSUELLE (données réelles)
          ══════════════════════════════════════════════════ */}
            {activeTab === 0 && (
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
                              Évolution mensuelle — {activeYears.join(' vs ')}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>Données réelles issues des inscriptions</Typography>
                          </Box>
                          <ToggleButtonGroup value={chartMetric} exclusive onChange={(_, v) => v && setChartMetric(v)} size="small">
                            {[{ v: 'formations', l: 'Formations' }, { v: 'participants', l: 'Participants' }, { v: 'budget', l: 'Budget' }].map(({ v, l }) => (
                                <ToggleButton key={v} value={v} sx={{ textTransform: 'none', fontSize: '0.77rem', px: 1.5, py: 0.5, '&.Mui-selected': { bgcolor: '#EEF2FF', color: C.indigo } }}>
                                  {l}
                                </ToggleButton>
                            ))}
                          </ToggleButtonGroup>
                        </Box>
                        {/* Légende */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
                          {activeYears.map((year, idx) => (
                              <Box key={year} sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                                <Box sx={{ width: 20, height: 3, borderRadius: 2, bgcolor: YEAR_COLORS[idx], border: idx > 0 ? `1px dashed ${YEAR_COLORS[idx]}` : undefined }} />
                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: YEAR_COLORS[idx] }}>{year}</Typography>
                                {year === primaryYear && <Chip label="principal" size="small" sx={{ height: 13, fontSize: '0.57rem', bgcolor: YEAR_COLORS[idx], color: '#fff' }} />}
                              </Box>
                          ))}
                        </Box>
                        <ResponsiveContainer width="100%" height={270}>
                          <AreaChart data={monthlyComparison} margin={{ top: 5, right: 20, bottom: 0, left: -10 }}>
                            <defs>
                              {activeYears.map((year, idx) => (
                                  <linearGradient key={year} id={`grd_${year}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={YEAR_COLORS[idx]} stopOpacity={0.14} />
                                    <stop offset="95%" stopColor={YEAR_COLORS[idx]} stopOpacity={0.01} />
                                  </linearGradient>
                              ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<DarkTooltip />} />
                            {activeYears.map((year, idx) => (
                                <Area key={year} type="monotone" dataKey={`val_${year}`} name={String(year)}
                                      stroke={YEAR_COLORS[idx]} fill={`url(#grd_${year})`}
                                      strokeWidth={idx === 0 ? 2.5 : 2} strokeDasharray={idx > 0 ? '6 3' : undefined}
                                      dot={{ fill: YEAR_COLORS[idx], r: idx === 0 ? 4 : 3, strokeWidth: 0 }}
                                      activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }} />
                            ))}
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Mini stats mensuelles */}
                  {(stats.evolutionMensuelle || []).filter(m => (m.formations || 0) > 0).length > 0 && (
                      <Grid item xs={12}>
                        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                          <CardContent sx={{ p: 2.5 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', mb: 2 }}>
                              Détail par mois — {primaryYear}
                            </Typography>
                            <Grid container spacing={1.5}>
                              {(stats.evolutionMensuelle || []).map((m, i) => {
                                const maxF = Math.max(...(stats.evolutionMensuelle || []).map(x => x.formations || 1));
                                const pct = Math.round((m.formations || 0) / maxF * 100);
                                return (
                                    <Grid item xs={6} sm={4} md={2} key={i}>
                                      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                                        <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', mb: 0.2 }}>{m.mois}</Typography>
                                        <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: m.formations > 0 ? '#0F172A' : '#CBD5E1' }}>
                                          {m.formations || 0}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.63rem', color: '#64748B' }}>formations</Typography>
                                        <Box sx={{ height: 3, bgcolor: '#E2E8F0', borderRadius: 2, mt: 1, overflow: 'hidden' }}>
                                          <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: C.indigo, borderRadius: 2 }} />
                                        </Box>
                                        {m.participants > 0 && (
                                            <Typography sx={{ fontSize: '0.6rem', color: C.emerald, mt: 0.5, fontWeight: 600 }}>
                                              {m.participants} part.
                                            </Typography>
                                        )}
                                      </Box>
                                    </Grid>
                                );
                              })}
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                  )}
                </Grid>
            )}

            {/* ══════════════════════════════════════════════════
            TAB 1 : COMPARAISON MULTI-ANNÉES (données réelles)
          ══════════════════════════════════════════════════ */}
            {activeTab === 1 && (
                <Grid container spacing={2.5}>
                  {/* Tendance pluriannuelle */}
                  <Grid item xs={12}>
                    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
                              Tendance pluriannuelle — {availableYears[availableYears.length - 1]}→{availableYears[0]}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>Progression réelle sur {availableYears.length} ans</Typography>
                          </Box>
                          <ToggleButtonGroup value={chartMetric} exclusive onChange={(_, v) => v && setChartMetric(v)} size="small">
                            {[
                              { v: 'formations', l: 'Formations' }, { v: 'participants', l: 'Participants' },
                              { v: 'budget', l: 'Budget' }, { v: 'tauxPresence', l: 'Présence' }, { v: 'noteMoyenne', l: 'Note' },
                            ].map(({ v, l }) => (
                                <ToggleButton key={v} value={v} sx={{ textTransform: 'none', fontSize: '0.74rem', px: 1.2, py: 0.4, '&.Mui-selected': { bgcolor: '#EEF2FF', color: C.indigo } }}>
                                  {l}
                                </ToggleButton>
                            ))}
                          </ToggleButtonGroup>
                        </Box>
                        <ResponsiveContainer width="100%" height={250}>
                          <ComposedChart data={annualTrend} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
                            <defs>
                              <linearGradient id="annGrd" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={C.indigo} stopOpacity={0.18} />
                                <stop offset="95%" stopColor={C.indigo} stopOpacity={0.01} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#475569', fontWeight: 700 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<DarkTooltip />} />
                            <Area type="monotone" dataKey={chartMetric}
                                  name={chartMetric === 'formations' ? 'Formations' : chartMetric === 'participants' ? 'Participants' : chartMetric === 'budget' ? 'Budget (DT)' : chartMetric === 'tauxPresence' ? 'Taux présence (%)' : 'Note moy. /20'}
                                  stroke={C.indigo} fill="url(#annGrd)" strokeWidth={3}
                                  dot={{ fill: C.indigo, r: 7, strokeWidth: 2, stroke: '#fff' }}
                                  activeDot={{ r: 9 }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Tableau comparatif */}
                  <Grid item xs={12}>
                    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>
                          Tableau comparatif — {availableYears.length} années
                        </Typography>
                        {Object.keys(allStats).length > 0
                            ? <ComparisonTable allStats={allStats} years={availableYears} primaryYear={primaryYear} />
                            : <Typography sx={{ color: '#94A3B8', textAlign: 'center', py: 3 }}>Chargement des données...</Typography>
                        }
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Barres groupées par domaine si comparaison */}
                  {compareYears.length > 0 && (stats.formationsParDomaine || []).length > 0 && (
                      <Grid item xs={12}>
                        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                          <CardContent sx={{ p: 3 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>
                              Formations par domaine — {activeYears.join(' vs ')}
                            </Typography>
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart
                                  data={(stats.formationsParDomaine || []).map(d => {
                                    const row = { name: d.name };
                                    activeYears.forEach(year => {
                                      const found = (allStats[year]?.formationsParDomaine || []).find(x => x.name === d.name);
                                      row[String(year)] = found?.value || 0;
                                    });
                                    return row;
                                  })}
                                  barSize={16} barGap={3}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} />
                                <Tooltip content={<DarkTooltip />} />
                                {activeYears.map((year, idx) => (
                                    <Bar key={year} dataKey={String(year)} name={String(year)} fill={YEAR_COLORS[idx]} radius={[4, 4, 0, 0]} />
                                ))}
                              </BarChart>
                            </ResponsiveContainer>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1.5, justifyContent: 'center' }}>
                              {activeYears.map((year, idx) => (
                                  <Box key={year} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                    <Box sx={{ width: 9, height: 9, borderRadius: 1, bgcolor: YEAR_COLORS[idx] }} />
                                    <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{year}</Typography>
                                  </Box>
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                  )}
                </Grid>
            )}

            {/* ══════════════════════════════════════════════════
            TAB 2 : RÉPARTITION (données réelles)
          ══════════════════════════════════════════════════ */}
            {activeTab === 2 && (
                <Grid container spacing={2.5}>
                  {/* Donut statuts */}
                  <Grid item xs={12} md={5}>
                    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', height: '100%' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 0.5 }}>Statuts des formations</Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', mb: 2 }}>{primaryYear} — données réelles</Typography>
                        {(stats.formationsParStatut || []).length > 0 ? (
                            <>
                              <ResponsiveContainer width="100%" height={190}>
                                <PieChart>
                                  <Pie data={stats.formationsParStatut || []} cx="50%" cy="50%"
                                       innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                    {(stats.formationsParStatut || []).map((entry, i) => (
                                        <Cell key={i} fill={entry.color || DOMAIN_COLORS[i]} strokeWidth={0} />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<DarkTooltip />} />
                                </PieChart>
                              </ResponsiveContainer>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9, mt: 1 }}>
                                {(stats.formationsParStatut || []).map((d, i) => {
                                  const total = (stats.formationsParStatut || []).reduce((s, x) => s + (x.value || 0), 0);
                                  const pct = total > 0 ? Math.round((d.value || 0) / total * 100) : 0;
                                  return (
                                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: d.color }} />
                                          <Typography sx={{ fontSize: '0.82rem', color: '#475569' }}>{d.name}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>{d.value}</Typography>
                                          <Chip label={`${pct}%`} size="small" sx={{ height: 17, fontSize: '0.66rem', bgcolor: d.color + '20', color: d.color, fontWeight: 700 }} />
                                        </Box>
                                      </Box>
                                  );
                                })}
                              </Box>
                            </>
                        ) : (
                            <Typography sx={{ color: '#94A3B8', textAlign: 'center', py: 4 }}>Pas de données pour {primaryYear}</Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Barres domaine */}
                  <Grid item xs={12} md={7}>
                    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 0.5 }}>Formations & Budget par domaine</Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', mb: 2 }}>{primaryYear} · barres = formations, courbe = budget</Typography>
                        {(stats.formationsParDomaine || []).length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                              <ComposedChart data={stats.formationsParDomaine || []} barSize={26}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} />
                                <YAxis yAxisId="l" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} />
                                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                                <Tooltip content={<DarkTooltip />} />
                                <Bar yAxisId="l" dataKey="value" name="Formations" radius={[5, 5, 0, 0]}>
                                  {(stats.formationsParDomaine || []).map((_, i) => (
                                      <Cell key={i} fill={DOMAIN_COLORS[i % DOMAIN_COLORS.length]} />
                                  ))}
                                </Bar>
                                <Line yAxisId="r" type="monotone" dataKey="budget" name="Budget (DT)"
                                      stroke={C.amber} strokeWidth={2.5}
                                      dot={{ fill: C.amber, r: 5, strokeWidth: 2, stroke: '#fff' }} />
                              </ComposedChart>
                            </ResponsiveContainer>
                        ) : (
                            <Typography sx={{ color: '#94A3B8', textAlign: 'center', py: 4 }}>Pas de données pour {primaryYear}</Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Participants par structure */}
                  {(stats.participantsParStructure || []).length > 0 && (
                      <Grid item xs={12}>
                        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                          <CardContent sx={{ p: 3 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>
                              Participants par structure — {primaryYear}
                            </Typography>
                            <ResponsiveContainer width="100%" height={Math.max(180, (stats.participantsParStructure || []).length * 45)}>
                              <BarChart data={stats.participantsParStructure || []} layout="vertical" barSize={22}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} width={130} />
                                <Tooltip content={<DarkTooltip />} />
                                <Bar dataKey="participants" name="Participants" radius={[0, 6, 6, 0]}>
                                  {(stats.participantsParStructure || []).map((_, i) => (
                                      <Cell key={i} fill={DOMAIN_COLORS[i % DOMAIN_COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </Grid>
                  )}
                </Grid>
            )}

            {/* ══════════════════════════════════════════════════
            TAB 3 : NOTES & RÉSULTATS (données réelles)
          ══════════════════════════════════════════════════ */}
            {activeTab === 3 && (
                <Grid container spacing={2.5}>
                  {/* Jauges */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', height: '100%' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2.5, textAlign: 'center' }}>
                          Indicateurs qualité — {primaryYear}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2.5 }}>
                          <CircularGauge value={noteGlobale || 0} max={20} label="Note globale"
                                         color={notePct >= 80 ? C.emerald : notePct >= 65 ? C.amber : C.rose} />
                          <CircularGauge value={stats.tauxPresence || 0} max={100} label="Taux présence" color={C.violet} size={120} />
                        </Box>
                        {/* Comparaison vs année précédente */}
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                          <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', mb: 1, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            vs {primaryYear - 1}
                          </Typography>
                          {[
                            { label: 'Note moy.', cur: noteGlobale, prev: prevStats.noteMoyenneGlobale, fmt: v => `${Number(v || 0).toFixed(1)}/20` },
                            { label: 'Taux présence', cur: stats.tauxPresence || 0, prev: prevStats.tauxPresence || 0, fmt: v => `${v}%` },
                          ].map((item, i) => {
                            const delta = Number(item.cur || 0) - Number(item.prev || 0);
                            const isPos = delta >= 0;
                            return (
                                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                                  <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>{item.label}</Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>{item.fmt(item.cur)}</Typography>
                                    <Chip size="small" label={`${isPos ? '+' : ''}${Number(delta).toFixed(1)}`}
                                          sx={{ height: 17, fontSize: '0.66rem', fontWeight: 700, bgcolor: isPos ? '#DCFCE7' : '#FEE2E2', color: isPos ? '#15803D' : '#DC2626' }} />
                                  </Box>
                                </Box>
                            );
                          })}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Barres notes par domaine */}
                  <Grid item xs={12} md={8}>
                    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
                            Notes par domaine — {primaryYear}
                          </Typography>
                          <Chip label="Note /20 + % réussite" size="small" sx={{ bgcolor: '#EEF2FF', color: C.indigo, fontWeight: 600 }} />
                        </Box>
                        {(stats.notesMoyennesParDomaine || []).length > 0 ? (
                            (stats.notesMoyennesParDomaine || []).map((d, i) => (
                                <NoteBar key={i} domaine={d.domaine} note={d.note}
                                         pourcentage={d.pourcentage || Math.round(d.note / 20 * 100)}
                                         color={DOMAIN_COLORS[i % DOMAIN_COLORS.length]} index={i} />
                            ))
                        ) : (
                            <Typography sx={{ color: '#94A3B8', textAlign: 'center', py: 4 }}>
                              Aucune note enregistrée pour {primaryYear}
                            </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Comparaison notes multi-années */}
                  {notesComparison.length > 0 && (
                      <Grid item xs={12}>
                        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                          <CardContent sx={{ p: 3 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 0.5 }}>
                              Comparaison notes par domaine — {activeYears.join(' vs ')}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', mb: 2 }}>
                              Barres = note /20 · Courbes = % réussite · Ligne rouge = seuil 70% (14/20)
                            </Typography>
                            <ResponsiveContainer width="100%" height={270}>
                              <ComposedChart data={notesComparison} barSize={16} margin={{ top: 5, right: 30, bottom: 0, left: -10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="domaine" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} />
                                <YAxis yAxisId="l" domain={[0, 20]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} />
                                <YAxis yAxisId="r" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickFormatter={v => `${v}%`} />
                                <Tooltip content={<DarkTooltip />} />
                                <ReferenceLine yAxisId="l" y={14} stroke={C.rose} strokeDasharray="5 4" strokeWidth={1.5}
                                               label={{ value: '14/20', position: 'insideRight', fontSize: 10, fill: C.rose, fontWeight: 700 }} />
                                {activeYears.map((year, idx) => (
                                    <Bar key={year} yAxisId="l" dataKey={`note_${year}`} name={`Note ${year}`}
                                         fill={YEAR_COLORS[idx]} radius={[4, 4, 0, 0]} opacity={0.85} barSize={18 - idx * 2} />
                                ))}
                                {activeYears.map((year, idx) => (
                                    <Line key={`pct_${year}`} yAxisId="r" type="monotone" dataKey={`pct_${year}`} name={`% réussite ${year}`}
                                          stroke={YEAR_COLORS[idx]} strokeWidth={2} strokeDasharray={idx > 0 ? '5 3' : undefined}
                                          dot={{ fill: YEAR_COLORS[idx], r: 4, strokeWidth: 2, stroke: '#fff' }} />
                                ))}
                              </ComposedChart>
                            </ResponsiveContainer>
                            <Box sx={{ display: 'flex', gap: 2.5, mt: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                              {activeYears.map((year, idx) => (
                                  <Box key={year} sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                                    <Box sx={{ width: 10, height: 9, borderRadius: 1, bgcolor: YEAR_COLORS[idx] }} />
                                    <Typography sx={{ fontSize: '0.73rem', color: '#64748B' }}>Note {year}</Typography>
                                    <Box sx={{ width: 14, height: 2, bgcolor: YEAR_COLORS[idx], ml: 0.5 }} />
                                    <Typography sx={{ fontSize: '0.73rem', color: '#64748B' }}>% {year}</Typography>
                                  </Box>
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                  )}
                </Grid>
            )}

            {/* ══════════════════════════════════════════════════
            TAB 4 : PERFORMANCE FORMATEURS (données réelles)
          ══════════════════════════════════════════════════ */}
            {activeTab === 4 && (
                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={8}>
                    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                          <EmojiEvents sx={{ color: C.amber, fontSize: 22 }} />
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
                              Classement Formateurs — {primaryYear}
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>Classé par note moyenne des apprenants — données réelles</Typography>
                          </Box>
                        </Box>
                        {(stats.topFormateurs || []).length > 0 ? (
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                    {['#', 'Formateur', 'Type', 'Sessions', 'Note moy.', '% Réussite', 'Satisfaction'].map(h => (
                                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#94A3B8', py: 1.5 }}>{h}</TableCell>
                                    ))}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {(stats.topFormateurs || []).map((f, i) => {
                                    const note = Number(f.noteMoyenne || 0);
                                    const notePctF = note ? Math.round(note / 20 * 100) : null;
                                    const medals = ['🥇', '🥈', '🥉'];
                                    return (
                                        <TableRow key={i} sx={{ '&:hover': { bgcolor: '#FAFBFF' } }}>
                                          <TableCell sx={{ py: 1.5, fontSize: '1rem' }}>{medals[i] || `${i + 1}`}</TableCell>
                                          <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              <Avatar sx={{ width: 30, height: 30, fontSize: '0.72rem', fontWeight: 700, bgcolor: f.type === 'INTERNE' ? '#DCFCE7' : '#EDE9FE', color: f.type === 'INTERNE' ? '#15803D' : '#7C3AED' }}>
                                                {String(f.nom || '').charAt(0)}
                                              </Avatar>
                                              <Typography sx={{ fontWeight: 600, fontSize: '0.84rem', color: '#0F172A' }}>{f.nom}</Typography>
                                            </Box>
                                          </TableCell>
                                          <TableCell>
                                            <Chip label={f.type || '—'} size="small" sx={{ height: 17, fontSize: '0.64rem', fontWeight: 700, bgcolor: f.type === 'INTERNE' ? '#DCFCE7' : '#EDE9FE', color: f.type === 'INTERNE' ? '#15803D' : '#7C3AED' }} />
                                          </TableCell>
                                          <TableCell align="center">
                                            <Chip label={f.nbFormations || 0} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.76rem', color: C.indigo, borderColor: '#C7D2FE' }} />
                                          </TableCell>
                                          <TableCell align="center">
                                            <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: note > 0 ? '#0F172A' : '#94A3B8' }}>
                                              {note > 0 ? `${note.toFixed(1)}/20` : '—'}
                                            </Typography>
                                          </TableCell>
                                          <TableCell align="center">
                                            {notePctF !== null && notePctF > 0 ? (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
                                                  <Chip label={`${notePctF}%`} size="small" sx={{ height: 18, fontSize: '0.7rem', fontWeight: 800, bgcolor: notePctF >= 80 ? '#DCFCE7' : notePctF >= 65 ? '#FEF3C7' : '#FEE2E2', color: notePctF >= 80 ? '#14532D' : notePctF >= 65 ? '#78350F' : '#7F1D1D' }} />
                                                  <Box sx={{ width: 55, height: 3, bgcolor: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
                                                    <Box sx={{ height: '100%', width: `${notePctF}%`, bgcolor: notePctF >= 80 ? C.emerald : notePctF >= 65 ? C.amber : C.rose, borderRadius: 2 }} />
                                                  </Box>
                                                </Box>
                                            ) : <Typography sx={{ fontSize: '0.76rem', color: '#94A3B8' }}>—</Typography>}
                                          </TableCell>
                                          <TableCell align="center">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                              <Star sx={{ fontSize: 13, color: C.amber }} />
                                              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700 }}>
                                                {f.satisfaction > 0 ? Number(f.satisfaction).toFixed(1) : '—'}
                                              </Typography>
                                            </Box>
                                          </TableCell>
                                        </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                        ) : (
                            <Typography sx={{ color: '#94A3B8', textAlign: 'center', py: 4 }}>
                              Aucune donnée de formateur pour {primaryYear}
                            </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Grid container spacing={2.5}>
                      {/* Taux présence */}
                      <Grid item xs={12}>
                        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', mb: 2 }}>Taux de présence</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                              <CircularGauge value={stats.tauxPresence || 0} max={100} label="des inscrits" color={C.emerald} size={140} />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                              {[
                                { label: 'Internes', value: stats.formateursInternes || 0, color: C.emerald },
                                { label: 'Externes', value: stats.formateursExternes || 0, color: C.violet },
                              ].map((item, i) => (
                                  <Box key={i} sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, border: `1px solid ${item.color}30`, bgcolor: item.color + '08', flex: 1 }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: item.color }}>{item.value}</Typography>
                                    <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>{item.label}</Typography>
                                  </Box>
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Radar notes */}
                      {(stats.notesMoyennesParDomaine || []).length > 0 && (
                          <Grid item xs={12}>
                            <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                              <CardContent sx={{ p: 3 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', mb: 1 }}>Radar notes / domaine</Typography>
                                <ResponsiveContainer width="100%" height={200}>
                                  <RadarChart data={(stats.notesMoyennesParDomaine || []).map(d => ({
                                    domaine: d.domaine?.substring(0, 6) || '',
                                    note: Math.round(d.note * 10) / 10,
                                  }))}>
                                    <PolarGrid stroke="#F1F5F9" />
                                    <PolarAngleAxis dataKey="domaine" tick={{ fontSize: 10, fill: '#64748B' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 20]} tick={{ fontSize: 9, fill: '#94A3B8' }} tickCount={3} />
                                    <Radar name="Notes" dataKey="note" stroke={C.indigo} fill={C.indigo} fillOpacity={0.18} strokeWidth={2} />
                                  </RadarChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>
                          </Grid>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
            )}

            {/* ══════════════════════════════════════════════════
            TAB 5 : BUDGET (données réelles)
          ══════════════════════════════════════════════════ */}
            {activeTab === 5 && (
                <Grid container spacing={2.5}>
                  {/* KPIs budget */}
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      {[
                        { label: 'Budget réalisé', value: stats.budgetTotal ? `${Math.round(stats.budgetTotal).toLocaleString('fr-TN')} DT` : '—', color: C.indigo, bg: '#EEF2FF', icon: AttachMoney },
                        { label: 'Moy. / formation', value: stats.totalFormations > 0 && stats.budgetTotal ? `${Math.round(stats.budgetTotal / stats.totalFormations).toLocaleString('fr-TN')} DT` : '—', color: C.emerald, bg: '#ECFDF5', icon: School },
                        { label: 'Objectif annuel', value: '100 000 DT', color: C.amber, bg: '#FFFBEB', icon: Assessment },
                        {
                          label: 'Taux réalisation', color: (stats.budgetTotal || 0) >= 100000 ? C.emerald : C.rose,
                          bg: (stats.budgetTotal || 0) >= 100000 ? '#ECFDF5' : '#FFF1F2',
                          value: stats.budgetTotal ? `${Math.round((stats.budgetTotal / 100000) * 100)}%` : '—',
                          icon: TrendingUp,
                        },
                      ].map((item, i) => (
                          <Grid item xs={6} md={3} key={i}>
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                              <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                                <CardContent sx={{ p: 2.5 }}>
                                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: item.bg, display: 'inline-flex', mb: 1.5 }}>
                                    <item.icon sx={{ color: item.color, fontSize: 20 }} />
                                  </Box>
                                  <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: item.color, lineHeight: 1.2 }}>{item.value}</Typography>
                                  <Typography sx={{ fontSize: '0.76rem', color: '#64748B', mt: 0.4 }}>{item.label}</Typography>
                                </CardContent>
                              </Card>
                            </motion.div>
                          </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  {/* Budget trimestriel */}
                  <Grid item xs={12} md={7}>
                    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 0.5 }}>Budget trimestriel — Réel vs Objectif</Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', mb: 2 }}>{primaryYear} — données réelles</Typography>
                        {(stats.budgetParTrimestre || []).length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={stats.budgetParTrimestre || []} barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="trimestre" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                                <Tooltip content={<DarkTooltip />} />
                                <Bar dataKey="budget" name="Budget réel" fill={C.indigo} radius={[5, 5, 0, 0]} />
                                <Bar dataKey="objectif" name="Objectif" fill="#E2E8F0" radius={[5, 5, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <Typography sx={{ color: '#94A3B8', textAlign: 'center', py: 4 }}>Pas de données pour {primaryYear}</Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 2, mt: 1.5, justifyContent: 'center' }}>
                          {[{ color: C.indigo, l: 'Budget réel' }, { color: '#CBD5E1', l: 'Objectif' }].map((item, i) => (
                              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                                <Box sx={{ width: 9, height: 9, borderRadius: 1, bgcolor: item.color }} />
                                <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>{item.l}</Typography>
                              </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Évolution budget 5 ans */}
                  <Grid item xs={12} md={5}>
                    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', height: '100%' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 0.5 }}>
                          Évolution budget — {availableYears.length} ans
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', mb: 2 }}>
                          {availableYears[availableYears.length - 1]}→{availableYears[0]} — données réelles
                        </Typography>
                        <ResponsiveContainer width="100%" height={210}>
                          <AreaChart data={annualTrend} margin={{ top: 5, right: 10, bottom: 0, left: -15 }}>
                            <defs>
                              <linearGradient id="budGrd" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={C.indigo} stopOpacity={0.16} />
                                <stop offset="95%" stopColor={C.indigo} stopOpacity={0.01} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#475569', fontWeight: 700 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                            <Tooltip content={<DarkTooltip />} />
                            <Area type="monotone" dataKey="budget" name="Budget (DT)"
                                  stroke={C.indigo} fill="url(#budGrd)" strokeWidth={3}
                                  dot={{ fill: C.indigo, r: 6, strokeWidth: 2, stroke: '#fff' }}
                                  activeDot={{ r: 8 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
            )}

          </motion.div>
        </AnimatePresence>
      </Box>
  );
}