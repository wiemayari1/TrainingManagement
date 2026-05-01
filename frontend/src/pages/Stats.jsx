import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, FormControl,
    Select, MenuItem, LinearProgress, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Tabs, Tab, ToggleButton, ToggleButtonGroup, Skeleton,
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, Line,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    Legend,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { statsService } from '../services/api';
import {
    School, People, Person, AttachMoney, TrendingUp, TrendingDown,
    CheckCircle, Star,
    Dashboard, ShowChart, FactCheck, AccountBalance, Groups, CalendarToday,
    BarChart as BarChartIcon
} from '@mui/icons-material';

// ── Constantes ────────────────────────────────────────────────────────────────
const ALL_YEARS = [2021, 2022, 2023, 2024, 2025, 2026];
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const COLORS = {
    indigo: '#6366F1',
    emerald: '#10B981',
    amber: '#F59E0B',
    rose: '#F43F5E',
    cyan: '#06B6D4',
    violet: '#8B5CF6',
    orange: '#F97316',
};

const DOMAIN_PALETTE = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#06B6D4', '#8B5CF6', '#F97316'];
const YEAR_PALETTE = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#06B6D4'];

const METRIC_COLORS = {
    formations: '#6366F1',
    participants: '#10B981',
    budget: '#F59E0B',
    tauxPresence: '#06B6D4',
    noteMoyenne: '#8B5CF6',
};

// ── Tooltip personnalisé ──────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <Box sx={{
            bgcolor: '#0F172A', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px', p: '10px 14px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)', minWidth: 140,
        }}>
            <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {label}
            </Typography>
            {payload.map((p, i) => {
                let displayValue = p.value ?? '—';
                const name = p.name || '';
                if (typeof p.value === 'number') {
                    if (name.includes('Budget') || name.includes('DT') || name.includes('budget')) {
                        displayValue = `${p.value.toLocaleString('fr-FR')} DT`;
                    } else if (name.includes('%') || name.includes('Présence') || name.includes('Taux') || name.includes('présence')) {
                        displayValue = `${p.value}%`;
                    } else if (name.includes('Note') || name.includes('/20')) {
                        displayValue = `${p.value.toFixed(1)}`;
                    } else {
                        displayValue = p.value.toLocaleString('fr-FR');
                    }
                }
                return (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mt: 0.4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: p.color || p.fill }} />
                            <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>{p.name}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.78rem', color: '#F1F5F9', fontWeight: 700 }}>
                            {displayValue}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
};

// ── Tooltip Radar personnalisé ────────────────────────────────────────────────
const RadarTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <Box sx={{
            bgcolor: '#0F172A', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px', p: '10px 14px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)', minWidth: 140,
        }}>
            <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {payload[0]?.payload?.domaine}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#6366F1' }} />
                    <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>Note moy.</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.78rem', color: '#F1F5F9', fontWeight: 700 }}>
                    {payload[0]?.value?.toFixed(1)}/20
                </Typography>
            </Box>
        </Box>
    );
};

// ── Graphique Barres + Ligne alignés ─────────────────────────────────────────
const CustomBarLineChart = ({
                                chartId,
                                data,
                                barKey,
                                lineKey,
                                nameKey = 'name',
                                barColors,
                                lineColor = '#F59E0B',
                                barName = 'Valeur',
                                lineName = 'Ligne',
                                height = 260,
                                leftDomain,
                                rightDomain,
                                rightTickFormatter,
                                xAngle = 0,
                                xHeight = 30,
                                barSize = 30,
                                tooltipFormatter,
                            }) => {
    const colorMap = useMemo(() => {
        if (!Array.isArray(barColors)) return {};
        const map = {};
        data?.forEach((d, i) => {
            map[d[nameKey]] = barColors[i % barColors.length];
        });
        return map;
    }, [data, barColors, nameKey]);

    return (
        <Box sx={{ width: '100%', height }}>
            <ResponsiveContainer width="100%" height={height}>
                <BarChart
                    key={chartId}
                    data={data}
                    barCategoryGap="30%"
                    margin={{ top: 20, right: 50, left: 10, bottom: xHeight }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                        dataKey={nameKey}
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={xAngle}
                        textAnchor={xAngle !== 0 ? 'end' : 'middle'}
                        height={xHeight}
                    />
                    <YAxis
                        yAxisId="l"
                        tick={{ fontSize: 10, fill: '#94A3B8' }}
                        axisLine={false}
                        tickLine={false}
                        domain={leftDomain}
                        allowDataOverflow={!!leftDomain}
                    />
                    <YAxis
                        yAxisId="r"
                        orientation="right"
                        tick={{ fontSize: 10, fill: '#94A3B8' }}
                        axisLine={false}
                        tickLine={false}
                        domain={rightDomain}
                        allowDataOverflow={!!rightDomain}
                        tickFormatter={rightTickFormatter}
                    />
                    <Tooltip
                        content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            const barItem  = payload.find(p => p.dataKey === barKey);
                            const lineItem = payload.find(p => p.dataKey === lineKey);
                            const barFill  = colorMap[label]
                                || (Array.isArray(barColors) ? barColors[0] : barColors)
                                || '#6366F1';
                            return (
                                <Box sx={{
                                    bgcolor: '#0F172A',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '10px', p: '10px 14px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)', minWidth: 150,
                                }}>
                                    <Typography sx={{
                                        fontSize: '0.7rem', color: '#64748B',
                                        fontWeight: 700, mb: 0.8, textTransform: 'uppercase',
                                    }}>
                                        {label}
                                    </Typography>
                                    {barItem?.value != null && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 0.4 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                                                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: barFill }} />
                                                <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>{barName}</Typography>
                                            </Box>
                                            <Typography sx={{ fontSize: '0.78rem', color: '#F1F5F9', fontWeight: 700 }}>
                                                {tooltipFormatter ? tooltipFormatter(barItem.value, barKey) : barItem.value}
                                            </Typography>
                                        </Box>
                                    )}
                                    {lineItem?.value != null && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 0.4 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                                                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: lineColor }} />
                                                <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>{lineName}</Typography>
                                            </Box>
                                            <Typography sx={{ fontSize: '0.78rem', color: '#F1F5F9', fontWeight: 700 }}>
                                                {tooltipFormatter ? tooltipFormatter(lineItem.value, lineKey) : lineItem.value}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            );
                        }}
                    />
                    <Bar
                        yAxisId="l"
                        dataKey={barKey}
                        name={barName}
                        maxBarSize={barSize}
                        animationDuration={1000}
                        radius={[6, 6, 0, 0]}
                        isAnimationActive={true}
                    >
                        {data.map((entry) => (
                            <Cell
                                key={`cell-${entry[nameKey]}`}
                                fill={
                                    colorMap[entry[nameKey]]
                                    || (Array.isArray(barColors) ? barColors[0] : barColors)
                                    || '#6366F1'
                                }
                            />
                        ))}
                    </Bar>
                    <Line
                        yAxisId="r"
                        type="monotone"
                        dataKey={lineKey}
                        name={lineName}
                        stroke={lineColor}
                        strokeWidth={3}
                        dot={{ r: 6, fill: '#fff', stroke: lineColor, strokeWidth: 2.5 }}
                        activeDot={{ r: 8, strokeWidth: 0, fill: lineColor }}
                        animationDuration={1000}
                        animationBegin={200}
                        connectNulls={true}
                    />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
};

