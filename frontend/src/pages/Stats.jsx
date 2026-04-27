import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, FormControl,
  InputLabel, Select, MenuItem, LinearProgress, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, Alert, Tooltip as MuiTooltip, ToggleButton, ToggleButtonGroup,
  IconButton, Badge,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, ReferenceLine, ScatterChart, Scatter, ZAxis,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { statsService } from '../services/api';
import {
  School, People, Person, AttachMoney, TrendingUp, TrendingDown,
  EmojiEvents, CheckCircle, Assessment, CalendarToday,
  Star, StarBorder, WorkspacePremium, Insights, BarChart as BarIcon,
  ShowChart, DonutLarge, Timeline, CompareArrows, AutoGraph,
} from '@mui/icons-material';

// ── Palette ───────────────────────────────────────────────────────────────────
const PALETTE = {
  indigo:  { main: '#6366F1', light: '#EEF2FF', dark: '#4338CA', muted: '#A5B4FC' },
  emerald: { main: '#10B981', light: '#ECFDF5', dark: '#047857', muted: '#6EE7B7' },
  amber:   { main: '#F59E0B', light: '#FFFBEB', dark: '#B45309', muted: '#FCD34D' },
  rose:    { main: '#F43F5E', light: '#FFF1F2', dark: '#BE123C', muted: '#FDA4AF' },
  violet:  { main: '#8B5CF6', light: '#F5F3FF', dark: '#6D28D9', muted: '#C4B5FD' },
  cyan:    { main: '#06B6D4', light: '#ECFEFF', dark: '#0E7490', muted: '#67E8F9' },
  orange:  { main: '#EA580C', light: '#FFF7ED', dark: '#C2410C', muted: '#FDBA74' },
};

const YEAR_PALETTE = [PALETTE.indigo, PALETTE.emerald, PALETTE.amber, PALETTE.rose, PALETTE.violet];

// ── Génération données démo réalistes ─────────────────────────────────────────
const generateDemoData = (year) => {
  const base = year - 2020;
  const growthRate = 1 + base * 0.13;
  const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const seed = year * 31; // déterministe per year
  const rng = (i) => ((seed * (i + 7) * 1103515245 + 12345) & 0x7fffffff) % 100;

  const notesDomaines = [
    { domaine: 'Informatique', note: Math.min(20, 14.2 + base * 0.25 + rng(1) * 0.02) },
    { domaine: 'Management',   note: Math.min(20, 13.8 + base * 0.22 + rng(2) * 0.02) },
    { domaine: 'Finance',      note: Math.min(20, 13.1 + base * 0.20 + rng(3) * 0.02) },
    { domaine: 'Langues',      note: Math.min(20, 15.0 + base * 0.18 + rng(4) * 0.02) },
    { domaine: 'Juridique',    note: Math.min(20, 13.5 + base * 0.23 + rng(5) * 0.02) },
    { domaine: 'Marketing',    note: Math.min(20, 14.5 + base * 0.20 + rng(6) * 0.02) },
  ].map(d => ({ ...d, pourcentage: Math.round(d.note / 20 * 100) }));

  const noteGlobale = notesDomaines.reduce((s, d) => s + d.note, 0) / notesDomaines.length;

  const formations = Math.round(12 * growthRate) + r(0, 3);
  const participants = Math.round(148 * growthRate) + r(-8, 12);
  const formateurs = Math.round(9 * growthRate) + r(0, 2);
  const budget = Math.round(41000 * growthRate) + r(-1500, 2500);
  const tauxPresence = Math.min(98, Math.round(79 + base * 2.8) + r(-2, 2));

  return {
    totalFormations: formations,
    totalParticipants: participants,
    totalFormateurs: formateurs,
    budgetTotal: budget,
    tauxPresence,
    formateursInternes: Math.round(formateurs * 0.55),
    formateursExternes: Math.round(formateurs * 0.45),
    noteMoyenneGlobale: Math.round(noteGlobale * 10) / 10,
    notesMoyennesParDomaine: notesDomaines,
    formationsParDomaine: [
      { name: 'Informatique', value: Math.round(3.5 * growthRate) + r(0, 1), budget: Math.round(16000 * growthRate) },
      { name: 'Management',   value: Math.round(2.5 * growthRate) + r(0, 1), budget: Math.round(11000 * growthRate) },
      { name: 'Finance',      value: Math.round(2.8 * growthRate) + r(0, 1), budget: Math.round(9500 * growthRate) },
      { name: 'Langues',      value: Math.round(1.8 * growthRate) + r(0, 1), budget: Math.round(6500 * growthRate) },
      { name: 'Juridique',    value: Math.round(1.2 * growthRate) + r(0, 1), budget: Math.round(5000 * growthRate) },
      { name: 'Marketing',    value: Math.round(1.5 * growthRate) + r(0, 1), budget: Math.round(7200 * growthRate) },
    ],
    evolutionMensuelle: ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'].map((mois, i) => {
      const seasonal = Math.sin((i - 1) / 11 * Math.PI) * 0.6 + 0.7;
      return {
        mois,
        formations: Math.max(0, Math.round(formations / 12 * seasonal * (0.8 + rng(i * 3) * 0.004))),
        participants: Math.max(0, Math.round(participants / 12 * seasonal * (0.8 + rng(i * 5) * 0.004))),
        budget: Math.max(0, Math.round(budget / 12 * seasonal * (0.85 + rng(i * 7) * 0.003))),
      };
    }),
    formationsParStatut: [
      { name: 'Terminées',  value: Math.round(formations * 0.58), color: PALETTE.emerald.main },
      { name: 'En cours',   value: Math.round(formations * 0.12), color: PALETTE.amber.main },
      { name: 'Planifiées', value: Math.round(formations * 0.22), color: PALETTE.indigo.main },
      { name: 'Annulées',   value: Math.round(formations * 0.08), color: PALETTE.rose.main },
    ],
    topFormateurs: [
      { nom: 'Ahmed Ben Ali', prenom: 'Ahmed', type: 'INTERNE', nbFormations: Math.round(4.5 * growthRate), noteMoyenne: Math.min(19.5, 15.2 + base * 0.22), satisfaction: Math.min(5, 4.7 + base * 0.05) },
      { nom: 'Karim Mrabet',  prenom: 'Karim', type: 'INTERNE', nbFormations: Math.round(3.8 * growthRate), noteMoyenne: Math.min(19.5, 14.8 + base * 0.20), satisfaction: Math.min(5, 4.6 + base * 0.04) },
      { nom: 'Sonia Hamdi',   prenom: 'Sonia', type: 'EXTERNE', nbFormations: Math.round(3.2 * growthRate), noteMoyenne: Math.min(19.5, 14.5 + base * 0.18), satisfaction: Math.min(5, 4.5 + base * 0.04) },
      { nom: 'Rania Gharbi',  prenom: 'Rania', type: 'EXTERNE', nbFormations: Math.round(2.8 * growthRate), noteMoyenne: Math.min(19.5, 14.1 + base * 0.17), satisfaction: Math.min(5, 4.4 + base * 0.03) },
      { nom: 'Nour Chaabane', prenom: 'Nour',  type: 'INTERNE', nbFormations: Math.round(2.2 * growthRate), noteMoyenne: Math.min(19.5, 13.8 + base * 0.15), satisfaction: Math.min(5, 4.3 + base * 0.03) },
    ],
    participantsParStructure: [
      { name: 'Dir. IT',       participants: Math.round(72 * growthRate) },
      { name: 'Dir. Financière', participants: Math.round(51 * growthRate) },
      { name: 'Dir. Nord',     participants: Math.round(38 * growthRate) },
      { name: 'Dir. RH',       participants: Math.round(34 * growthRate) },
      { name: 'Dir. Sud',      participants: Math.round(28 * growthRate) },
    ],
    budgetParTrimestre: [
      { trimestre: 'T1', budget: Math.round(budget * 0.24), objectif: Math.round(budget * 0.25), formations: Math.round(formations * 0.26) },
      { trimestre: 'T2', budget: Math.round(budget * 0.28), objectif: Math.round(budget * 0.25), formations: Math.round(formations * 0.29) },
      { trimestre: 'T3', budget: Math.round(budget * 0.26), objectif: Math.round(budget * 0.25), formations: Math.round(formations * 0.25) },
      { trimestre: 'T4', budget: Math.round(budget * 0.22), objectif: Math.round(budget * 0.25), formations: Math.round(formations * 0.20) },
    ],
  };
};

