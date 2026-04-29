import React, { useEffect, useState, useCallback } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, FormControl,
    Select, MenuItem, LinearProgress, Chip, Avatar,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Tabs, Tab, ToggleButton, ToggleButtonGroup, Divider,
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
    CheckCircle, Assessment, Star, AutoGraph, CompareArrows, ShowChart,
    CalendarMonth, DonutLarge, BarChart as BarChartIcon,
} from '@mui/icons-material';

// ── Années disponibles ────────────────────────────────────────────────────────
const ALL_YEARS = [2022, 2023, 2024, 2025, 2026];
const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const DOMAINES = ['Informatique','Management','Finance','Langues','Juridique','Marketing'];

// ── Palette ───────────────────────────────────────────────────────────────────
const PALETTE = {
    indigo:  { main: '#6366F1', light: '#EEF2FF', dark: '#4338CA', muted: '#A5B4FC' },
    emerald: { main: '#10B981', light: '#ECFDF5', dark: '#047857', muted: '#6EE7B7' },
    amber:   { main: '#F59E0B', light: '#FFFBEB', dark: '#B45309', muted: '#FCD34D' },
    rose:    { main: '#F43F5E', light: '#FFF1F2', dark: '#BE123C', muted: '#FDA4AF' },
    cyan:    { main: '#06B6D4', light: '#ECFEFF', dark: '#0E7490', muted: '#67E8F9' },
};

const YEAR_COLORS = ['#6366F1','#10B981','#F59E0B','#F43F5E','#06B6D4'];
const DOMAIN_COLORS = ['#6366F1','#10B981','#F59E0B','#F43F5E','#06B6D4','#8B5CF6'];
const DASH_STYLES = [undefined,[6,3],[4,2],[8,3],[3,3]];

// ── Générateur de données démo ────────────────────────────────────────────────
function seededRng(seed) {
    let s = Math.abs(seed) % 2147483647 || 1;
    return () => { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; };
}

function generateDemoData(year) {
    const r = seededRng(year * 179 + 13);
    const base = year - 2022;
    const gr = 1 + base * 0.14;
    const formations = Math.round(14 * gr) + Math.floor(r() * 4);
    const participants = Math.round(160 * gr) + Math.floor(r() * 22) - 5;
    const formateurs = Math.round(10 * gr) + Math.floor(r() * 3);
    const budget = Math.round(45000 * gr) + Math.floor(r() * 6000) - 2500;
    const tauxPresence = Math.min(98, Math.round(80 + base * 2.5) + Math.floor(r() * 5) - 2);

    const domNotes = DOMAINES.map((domaine, i) => {
        const note = Math.min(19.5, +(13.8 + base * 0.28 + r() * 0.9 - 0.3).toFixed(1));
        return { domaine, note, pourcentage: Math.round(note / 20 * 100) };
    });
    const noteMoyenneGlobale = +(domNotes.reduce((s, d) => s + d.note, 0) / domNotes.length).toFixed(1);

    const evolutionMensuelle = MONTHS.map((mois, i) => {
        const s = Math.sin((i - 1) / 11 * Math.PI) * 0.65 + 0.7;
        return {
            mois,
            formations: Math.max(0, Math.round(formations / 12 * s * (0.75 + r() * 0.5))),
            participants: Math.max(0, Math.round(participants / 12 * s * (0.78 + r() * 0.44))),
            budget: Math.max(0, Math.round(budget / 12 * s * (0.8 + r() * 0.4))),
        };
    });

    const formationsParDomaine = DOMAINES.map((name, i) => ({
        name,
        value: Math.max(1, Math.round(formations / DOMAINES.length * (0.6 + r() * 0.8))),
        budget: Math.max(3000, Math.round(budget / DOMAINES.length * (0.6 + r() * 0.8))),
    }));

    const formationsParStatut = [
        { name: 'Terminées',  value: Math.round(formations * 0.56), color: PALETTE.emerald.main },
        { name: 'En cours',   value: Math.round(formations * 0.13), color: PALETTE.amber.main },
        { name: 'Planifiées', value: Math.round(formations * 0.23), color: PALETTE.indigo.main },
        { name: 'Annulées',   value: Math.round(formations * 0.08), color: PALETTE.rose.main },
    ];

    const topFormateurs = [
        { nom: 'Ahmed Ben Ali',  type: 'INTERNE', nbFormations: Math.round(4.5 * (1 + base * 0.14)), noteMoyenne: Math.min(19.5, +(15.0 + base * 0.25).toFixed(1)) },
        { nom: 'Karim Mrabet',   type: 'INTERNE', nbFormations: Math.round(3.8 * (1 + base * 0.13)), noteMoyenne: Math.min(19.5, +(14.6 + base * 0.22).toFixed(1)) },
        { nom: 'Sarra Trabelsi', type: 'EXTERNE', nbFormations: Math.round(3.2 * (1 + base * 0.12)), noteMoyenne: Math.min(19.5, +(14.3 + base * 0.20).toFixed(1)) },
        { nom: 'Rania Gharbi',   type: 'EXTERNE', nbFormations: Math.round(2.8 * (1 + base * 0.11)), noteMoyenne: Math.min(19.5, +(13.9 + base * 0.18).toFixed(1)) },
        { nom: 'Nour Chaabane',  type: 'INTERNE', nbFormations: Math.round(2.2 * (1 + base * 0.10)), noteMoyenne: Math.min(19.5, +(13.5 + base * 0.16).toFixed(1)) },
    ];

    const participantsParStructure = [
        { name: 'Dir. IT',        participants: Math.round(78 * (1 + base * 0.14)) },
        { name: 'Dir. Financière', participants: Math.round(55 * (1 + base * 0.14)) },
        { name: 'Dir. Nord',      participants: Math.round(40 * (1 + base * 0.13)) },
        { name: 'Dir. RH',        participants: Math.round(36 * (1 + base * 0.12)) },
        { name: 'Dir. Sud',       participants: Math.round(29 * (1 + base * 0.11)) },
    ];

    const budgetParTrimestre = [
        { trimestre: 'T1', budget: Math.round(budget * 0.24), objectif: Math.round(budget / 4) },
        { trimestre: 'T2', budget: Math.round(budget * 0.28), objectif: Math.round(budget / 4) },
        { trimestre: 'T3', budget: Math.round(budget * 0.26), objectif: Math.round(budget / 4) },
        { trimestre: 'T4', budget: Math.round(budget * 0.22), objectif: Math.round(budget / 4) },
    ];

    return {
        totalFormations: formations,
        totalParticipants: participants,
        totalFormateurs: formateurs,
        budgetTotal: budget,
        tauxPresence,
        noteMoyenneGlobale,
        formateursInternes: Math.round(formateurs * 0.56),
        formateursExternes: Math.round(formateurs * 0.44),
        notesMoyennesParDomaine: domNotes,
        evolutionMensuelle,
        formationsParDomaine,
        formationsParStatut,
        topFormateurs,
        participantsParStructure,
        budgetParTrimestre,
    };
}