// ── Carte KPI ─────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, color, bg, trend, sub, delay = 0, loading }) {
    const Icon = icon;
    const isPositive = trend && !String(trend).startsWith('-');
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        >
            <Card sx={{
                border: '1px solid #E2E8F0', borderRadius: '16px',
                boxShadow: 'none', height: '100%', overflow: 'hidden', position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 32px ${color}18` },
            }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: color, opacity: 0.7 }} />
                <CardContent sx={{ p: 2.5, pt: 3 }}>
                    {loading ? (
                        <>
                            <Skeleton width={40} height={40} variant="rounded" sx={{ mb: 1.5 }} />
                            <Skeleton width="60%" height={32} />
                            <Skeleton width="40%" height={18} sx={{ mt: 0.5 }} />
                        </>
                    ) : (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                <Box sx={{ p: 1, borderRadius: '10px', bgcolor: bg }}>
                                    <Icon sx={{ color, fontSize: 20 }} />
                                </Box>
                                {trend && (
                                    <Box sx={{
                                        display: 'flex', alignItems: 'center', gap: 0.3,
                                        bgcolor: isPositive ? '#DCFCE7' : '#FEE2E2',
                                        color: isPositive ? '#15803D' : '#DC2626',
                                        px: 1, py: 0.3, borderRadius: '6px',
                                        fontSize: '0.67rem', fontWeight: 700,
                                    }}>
                                        {isPositive ? <TrendingUp sx={{ fontSize: 12 }} /> : <TrendingDown sx={{ fontSize: 12 }} />}
                                        {trend}
                                    </Box>
                                )}
                            </Box>
                            <Typography sx={{ fontWeight: 800, fontSize: '1.75rem', color: '#0F172A', lineHeight: 1, mb: 0.3, letterSpacing: '-0.02em' }}>
                                {value ?? '—'}
                            </Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>{label}</Typography>
                            {sub && <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', mt: 0.4 }}>{sub}</Typography>}
                        </>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

// ── Barre de note par domaine ─────────────────────────────────────────────────
function DomainNoteBar({ domaine, note, pourcentage, color, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06, duration: 0.4 }}
        >
            <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.7 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>{domaine}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                            {note != null ? note.toFixed(1) : '—'}
                            <Typography component="span" sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 400 }}>/20</Typography>
                        </Typography>
                        {pourcentage > 0 && (
                            <Chip label={`${pourcentage}%`} size="small" sx={{
                                height: 18, fontSize: '0.65rem', fontWeight: 700,
                                bgcolor: pourcentage >= 80 ? '#DCFCE7' : pourcentage >= 70 ? '#FEF3C7' : '#FEE2E2',
                                color: pourcentage >= 80 ? '#14532D' : pourcentage >= 70 ? '#78350F' : '#7F1D1D',
                            }} />
                        )}
                    </Box>
                </Box>
                <Box sx={{ height: 8, bgcolor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pourcentage}%` }}
                        transition={{ delay: index * 0.06 + 0.3, duration: 0.7, ease: 'easeOut' }}
                        style={{
                            height: '100%',
                            borderRadius: 4,
                            background: `linear-gradient(90deg, ${color}70, ${color})`,
                        }}
                    />
                </Box>
                <Box sx={{ position: 'relative', mt: 0.3, height: 16 }}>
                    <Box sx={{
                        position: 'absolute', left: '70%', top: -12, width: 2, height: 16,
                        bgcolor: '#EF4444', opacity: 0.5, borderRadius: 1,
                    }} />
                    <Typography sx={{
                        position: 'absolute', left: '70%', top: -24,
                        transform: 'translateX(-50%)',
                        fontSize: '0.6rem', color: '#EF4444', fontWeight: 700,
                        bgcolor: 'rgba(255,255,255,0.9)', px: 0.5, borderRadius: 0.5,
                    }}>
                        70%
                    </Typography>
                </Box>
            </Box>
        </motion.div>
    );
}