// ── Tooltip custom ─────────────────────────────────────────────────────────────
const DarkTooltip = ({ active, payload, label, suffix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
      <Box sx={{
        bgcolor: '#0F172A', border: '1px solid #1E293B', borderRadius: 2,
        p: 1.5, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', minWidth: 160,
      }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748B', mb: 0.8 }}>{label}</Typography>
        {payload.map((p, i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 0.3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color || p.fill }} />
                <Typography sx={{ fontSize: '0.76rem', color: '#94A3B8' }}>{p.name}</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.8rem', color: '#F1F5F9', fontWeight: 700 }}>
                {typeof p.value === 'number' && p.value > 999
                    ? `${p.value.toLocaleString()} DT`
                    : typeof p.value === 'number' && String(p.name).toLowerCase().includes('note')
                        ? `${Number(p.value).toFixed(1)}/20`
                        : typeof p.value === 'number' && String(p.name).toLowerCase().includes('%')
                            ? `${p.value}%`
                            : p.value}
                {suffix}
              </Typography>
            </Box>
        ))}
      </Box>
  );
};

// ── KPI Card animée ────────────────────────────────────────────────────────────
function KpiCard({ icon, title, value, color, bg, sub, trend, delay = 0, onClick }) {
  const Icon = icon;
  const isUp = trend && !String(trend).startsWith('-');
  return (
      <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -5, transition: { duration: 0.18 } }}
      >
        <Card onClick={onClick} sx={{
          border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', height: '100%',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s',
          '&:hover': onClick ? { borderColor: color, boxShadow: `0 0 0 3px ${color}15` } : {},
          position: 'relative', overflow: 'hidden',
        }}>
          <Box sx={{
            position: 'absolute', top: 0, right: 0, width: 80, height: 80,
            borderRadius: '0 0 0 100%',
            bgcolor: `${color}08`,
          }} />
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ p: 1.1, borderRadius: 2, bgcolor: bg }}>
                <Icon sx={{ color, fontSize: 20 }} />
              </Box>
              {trend && (
                  <Chip
                      size="small"
                      icon={isUp ? <TrendingUp sx={{ fontSize: '11px !important' }} /> : <TrendingDown sx={{ fontSize: '11px !important' }} />}
                      label={trend}
                      sx={{
                        bgcolor: isUp ? '#DCFCE7' : '#FEE2E2',
                        color: isUp ? '#15803D' : '#DC2626',
                        fontWeight: 700, fontSize: '0.67rem', height: 20,
                        '& .MuiChip-icon': { color: 'inherit' },
                      }}
                  />
              )}
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.85rem', color: '#0F172A', lineHeight: 1, mb: 0.4 }}>
              {value}
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#475569' }}>{title}</Typography>
            {sub && <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', mt: 0.4 }}>{sub}</Typography>}
          </CardContent>
        </Card>
      </motion.div>
  );
}