// ── Tooltip sombre ────────────────────────────────────────────────────────────
const DarkTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <Box sx={{ bgcolor:'#0F172A', border:'1px solid #1E293B', borderRadius:2, p:1.5, boxShadow:'0 20px 40px rgba(0,0,0,0.4)', minWidth:150 }}>
            <Typography sx={{ fontWeight:700, fontSize:'0.72rem', color:'#64748B', mb:0.8 }}>{label}</Typography>
            {payload.map((p, i) => (
                <Box key={i} sx={{ display:'flex', justifyContent:'space-between', gap:2, mt:0.3 }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:0.7 }}>
                        <Box sx={{ width:8, height:8, borderRadius:'50%', bgcolor:p.color || p.fill }} />
                        <Typography sx={{ fontSize:'0.73rem', color:'#94A3B8' }}>{p.name}</Typography>
                    </Box>
                    <Typography sx={{ fontSize:'0.78rem', color:'#F1F5F9', fontWeight:700 }}>
                        {typeof p.value === 'number' && p.value > 999
                            ? `${p.value.toLocaleString('fr-FR')} DT`
                            : typeof p.value === 'number'
                                ? p.value
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
        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay, duration:0.45 }}>
            <Card sx={{
                border:'1px solid #E2E8F0',
                borderRadius:3,
                boxShadow:'none',
                height:'100%',
                position:'relative',
                overflow:'hidden',
                transition:'all 0.3s ease',
                '&:hover': {
                    transform:'translateY(-4px)',
                    boxShadow:'0 12px 32px rgba(0,0,0,0.08)',
                }
            }}>
                <Box sx={{ position:'absolute', top:0, right:0, width:90, height:90, borderRadius:'0 0 0 100%', bgcolor:`${color}08` }} />
                <Box sx={{ position:'absolute', top:0, left:0, right:0, height:3, bgcolor:color, borderRadius:'12px 12px 0 0' }} />
                <CardContent sx={{ p:2.5, pt:3 }}>
                    <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:2 }}>
                        <Box sx={{
                            p:1.2,
                            borderRadius:2,
                            bgcolor:bg,
                            display:'flex',
                            alignItems:'center',
                            justifyContent:'center',
                        }}>
                            <Icon sx={{ color, fontSize:22 }} />
                        </Box>
                        {trend && (
                            <Chip
                                size="small"
                                icon={isUp ? <TrendingUp sx={{ fontSize:'11px !important' }} /> : <TrendingDown sx={{ fontSize:'11px !important' }} />}
                                label={trend}
                                sx={{
                                    bgcolor: isUp ? '#DCFCE7' : '#FEE2E2',
                                    color: isUp ? '#15803D' : '#DC2626',
                                    fontWeight:700, fontSize:'0.67rem', height:20,
                                    '& .MuiChip-icon': { color:'inherit' },
                                }}
                            />
                        )}
                    </Box>
                    <Typography sx={{ fontWeight:800, fontSize:'1.8rem', color:'#0F172A', lineHeight:1, mb:0.4 }}>{value}</Typography>
                    <Typography sx={{ fontWeight:600, fontSize:'0.82rem', color:'#475569' }}>{title}</Typography>
                    {sub && <Typography sx={{ fontSize:'0.7rem', color:'#94A3B8', mt:0.4 }}>{sub}</Typography>}
                </CardContent>
            </Card>
        </motion.div>
    );
}

// ── Barre note ────────────────────────────────────────────────────────────────
function NoteBar({ domaine, note, pourcentage, color, index }) {
    return (
        <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay: index * 0.07 }}>
            <Box sx={{ mb:2.5 }}>
                <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:0.8 }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                        <Box sx={{ width:10, height:10, borderRadius:'50%', bgcolor:color }} />
                        <Typography sx={{ fontSize:'0.85rem', fontWeight:600, color:'#374151' }}>{domaine}</Typography>
                    </Box>
                    <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                        <Typography sx={{ fontSize:'0.85rem', fontWeight:800, color:'#0F172A' }}>
                            {note.toFixed(1)}<Typography component="span" sx={{ fontSize:'0.7rem', color:'#9CA3AF', fontWeight:400 }}>/20</Typography>
                        </Typography>
                        <Chip
                            label={`${pourcentage}%`}
                            size="small"
                            sx={{
                                height:20, fontSize:'0.68rem', fontWeight:700,
                                bgcolor: pourcentage >= 80 ? '#DCFCE7' : pourcentage >= 70 ? '#FEF3C7' : '#FEE2E2',
                                color:   pourcentage >= 80 ? '#14532D' : pourcentage >= 70 ? '#78350F' : '#7F1D1D',
                            }}
                        />
                    </Box>
                </Box>
                <Box sx={{ position:'relative', height:10, borderRadius:5, bgcolor:'#F1F5F9', overflow:'hidden' }}>
                    <motion.div
                        initial={{ width:0 }}
                        animate={{ width:`${pourcentage}%` }}
                        transition={{ delay: index * 0.07 + 0.3, duration:0.7, ease:'easeOut' }}
                        style={{ position:'absolute', height:'100%', borderRadius:5, background:`linear-gradient(90deg, ${color}80, ${color})` }}
                    />
                    <Box sx={{ position:'absolute', left:'70%', top:'-2px', bottom:'-2px', width:2, bgcolor:'#EF4444', opacity:.5, zIndex:1 }} />
                </Box>
                <Typography sx={{ fontSize:'0.65rem', color:'#9CA3AF', mt:0.4, textAlign:'right' }}>
                    Seuil 70% = 14/20
                </Typography>
            </Box>
        </motion.div>
    );
}

