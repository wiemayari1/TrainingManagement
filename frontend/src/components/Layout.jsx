import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
    Box, Drawer, AppBar, Toolbar, List, Typography, Divider,
    IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Avatar, Menu, MenuItem, Tooltip,
} from '@mui/material';
import {
    Dashboard, School, People, Person,
    Assessment, AdminPanelSettings, Business, Category, Work,
    Logout, Storefront,
    Menu as MenuIcon,
    KeyboardArrowRight,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const DRAWER_FULL = 260;
const DRAWER_MINI = 68;

// ── Logo SVG (toque de diplôme) ─────────────────────────────────
const GraduationCapLogo = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
);

// ── Icône toggle sidebar (comme Grok) ─────────────────────────────
const SidebarToggleIcon = ({ collapsed }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {collapsed ? (
            // Mode collapsed → icône pour agrandir (deux barres séparées)
            <>
                <rect x="3" y="3" width="7" height="18" rx="1" />
                <rect x="14" y="3" width="7" height="18" rx="1" />
            </>
        ) : (
            // Mode expanded → icône pour réduire (une seule barre)
            <>
                <rect x="3" y="3" width="18" height="18" rx="1" />
                <line x1="9" y1="3" x2="9" y2="21" />
            </>
        )}
    </svg>
);

// Helper: lit la photo depuis localStorage
const getStoredPhoto = (userId) => {
    try { return localStorage.getItem('profilePhoto_' + userId) || null; } catch { return null; }
};