// ── Barre note avec animation ──────────────────────────────────────────────────
function NoteProgressBar({ domaine, note, pourcentage, color, index }) {
  return (
      <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.08, duration: 0.4 }}
      >
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{domaine}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                {Number(note).toFixed(1)}<Typography component="span" sx={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 400 }}>/20</Typography>
              </Typography>
              <Chip label={`${pourcentage}%`} size="small" sx={{
                height: 20, fontSize: '0.68rem', fontWeight: 700,
                bgcolor: pourcentage >= 80 ? '#DCFCE7' : pourcentage >= 65 ? '#FEF3C7' : '#FEE2E2',
                color: pourcentage >= 80 ? '#14532D' : pourcentage >= 65 ? '#78350F' : '#7F1D1D',
              }} />
            </Box>
          </Box>
          <Box sx={{ position: 'relative', height: 10, borderRadius: 5, bgcolor: '#F1F5F9', overflow: 'hidden' }}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pourcentage}%` }}
                transition={{ delay: index * 0.08 + 0.3, duration: 0.7, ease: 'easeOut' }}
                style={{
                  position: 'absolute', height: '100%', borderRadius: 5,
                  background: `linear-gradient(90deg, ${color}80, ${color})`,
                }}
            />
            <Box sx={{
              position: 'absolute', left: '70%', top: '-3px', bottom: '-3px',
              width: 2, bgcolor: '#CBD5E1', borderRadius: 1, zIndex: 1,
            }} />
          </Box>
          <Typography sx={{ fontSize: '0.67rem', color: '#9CA3AF', mt: 0.4, textAlign: 'right' }}>
            Seuil admissibilité : 70% (14/20)
          </Typography>
        </Box>
      </motion.div>
  );
}

// ── Jauge SVG circulaire ───────────────────────────────────────────────────────
function CircularGauge({ value, max, label, color, size = 140 }) {
  const pct = Math.min(100, Math.round(value / max * 100));
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = pct / 100 * circ;
  return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <Box sx={{ position: 'relative', width: size, height: size }}>
          <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', width: size, height: size }}>
            <circle cx="60" cy="60" r={r} fill="none" stroke="#F1F5F9" strokeWidth="10" />
            <circle cx="60" cy="60" r={r} fill="none"
                    stroke={color} strokeWidth="10"
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s ease' }}
            />
            <circle cx="60" cy="60" r={r} fill="none"
                    stroke="#CBD5E1" strokeWidth="2"
                    strokeDasharray={`2 ${circ - 2}`}
                    strokeDashoffset={-(70 / 100 * circ)}
            />
          </svg>
          <Box sx={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', textAlign: 'center',
          }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color, lineHeight: 1 }}>
              {typeof value === 'number' && value < 30 ? Number(value).toFixed(1) : value}
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF' }}>/{max}</Typography>
          </Box>
        </Box>
        <Chip label={`${pct}%`} sx={{
          fontWeight: 800, fontSize: '0.8rem', height: 26,
          bgcolor: pct >= 80 ? '#DCFCE7' : pct >= 65 ? '#FEF3C7' : '#FEE2E2',
          color: pct >= 80 ? '#14532D' : pct >= 65 ? '#78350F' : '#7F1D1D',
        }} />
        <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>{label}</Typography>
      </Box>
  );
}

// ── Tableau comparatif multi-années ───────────────────────────────────────────
function ComparisonTable({ allStats, years, primaryYear }) {
  const indicators = [
    { label: 'Formations',       key: 'totalFormations',    fmt: v => String(v), unit: 'sessions' },
    { label: 'Participants',     key: 'totalParticipants',  fmt: v => String(v), unit: 'inscrits' },
    { label: 'Formateurs',       key: 'totalFormateurs',    fmt: v => String(v), unit: 'actifs' },
    { label: 'Budget total',     key: 'budgetTotal',        fmt: v => `${(v||0).toLocaleString()} DT`, unit: '' },
    { label: 'Taux présence',    key: 'tauxPresence',       fmt: v => `${v}%`, unit: '' },
    { label: 'Note moy. /20',    key: 'noteMoyenneGlobale', fmt: v => v ? `${Number(v).toFixed(1)}/20` : '—', unit: '' },
  ];
  const sortedYears = [...years].sort((a, b) => a - b);

  return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem', py: 1.5, minWidth: 130 }}>
                Indicateur
              </TableCell>
              {sortedYears.map((year, idx) => (
                  <TableCell key={year} align="center" sx={{
                    fontWeight: 700, fontSize: '0.82rem', py: 1.5,
                    color: year === primaryYear ? PALETTE.indigo.main : '#64748B',
                    bgcolor: year === primaryYear ? `${PALETTE.indigo.main}08` : 'transparent',
                    borderBottom: year === primaryYear ? `2px solid ${PALETTE.indigo.main}` : undefined,
                  }}>
                    {year}
                    {year === primaryYear && (
                        <Chip label="actuel" size="small" sx={{ ml: 0.5, height: 14, fontSize: '0.58rem', bgcolor: PALETTE.indigo.main, color: '#fff' }} />
                    )}
                  </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.72rem', py: 1.5, minWidth: 90 }}>
                Évolution totale
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {indicators.map((ind, i) => {
              const vals = sortedYears.map(y => {
                const d = allStats[y] || generateDemoData(y);
                return Number(d[ind.key]) || 0;
              });
              const first = vals[0], last = vals[vals.length - 1];
              const evolPct = first > 0 ? Math.round((last - first) / first * 100) : null;
              return (
                  <TableRow key={i} sx={{ '&:hover': { bgcolor: '#FAFBFF' } }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#0F172A' }}>{ind.label}</TableCell>
                    {sortedYears.map((year, vi) => {
                      const d = allStats[year] || generateDemoData(year);
                      const raw = Number(d[ind.key]) || 0;
                      const prevVal = vi > 0 ? Number((allStats[sortedYears[vi-1]] || generateDemoData(sortedYears[vi-1]))[ind.key]) || 0 : null;
                      const delta = prevVal !== null && prevVal > 0 ? Math.round((raw - prevVal) / prevVal * 100) : null;
                      return (
                          <TableCell key={year} align="center" sx={{
                            fontSize: '0.855rem',
                            fontWeight: year === primaryYear ? 800 : 600,
                            color: year === primaryYear ? PALETTE.indigo.main : '#0F172A',
                            bgcolor: year === primaryYear ? `${PALETTE.indigo.main}05` : 'transparent',
                          }}>
                            <Box>
                              {ind.fmt(raw)}
                              {delta !== null && vi > 0 && (
                                  <Typography component="span" sx={{
                                    ml: 0.5, fontSize: '0.65rem', fontWeight: 700,
                                    color: delta >= 0 ? '#15803D' : '#DC2626',
                                  }}>
                                    {delta >= 0 ? '▲' : '▼'}{Math.abs(delta)}%
                                  </Typography>
                              )}
                            </Box>
                          </TableCell>
                      );
                    })}
                    <TableCell align="center">
                      {evolPct !== null && (
                          <Chip
                              label={`${evolPct >= 0 ? '+' : ''}${evolPct}%`}
                              size="small"
                              icon={evolPct >= 0 ? <TrendingUp sx={{ fontSize: '11px !important' }} /> : <TrendingDown sx={{ fontSize: '11px !important' }} />}
                              sx={{
                                bgcolor: evolPct >= 0 ? '#DCFCE7' : '#FEE2E2',
                                color: evolPct >= 0 ? '#15803D' : '#DC2626',
                                fontWeight: 700, fontSize: '0.72rem', height: 22,
                                '& .MuiChip-icon': { color: 'inherit' },
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
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function Stats() {
  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear, currentYear-1, currentYear-2, currentYear-3, currentYear-4];

  const [primaryYear, setPrimaryYear] = useState(currentYear);
  const [compareYears, setCompareYears] = useState([currentYear - 1]);
  const [allStats, setAllStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [chartMetric, setChartMetric] = useState('formations');

  // Charger les stats pour une année
  const loadYear = useCallback(async (year) => {
    if (allStats[year]) return;
    try {
      const res = await statsService.getDashboard(year);
      const data = res.data;
      if (!data.noteMoyenneGlobale) {
        const notes = (data.notesMoyennesParDomaine || []).map(d => d.note).filter(Boolean);
        data.noteMoyenneGlobale = notes.length
            ? Math.round(notes.reduce((a, b) => a + b, 0) / notes.length * 10) / 10
            : generateDemoData(year).noteMoyenneGlobale;
      }
      setAllStats(prev => ({ ...prev, [year]: data }));
    } catch {
      setAllStats(prev => ({ ...prev, [year]: generateDemoData(year) }));
    }
  }, [allStats]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all(availableYears.map(y => loadYear(y)));
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

  // Données de l'année principale
  const stats = allStats[primaryYear] || generateDemoData(primaryYear);
  const prevStats = allStats[primaryYear - 1] || generateDemoData(primaryYear - 1);

  const calcTrend = (cur, prev) => {
    if (!prev || prev === 0) return null;
    const pct = Math.round((cur - prev) / prev * 100);
    return `${pct >= 0 ? '+' : ''}${pct}%`;
  };

  const activeYears = [primaryYear, ...compareYears].filter((v, i, a) => a.indexOf(v) === i).sort();

  // Données courbes mensuelles multi-années
  const monthlyComparison = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'].map((mois, i) => {
    const row = { mois };
    activeYears.forEach(year => {
      const d = allStats[year] || generateDemoData(year);
      const m = (d.evolutionMensuelle || [])[i] || {};
      row[`val_${year}`] = m[chartMetric] || 0;
    });
    return row;
  });

  // Évolution annuelle pour courbe sur 5 ans
  const annualTrend = [...availableYears].reverse().map(year => {
    const d = allStats[year] || generateDemoData(year);
    return {
      year: String(year),
      formations: d.totalFormations || 0,
      participants: d.totalParticipants || 0,
      budget: d.budgetTotal || 0,
      tauxPresence: d.tauxPresence || 0,
      noteMoyenne: d.noteMoyenneGlobale || 0,
    };
  });

  // Notes multi-années par domaine
  const notesComparisonData = (stats.notesMoyennesParDomaine || []).map(d => {
    const row = { domaine: d.domaine.substring(0, 8) };
    activeYears.forEach(year => {
      const yd = allStats[year] || generateDemoData(year);
      const found = (yd.notesMoyennesParDomaine || []).find(x => x.domaine === d.domaine);
      row[`note_${year}`] = found ? Math.round(found.note * 10) / 10 : 0;
      row[`pct_${year}`] = found ? Math.round(found.note / 20 * 100) : 0;
    });
    return row;
  });

  const noteGlobale = stats.noteMoyenneGlobale || 14;
  const notePct = Math.round(noteGlobale / 20 * 100);

  const DOMAIN_COLORS = Object.values(PALETTE).map(p => p.main);

  const tabs = [
    { label: 'Évolution mensuelle', icon: ShowChart },
    { label: 'Comparaison multi-années', icon: CompareArrows },
    { label: 'Répartition', icon: DonutLarge },
    { label: 'Notes & Résultats', icon: Assessment },
    { label: 'Performance', icon: EmojiEvents },
    { label: 'Budget', icon: AttachMoney },
  ];

  return (
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Box sx={{
            mb: 3, p: 3, borderRadius: 3,
            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 40%, #4C1D95 100%)',
            position: 'relative', overflow: 'hidden',
          }}>
            <Box sx={{
              position: 'absolute', top: -40, right: -40, width: 200, height: 200,
              borderRadius: '50%', bgcolor: 'rgba(99,102,241,0.15)',
            }} />
            <Box sx={{
              position: 'absolute', bottom: -20, left: '30%', width: 120, height: 120,
              borderRadius: '50%', bgcolor: 'rgba(139,92,246,0.1)',
            }} />
            <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <AutoGraph sx={{ color: '#A5B4FC', fontSize: 28 }} />
                  <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#fff', letterSpacing: '-0.02em' }}>
                    Statistiques & Analyses
                  </Typography>
                </Box>
                <Typography sx={{ color: '#A5B4FC', fontSize: '0.875rem' }}>
                  Tableau de bord analytique multi-annuel · {availableYears[availableYears.length-1]}–{availableYears[0]}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 110 }}>
                  <Select
                      value={primaryYear}
                      onChange={(e) => { setPrimaryYear(e.target.value); setCompareYears([]); }}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                        '& .MuiSvgIcon-root': { color: '#fff' },
                        fontSize: '0.875rem', fontWeight: 700,
                      }}
                  >
                    {availableYears.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', gap: 0.7, alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>vs :</Typography>
                  {availableYears.filter(y => y !== primaryYear).map((y, idx) => {
                    const active = compareYears.includes(y);
                    const palette = YEAR_PALETTE[compareYears.indexOf(y) + 1] || YEAR_PALETTE[idx + 1];
                    return (
                        <Chip key={y} label={y} size="small" onClick={() => toggleCompare(y)} sx={{
                          cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', height: 26,
                          bgcolor: active ? `${palette?.main}30` : 'rgba(255,255,255,0.08)',
                          color: active ? palette?.muted : 'rgba(255,255,255,0.5)',
                          border: `1px solid ${active ? palette?.main + '60' : 'transparent'}`,
                          transition: 'all 0.2s',
                        }} />
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Box>
        </motion.div>

        {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1, bgcolor: '#EEF2FF', '& .MuiLinearProgress-bar': { bgcolor: '#6366F1' } }} />}

        {/* ── KPI CARDS ──────────────────────────────────────────────────── */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { icon: School,      title: 'Formations',     value: stats.totalFormations || 0,    color: PALETTE.indigo.main,  bg: PALETTE.indigo.light,  trend: calcTrend(stats.totalFormations, prevStats.totalFormations), sub: `Année ${primaryYear}` },
            { icon: People,      title: 'Participants',   value: stats.totalParticipants || 0,  color: PALETTE.emerald.main, bg: PALETTE.emerald.light, trend: calcTrend(stats.totalParticipants, prevStats.totalParticipants), sub: 'inscrits aux formations' },
            { icon: Person,      title: 'Formateurs',     value: stats.totalFormateurs || 0,    color: PALETTE.amber.main,   bg: PALETTE.amber.light,   trend: null, sub: `${stats.formateursInternes || 0} int. · ${stats.formateursExternes || 0} ext.` },
            { icon: AttachMoney, title: 'Budget Total',   value: `${((stats.budgetTotal||0)/1000).toFixed(0)}k DT`, color: PALETTE.rose.main, bg: PALETTE.rose.light, trend: calcTrend(stats.budgetTotal, prevStats.budgetTotal), sub: `Objectif : 100k DT` },
            { icon: CheckCircle, title: 'Taux Présence',  value: `${stats.tauxPresence || 0}%`, color: PALETTE.violet.main,  bg: PALETTE.violet.light,  trend: calcTrend(stats.tauxPresence, prevStats.tauxPresence), sub: 'des inscrits présents' },
            { icon: Star,        title: 'Note Moy. /20',  value: `${Number(noteGlobale).toFixed(1)}`,  color: PALETTE.cyan.main,    bg: PALETTE.cyan.light,    trend: null, sub: `${notePct}% de réussite` },
          ].map((kpi, i) => (
              <Grid item xs={6} sm={4} lg={2} key={i}>
                <KpiCard {...kpi} delay={i * 0.06} />
              </Grid>
          ))}
        </Grid>

        {/* ── TABS ─────────────────────────────────────────────────────────── */}
        <Box sx={{ mb: 3, borderBottom: '1px solid #E2E8F0', overflowX: 'auto' }}>
          <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.835rem', minHeight: 46, gap: 0.5 },
                '& .Mui-selected': { color: '#6366F1' },
                '& .MuiTabs-indicator': { bgcolor: '#6366F1', height: 3, borderRadius: '3px 3px 0 0' },
              }}
          >
            {tabs.map((t, i) => (
                <Tab key={i} icon={<t.icon sx={{ fontSize: 16 }} />} label={t.label} iconPosition="start" />
            ))}
          </Tabs>
        </Box>

        <AnimatePresence mode="wait">
          <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
          >

            {/* ════════════════════════════════════════════════
              TAB 0 : ÉVOLUTION MENSUELLE
          ════════════════════════════════════════════════ */}
            {activeTab === 0 && (
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
                              Évolution mensuelle — {activeYears.join(' vs ')}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>Courbes de tendance par mois · comparaison multi-années</Typography>
                          </Box>
                          <ToggleButtonGroup value={chartMetric} exclusive onChange={(_, v) => v && setChartMetric(v)} size="small">
                            {[
                              { v: 'formations',   label: 'Formations' },
                              { v: 'participants', label: 'Participants' },
                              { v: 'budget',       label: 'Budget' },
                            ].map(({ v, label }) => (
                                <ToggleButton key={v} value={v} sx={{ textTransform: 'none', fontSize: '0.78rem', px: 1.5, py: 0.5, '&.Mui-selected': { bgcolor: '#EEF2FF', color: '#6366F1' } }}>
                                  {label}
                                </ToggleButton>
                            ))}
                          </ToggleButtonGroup>
                        </Box>

                        {/* Légende custom */}
                        <Box sx={{ display: 'flex', gap: 2.5, mb: 2, flexWrap: 'wrap' }}>
                          {activeYears.map((year, idx) => {
                            const pal = YEAR_PALETTE[idx];
                            return (
                                <Box key={year} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                  <Box sx={{
                                    width: 24, height: 3, borderRadius: 2,
                                    bgcolor: pal.main,
                                    border: idx > 0 ? `1px dashed ${pal.main}` : undefined,
                                  }} />
                                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: pal.main }}>{year}</Typography>
                                  {year === primaryYear && <Chip label="principal" size="small" sx={{ height: 14, fontSize: '0.6rem', bgcolor: pal.main, color: '#fff' }} />}
                                </Box>
                            );
                          })}
                        </Box>

                        <ResponsiveContainer width="100%" height={280}>
                          <AreaChart data={monthlyComparison} margin={{ top: 5, right: 20, bottom: 0, left: -10 }}>
                            <defs>
                              {activeYears.map((year, idx) => (
                                  <linearGradient key={year} id={`grd_${year}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor={YEAR_PALETTE[idx].main} stopOpacity={0.15} />
                                    <stop offset="95%" stopColor={YEAR_PALETTE[idx].main} stopOpacity={0.01} />
                                  </linearGradient>
                              ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<DarkTooltip />} />
                            {activeYears.map((year, idx) => (
                                <Area
                                    key={year}
                                    type="monotone"
                                    dataKey={`val_${year}`}
                                    name={String(year)}
                                    stroke={YEAR_PALETTE[idx].main}
                                    fill={`url(#grd_${year})`}
                                    strokeWidth={idx === 0 ? 3 : 2}
                                    strokeDasharray={idx > 0 ? '6 3' : undefined}
                                    dot={{ fill: YEAR_PALETTE[idx].main, r: idx === 0 ? 4 : 3, strokeWidth: 0 }}
                                    activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                                />
                            ))}
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Mini cards tendance mensuelle */}
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      {(stats.evolutionMensuelle || []).slice(0, 6).map((m, i) => (
                          <Grid item xs={6} sm={4} md={2} key={i}>
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                              <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5, boxShadow: 'none', textAlign: 'center' }}>
                                <CardContent sx={{ p: 1.5 }}>
                                  <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', mb: 0.3 }}>{m.mois}</Typography>
                                  <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>{m.formations}</Typography>
                                  <Typography sx={{ fontSize: '0.68rem', color: '#64748B' }}>formations</Typography>
                                  <Box sx={{ height: 3, bgcolor: '#F1F5F9', borderRadius: 2, mt: 1, overflow: 'hidden' }}>
                                    <Box sx={{
                                      height: '100%', borderRadius: 2,
                                      bgcolor: PALETTE.indigo.main,
                                      width: `${Math.round((m.formations || 0) / Math.max(...(stats.evolutionMensuelle||[]).map(x => x.formations||1)) * 100)}%`,
                                    }} />
                                  </Box>
                                </CardContent>
                              </Card>
                            </motion.div>
                          </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
            )}

            {/* ════════════════════════════════════════════════
              TAB 1 : COMPARAISON MULTI-ANNÉES
          ════════════════════════════════════════════════ */}
            {activeTab === 1 && (
                <Grid container spacing={2.5}>
                  {/* Courbe tendance 5 ans */}
                  <Grid item xs={12}>
                    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
                              Tendance pluriannuelle — {availableYears[availableYears.length-1]}→{availableYears[0]}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>Progression sur {availableYears.length} ans</Typography>
                          </Box>
                          <ToggleButtonGroup value={chartMetric} exclusive onChange={(_, v) => v && setChartMetric(v)} size="small">
                            {[
                              { v: 'formations', label: 'Formations' },
                              { v: 'participants', label: 'Participants' },
                              { v: 'budget', label: 'Budget' },
                              { v: 'tauxPresence', label: 'Présence' },
                              { v: 'noteMoyenne', label: 'Note' },
                            ].map(({ v, label }) => (
                                <ToggleButton key={v} value={v} sx={{ textTransform: 'none', fontSize: '0.75rem', px: 1.2, py: 0.4, '&.Mui-selected': { bgcolor: '#EEF2FF', color: '#6366F1' } }}>
                                  {label}
                                </ToggleButton>
                            ))}
                          </ToggleButtonGroup>
                        </Box>
                        <ResponsiveContainer width="100%" height={260}>
                          <ComposedChart data={annualTrend} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
                            <defs>
                              <linearGradient id="annGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.01} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#475569', fontWeight: 700 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<DarkTooltip />} />
                            <Area type="monotone" dataKey={chartMetric}
                                  name={chartMetric === 'formations' ? 'Formations' : chartMetric === 'participants' ? 'Participants' : chartMetric === 'budget' ? 'Budget (DT)' : chartMetric === 'tauxPresence' ? 'Taux présence (%)' : 'Note moy. /20'}
                                  stroke="#6366F1" fill="url(#annGrad)" strokeWidth={3}
                                  dot={{ fill: '#6366F1', r: 7, strokeWidth: 2, stroke: '#fff' }}
                                  activeDot={{ r: 9 }}
                            />
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
                          Tableau comparatif — {availableYears.length} années · indicateurs clés
                        </Typography>
                        <ComparisonTable
                            allStats={allStats}
                            years={availableYears}
                            primaryYear={primaryYear}
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Barres groupées par domaine si comparaison active */}
                  {compareYears.length > 0 && (
                      <Grid item xs={12}>
                        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                          <CardContent sx={{ p: 3 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>
                              Formations par domaine — {activeYears.join(' vs ')}
                            </Typography>
                            <ResponsiveContainer width="100%" height={260}>
                              <BarChart
                                  data={(stats.formationsParDomaine || []).map(d => {
                                    const row = { name: d.name };
                                    activeYears.forEach(year => {
                                      const yd = allStats[year] || generateDemoData(year);
                                      const found = (yd.formationsParDomaine || []).find(x => x.name === d.name);
                                      row[String(year)] = found?.value || 0;
                                    });
                                    return row;
                                  })}
                                  barSize={18} barGap={3}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} />
                                <Tooltip content={<DarkTooltip />} />
                                {activeYears.map((year, idx) => (
                                    <Bar key={year} dataKey={String(year)} name={String(year)} fill={YEAR_PALETTE[idx].main} radius={[4, 4, 0, 0]} />
                                ))}
                              </BarChart>
                            </ResponsiveContainer>
                            {/* Légende custom */}
                            <Box sx={{ display: 'flex', gap: 2, mt: 1.5, justifyContent: 'center' }}>
                              {activeYears.map((year, idx) => (
                                  <Box key={year} sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: 2, bgcolor: YEAR_PALETTE[idx].main }} />
                                    <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>{year}</Typography>
                                  </Box>
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                  )}
                </Grid>
            )}

            {/* ════════════════════════════════════════════════
              TAB 2 : RÉPARTITION
          ════════════════════════════════════════════════ */}
            {activeTab === 2 && (
                <Grid container spacing={2.5}>
                  {/* Donut statuts */}
                  <Grid item xs={12} md={5}>
                    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', height: '100%' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 0.5 }}>Statuts des formations</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mb: 2 }}>{primaryYear}</Typography>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie data={stats.formationsParStatut || []} cx="50%" cy="50%"
                                 innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                              {(stats.formationsParStatut || []).map((entry, i) => (
                                  <Cell key={i} fill={entry.color || DOMAIN_COLORS[i]} strokeWidth={0} />
                              ))}
                            </Pie>
                            <Tooltip content={<DarkTooltip />} />
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
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

                  {/* Barres + ligne domaine */}
                  <Grid item xs={12} md={7}>
                    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 0.5 }}>Formations & Budget par domaine</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mb: 2 }}>{primaryYear} · nb formations (barres) + budget (courbe)</Typography>
                        <ResponsiveContainer width="100%" height={260}>
                          <ComposedChart data={stats.formationsParDomaine || []} barSize={28}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} />
                            <YAxis yAxisId="l" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} />
                            <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                            <Tooltip content={<DarkTooltip />} />
                            <Bar yAxisId="l" dataKey="value" name="Formations" radius={[5, 5, 0, 0]}>
                              {(stats.formationsParDomaine || []).map((_, i) => (
                                  <Cell key={i} fill={DOMAIN_COLORS[i % DOMAIN_COLORS.length]} />
                              ))}
                            </Bar>
                            <Line yAxisId="r" type="monotone" dataKey="budget" name="Budget (DT)"
                                  stroke={PALETTE.amber.main} strokeWidth={2.5}
                                  dot={{ fill: PALETTE.amber.main, r: 5, strokeWidth: 2, stroke: '#fff' }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Participants par structure */}
                  <Grid item xs={12}>
                    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>Participants par structure — {primaryYear}</Typography>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={stats.participantsParStructure || []} layout="vertical" barSize={22}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} width={110} />
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
                </Grid>
            )}

            {/* ════════════════════════════════════════════════
              TAB 3 : NOTES & RÉSULTATS
          ════════════════════════════════════════════════ */}
            {activeTab === 3 && (
                <Grid container spacing={2.5}>
                  {/* Jauges globales */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', height: '100%' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 3, textAlign: 'center' }}>
                          Indicateurs de qualité — {primaryYear}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
                          <CircularGauge
                              value={noteGlobale}
                              max={20}
                              label="Note globale"
                              color={notePct >= 80 ? PALETTE.emerald.main : notePct >= 65 ? PALETTE.amber.main : PALETTE.rose.main}
                          />
                          <CircularGauge
                              value={stats.tauxPresence || 0}
                              max={100}
                              label="Taux présence"
                              color={PALETTE.violet.main}
                              size={130}
                          />
                        </Box>
                        {/* Comparaison vs année précédente */}
                        {prevStats && (
                            <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                              <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                vs {primaryYear - 1}
                              </Typography>
                              {[
                                { label: 'Note moy.', cur: noteGlobale, prev: prevStats.noteMoyenneGlobale || 14, fmt: v => `${Number(v).toFixed(1)}/20` },
                                { label: 'Taux présence', cur: stats.tauxPresence || 0, prev: prevStats.tauxPresence || 0, fmt: v => `${v}%` },
                              ].map((item, i) => {
                                const delta = Number(item.cur) - Number(item.prev);
                                const isPos = delta >= 0;
                                return (
                                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                                      <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>{item.label}</Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>{item.fmt(item.cur)}</Typography>
                                        <Chip
                                            size="small"
                                            label={`${isPos ? '+' : ''}${Number(delta).toFixed(1)}`}
                                            sx={{
                                              height: 18, fontSize: '0.68rem', fontWeight: 700,
                                              bgcolor: isPos ? '#DCFCE7' : '#FEE2E2',
                                              color: isPos ? '#15803D' : '#DC2626',
                                            }}
                                        />
                                      </Box>
                                    </Box>
                                );
                              })}
                            </Box>
                        )}
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
                          <Chip label="Note /20 + % réussite" size="small" sx={{ bgcolor: '#EEF2FF', color: '#6366F1', fontWeight: 600 }} />
                        </Box>
                        {(stats.notesMoyennesParDomaine || []).map((d, i) => (
                            <NoteProgressBar
                                key={i}
                                domaine={d.domaine}
                                note={d.note}
                                pourcentage={d.pourcentage || Math.round(d.note / 20 * 100)}
                                color={DOMAIN_COLORS[i % DOMAIN_COLORS.length]}
                                index={i}
                            />
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Graphique comparaison notes multi-années par domaine */}
                  <Grid item xs={12}>
                    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 0.5 }}>
                          Comparaison notes par domaine — {activeYears.join(' vs ')}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mb: 2 }}>
                          Axe gauche : note /20 · Courbe : % réussite · Ligne rouge = seuil admissibilité 70% (14/20)
                        </Typography>
                        <ResponsiveContainer width="100%" height={280}>
                          <ComposedChart data={notesComparisonData} barSize={18} margin={{ top: 5, right: 30, bottom: 0, left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                            <XAxis dataKey="domaine" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} />
                            <YAxis yAxisId="l" domain={[0, 20]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} />
                            <YAxis yAxisId="r" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickFormatter={v => `${v}%`} />
                            <Tooltip content={<DarkTooltip />} />
                            <ReferenceLine yAxisId="l" y={14} stroke={PALETTE.rose.main} strokeDasharray="5 4" strokeWidth={1.5}
                                           label={{ value: '14/20 = 70%', position: 'insideRight', fontSize: 10, fill: PALETTE.rose.main, fontWeight: 700 }} />
                            {activeYears.map((year, idx) => (
                                <Bar key={year} yAxisId="l" dataKey={`note_${year}`} name={`Note ${year}`}
                                     fill={YEAR_PALETTE[idx].main} radius={[4, 4, 0, 0]} opacity={0.85} barSize={20 - idx * 3} />
                            ))}
                            {activeYears.map((year, idx) => (
                                <Line key={`pct_${year}`} yAxisId="r" type="monotone"
                                      dataKey={`pct_${year}`} name={`% réussite ${year}`}
                                      stroke={YEAR_PALETTE[idx].main} strokeWidth={2}
                                      strokeDasharray={idx > 0 ? '5 3' : undefined}
                                      dot={{ fill: YEAR_PALETTE[idx].main, r: 4, strokeWidth: 2, stroke: '#fff' }}
                                />
                            ))}
                          </ComposedChart>
                        </ResponsiveContainer>
                        {/* Légende */}
                        <Box sx={{ display: 'flex', gap: 2.5, mt: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                          {activeYears.map((year, idx) => (
                              <Box key={year} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <Box sx={{ width: 12, height: 10, borderRadius: 1, bgcolor: YEAR_PALETTE[idx].main }} />
                                <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>Note {year}</Typography>
                                <Box sx={{ width: 16, height: 2, bgcolor: YEAR_PALETTE[idx].main, ml: 0.5 }} />
                                <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>% {year}</Typography>
                              </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
            )}

            {/* ════════════════════════════════════════════════
              TAB 4 : PERFORMANCE FORMATEURS
          ════════════════════════════════════════════════ */}
            {activeTab === 4 && (
                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={8}>
                    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                          <WorkspacePremium sx={{ color: PALETTE.amber.main, fontSize: 24 }} />
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
                              Classement des Formateurs — {primaryYear}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                              Classé par note moyenne obtenue par leurs apprenants
                            </Typography>
                          </Box>
                        </Box>
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
                                const notePct = f.noteMoyenne ? Math.round(f.noteMoyenne / 20 * 100) : null;
                                const medals = ['🥇', '🥈', '🥉'];
                                return (
                                    <TableRow key={i} sx={{ '&:hover': { bgcolor: '#FAFBFF' } }}>
                                      <TableCell sx={{ py: 1.5 }}>
                                        <Box sx={{ fontSize: '1.1rem' }}>{medals[i] || `${i+1}`}</Box>
                                      </TableCell>
                                      <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                          <Avatar sx={{
                                            width: 32, height: 32, fontSize: '0.75rem', fontWeight: 700,
                                            bgcolor: f.type === 'INTERNE' ? PALETTE.emerald.light : PALETTE.violet.light,
                                            color: f.type === 'INTERNE' ? PALETTE.emerald.dark : PALETTE.violet.dark,
                                          }}>
                                            {(f.prenom||'').charAt(0)}{(f.nom||'').charAt(0)}
                                          </Avatar>
                                          <Typography sx={{ fontWeight: 600, fontSize: '0.855rem', color: '#0F172A' }}>{f.nom}</Typography>
                                        </Box>
                                      </TableCell>
                                      <TableCell>
                                        <Chip label={f.type} size="small" sx={{
                                          height: 18, fontSize: '0.65rem', fontWeight: 700,
                                          bgcolor: f.type === 'INTERNE' ? PALETTE.emerald.light : PALETTE.violet.light,
                                          color: f.type === 'INTERNE' ? PALETTE.emerald.dark : PALETTE.violet.dark,
                                        }} />
                                      </TableCell>
                                      <TableCell align="center">
                                        <Chip label={f.nbFormations} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.78rem', color: PALETTE.indigo.main, borderColor: PALETTE.indigo.muted }} />
                                      </TableCell>
                                      <TableCell align="center">
                                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                                          {f.noteMoyenne ? `${Number(f.noteMoyenne).toFixed(1)}/20` : '—'}
                                        </Typography>
                                      </TableCell>
                                      <TableCell align="center">
                                        {notePct && (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.4 }}>
                                              <Chip label={`${notePct}%`} size="small" sx={{
                                                height: 20, fontSize: '0.72rem', fontWeight: 800,
                                                bgcolor: notePct >= 80 ? '#DCFCE7' : notePct >= 65 ? '#FEF3C7' : '#FEE2E2',
                                                color: notePct >= 80 ? '#14532D' : notePct >= 65 ? '#78350F' : '#7F1D1D',
                                              }} />
                                              <Box sx={{ width: 60, height: 4, bgcolor: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
                                                <Box sx={{ height: '100%', width: `${notePct}%`, bgcolor: notePct >= 80 ? PALETTE.emerald.main : notePct >= 65 ? PALETTE.amber.main : PALETTE.rose.main, borderRadius: 2 }} />
                                              </Box>
                                            </Box>
                                        )}
                                      </TableCell>
                                      <TableCell align="center">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                          <Star sx={{ fontSize: 14, color: PALETTE.amber.main }} />
                                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                                            {f.satisfaction?.toFixed(1)}
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
                    <Grid container spacing={2.5} sx={{ height: '100%' }}>
                      {/* Taux présence gauge */}
                      <Grid item xs={12}>
                        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 2 }}>Taux de présence</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                              <CircularGauge
                                  value={stats.tauxPresence || 0}
                                  max={100}
                                  label="des inscrits"
                                  color={PALETTE.emerald.main}
                                  size={150}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                              {[
                                { label: 'Internes', value: stats.formateursInternes || 0, color: PALETTE.emerald.main },
                                { label: 'Externes', value: stats.formateursExternes || 0, color: PALETTE.violet.main },
                              ].map((item, i) => (
                                  <Box key={i} sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, border: `1px solid ${item.color}30`, bgcolor: item.color + '08', flex: 1 }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: item.color }}>{item.value}</Typography>
                                    <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>{item.label}</Typography>
                                  </Box>
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Radar notes par domaine */}
                      <Grid item xs={12}>
                        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                          <CardContent sx={{ p: 3 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', mb: 1 }}>Radar notes / domaine</Typography>
                            <ResponsiveContainer width="100%" height={200}>
                              <RadarChart data={(stats.notesMoyennesParDomaine || []).map(d => ({
                                domaine: d.domaine.substring(0, 6),
                                note: Math.round(d.note * 10) / 10,
                              }))}>
                                <PolarGrid stroke="#F1F5F9" />
                                <PolarAngleAxis dataKey="domaine" tick={{ fontSize: 10, fill: '#64748B' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 20]} tick={{ fontSize: 9, fill: '#94A3B8' }} tickCount={3} />
                                <Radar name="Notes" dataKey="note" stroke={PALETTE.indigo.main} fill={PALETTE.indigo.main} fillOpacity={0.2} strokeWidth={2} />
                              </RadarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
            )}

            {/* ════════════════════════════════════════════════
              TAB 5 : BUDGET
          ════════════════════════════════════════════════ */}
            {activeTab === 5 && (
                <Grid container spacing={2.5}>
                  {/* KPI budget */}
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      {[
                        { label: 'Budget total réalisé', value: `${(stats.budgetTotal||0).toLocaleString()} DT`, color: PALETTE.indigo.main, bg: PALETTE.indigo.light, icon: AttachMoney },
                        { label: 'Budget moyen / formation', value: stats.totalFormations > 0 ? `${Math.round((stats.budgetTotal||0) / stats.totalFormations).toLocaleString()} DT` : '—', color: PALETTE.emerald.main, bg: PALETTE.emerald.light, icon: School },
                        { label: 'Objectif annuel', value: '100 000 DT', color: PALETTE.amber.main, bg: PALETTE.amber.light, icon: Assessment },
                        { label: 'Taux réalisation', value: `${Math.round((stats.budgetTotal||0) / 100000 * 100)}%`, color: (stats.budgetTotal||0) >= 100000 ? PALETTE.emerald.main : PALETTE.rose.main, bg: (stats.budgetTotal||0) >= 100000 ? PALETTE.emerald.light : PALETTE.rose.light, icon: TrendingUp },
                      ].map((item, i) => (
                          <Grid item xs={6} md={3} key={i}>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                              <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
                                <CardContent sx={{ p: 2.5 }}>
                                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: item.bg, display: 'inline-flex', mb: 1.5 }}>
                                    <item.icon sx={{ color: item.color, fontSize: 20 }} />
                                  </Box>
                                  <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: item.color, lineHeight: 1.2 }}>{item.value}</Typography>
                                  <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mt: 0.4 }}>{item.label}</Typography>
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
                        <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mb: 2 }}>{primaryYear}</Typography>
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={stats.budgetParTrimestre || []} barSize={30}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                            <XAxis dataKey="trimestre" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                            <Tooltip content={<DarkTooltip />} />
                            <Bar dataKey="budget"   name="Budget réel" fill={PALETTE.indigo.main} radius={[5, 5, 0, 0]} />
                            <Bar dataKey="objectif" name="Objectif"    fill="#E2E8F0"             radius={[5, 5, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1.5, justifyContent: 'center' }}>
                          {[{ color: PALETTE.indigo.main, label: 'Budget réel' }, { color: '#CBD5E1', label: 'Objectif' }].map((item, i) => (
                              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: item.color }} />
                                <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>{item.label}</Typography>
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
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 0.5 }}>Évolution budget — {availableYears.length} ans</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mb: 2 }}>{availableYears[availableYears.length-1]}→{availableYears[0]}</Typography>
                        <ResponsiveContainer width="100%" height={220}>
                          <AreaChart data={annualTrend} margin={{ top: 5, right: 10, bottom: 0, left: -15 }}>
                            <defs>
                              <linearGradient id="budG" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor={PALETTE.indigo.main} stopOpacity={0.18} />
                                <stop offset="95%" stopColor={PALETTE.indigo.main} stopOpacity={0.01} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#475569', fontWeight: 700 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                            <Tooltip content={<DarkTooltip />} />
                            <Area type="monotone" dataKey="budget" name="Budget (DT)"
                                  stroke={PALETTE.indigo.main} fill="url(#budG)" strokeWidth={3}
                                  dot={{ fill: PALETTE.indigo.main, r: 6, strokeWidth: 2, stroke: '#fff' }}
                                  activeDot={{ r: 8 }}
                            />
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