// ── Tableau comparatif ────────────────────────────────────────────────────────
function CompareTable({ allStats, mainYear }) {
    const indicators = [
        { label:'Formations',      key:'totalFormations',    fmt: v => v },
        { label:'Participants',    key:'totalParticipants',  fmt: v => v },
        { label:'Budget (DT)',     key:'budgetTotal',        fmt: v => v.toLocaleString('fr-FR') },
        { label:'Taux présence',   key:'tauxPresence',       fmt: v => `${v}%` },
        { label:'Note moy. /20',  key:'noteMoyenneGlobale', fmt: v => v ? `${Number(v).toFixed(1)}` : '—' },
        { label:'Formateurs',      key:'totalFormateurs',    fmt: v => v },
    ];
    return (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ bgcolor:'#F8FAFC' }}>
                        <TableCell sx={{ fontWeight:700, color:'#475569', fontSize:'0.72rem', py:1.5 }}>Indicateur</TableCell>
                        {ALL_YEARS.map(y => (
                            <TableCell key={y} align="center" sx={{
                                fontWeight:700, fontSize:'0.78rem', py:1.5,
                                color: y === mainYear ? PALETTE.indigo.main : '#64748B',
                                bgcolor: y === mainYear ? `${PALETTE.indigo.main}08` : 'transparent',
                                borderBottom: y === mainYear ? `2px solid ${PALETTE.indigo.main}` : undefined,
                            }}>
                                {y}{y === mainYear && <Chip label="actuel" size="small" sx={{ ml:0.5, height:14, fontSize:'0.58rem', bgcolor:PALETTE.indigo.main, color:'#fff' }} />}
                            </TableCell>
                        ))}
                        <TableCell align="center" sx={{ fontWeight:700, color:'#475569', fontSize:'0.72rem', py:1.5 }}>Évol. totale</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {indicators.map((ind, i) => {
                        const vals = ALL_YEARS.map(y => Number((allStats[y] || generateDemoData(y))[ind.key]) || 0);
                        const first = vals[0], last = vals[vals.length - 1];
                        const evolPct = first > 0 ? Math.round((last - first) / first * 100) : null;
                        return (
                            <TableRow key={i} sx={{ '&:hover': { bgcolor:'#FAFBFF' } }}>
                                <TableCell sx={{ fontWeight:600, fontSize:'0.84rem', color:'#0F172A' }}>{ind.label}</TableCell>
                                {ALL_YEARS.map((y, vi) => {
                                    const d = allStats[y] || generateDemoData(y);
                                    const raw = Number(d[ind.key]) || 0;
                                    const prev = vi > 0 ? Number((allStats[ALL_YEARS[vi-1]] || generateDemoData(ALL_YEARS[vi-1]))[ind.key]) || 0 : null;
                                    const delta = prev !== null && prev > 0 ? Math.round((raw - prev) / prev * 100) : null;
                                    return (
                                        <TableCell key={y} align="center" sx={{
                                            fontSize:'0.84rem',
                                            fontWeight: y === mainYear ? 800 : 600,
                                            color: y === mainYear ? PALETTE.indigo.main : '#0F172A',
                                            bgcolor: y === mainYear ? `${PALETTE.indigo.main}05` : 'transparent',
                                        }}>
                                            <Box>
                                                {ind.fmt(raw)}
                                                {delta !== null && vi > 0 && (
                                                    <Typography component="span" sx={{ ml:0.5, fontSize:'0.62rem', fontWeight:700, color: delta >= 0 ? '#15803D' : '#DC2626' }}>
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
                                            icon={evolPct >= 0 ? <TrendingUp sx={{ fontSize:'11px !important' }} /> : <TrendingDown sx={{ fontSize:'11px !important' }} />}
                                            sx={{
                                                bgcolor: evolPct >= 0 ? '#DCFCE7' : '#FEE2E2',
                                                color:   evolPct >= 0 ? '#15803D' : '#DC2626',
                                                fontWeight:700, fontSize:'0.72rem', height:22,
                                                '& .MuiChip-icon': { color:'inherit' },
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
    const [primaryYear, setPrimaryYear] = useState(2026);
    const [compareYears, setCompareYears] = useState([2026, 2025, 2024]);
    const [allStats, setAllStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [chartMetric, setChartMetric] = useState('formations');

    const loadYear = useCallback(async (year) => {
        try {
            const res = await statsService.getDashboard(year);
            const data = res.data;
            if (!data.noteMoyenneGlobale && data.notesMoyennesParDomaine?.length) {
                const notes = data.notesMoyennesParDomaine.map(d => d.note).filter(Boolean);
                data.noteMoyenneGlobale = notes.length
                    ? Math.round(notes.reduce((a, b) => a + b, 0) / notes.length * 10) / 10
                    : generateDemoData(year).noteMoyenneGlobale;
            }
            setAllStats(prev => ({ ...prev, [year]: data }));
        } catch {
            setAllStats(prev => ({ ...prev, [year]: generateDemoData(year) }));
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all(ALL_YEARS.map(y => loadYear(y)));
            setLoading(false);
        };
        init();
    }, []);

    const toggleCompare = (year) => {
        if (year === primaryYear) return;
        setCompareYears(prev =>
            prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year].sort()
        );
    };

    const stats = allStats[primaryYear] || generateDemoData(primaryYear);
    const prevStats = allStats[primaryYear - 1] || generateDemoData(primaryYear - 1);

    const calcTrend = (cur, prev) => {
        if (!prev || prev === 0) return null;
        const pct = Math.round((cur - prev) / prev * 100);
        return `${pct >= 0 ? '+' : ''}${pct}%`;
    };

    const activeYears = [primaryYear, ...compareYears].filter((v, i, a) => a.indexOf(v) === i).sort();

    // Données mensuelles multi-années
    const monthlyComparison = MONTHS.map((mois, i) => {
        const row = { mois };
        activeYears.forEach(year => {
            const d = allStats[year] || generateDemoData(year);
            const m = (d.evolutionMensuelle || [])[i] || {};
            row[`val_${year}`] = m[chartMetric] || 0;
        });
        return row;
    });

    // Tendance annuelle
    const annualTrend = ALL_YEARS.map(year => {
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

    // Notes par domaine multi-années
    const notesComparisonData = DOMAINES.map((domaine, i) => {
        const row = { domaine: domaine.substring(0, 8) };
        activeYears.forEach(year => {
            const yd = allStats[year] || generateDemoData(year);
            const found = (yd.notesMoyennesParDomaine || []).find(x => x.domaine === domaine);
            row[`note_${year}`] = found ? Math.round(found.note * 10) / 10 : 0;
            row[`pct_${year}`]  = found ? Math.round(found.note / 20 * 100) : 0;
        });
        return row;
    });

    const tabs = [
        { label:'Évolution mensuelle',       icon: ShowChart },
        { label:'Comparaison multi-années',  icon: CompareArrows },
        { label:'Notes & Résultats',         icon: Assessment },
        { label:'Budget',                    icon: AttachMoney },
    ];

    return (
        <Box sx={{ p:{ xs:2, md:3 }, bgcolor:'#F8FAFC', minHeight:'100vh' }}>

            {/* ── HEADER ─────────────────────────────────────────────────── */}
            <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5 }}>
                <Box sx={{
                    mb:3, p:{ xs:2.5, md:3.5 }, borderRadius:3,
                    background:'linear-gradient(135deg, #1E1B4B 0%, #312E81 35%, #4C1D95 70%, #6366F1 100%)',
                    position:'relative', overflow:'hidden',
                    boxShadow:'0 20px 50px rgba(99,102,241,0.2)',
                }}>
                    {/* Glows décoratifs */}
                    <Box sx={{ position:'absolute', top:-60, right:-40, width:280, height:280, borderRadius:'50%', bgcolor:'rgba(99,102,241,.18)', filter:'blur(60px)' }} />
                    <Box sx={{ position:'absolute', bottom:-40, left:'20%', width:200, height:200, borderRadius:'50%', bgcolor:'rgba(139,92,246,.12)', filter:'blur(50px)' }} />
                    <Box sx={{ position:'absolute', top:'30%', left:-30, width:120, height:120, borderRadius:'50%', bgcolor:'rgba(168,85,247,.1)', filter:'blur(40px)' }} />

                    {/* Lignes décoratives */}
                    <Box sx={{ position:'absolute', top:0, left:0, right:0, height:'1px', bgcolor:'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />

                    <Box sx={{ position:'relative', zIndex:1, display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:2 }}>
                        <Box>
                            <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:1 }}>
                                <Box sx={{
                                    p:1,
                                    borderRadius:2,
                                    bgcolor:'rgba(255,255,255,0.1)',
                                    backdropFilter:'blur(8px)',
                                    border:'1px solid rgba(255,255,255,0.1)',
                                }}>
                                    <AutoGraph sx={{ color:'#C4B5FD', fontSize:26 }} />
                                </Box>
                                <Typography sx={{ fontWeight:800, fontSize:'1.6rem', color:'#fff', letterSpacing:'-0.02em' }}>
                                    Statistiques & Analyses
                                </Typography>
                            </Box>
                            <Typography sx={{ color:'#A5B4FC', fontSize:'0.875rem', ml:0.5 }}>
                                Suivi des performances et indicateurs clés
                            </Typography>
                        </Box>
                        <Box sx={{ display:'flex', gap:1.5, alignItems:'center', flexWrap:'wrap' }}>
                            <FormControl size="small" sx={{ minWidth:110 }}>
                                <Select
                                    value={primaryYear}
                                    onChange={e => { setPrimaryYear(e.target.value); setCompareYears([]); }}
                                    sx={{
                                        bgcolor:'rgba(255,255,255,.1)',
                                        color:'#fff',
                                        borderRadius:2,
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor:'rgba(255,255,255,.2)' },
                                        '& .MuiSvgIcon-root': { color:'#fff' },
                                        fontSize:'0.875rem',
                                        fontWeight:700,
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor:'rgba(255,255,255,.4)' },
                                    }}
                                >
                                    {ALL_YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <Box sx={{ display:'flex', gap:.7, alignItems:'center' }}>
                                <Typography sx={{ fontSize:'0.72rem', color:'#94A3B8', fontWeight:600 }}>comparer :</Typography>
                                {ALL_YEARS.filter(y => y !== primaryYear).map((y, idx) => {
                                    const active = compareYears.includes(y);
                                    const col = YEAR_COLORS[(compareYears.indexOf(y) + 1) % YEAR_COLORS.length];
                                    return (
                                        <Chip key={y} label={y} size="small" onClick={() => toggleCompare(y)} sx={{
                                            cursor:'pointer',
                                            fontWeight:700,
                                            fontSize:'0.78rem',
                                            height:26,
                                            bgcolor: active ? `${col}30` : 'rgba(255,255,255,.08)',
                                            color:   active ? col : 'rgba(255,255,255,.5)',
                                            border:  `1px solid ${active ? col + '60' : 'transparent'}`,
                                            transition:'all .2s',
                                            '&:hover': { bgcolor: active ? `${col}40` : 'rgba(255,255,255,.15)' },
                                        }} />
                                    );
                                })}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </motion.div>

            {loading && <LinearProgress sx={{ mb:2, borderRadius:1, bgcolor:'#EEF2FF', '& .MuiLinearProgress-bar': { bgcolor:'#6366F1' } }} />}

            {/* ── KPI CARDS ──────────────────────────────────────────────── */}
            <Grid container spacing={2} sx={{ mb:3 }}>
                {[
                    { icon:School,      title:'Formations',    value:stats.totalFormations||0,   color:PALETTE.indigo.main,  bg:PALETTE.indigo.light,  trend:calcTrend(stats.totalFormations, prevStats.totalFormations),  sub:`Année ${primaryYear}` },
                    { icon:People,      title:'Participants',  value:stats.totalParticipants||0, color:PALETTE.emerald.main, bg:PALETTE.emerald.light, trend:calcTrend(stats.totalParticipants, prevStats.totalParticipants), sub:'inscrits aux formations' },
                    { icon:Person,      title:'Formateurs',    value:stats.totalFormateurs||0,   color:PALETTE.amber.main,   bg:PALETTE.amber.light,   trend:null, sub:`${stats.formateursInternes||0} int · ${stats.formateursExternes||0} ext` },
                    { icon:AttachMoney, title:'Budget Total',  value:`${((stats.budgetTotal||0)/1000).toFixed(0)}k DT`, color:PALETTE.rose.main, bg:PALETTE.rose.light, trend:calcTrend(stats.budgetTotal, prevStats.budgetTotal), sub:'Objectif : 100k DT' },
                    { icon:CheckCircle, title:'Taux Présence', value:`${stats.tauxPresence||0}%`, color:PALETTE.cyan.main, bg:PALETTE.cyan.light, trend:calcTrend(stats.tauxPresence, prevStats.tauxPresence), sub:'participants présents' },
                    { icon:Star,        title:'Note Moy. /20', value:`${Number(stats.noteMoyenneGlobale||0).toFixed(1)}`, color:'#8B5CF6', bg:'#F5F3FF', trend:null, sub:`${Math.round((stats.noteMoyenneGlobale||0)/20*100)}% réussite` },
                ].map((kpi, i) => (
                    <Grid item xs={6} sm={4} lg={2} key={i}>
                        <KpiCard {...kpi} delay={i * 0.06} />
                    </Grid>
                ))}
            </Grid>

            {/* ── TABS ─────────────────────────────────────────────────────── */}
            <Box sx={{ mb:3, borderBottom:'1px solid #E2E8F0', overflowX:'auto' }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTab-root': { textTransform:'none', fontWeight:600, fontSize:'0.835rem', minHeight:46, gap:.5 },
                        '& .Mui-selected': { color:'#6366F1' },
                        '& .MuiTabs-indicator': { bgcolor:'#6366F1', height:3, borderRadius:'3px 3px 0 0' },
                    }}
                >
                    {tabs.map((t, i) => (
                        <Tab key={i} icon={<t.icon sx={{ fontSize:16 }} />} label={t.label} iconPosition="start" />
                    ))}
                </Tabs>
            </Box>

            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:.3 }}>

                    {/* ═══════════════════════════════════════════
                        TAB 0 — ÉVOLUTION MENSUELLE
                    ═══════════════════════════════════════════ */}
                    {activeTab === 0 && (
                        <Grid container spacing={2.5}>
                            <Grid item xs={12}>
                                <Card sx={{
                                    border:'1px solid #E2E8F0',
                                    borderRadius:3,
                                    boxShadow:'0 4px 20px rgba(0,0,0,0.04)',
                                    overflow:'hidden',
                                }}>
                                    <CardContent sx={{ p:3 }}>
                                        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2.5, flexWrap:'wrap', gap:1.5 }}>
                                            <Box>
                                                <Typography sx={{ fontWeight:700, fontSize:'1rem', color:'#0F172A' }}>
                                                    Évolution mensuelle — {activeYears.join(' · ')}
                                                </Typography>
                                                <Typography sx={{ fontSize:'0.75rem', color:'#94A3B8' }}>Courbes comparatives par mois</Typography>
                                            </Box>
                                            <ToggleButtonGroup value={chartMetric} exclusive onChange={(_, v) => v && setChartMetric(v)} size="small">
                                                {[{v:'formations',l:'Formations'},{v:'participants',l:'Participants'},{v:'budget',l:'Budget'}].map(({ v, l }) => (
                                                    <ToggleButton key={v} value={v} sx={{ textTransform:'none', fontSize:'0.78rem', px:1.5, py:.5, '&.Mui-selected': { bgcolor:'#EEF2FF', color:'#6366F1' } }}>
                                                        {l}
                                                    </ToggleButton>
                                                ))}
                                            </ToggleButtonGroup>
                                        </Box>
                                        {/* Légende */}
                                        <Box sx={{ display:'flex', gap:2.5, mb:2, flexWrap:'wrap' }}>
                                            {activeYears.map((year, idx) => (
                                                <Box key={year} sx={{ display:'flex', alignItems:'center', gap:.8 }}>
                                                    <Box sx={{ width:24, height:3, borderRadius:2, bgcolor:YEAR_COLORS[idx % YEAR_COLORS.length] }} />
                                                    <Typography sx={{ fontSize:'0.78rem', fontWeight:700, color:YEAR_COLORS[idx % YEAR_COLORS.length] }}>
                                                        {year}{year === primaryYear && <Chip label="principal" size="small" sx={{ ml:.5, height:14, fontSize:'0.6rem', bgcolor:YEAR_COLORS[idx % YEAR_COLORS.length], color:'#fff' }} />}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <AreaChart data={monthlyComparison} margin={{ top:5, right:20, bottom:0, left:-10 }}>
                                                <defs>
                                                    {activeYears.map((year, idx) => (
                                                        <linearGradient key={year} id={`grd_${year}`} x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%"  stopColor={YEAR_COLORS[idx % YEAR_COLORS.length]} stopOpacity={0.15} />
                                                            <stop offset="95%" stopColor={YEAR_COLORS[idx % YEAR_COLORS.length]} stopOpacity={0.01} />
                                                        </linearGradient>
                                                    ))}
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                                <XAxis dataKey="mois" tick={{ fontSize:11, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize:11, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
                                                <Tooltip content={<DarkTooltip />} />
                                                {activeYears.map((year, idx) => (
                                                    <Area
                                                        key={year}
                                                        type="monotone"
                                                        dataKey={`val_${year}`}
                                                        name={String(year)}
                                                        stroke={YEAR_COLORS[idx % YEAR_COLORS.length]}
                                                        fill={idx === 0 ? `url(#grd_${year})` : 'transparent'}
                                                        strokeWidth={idx === 0 ? 3 : 2}
                                                        strokeDasharray={idx > 0 ? (DASH_STYLES[idx] || []).join(' ') : undefined}
                                                        dot={{ fill:YEAR_COLORS[idx % YEAR_COLORS.length], r:idx === 0 ? 4 : 3, strokeWidth:0 }}
                                                        activeDot={{ r:7, strokeWidth:2, stroke:'#fff' }}
                                                    />
                                                ))}
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                            {/* Mini cards mensuelles */}
                            {(stats.evolutionMensuelle || []).slice(0, 6).map((m, i) => (
                                <Grid item xs={6} sm={4} md={2} key={i}>
                                    <motion.div initial={{ opacity:0, scale:.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay: i * 0.05 }}>
                                        <Card sx={{
                                            border:'1px solid #E2E8F0',
                                            borderRadius:2.5,
                                            boxShadow:'none',
                                            textAlign:'center',
                                            transition:'all 0.3s ease',
                                            '&:hover': {
                                                transform:'translateY(-3px)',
                                                boxShadow:'0 8px 24px rgba(0,0,0,0.06)',
                                            }
                                        }}>
                                            <CardContent sx={{ p:1.5 }}>
                                                <Typography sx={{ fontSize:'0.72rem', color:'#94A3B8', mb:.3 }}>{m.mois}</Typography>
                                                <Typography sx={{ fontSize:'1.3rem', fontWeight:800, color:'#0F172A' }}>{m.formations}</Typography>
                                                <Typography sx={{ fontSize:'0.68rem', color:'#64748B' }}>formations</Typography>
                                                <Box sx={{ height:3, bgcolor:'#F1F5F9', borderRadius:2, mt:1, overflow:'hidden' }}>
                                                    <Box sx={{
                                                        height:'100%',
                                                        borderRadius:2,
                                                        bgcolor:PALETTE.indigo.main,
                                                        width:`${Math.round((m.formations||0) / Math.max(...(stats.evolutionMensuelle||[]).map(x => x.formations||1)) * 100)}%`,
                                                    }} />
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {/* ═══════════════════════════════════════════
                        TAB 1 — COMPARAISON MULTI-ANNÉES
                    ═══════════════════════════════════════════ */}
                    {activeTab === 1 && (
                        <Grid container spacing={2.5}>
                            <Grid item xs={12}>
                                <Card sx={{
                                    border:'1px solid #E2E8F0',
                                    borderRadius:3,
                                    boxShadow:'0 4px 20px rgba(0,0,0,0.04)',
                                    overflow:'hidden',
                                }}>
                                    <CardContent sx={{ p:3 }}>
                                        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2, flexWrap:'wrap', gap:1 }}>
                                            <Box>
                                                <Typography sx={{ fontWeight:700, fontSize:'1rem', color:'#0F172A' }}>
                                                    Tendance pluriannuelle — 2022→2026
                                                </Typography>
                                                <Typography sx={{ fontSize:'0.75rem', color:'#94A3B8' }}>Progression sur 5 ans</Typography>
                                            </Box>
                                            <ToggleButtonGroup value={chartMetric} exclusive onChange={(_, v) => v && setChartMetric(v)} size="small">
                                                {[
                                                    {v:'formations',l:'Formations'},{v:'participants',l:'Participants'},
                                                    {v:'budget',l:'Budget'},{v:'tauxPresence',l:'Présence'},{v:'noteMoyenne',l:'Note'}
                                                ].map(({ v, l }) => (
                                                    <ToggleButton key={v} value={v} sx={{ textTransform:'none', fontSize:'0.75rem', px:1.2, py:.4, '&.Mui-selected': { bgcolor:'#EEF2FF', color:'#6366F1' } }}>
                                                        {l}
                                                    </ToggleButton>
                                                ))}
                                            </ToggleButtonGroup>
                                        </Box>
                                        <ResponsiveContainer width="100%" height={260}>
                                            <ComposedChart data={annualTrend} margin={{ top:10, right:20, bottom:0, left:-10 }}>
                                                <defs>
                                                    <linearGradient id="annGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.01} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                                <XAxis dataKey="year" tick={{ fontSize:12, fill:'#475569', fontWeight:700 }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize:11, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
                                                <Tooltip content={<DarkTooltip />} />
                                                <Area
                                                    type="monotone"
                                                    dataKey={chartMetric}
                                                    name={chartMetric==='formations'?'Formations':chartMetric==='participants'?'Participants':chartMetric==='budget'?'Budget (DT)':chartMetric==='tauxPresence'?'Taux présence (%)':'Note moy. /20'}
                                                    stroke="#6366F1"
                                                    fill="url(#annGrad)"
                                                    strokeWidth={3}
                                                    dot={{ fill:'#6366F1', r:7, strokeWidth:2, stroke:'#fff' }}
                                                    activeDot={{ r:9 }}
                                                />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12}>
                                <Card sx={{
                                    border:'1px solid #E2E8F0',
                                    borderRadius:3,
                                    boxShadow:'0 4px 20px rgba(0,0,0,0.04)',
                                    overflow:'hidden',
                                }}>
                                    <CardContent sx={{ p:3 }}>
                                        <Typography sx={{ fontWeight:700, fontSize:'1rem', color:'#0F172A', mb:2 }}>
                                            Tableau comparatif · 5 années · indicateurs clés
                                        </Typography>
                                        <CompareTable allStats={allStats} mainYear={primaryYear} />
                                    </CardContent>
                                </Card>
                            </Grid>
                            {compareYears.length > 0 && (
                                <Grid item xs={12}>
                                    <Card sx={{
                                        border:'1px solid #E2E8F0',
                                        borderRadius:3,
                                        boxShadow:'0 4px 20px rgba(0,0,0,0.04)',
                                        overflow:'hidden',
                                    }}>
                                        <CardContent sx={{ p:3 }}>
                                            <Typography sx={{ fontWeight:700, fontSize:'1rem', color:'#0F172A', mb:2 }}>
                                                Formations par domaine — {activeYears.join(' · ')}
                                            </Typography>
                                            <Box sx={{ display:'flex', gap:2, mb:1.5, flexWrap:'wrap' }}>
                                                {activeYears.map((year, idx) => (
                                                    <Box key={year} sx={{ display:'flex', alignItems:'center', gap:.7 }}>
                                                        <Box sx={{ width:10, height:10, borderRadius:2, bgcolor:YEAR_COLORS[idx % YEAR_COLORS.length] }} />
                                                        <Typography sx={{ fontSize:'0.78rem', color:'#64748B', fontWeight:600 }}>{year}</Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                            <ResponsiveContainer width="100%" height={260}>
                                                <BarChart
                                                    data={(stats.formationsParDomaine||[]).map(d => {
                                                        const row = { name: d.name };
                                                        activeYears.forEach(year => {
                                                            const yd = allStats[year] || generateDemoData(year);
                                                            const found = (yd.formationsParDomaine||[]).find(x => x.name === d.name);
                                                            row[String(year)] = found?.value || 0;
                                                        });
                                                        return row;
                                                    })}
                                                    barSize={18}
                                                    barGap={3}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                                    <XAxis dataKey="name" tick={{ fontSize:11, fill:'#94A3B8' }} axisLine={false} />
                                                    <YAxis tick={{ fontSize:11, fill:'#94A3B8' }} axisLine={false} />
                                                    <Tooltip content={<DarkTooltip />} />
                                                    {activeYears.map((year, idx) => (
                                                        <Bar key={year} dataKey={String(year)} name={String(year)} fill={YEAR_COLORS[idx % YEAR_COLORS.length]} radius={[4,4,0,0]} />
                                                    ))}
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}
                        </Grid>
                    )}

                    {/* ═══════════════════════════════════════════
                        TAB 2 — NOTES & RÉSULTATS
                    ═══════════════════════════════════════════ */}
                    {activeTab === 2 && (
                        <Grid container spacing={2.5}>
                            <Grid item xs={12} md={7}>
                                <Card sx={{
                                    border:'1px solid #E2E8F0',
                                    borderRadius:3,
                                    boxShadow:'0 4px 20px rgba(0,0,0,0.04)',
                                    overflow:'hidden',
                                }}>
                                    <CardContent sx={{ p:3 }}>
                                        <Typography sx={{ fontWeight:700, fontSize:'1rem', color:'#0F172A', mb:.5 }}>
                                            Notes par domaine — {primaryYear}
                                        </Typography>
                                        <Typography sx={{ fontSize:'0.75rem', color:'#94A3B8', mb:2 }}>
                                            Note /20 · % réussite · ligne rouge = seuil 70%
                                        </Typography>
                                        {(stats.notesMoyennesParDomaine || []).map((d, i) => (
                                            <NoteBar key={i} domaine={d.domaine} note={d.note} pourcentage={d.pourcentage || Math.round(d.note/20*100)} color={DOMAIN_COLORS[i % DOMAIN_COLORS.length]} index={i} />
                                        ))}
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={5}>
                                <Grid container spacing={2.5}>
                                    <Grid item xs={12}>
                                        <Card sx={{
                                            border:'1px solid #E2E8F0',
                                            borderRadius:3,
                                            boxShadow:'0 4px 20px rgba(0,0,0,0.04)',
                                            overflow:'hidden',
                                        }}>
                                            <CardContent sx={{ p:3 }}>
                                                <Typography sx={{ fontWeight:700, fontSize:'1rem', color:'#0F172A', mb:.5 }}>Note globale — 2022–2026</Typography>
                                                <Typography sx={{ fontSize:'0.75rem', color:'#94A3B8', mb:2 }}>Moyenne toutes formations</Typography>
                                                <ResponsiveContainer width="100%" height={180}>
                                                    <AreaChart data={annualTrend} margin={{ top:5, right:10, bottom:0, left:-15 }}>
                                                        <defs>
                                                            <linearGradient id="noteGrad" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.2} />
                                                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.01} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                                        <XAxis dataKey="year" tick={{ fontSize:11, fill:'#475569' }} axisLine={false} tickLine={false} />
                                                        <YAxis domain={[13,18]} tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
                                                        <Tooltip content={<DarkTooltip />} />
                                                        <ReferenceLine y={14} stroke="#EF4444" strokeDasharray="4 3" strokeWidth={1.5} />
                                                        <Area type="monotone" dataKey="noteMoyenne" name="Note moy." stroke="#6366F1" fill="url(#noteGrad)" strokeWidth={2.5} dot={{ fill:'#6366F1', r:5, strokeWidth:2, stroke:'#fff' }} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Card sx={{
                                            border:'1px solid #E2E8F0',
                                            borderRadius:3,
                                            boxShadow:'0 4px 20px rgba(0,0,0,0.04)',
                                            overflow:'hidden',
                                        }}>
                                            <CardContent sx={{ p:3 }}>
                                                <Typography sx={{ fontWeight:700, fontSize:'1rem', color:'#0F172A', mb:.5 }}>Taux présence — 2022–2026</Typography>
                                                <Typography sx={{ fontSize:'0.75rem', color:'#94A3B8', mb:2 }}>% inscrits présents</Typography>
                                                <ResponsiveContainer width="100%" height={150}>
                                                    <LineChart data={annualTrend} margin={{ top:5, right:10, bottom:0, left:-15 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                                        <XAxis dataKey="year" tick={{ fontSize:11, fill:'#475569' }} axisLine={false} tickLine={false} />
                                                        <YAxis domain={[75,100]} tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                                                        <Tooltip content={<DarkTooltip />} />
                                                        <Line type="monotone" dataKey="tauxPresence" name="Taux présence" stroke="#10B981" strokeWidth={2.5} dot={{ fill:'#10B981', r:5, strokeWidth:2, stroke:'#fff' }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Card sx={{
                                    border:'1px solid #E2E8F0',
                                    borderRadius:3,
                                    boxShadow:'0 4px 20px rgba(0,0,0,0.04)',
                                    overflow:'hidden',
                                }}>
                                    <CardContent sx={{ p:3 }}>
                                        <Typography sx={{ fontWeight:700, fontSize:'1rem', color:'#0F172A', mb:.5 }}>
                                            Notes par domaine — comparaison {activeYears.join(' · ')}
                                        </Typography>
                                        <Typography sx={{ fontSize:'0.75rem', color:'#94A3B8', mb:2 }}>
                                            Ligne rouge = seuil admissibilité 14/20 (70%)
                                        </Typography>
                                        <Box sx={{ display:'flex', gap:2, mb:1.5, flexWrap:'wrap' }}>
                                            {activeYears.map((year, idx) => (
                                                <Box key={year} sx={{ display:'flex', alignItems:'center', gap:.7 }}>
                                                    <Box sx={{ width:14, height:3, borderRadius:2, bgcolor:YEAR_COLORS[idx%YEAR_COLORS.length] }} />
                                                    <Typography sx={{ fontSize:'0.78rem', color:'#64748B' }}>{year}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                        <ResponsiveContainer width="100%" height={260}>
                                            <ComposedChart data={notesComparisonData} margin={{ top:5, right:30, bottom:0, left:-10 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                                <XAxis dataKey="domaine" tick={{ fontSize:11, fill:'#94A3B8' }} axisLine={false} />
                                                <YAxis yAxisId="l" domain={[12,20]} tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} />
                                                <YAxis yAxisId="r" orientation="right" domain={[60,100]} tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickFormatter={v => `${v}%`} />
                                                <Tooltip content={<DarkTooltip />} />
                                                <ReferenceLine yAxisId="l" y={14} stroke="#EF4444" strokeDasharray="5 4" strokeWidth={1.5} label={{ value:'14/20', position:'insideRight', fontSize:10, fill:'#EF4444', fontWeight:700 }} />
                                                {activeYears.map((year, idx) => (
                                                    <Bar key={`note_${year}`} yAxisId="l" dataKey={`note_${year}`} name={`Note ${year}`} fill={YEAR_COLORS[idx%YEAR_COLORS.length]} radius={[4,4,0,0]} opacity={0.85} barSize={18 - idx * 2} />
                                                ))}
                                                {activeYears.map((year, idx) => (
                                                    <Line key={`pct_${year}`} yAxisId="r" type="monotone" dataKey={`pct_${year}`} name={`% réussite ${year}`} stroke={YEAR_COLORS[idx%YEAR_COLORS.length]} strokeWidth={2} strokeDasharray={idx > 0 ? '5 3' : undefined} dot={{ fill:YEAR_COLORS[idx%YEAR_COLORS.length], r:4, strokeWidth:2, stroke:'#fff' }} />
                                                ))}
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    )}

                    {/* ═══════════════════════════════════════════
                        TAB 3 — BUDGET
                    ═══════════════════════════════════════════ */}
                    {activeTab === 3 && (
                        <Grid container spacing={2.5}>
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    {[
                                        { label:'Budget total réalisé', value:`${(stats.budgetTotal||0).toLocaleString('fr-FR')} DT`, color:PALETTE.indigo.main, bg:PALETTE.indigo.light, icon:AttachMoney },
                                        { label:'Budget moy./formation', value:stats.totalFormations>0?`${Math.round((stats.budgetTotal||0)/stats.totalFormations).toLocaleString('fr-FR')} DT`:'—', color:PALETTE.emerald.main, bg:PALETTE.emerald.light, icon:School },
                                        { label:'Objectif annuel', value:'100 000 DT', color:PALETTE.amber.main, bg:PALETTE.amber.light, icon:Assessment },
                                        { label:'Taux réalisation', value:`${Math.round((stats.budgetTotal||0)/100000*100)}%`, color:(stats.budgetTotal||0)>=100000?PALETTE.emerald.main:PALETTE.rose.main, bg:(stats.budgetTotal||0)>=100000?PALETTE.emerald.light:PALETTE.rose.light, icon:TrendingUp },
                                    ].map((item, i) => (
                                        <Grid item xs={6} md={3} key={i}>
                                            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.08 }}>
                                                <Card sx={{
                                                    border:'1px solid #E2E8F0',
                                                    borderRadius:3,
                                                    boxShadow:'none',
                                                    overflow:'hidden',
                                                    transition:'all 0.3s ease',
                                                    '&:hover': {
                                                        transform:'translateY(-4px)',
                                                        boxShadow:'0 12px 32px rgba(0,0,0,0.08)',
                                                    }
                                                }}>
                                                    <Box sx={{ height:3, bgcolor:item.color, borderRadius:'12px 12px 0 0' }} />
                                                    <CardContent sx={{ p:2.5 }}>
                                                        <Box sx={{ p:1, borderRadius:2, bgcolor:item.bg, display:'inline-flex', mb:1.5 }}>
                                                            <item.icon sx={{ color:item.color, fontSize:20 }} />
                                                        </Box>
                                                        <Typography sx={{ fontWeight:800, fontSize:'1.2rem', color:item.color, lineHeight:1.2 }}>{item.value}</Typography>
                                                        <Typography sx={{ fontSize:'0.78rem', color:'#64748B', mt:.4 }}>{item.label}</Typography>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Card sx={{
                                    border:'1px solid #E2E8F0',
                                    borderRadius:3,
                                    boxShadow:'0 4px 20px rgba(0,0,0,0.04)',
                                    overflow:'hidden',
                                }}>
                                    <CardContent sx={{ p:3 }}>
                                        <Typography sx={{ fontWeight:700, fontSize:'1rem', color:'#0F172A', mb:.5 }}>Budget annuel 2022–2026 · Réel vs Objectif</Typography>
                                        <Typography sx={{ fontSize:'0.75rem', color:'#94A3B8', mb:2 }}>Barres = réel · ligne pointillée = objectif 100 000 DT</Typography>
                                        <ResponsiveContainer width="100%" height={240}>
                                            <ComposedChart data={annualTrend} margin={{ top:5, right:20, bottom:0, left:-10 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                                <XAxis dataKey="year" tick={{ fontSize:12, fill:'#475569', fontWeight:700 }} axisLine={false} />
                                                <YAxis tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickFormatter={v => `${Math.round(v/1000)}k`} />
                                                <Tooltip content={<DarkTooltip />} />
                                                <ReferenceLine y={100000} stroke="#EF4444" strokeDasharray="5 3" strokeWidth={1.5} label={{ value:'100k', position:'insideRight', fontSize:10, fill:'#EF4444', fontWeight:700 }} />
                                                <Bar dataKey="budget" name="Budget réel" radius={[5,5,0,0]}>
                                                    {annualTrend.map((entry, i) => (
                                                        <Cell key={i} fill={entry.year == primaryYear ? '#6366F1' : '#6366F140'} />
                                                    ))}
                                                </Bar>
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card sx={{
                                    border:'1px solid #E2E8F0',
                                    borderRadius:3,
                                    boxShadow:'0 4px 20px rgba(0,0,0,0.04)',
                                    overflow:'hidden',
                                }}>
                                    <CardContent sx={{ p:3 }}>
                                        <Typography sx={{ fontWeight:700, fontSize:'1rem', color:'#0F172A', mb:.5 }}>Budget par domaine — {primaryYear}</Typography>
                                        <Typography sx={{ fontSize:'0.75rem', color:'#94A3B8', mb:2 }}>Répartition année principale</Typography>
                                        <Box sx={{ display:'flex', flexWrap:'wrap', gap:1, mb:2 }}>
                                            {(stats.formationsParDomaine||[]).map((d, i) => (
                                                <Box key={i} sx={{ display:'flex', alignItems:'center', gap:.5 }}>
                                                    <Box sx={{ width:8, height:8, borderRadius:'50%', bgcolor:DOMAIN_COLORS[i%DOMAIN_COLORS.length] }} />
                                                    <Typography sx={{ fontSize:'0.72rem', color:'#64748B' }}>{d.name.substring(0,7)}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie data={stats.formationsParDomaine||[]} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="budget" nameKey="name">
                                                    {(stats.formationsParDomaine||[]).map((_, i) => (
                                                        <Cell key={i} fill={DOMAIN_COLORS[i%DOMAIN_COLORS.length]} strokeWidth={0} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<DarkTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card sx={{
                                    border:'1px solid #E2E8F0',
                                    borderRadius:3,
                                    boxShadow:'0 4px 20px rgba(0,0,0,0.04)',
                                    overflow:'hidden',
                                }}>
                                    <CardContent sx={{ p:3 }}>
                                        <Typography sx={{ fontWeight:700, fontSize:'1rem', color:'#0F172A', mb:.5 }}>Budget trimestriel — {primaryYear}</Typography>
                                        <Typography sx={{ fontSize:'0.75rem', color:'#94A3B8', mb:2 }}>Réel vs objectif</Typography>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <BarChart data={stats.budgetParTrimestre||[]} barSize={30}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                                <XAxis dataKey="trimestre" tick={{ fontSize:12, fill:'#94A3B8' }} axisLine={false} />
                                                <YAxis tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickFormatter={v => `${Math.round(v/1000)}k`} />
                                                <Tooltip content={<DarkTooltip />} />
                                                <Bar dataKey="budget" name="Budget réel" fill={PALETTE.indigo.main} radius={[5,5,0,0]} />
                                                <Bar dataKey="objectif" name="Objectif" fill="#E2E8F0" radius={[5,5,0,0]} />
                                            </BarChart>
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