export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const { user, logout, canManageFormations, canViewStats, isAdmin } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const photo = getStoredPhoto(user?.id);

    const handleLogout = () => { logout(); navigate('/login'); };

    const roleInfo = (role) => {
        switch (role) {
            case 'ROLE_ADMIN': return { label: 'Admin', color: '#EF4444', bg: '#FEF2F2', dot: '#EF4444' };
            case 'ROLE_RESPONSABLE': return { label: 'Responsable', color: '#F59E0B', bg: '#FFFBEB', dot: '#F59E0B' };
            default: return { label: 'Utilisateur', color: '#10B981', bg: '#ECFDF5', dot: '#10B981' };
        }
    };
    const ri = roleInfo(user?.role);

    const buildMenu = () => {
        const items = [
            { path: '/dashboard', label: 'Tableau de bord', icon: Dashboard, show: true },
        ];
        if (canManageFormations()) {
            items.push(
                { path: '/formations',  label: 'Formations',   icon: School,  show: true },
                { path: '/participants', label: 'Participants', icon: People,  show: true },
                { path: '/formateurs',  label: 'Formateurs',   icon: Person,  show: true },
            );
        }
        if (canViewStats()) {
            items.push({ path: '/stats', label: 'Statistiques', icon: Assessment, show: true });
        }
        if (isAdmin()) {
            items.push(
                { type: 'divider' },
                { type: 'header', text: 'Administration' },
                { path: '/admin/users',      label: 'Utilisateurs', icon: AdminPanelSettings, show: true },
                { path: '/admin/structures', label: 'Structures',   icon: Business,           show: true },
                { path: '/admin/domaines',   label: 'Domaines',     icon: Category,           show: true },
                { path: '/admin/profils',    label: 'Profils',      icon: Work,               show: true },
                { path: '/admin/employeurs', label: 'Employeurs',   icon: Storefront,         show: true },
            );
        }
        return items;
    };

    const menuItems = buildMenu();
    const drawerWidth = collapsed ? DRAWER_MINI : DRAWER_FULL;

    const isActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path + '/');

    const sidebarContent = (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: '#1A1A2E',
            color: '#fff',
        }}>
            {/* ── LOGO + TOGGLE ── */}
            <Box sx={{
                px: collapsed ? 1.5 : 2.5,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                minHeight: 64,
            }}>
                {!collapsed && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '10px',
                            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                        }}>
                            <GraduationCapLogo size={20} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#F1F5F9', lineHeight: 1.2 }}>
                                Excellent Training
                            </Typography>
                            <Typography sx={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)' }}>
                                Gestion de Formation
                            </Typography>
                        </Box>
                    </Box>
                )}
                {collapsed && (
                    <Box sx={{
                        width: 36, height: 36, borderRadius: '10px',
                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                    }}>
                        <GraduationCapLogo size={20} />
                    </Box>
                )}
                {/* ── Icône toggle unique en haut ── */}
                <Tooltip title={collapsed ? 'Agrandir' : 'Réduire'} placement="right" arrow>
                    <IconButton
                        size="small"
                        onClick={() => setCollapsed(!collapsed)}
                        sx={{
                            color: 'rgba(255,255,255,0.4)',
                            '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
                            borderRadius: 1.5,
                            p: 0.8,
                        }}
                    >
                        <SidebarToggleIcon collapsed={collapsed} />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* ── NAV ── */}
            <List sx={{ px: 1.5, py: 1.5, flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 0 } }}>
                {menuItems.map((item, i) => {
                    if (item.type === 'divider') return (
                        <Divider key={i} sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.07)' }} />
                    );
                    if (item.type === 'header') return !collapsed ? (
                        <Typography key={i} sx={{
                            px: 1.5, pt: 0.5, pb: 1,
                            color: 'rgba(255,255,255,0.25)',
                            fontSize: '0.6rem', fontWeight: 700,
                            letterSpacing: '0.12em', textTransform: 'uppercase',
                        }}>
                            {item.text}
                        </Typography>
                    ) : null;

                    const active = isActive(item.path);
                    const Icon = item.icon;

                    return (
                        <Tooltip key={item.path} title={collapsed ? item.label : ''} placement="right" arrow>
                            <ListItem disablePadding sx={{ mb: 0.4 }}>
                                <ListItemButton
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        borderRadius: 2,
                                        py: 0.9,
                                        px: collapsed ? 1 : 1.5,
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        bgcolor: active ? 'rgba(99,102,241,0.18)' : 'transparent',
                                        color: active ? '#A5B4FC' : 'rgba(255,255,255,0.45)',
                                        '&:hover': {
                                            bgcolor: active ? 'rgba(99,102,241,0.22)' : 'rgba(255,255,255,0.05)',
                                            color: active ? '#A5B4FC' : 'rgba(255,255,255,0.8)',
                                        },
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {/* Active indicator */}
                                    {active && (
                                        <Box sx={{
                                            position: 'absolute', left: 0, top: '20%', bottom: '20%',
                                            width: 3, borderRadius: '0 2px 2px 0',
                                            bgcolor: '#6366F1',
                                        }} />
                                    )}
                                    <ListItemIcon sx={{
                                        color: 'inherit',
                                        minWidth: collapsed ? 0 : 32,
                                        mr: collapsed ? 0 : 0.8,
                                    }}>
                                        <Icon sx={{ fontSize: 18 }} />
                                    </ListItemIcon>
                                    {!collapsed && (
                                        <>
                                            <ListItemText
                                                primary={item.label}
                                                primaryTypographyProps={{
                                                    fontSize: '0.84rem',
                                                    fontWeight: active ? 600 : 400,
                                                    color: 'inherit',
                                                    letterSpacing: active ? '-0.01em' : 0,
                                                }}
                                            />
                                            {active && (
                                                <KeyboardArrowRight sx={{ fontSize: 14, opacity: 0.6, flexShrink: 0 }} />
                                            )}
                                        </>
                                    )}
                                </ListItemButton>
                            </ListItem>
                        </Tooltip>
                    );
                })}
            </List>

            {/* ── FOOTER ── */}
            <Box sx={{
                px: 1.5, py: 1.5,
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', flexDirection: 'column', gap: 0.5,
            }}>
                <Tooltip title={collapsed ? 'Déconnexion' : ''} placement="right" arrow>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            borderRadius: 2, py: 0.9,
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            color: 'rgba(239,68,68,0.6)',
                            '&:hover': { bgcolor: 'rgba(239,68,68,0.1)', color: '#EF4444' },
                            transition: 'all 0.15s',
                        }}
                    >
                        <ListItemIcon sx={{ color: 'inherit', minWidth: collapsed ? 0 : 32, mr: collapsed ? 0 : 0.8 }}>
                            <Logout sx={{ fontSize: 17 }} />
                        </ListItemIcon>
                        {!collapsed && (
                            <ListItemText
                                primary="Déconnexion"
                                primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: 500, color: 'inherit' }}
                            />
                        )}
                    </ListItemButton>
                </Tooltip>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F0F2F8' }}>
            {/* ── APPBAR ── */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: 'rgba(240,242,248,0.85)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    transition: 'width 0.25s ease, margin 0.25s ease',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', minHeight: '60px !important', px: { xs: 2, sm: 3 } }}>
                    <IconButton
                        onClick={() => setMobileOpen(!mobileOpen)}
                        sx={{ display: { sm: 'none' }, color: '#475569' }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Page title */}
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
                            {menuItems.find(m => m.path && isActive(m.path))?.label || 'Tableau de bord'}
                        </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }} />

                    {/* Right actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 1,
                                cursor: 'pointer',
                                px: 1.5, py: 0.7,
                                borderRadius: 2,
                                bgcolor: '#fff',
                                border: '1px solid #E8EAF0',
                                '&:hover': { bgcolor: '#EEF2FF', border: '1px solid #C7D2FE' },
                                transition: 'all 0.15s',
                            }}
                        >
                            <Avatar
                                src={photo}
                                sx={{
                                    width: 26, height: 26,
                                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                    fontSize: '0.7rem', fontWeight: 700,
                                }}
                            >
                                {!photo && (user?.login || 'U').charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>
                                    {user?.login}
                                </Typography>
                                <Typography sx={{ fontSize: '0.62rem', color: '#94A3B8', lineHeight: 1 }}>
                                    {ri.label}
                                </Typography>
                            </Box>
                        </Box>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => setAnchorEl(null)}
                            PaperProps={{
                                sx: {
                                    mt: 1.5, minWidth: 190, borderRadius: 2.5,
                                    border: '1px solid #E8EAF0',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                    overflow: 'hidden',
                                },
                            }}
                        >
                            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>{user?.login}</Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>{user?.email}</Typography>
                            </Box>
                            <MenuItem
                                onClick={() => { setAnchorEl(null); navigate('/profile'); }}
                                sx={{ gap: 1.5, fontSize: '0.85rem', color: '#0F172A', py: 1.2, mx: 0.5, mt: 0.5, borderRadius: 1.5 }}
                            >
                                Mon Profil
                            </MenuItem>
                            <Divider sx={{ my: 0.5 }} />
                            <MenuItem
                                onClick={handleLogout}
                                sx={{ gap: 1.5, fontSize: '0.85rem', color: '#EF4444', py: 1.2, mx: 0.5, mb: 0.5, borderRadius: 1.5 }}
                            >
                                <Logout fontSize="small" /> Déconnexion
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* ── SIDEBAR ── */}
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 }, transition: 'width 0.25s ease' }}
            >
                {/* Mobile */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { width: DRAWER_FULL, border: 'none' },
                    }}
                >
                    {sidebarContent}
                </Drawer>

                {/* Desktop */}
                <Drawer
                    variant="permanent"
                    open
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            border: 'none',
                            boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
                            transition: 'width 0.25s ease',
                            overflowX: 'hidden',
                        },
                    }}
                >
                    {sidebarContent}
                </Drawer>
            </Box>

            {/* ── MAIN ── */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    mt: '60px',
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    transition: 'width 0.25s ease',
                    minHeight: 'calc(100vh - 60px)',
                }}
            >
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    style={{ height: '100%' }}
                >
                    <Outlet />
                </motion.div>
            </Box>
        </Box>
    );
}