// ── Indicateur de progression annuelle ───────────────────────────────────────
function YearProgressBar({ year, value, maxValue, color, metric, index }) {
    const pct = maxValue > 0 ? Math.round(value / maxValue * 100) : 0;
    const fmt = metric === 'budget'
        ? `${(value / 1000).toFixed(1)}k DT`
        : metric === 'tauxPresence'
            ? `${value}%`
            : value;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}>
            <Box sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>{year}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color }}>
                        {fmt}
                    </Typography>
                </Box>
                <Box sx={{ height: 6, bgcolor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: index * 0.05 + 0.3, duration: 0.6, ease: 'easeOut' }}
                        style={{ height: '100%', borderRadius: 3, backgroundColor: color }}
                    />
                </Box>
            </Box>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function Stats() {
    const [primaryYear, setPrimaryYear] = useState(2026);
    const [allStats, setAllStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingYear, setLoadingYear] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [chartMetric, setChartMetric] = useState('formations');

    const loadYear = useCallback(async (year) => {
        try {
            const res = await statsService.getDashboard(year);
            setAllStats(prev => ({ ...prev, [year]: res.data }));
        } catch {
            setAllStats(prev => ({ ...prev, [year]: null }));
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await loadYear(primaryYear);
            Promise.all(ALL_YEARS.filter(y => y !== primaryYear).map(loadYear));
            setLoading(false);
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleYearChange = async (year) => {
        setPrimaryYear(year);
        if (!allStats[year]) {
            setLoadingYear(true);
            try {
                await loadYear(year);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingYear(false);
            }
        }
    };

    const stats = allStats[primaryYear];
    const prevStats = allStats[primaryYear - 1];

    const calcTrend = (cur, prev) => {
        if (!cur || !prev || prev === 0) return null;
        const pct = Math.round((cur - prev) / prev * 100);
        return `${pct >= 0 ? '+' : ''}${pct}%`;
    };

    const domaineData = useMemo(() => stats?.formationsParDomaine || [], [stats?.formationsParDomaine]);
    const topFormateursData = useMemo(() =>
            stats?.topFormateurs?.map(f => ({
                name: `${f.prenom || ''} ${(f.nom || '').substring(0, 1)}.`,
                formations: f.nbFormations || 0,
                note: f.noteMoyenne || 0,
            })) || [],
        [stats?.topFormateurs]);

    const annualTrend = ALL_YEARS.map(y => {
        const d = allStats[y];
        return {
            year: String(y),
            formations: d?.totalFormations || 0,
            participants: d?.totalParticipants || 0,
            budget: d?.budgetTotal || 0,
            tauxPresence: d?.tauxPresence || 0,
            noteMoyenne: d?.noteMoyenneGlobale || 0,
        };
    });

    const maxValues = {
        formations: Math.max(...annualTrend.map(d => d.formations), 1),
        participants: Math.max(...annualTrend.map(d => d.participants), 1),
        budget: Math.max(...annualTrend.map(d => d.budget), 1),
        tauxPresence: 100,
    };

    const TABS = [
        { label: 'Vue d\'ensemble', icon: <Dashboard fontSize="small" /> },
        { label: 'Évolution mensuelle', icon: <ShowChart fontSize="small" /> },
        { label: 'Notes & Résultats', icon: <FactCheck fontSize="small" /> },
        { label: 'Budget & Finances', icon: <AccountBalance fontSize="small" /> },
        { label: 'Formateurs', icon: <Groups fontSize="small" /> },
        { label: 'Comparatif annuel', icon: <CalendarToday fontSize="small" /> },
    ];

    const isLoadingCurrent = loading || loadingYear || !stats;

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, minHeight: '100vh', bgcolor: '#F8FAFC' }}>

            {/* ══ HEADER ══════════════════════════════════════════════════════ */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Box sx={{
                    mb: 3, p: { xs: 2.5, md: 3.5 }, borderRadius: '20px',
                    bgcolor: '#0F0E2E',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <Box sx={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
                    <Box sx={{ position: 'absolute', bottom: -40, left: '20%', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)' }} />

                    <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                <BarChartIcon sx={{ color: '#A5B4FC', fontSize: 26 }} />
                                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.6rem' }, color: '#fff', letterSpacing: '-0.02em' }}>
                                    Statistiques & Analyses
                                </Typography>
                            </Box>
                            <Typography sx={{ color: '#64748B', fontSize: '0.875rem' }}>
                                Données réelles · {primaryYear} · Tableau de bord analytique
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography sx={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>Année :</Typography>
                            <FormControl size="small">
                                <Select
                                    value={primaryYear}
                                    onChange={e => handleYearChange(e.target.value)}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.08)', color: '#fff',
                                        borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem',
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
                                        '& .MuiSvgIcon-root': { color: '#fff' },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6366F1' },
                                    }}
                                >
                                    {ALL_YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    {(loading || loadingYear) && (
                        <LinearProgress sx={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            bgcolor: 'rgba(255,255,255,0.05)',
                            '& .MuiLinearProgress-bar': { bgcolor: '#6366F1' },
                        }} />
                    )}
                </Box>
            </motion.div>

            {/* ══ KPI CARDS ════════════════════════════════════════════════════ */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    {
                        icon: School, label: 'Formations', color: '#6366F1', bg: '#EEF2FF',
                        value: stats?.totalFormations,
                        trend: calcTrend(stats?.totalFormations, prevStats?.totalFormations),
                        sub: `Année ${primaryYear}`,
                    },
                    {
                        icon: People, label: 'Participants', color: '#10B981', bg: '#ECFDF5',
                        value: stats?.totalParticipants,
                        trend: calcTrend(stats?.totalParticipants, prevStats?.totalParticipants),
                        sub: 'inscrits aux formations',
                    },
                    {
                        icon: Person, label: 'Formateurs actifs', color: '#F59E0B', bg: '#FFFBEB',
                        value: stats?.totalFormateurs,
                        sub: `${stats?.formateursInternes || 0} int · ${stats?.formateursExternes || 0} ext`,
                    },
                    {
                        icon: AttachMoney, label: 'Budget total', color: '#F43F5E', bg: '#FFF1F2',
                        value: stats?.budgetTotal ? `${(stats.budgetTotal / 1000).toFixed(1)}k DT` : null,
                        trend: calcTrend(stats?.budgetTotal, prevStats?.budgetTotal),
                        sub: 'dépenses de formation',
                    },
                    {
                        icon: CheckCircle, label: 'Taux de présence', color: '#06B6D4', bg: '#ECFEFF',
                        value: stats?.tauxPresence != null ? `${stats.tauxPresence}%` : null,
                        trend: calcTrend(stats?.tauxPresence, prevStats?.tauxPresence),
                        sub: 'participants présents',
                    },
                    {
                        icon: Star, label: 'Note moyenne', color: '#8B5CF6', bg: '#F5F3FF',
                        value: stats?.noteMoyenneGlobale != null ? `${Number(stats.noteMoyenneGlobale).toFixed(1)}/20` : null,
                        sub: stats?.noteMoyenneGlobale
                            ? `${Math.round(stats.noteMoyenneGlobale / 20 * 100)}% réussite`
                            : 'Pas encore de notes',
                    },
                ].map((kpi, i) => (
                    <Grid item xs={6} sm={4} lg={2} key={i}>
                        <KpiCard {...kpi} delay={i * 0.06} loading={isLoadingCurrent} />
                    </Grid>
                ))}
            </Grid>

            {/* ══ TABS ═════════════════════════════════════════════════════════ */}
            <Box sx={{ borderBottom: '1px solid #E2E8F0', mb: 3, overflowX: 'auto' }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none', fontWeight: 600, fontSize: '0.83rem',
                            minHeight: 48, color: '#64748B',
                        },
                        '& .Mui-selected': { color: '#0F172A', fontWeight: 700 },
                        '& .MuiTabs-indicator': { bgcolor: '#6366F1', height: 3, borderRadius: '3px 3px 0 0' },
                    }}
                >
                    {TABS.map((t, i) => (
                        <Tab key={i} icon={t.icon} iconPosition="start" label={t.label} sx={{ minHeight: 48, gap: 1 }} />
                    ))}
                </Tabs>
            </Box>

            <AnimatePresence mode="wait">
                <motion.div
                    key={`${activeTab}-${primaryYear}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28 }}
                >

                    {/* ══ TAB 0 — VUE D'ENSEMBLE ══════════════════════════════ */}
                    {activeTab === 0 && (
                        <Grid container spacing={2.5}>

                            <Grid item xs={12} md={5}>
                                <Card sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: 'none', height: '100%' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', mb: 0.4 }}>
                                            Formations par statut
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.73rem', color: '#94A3B8', mb: 2.5 }}>
                                            Répartition {primaryYear}
                                        </Typography>
                                        {isLoadingCurrent ? (
                                            <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
                                        ) : (
                                            <>
                                                <ResponsiveContainer width="100%" height={220}>
                                                    <PieChart>
                                                        <Pie
                                                            data={stats?.formationsParStatut || []}
                                                            cx="50%" cy="50%"
                                                            innerRadius={60} outerRadius={95}
                                                            paddingAngle={3} dataKey="value"
                                                            stroke="#fff" strokeWidth={2}
                                                            cornerRadius={4}
                                                        >
                                                            {(stats?.formationsParStatut || []).map((entry, i) => (
                                                                <Cell key={i} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip content={<CustomTooltip />} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                                                    {(stats?.formationsParStatut || []).map((s, i) => (
                                                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                                                            <Typography sx={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
                                                                {s.name} ({s.value})
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={7}>
                                <Card sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: 'none', height: '100%' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', mb: 0.4 }}>
                                            Participants par structure
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.73rem', color: '#94A3B8', mb: 2.5 }}>
                                            Répartition des effectifs formés · {primaryYear}
                                        </Typography>
                                        {isLoadingCurrent ? (
                                            <Skeleton variant="rounded" width="100%" height={200} />
                                        ) : (stats?.participantsParStructure?.length > 0) ? (
                                            <ResponsiveContainer width="100%" height={220}>
                                                <BarChart
                                                    data={stats.participantsParStructure}
                                                    layout="vertical"
                                                    barSize={20}
                                                    margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                                                    <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }} axisLine={false} tickLine={false} width={120} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Bar dataKey="participants" name="Participants" radius={[0, 6, 6, 0]} animationDuration={1000}>
                                                        {(stats.participantsParStructure || []).map((_, i) => (
                                                            <Cell key={i} fill={DOMAIN_PALETTE[i % DOMAIN_PALETTE.length]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#94A3B8', fontSize: '0.85rem' }}>
                                                Aucune donnée pour {primaryYear}
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={5}>
                                <Card sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: 'none', height: '100%' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', mb: 0.4 }}>
                                            Répartition par domaine
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.73rem', color: '#94A3B8', mb: 2.5 }}>
                                            Volume de formations · {primaryYear}
                                        </Typography>
                                        {isLoadingCurrent ? (
                                            <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
                                        ) : (
                                            <>
                                                <ResponsiveContainer width="100%" height={220}>
                                                    <PieChart>
                                                        <Pie
                                                            data={stats?.formationsParDomaine || []}
                                                            cx="50%" cy="50%"
                                                            innerRadius={60} outerRadius={95}
                                                            paddingAngle={3} dataKey="value" nameKey="name"
                                                            stroke="#fff" strokeWidth={2}
                                                            cornerRadius={4}
                                                        >
                                                            {(stats?.formationsParDomaine || []).map((_, i) => (
                                                                <Cell key={i} fill={DOMAIN_PALETTE[i % DOMAIN_PALETTE.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip content={<CustomTooltip />} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
                                                    {(stats?.formationsParDomaine || []).map((d, i) => (
                                                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: DOMAIN_PALETTE[i % DOMAIN_PALETTE.length] }} />
                                                            <Typography sx={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
                                                                {d.name} ({d.value})
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={7}>
                                <Card sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: 'none', height: '100%' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
                                            <Box>
                                                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', mb: 0.2 }}>
                                                    Formations & Budget par domaine
                                                </Typography>
                                                <Typography sx={{ fontSize: '0.73rem', color: '#94A3B8' }}>
                                                    Nombre de formations et budget alloué · {primaryYear}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        {isLoadingCurrent ? (
                                            <Skeleton variant="rounded" width="100%" height={240} />
                                        ) : (domaineData.length > 0) ? (
                                            <CustomBarLineChart
                                                chartId={`domaine-${primaryYear}`}
                                                data={domaineData}
                                                barKey="value"
                                                lineKey="budget"
                                                nameKey="name"
                                                barColors={DOMAIN_PALETTE}
                                                lineColor="#F59E0B"
                                                barName="Formations"
                                                lineName="Budget (DT)"
                                                height={260}
                                                barSize={28}
                                                xAngle={-20}
                                                xHeight={50}
                                                rightTickFormatter={v => `${Math.round(v / 1000)}k`}
                                                tooltipFormatter={(val, key) =>
                                                    key === 'budget'
                                                        ? `${Number(val).toLocaleString('fr-FR')} DT`
                                                        : val
                                                }
                                            />
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240, color: '#94A3B8' }}>
                                                Aucune donnée disponible
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                        </Grid>
                    )}

                    {/* ══ TAB 1 — ÉVOLUTION MENSUELLE ═════════════════════════ */}
                    {activeTab === 1 && (
                        <Grid container spacing={2.5}>
                            <Grid item xs={12}>
                                <Card sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: 'none' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
                                            <Box>
                                                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', mb: 0.2 }}>
                                                    Évolution mensuelle — {primaryYear}
                                                </Typography>
                                                <Typography sx={{ fontSize: '0.73rem', color: '#94A3B8' }}>
                                                    Données réelles extraites de la base
                                                </Typography>
                                            </Box>
                                            <ToggleButtonGroup value={chartMetric} exclusive onChange={(_, v) => v && setChartMetric(v)} size="small">
                                                {[
                                                    { v: 'formations', l: 'Formations' },
                                                    { v: 'participants', l: 'Participants' },
                                                    { v: 'budget', l: 'Budget' },
                                                ].map(({ v, l }) => (
                                                    <ToggleButton key={v} value={v} sx={{
                                                        textTransform: 'none', fontSize: '0.78rem', px: 1.5, py: 0.5, fontWeight: 600,
                                                        '&.Mui-selected': { bgcolor: '#EEF2FF', color: '#6366F1', fontWeight: 700 },
                                                    }}>
                                                        {l}
                                                    </ToggleButton>
                                                ))}
                                            </ToggleButtonGroup>
                                        </Box>

                                        {isLoadingCurrent ? (
                                            <Skeleton variant="rounded" width="100%" height={300} />
                                        ) : (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <AreaChart data={stats?.evolutionMensuelle || []} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id={`areaGrad-${chartMetric}`} x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor={METRIC_COLORS[chartMetric] || '#6366F1'} stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor={METRIC_COLORS[chartMetric] || '#6366F1'} stopOpacity={0.02} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                                    <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                                                    <YAxis
                                                        tick={{ fontSize: 11, fill: '#94A3B8' }}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tickFormatter={chartMetric === 'budget' ? v => `${Math.round(v / 1000)}k` : undefined}
                                                    />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Area
                                                        type="monotone"
                                                        dataKey={chartMetric}
                                                        name={chartMetric === 'formations' ? 'Formations' : chartMetric === 'participants' ? 'Participants' : 'Budget (DT)'}
                                                        stroke={METRIC_COLORS[chartMetric] || '#6366F1'}
                                                        fill={`url(#areaGrad-${chartMetric})`}
                                                        strokeWidth={3}
                                                        dot={{ fill: '#fff', r: 5, strokeWidth: 2.5, stroke: METRIC_COLORS[chartMetric] || '#6366F1' }}
                                                        activeDot={{ r: 7, strokeWidth: 0, fill: METRIC_COLORS[chartMetric] || '#6366F1' }}
                                                        animationDuration={1200}
                                                        animationEasing="ease-out"
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            {(stats?.evolutionMensuelle || []).map((m, i) => {
                                const monthlyData = stats?.evolutionMensuelle || [];
                                const maxMonthly = Math.max(...monthlyData.map(x => x[chartMetric] || 0), 1);
                                const val = m[chartMetric] || 0;
                                return (
                                    <Grid item xs={4} sm={3} md={2} key={i}>
                                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                                            <Card sx={{ border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: 'none', textAlign: 'center' }}>
                                                <CardContent sx={{ p: 1.5 }}>
                                                    <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>{m.mois}</Typography>
                                                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2, mt: 0.3 }}>
                                                        {val}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '0.62rem', color: '#64748B' }}>
                                                        {chartMetric === 'budget' ? 'DT' : chartMetric}
                                                    </Typography>
                                                    <Box sx={{ mt: 0.8, height: 3, bgcolor: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
                                                        <Box sx={{
                                                            height: '100%', borderRadius: 2, bgcolor: METRIC_COLORS[chartMetric] || '#6366F1',
                                                            width: `${Math.round((val / maxMonthly) * 100)}%`,
                                                            transition: 'width 0.6s ease-out',
                                                        }} />
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}

                    {/* ══ TAB 2 — NOTES & RÉSULTATS ═══════════════════════════ */}
                    {activeTab === 2 && (
                        <Grid container spacing={2.5}>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: 'none', height: '100%' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', mb: 0.4 }}>
                                            Notes moyennes par domaine
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.73rem', color: '#94A3B8', mb: 2.5 }}>
                                            Évaluations des participants · {primaryYear}
                                        </Typography>
                                        {isLoadingCurrent ? (
                                            <Box>{[1, 2, 3, 4].map(i => <Skeleton key={i} height={50} sx={{ mb: 1 }} />)}</Box>
                                        ) : (stats?.notesMoyennesParDomaine?.filter(d => d.note != null).length > 0) ? (
                                            stats.notesMoyennesParDomaine
                                                .filter(d => d.note != null)
                                                .map((d, i) => (
                                                    <DomainNoteBar
                                                        key={i}
                                                        domaine={d.domaine}
                                                        note={d.note}
                                                        pourcentage={d.pourcentage || Math.round((d.note / 20) * 100)}
                                                        color={DOMAIN_PALETTE[i % DOMAIN_PALETTE.length]}
                                                        index={i}
                                                    />
                                                ))
                                        ) : (
                                            <Box sx={{ textAlign: 'center', py: 5, color: '#94A3B8' }}>
                                                Aucune note enregistrée pour {primaryYear}
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Grid container spacing={2.5}>
                                    <Grid item xs={12}>
                                        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: 'none' }}>
                                            <CardContent sx={{ p: 3 }}>
                                                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', mb: 0.4 }}>
                                                    Radar des compétences
                                                </Typography>
                                                <Typography sx={{ fontSize: '0.73rem', color: '#94A3B8', mb: 1.5 }}>
                                                    Performance par domaine de formation
                                                </Typography>
                                                {isLoadingCurrent ? (
                                                    <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
                                                ) : (
                                                    <ResponsiveContainer width="100%" height={240}>
                                                        <RadarChart
                                                            data={(stats?.notesMoyennesParDomaine || [])
                                                                .filter(d => d.note != null)
                                                                .map(d => ({
                                                                    domaine: d.domaine?.length > 10 ? d.domaine.substring(0, 9) + '…' : (d.domaine || ''),
                                                                    note: d.note || 0
                                                                }))}
                                                        >
                                                            <PolarGrid stroke="#E2E8F0" />
                                                            <PolarAngleAxis dataKey="domaine" tick={{ fontSize: 9, fill: '#64748B' }} />
                                                            <PolarRadiusAxis angle={30} domain={[0, 20]} tick={{ fontSize: 9, fill: '#94A3B8' }} tickCount={4} />
                                                            <Radar name="Note moy." dataKey="note" stroke="#6366F1" fill="#6366F1" fillOpacity={0.18} strokeWidth={2} />
                                                            <Tooltip content={<RadarTooltip />} />
                                                        </RadarChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: 'none', textAlign: 'center' }}>
                                            <CardContent sx={{ p: 2.5 }}>
                                                <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
                                                    Taux présence
                                                </Typography>
                                                <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#06B6D4' }}>
                                                    {stats?.tauxPresence != null ? `${stats.tauxPresence}%` : '—'}
                                                </Typography>
                                                <Box sx={{ mt: 1, height: 6, bgcolor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                                                    <Box sx={{ height: '100%', width: `${stats?.tauxPresence || 0}%`, bgcolor: '#06B6D4', borderRadius: 3, transition: 'width 1s' }} />
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: 'none', textAlign: 'center' }}>
                                            <CardContent sx={{ p: 2.5 }}>
                                                <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
                                                    Note globale
                                                </Typography>
                                                <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#8B5CF6' }}>
                                                    {stats?.noteMoyenneGlobale != null ? `${Number(stats.noteMoyenneGlobale).toFixed(1)}` : '—'}
                                                </Typography>
                                                <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8' }}>/20</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}

                    {/* ══ TAB 3 — BUDGET & FINANCES ═══════════════════════════ */}
                    {activeTab === 3 && (
                        <Grid container spacing={2.5}>
                            {[
                                {
                                    label: 'Budget total réalisé',
                                    value: stats?.budgetTotal ? `${stats.budgetTotal.toLocaleString('fr-FR')} DT` : '—',
                                    color: '#6366F1',
                                },
                                {
                                    label: 'Coût moyen / formation',
                                    value: stats?.totalFormations && stats?.budgetTotal
                                        ? `${Math.round(stats.budgetTotal / stats.totalFormations).toLocaleString('fr-FR')} DT`
                                        : '—',
                                    color: '#10B981',
                                },
                                {
                                    label: 'Coût moyen / participant',
                                    value: stats?.totalParticipants && stats?.budgetTotal
                                        ? `${Math.round(stats.budgetTotal / stats.totalParticipants).toLocaleString('fr-FR')} DT`
                                        : '—',
                                    color: '#F59E0B',
                                },
                            ].map((item, i) => (
                                <Grid item xs={12} md={4} key={i}>
                                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                                        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: 'none' }}>
                                            <CardContent sx={{ p: 2.5 }}>
                                                <Box sx={{ width: 4, height: 36, bgcolor: item.color, borderRadius: 2, mb: 1.5 }} />
                                                <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, mb: 0.4 }}>{item.label}</Typography>
                                                <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: item.color }}>
                                                    {isLoadingCurrent ? <Skeleton width={100} /> : item.value}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            ))}

                            <Grid item xs={12} md={7}>
                                <Card sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: 'none' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', mb: 0.4 }}>
                                            Budget par trimestre
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.73rem', color: '#94A3B8', mb: 2.5 }}>
                                            Dépenses réelles · {primaryYear}
                                        </Typography>
                                        {isLoadingCurrent ? (
                                            <Skeleton variant="rounded" width="100%" height={240} />
                                        ) : (
                                            <ResponsiveContainer width="100%" height={260}>
                                                <BarChart data={stats?.budgetParTrimestre || []} barSize={36}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                                    <XAxis dataKey="trimestre" tick={{ fontSize: 12, fill: '#475569', fontWeight: 700 }} axisLine={false} />
                                                    <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: 8 }} />
                                                    <Bar dataKey="budget" name="Budget réalisé" fill="#6366F1" radius={[6, 6, 0, 0]} animationDuration={1000} />
                                                    <Bar dataKey="objectif" name="Objectif prévu" fill="#E2E8F0" radius={[6, 6, 0, 0]} animationDuration={1000} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={5}>
                                <Card sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: 'none', height: '100%' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', mb: 0.4 }}>
                                            Budget par domaine
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.73rem', color: '#94A3B8', mb: 1 }}>
                                            Répartition des dépenses
                                        </Typography>
                                        {isLoadingCurrent ? (
                                            <Skeleton variant="circular" width={180} height={180} sx={{ mx: 'auto', mt: 2 }} />
                                        ) : (
                                            <>
                                                <ResponsiveContainer width="100%" height={180}>
                                                    <PieChart>
                                                        <Pie
                                                            data={stats?.formationsParDomaine || []}
                                                            cx="50%" cy="50%"
                                                            innerRadius={50} outerRadius={80}
                                                            paddingAngle={3} dataKey="budget" nameKey="name"
                                                            stroke="#fff" strokeWidth={2} cornerRadius={4}
                                                        >
                                                            {(stats?.formationsParDomaine || []).map((_, i) => (
                                                                <Cell key={i} fill={DOMAIN_PALETTE[i % DOMAIN_PALETTE.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip content={<CustomTooltip />} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <Box sx={{ mt: 1 }}>
                                                    {(stats?.formationsParDomaine || []).map((d, i) => (
                                                        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: DOMAIN_PALETTE[i % DOMAIN_PALETTE.length] }} />
                                                                <Typography sx={{ fontSize: '0.75rem', color: '#475569' }}>{d.name}</Typography>
                                                            </Box>
                                                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A' }}>
                                                                {Number(d.budget || 0).toLocaleString('fr-FR')} DT
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    )}

                    {/* ══ TAB 4 — FORMATEURS ══════════════════════════════════ */}
                    {activeTab === 4 && (
                        <Grid container spacing={2.5}>
                            <Grid item xs={12} lg={8}>
                                <Card sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: 'none', height: '100%' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                                            <Groups sx={{ color: '#6366F1', fontSize: 22 }} />
                                            <Box>
                                                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
                                                    Analyse des Performances (Top Formateurs) — {primaryYear}
                                                </Typography>
                                                <Typography sx={{ fontSize: '0.73rem', color: '#94A3B8' }}>
                                                    Volume de sessions vs Note de satisfaction
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {isLoadingCurrent ? (
                                            <Skeleton variant="rounded" width="100%" height={300} />
                                        ) : (topFormateursData.length > 0) ? (
                                            <CustomBarLineChart
                                                chartId={`formateurs-${primaryYear}`}
                                                data={topFormateursData}
                                                barKey="formations"
                                                lineKey="note"
                                                nameKey="name"
                                                barColors={['#6366F1']}
                                                lineColor="#F59E0B"
                                                barName="Sessions animées"
                                                lineName="Note /20"
                                                height={300}
                                                barSize={40}
                                                rightDomain={[10, 20]}
                                                tooltipFormatter={(val, key) =>
                                                    key === 'note' ? `${Number(val).toFixed(1)}/20` : val
                                                }
                                            />
                                        ) : (
                                            <Box sx={{ textAlign: 'center', py: 5, color: '#94A3B8' }}>
                                                Aucune donnée de formateurs pour {primaryYear}
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} lg={4}>
                                <Grid container spacing={2.5}>
                                    <Grid item xs={12}>
                                        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: 'none' }}>
                                            <CardContent sx={{ p: 3 }}>
                                                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', mb: 2 }}>
                                                    Internes vs Externes
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                                                    {[
                                                        { label: 'Internes', value: stats?.formateursInternes || 0, color: '#10B981', bg: '#ECFDF5' },
                                                        { label: 'Externes', value: stats?.formateursExternes || 0, color: '#8B5CF6', bg: '#F5F3FF' },
                                                    ].map((item, i) => (
                                                        <Box key={i} sx={{
                                                            flex: 1, textAlign: 'center', p: 1.5, borderRadius: '10px',
                                                            border: `1px solid ${item.color}25`, bgcolor: item.color + '08',
                                                        }}>
                                                            <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: item.color }}>
                                                                {isLoadingCurrent ? <Skeleton width={30} sx={{ mx: 'auto' }} /> : item.value}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>{item.label}</Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                                {!isLoadingCurrent && (
                                                    <ResponsiveContainer width="100%" height={160}>
                                                        <PieChart>
                                                            <Pie
                                                                data={[
                                                                    { name: 'Internes', value: stats?.formateursInternes || 0 },
                                                                    { name: 'Externes', value: stats?.formateursExternes || 0 },
                                                                ]}
                                                                cx="50%" cy="50%"
                                                                innerRadius={45} outerRadius={70}
                                                                paddingAngle={3} dataKey="value"
                                                                stroke="#fff" strokeWidth={2} cornerRadius={4}
                                                            >
                                                                <Cell fill="#10B981" />
                                                                <Cell fill="#8B5CF6" />
                                                            </Pie>
                                                            <Tooltip content={<CustomTooltip />} />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}

                    {/* ══ TAB 5 — COMPARATIF ANNUEL ═══════════════════════════ */}
                    {activeTab === 5 && (
                        <Grid container spacing={2.5}>
                            <Grid item xs={12}>
                                <Card sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: 'none' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
                                            <Box>
                                                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', mb: 0.2 }}>
                                                    Évolution pluriannuelle — {Math.min(...ALL_YEARS)}→{Math.max(...ALL_YEARS)}
                                                </Typography>
                                                <Typography sx={{ fontSize: '0.73rem', color: '#94A3B8' }}>
                                                    Données réelles de la base · {ALL_YEARS.length} années
                                                </Typography>
                                            </Box>
                                            <ToggleButtonGroup value={chartMetric} exclusive onChange={(_, v) => v && setChartMetric(v)} size="small">
                                                {[
                                                    { v: 'formations', l: 'Formations' },
                                                    { v: 'participants', l: 'Participants' },
                                                    { v: 'budget', l: 'Budget' },
                                                    { v: 'tauxPresence', l: 'Présence' },
                                                ].map(({ v, l }) => (
                                                    <ToggleButton key={v} value={v} sx={{
                                                        textTransform: 'none', fontSize: '0.75rem', px: 1.2, py: 0.4, fontWeight: 600,
                                                        '&.Mui-selected': { bgcolor: '#EEF2FF', color: '#6366F1', fontWeight: 700 },
                                                    }}>
                                                        {l}
                                                    </ToggleButton>
                                                ))}
                                            </ToggleButtonGroup>
                                        </Box>

                                        <ResponsiveContainer width="100%" height={260}>
                                            <AreaChart data={annualTrend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id={`annGrad-${chartMetric}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={METRIC_COLORS[chartMetric] || '#6366F1'} stopOpacity={0.25} />
                                                        <stop offset="95%" stopColor={METRIC_COLORS[chartMetric] || '#6366F1'} stopOpacity={0.02} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                                <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#475569', fontWeight: 700 }} axisLine={false} />
                                                <YAxis
                                                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                                                    axisLine={false}
                                                    tickFormatter={
                                                        chartMetric === 'budget'
                                                            ? v => `${Math.round(v / 1000)}k`
                                                            : chartMetric === 'tauxPresence'
                                                                ? v => `${v}%`
                                                                : undefined
                                                    }
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area
                                                    type="monotone"
                                                    dataKey={chartMetric}
                                                    name={
                                                        chartMetric === 'formations' ? 'Formations'
                                                            : chartMetric === 'participants' ? 'Participants'
                                                                : chartMetric === 'budget' ? 'Budget (DT)'
                                                                    : 'Taux présence (%)'
                                                    }
                                                    stroke={METRIC_COLORS[chartMetric] || '#6366F1'}
                                                    fill={`url(#annGrad-${chartMetric})`}
                                                    strokeWidth={3}
                                                    dot={{ fill: '#fff', r: 6, strokeWidth: 2.5, stroke: METRIC_COLORS[chartMetric] || '#6366F1' }}
                                                    activeDot={{ r: 8, strokeWidth: 0, fill: METRIC_COLORS[chartMetric] || '#6366F1' }}
                                                    animationDuration={1200}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Card sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: 'none' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', mb: 0.4 }}>
                                            Formations par année
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.73rem', color: '#94A3B8', mb: 2 }}>
                                            Progression depuis {Math.min(...ALL_YEARS)}
                                        </Typography>
                                        {ALL_YEARS.map((y, i) => {
                                            const d = allStats[y];
                                            return (
                                                <YearProgressBar
                                                    key={y}
                                                    year={y}
                                                    value={d?.totalFormations || 0}
                                                    maxValue={maxValues.formations}
                                                    color={y === primaryYear ? '#6366F1' : YEAR_PALETTE[i % YEAR_PALETTE.length] + '80'}
                                                    metric="formations"
                                                    index={i}
                                                />
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Card sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: 'none' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', mb: 0.4 }}>
                                            Budget par année
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.73rem', color: '#94A3B8', mb: 2 }}>
                                            Dépenses totales de formation
                                        </Typography>
                                        {ALL_YEARS.map((y, i) => {
                                            const d = allStats[y];
                                            return (
                                                <YearProgressBar
                                                    key={y}
                                                    year={y}
                                                    value={d?.budgetTotal || 0}
                                                    maxValue={maxValues.budget}
                                                    color={y === primaryYear ? '#F59E0B' : YEAR_PALETTE[i % YEAR_PALETTE.length] + '80'}
                                                    metric="budget"
                                                    index={i}
                                                />
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12}>
                                <Card sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: 'none' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', mb: 2.5 }}>
                                            Tableau récapitulatif — {ALL_YEARS.join(', ')}
                                        </Typography>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#64748B', py: 1.5 }}>Indicateur</TableCell>
                                                        {ALL_YEARS.map(y => (
                                                            <TableCell key={y} align="center" sx={{
                                                                fontWeight: 700, fontSize: '0.78rem', py: 1.5,
                                                                color: y === primaryYear ? '#6366F1' : '#64748B',
                                                                bgcolor: y === primaryYear ? '#EEF2FF' : 'transparent',
                                                                borderBottom: y === primaryYear ? '2px solid #6366F1' : undefined,
                                                            }}>
                                                                {y}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {[
                                                        { label: 'Formations', key: 'totalFormations', fmt: v => v },
                                                        { label: 'Participants', key: 'totalParticipants', fmt: v => v },
                                                        { label: 'Budget (DT)', key: 'budgetTotal', fmt: v => v ? Number(v).toLocaleString('fr-FR') : '—' },
                                                        { label: 'Taux présence', key: 'tauxPresence', fmt: v => v != null ? `${v}%` : '—' },
                                                        { label: 'Note moy. /20', key: 'noteMoyenneGlobale', fmt: v => v != null ? Number(v).toFixed(1) : '—' },
                                                    ].map((ind, ri) => (
                                                        <TableRow key={ri} sx={{ '&:hover': { bgcolor: '#FAFBFF' } }}>
                                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.84rem', color: '#0F172A' }}>{ind.label}</TableCell>
                                                            {ALL_YEARS.map(y => {
                                                                const d = allStats[y];
                                                                const raw = d?.[ind.key];
                                                                const prev = allStats[y - 1]?.[ind.key];
                                                                const delta = prev && raw && prev > 0
                                                                    ? Math.round((raw - prev) / prev * 100) : null;
                                                                return (
                                                                    <TableCell key={y} align="center" sx={{
                                                                        fontWeight: y === primaryYear ? 800 : 600,
                                                                        color: y === primaryYear ? '#6366F1' : '#0F172A',
                                                                        bgcolor: y === primaryYear ? '#EEF2FF' : 'transparent',
                                                                        fontSize: '0.84rem',
                                                                    }}>
                                                                        <Box>
                                                                            {d ? ind.fmt(raw) : <Skeleton width={40} sx={{ mx: 'auto' }} />}
                                                                            {delta != null && (
                                                                                <Typography component="span" sx={{
                                                                                    ml: 0.5, fontSize: '0.6rem', fontWeight: 700,
                                                                                    color: delta >= 0 ? '#15803D' : '#DC2626',
                                                                                }}>
                                                                                    {delta >= 0 ? '▲' : '▼'}{Math.abs(delta)}%
                                                                                </Typography>
                                                                            )}
                                                                        </Box>
                                                                    </TableCell>
                                                                );
                                                            })}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
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