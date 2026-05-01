import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
    Box, Drawer, AppBar, Toolbar, List, Typography, Divider,
    IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Avatar, Menu, MenuItem,
} from '@mui/material';
import {
    Dashboard, School, People, Person,
    Assessment, AdminPanelSettings, Business, Category, Work,
    Logout, Storefront,
    Menu as MenuIcon,
    ChevronRight,
} from '@mui/icons-material';

const DRAWER_FULL = 280;
const DRAWER_MINI = 72;

const COLORS = {
    sidebarBg: '#0F0E2E',
    sidebarBgHover: 'rgba(255,255,255,0.06)',
    sidebarActiveBg: 'linear-gradient(90deg, #4C1D95 0%, #7C3AED 100%)',
    sidebarActiveBgSolid: '#4C1D95',
    primary: '#6366F1',
    primaryLight: '#818CF8',
    text: '#A5B4FC',
    textActive: '#FFFFFF',
    textHover: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.5)',
    headerText: '#818CF8',
    pageBg: '#F1F5F9',
    headerBg: '#FFFFFF',
    headerBorder: '#E2E8F0',
    border: 'rgba(255,255,255,0.08)',
};

const SidebarToggleIcon = ({ collapsed }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {collapsed ? (
            <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></>
        ) : (
            <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/></>
        )}
    </svg>
);

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
            case 'ROLE_ADMIN': return { label: 'Admin', color: '#6366F1', bg: '#EEF2FF', dot: '#6366F1' };
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
                { path: '/formations', label: 'Formations', icon: School, show: true },
                { path: '/participants', label: 'Participants', icon: People, show: true },
                { path: '/formateurs', label: 'Formateurs', icon: Person, show: true },
            );
        }
        if (canViewStats()) {
            items.push({ path: '/stats', label: 'Statistiques', icon: Assessment, show: true });
        }
        if (isAdmin()) {
            items.push(
                { type: 'divider' },
                { type: 'header', text: 'Administration' },
                { path: '/admin/users', label: 'Utilisateurs', icon: AdminPanelSettings, show: true },
                { path: '/admin/structures', label: 'Structures', icon: Business, show: true },
                { path: '/admin/domaines', label: 'Domaines', icon: Category, show: true },
                { path: '/admin/profils', label: 'Profils', icon: Work, show: true },
                { path: '/admin/employeurs', label: 'Employeurs', icon: Storefront, show: true },
            );
        }
        return items;
    };

    const menuItems = buildMenu();
    const isProfilePage = location.pathname === '/profile';
    const drawerWidth = isProfilePage ? 0 : (collapsed ? DRAWER_MINI : DRAWER_FULL);

    const isActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path + '/');

    const sidebarContent = (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: COLORS.sidebarBg,
        }}>
            {/* ═════════════════ HEADER — TOUJOURS VISIBLE ═════════════════ */}
            <Box sx={{
                p: collapsed ? 1.5 : 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? 0 : 1.5,
                position: 'relative',
                minHeight: collapsed ? 60 : 70,
            }}>
                {/* Logo */}
                <Box
                    component="img"
                    src="/assets/logo_2.png"
                    alt="Excellent Training"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                    sx={{
                        width: collapsed ? 36 : 42,
                        height: collapsed ? 36 : 42,
                        objectFit: 'contain',
                        flexShrink: 0,
                    }}
                />
                {/* Fallback */}
                <Box
                    sx={{
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: collapsed ? 36 : 42,
                        height: collapsed ? 36 : 42,
                        borderRadius: 2,
                        bgcolor: 'rgba(99,102,241,0.2)',
                        color: '#A5B4FC',
                        fontWeight: 800,
                        fontSize: collapsed ? '0.9rem' : '1.1rem',
                        flexShrink: 0,
                    }}
                >
                    ET
                </Box>

                {/* Texte (visible seulement quand pas collapsed) */}
                {!collapsed && (
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '1.05rem',
                            lineHeight: 1.3,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            Excellent Training
                        </Typography>
                        <Typography sx={{
                            color: COLORS.textMuted,
                            fontSize: '0.75rem',
                            lineHeight: 1.4,
                            whiteSpace: 'nowrap',
                            mt: 0.2,
                        }}>
                            Centre de formation
                        </Typography>
                    </Box>
                )}

                {/* BOUTON TOGGLE — TOUJOURS VISIBLE ET BIEN PLACÉ */}
                <IconButton
                    onClick={() => setCollapsed(!collapsed)}
                    sx={{
                        color: 'rgba(255,255,255,0.4)',
                        '&:hover': {
                            color: '#fff',
                            bgcolor: 'rgba(255,255,255,0.08)'
                        },
                        borderRadius: 1.5,
                        p: 0.8,
                        flexShrink: 0,
                        // Quand collapsed, on le met en haut à droite absolu
                        ...(collapsed && {
                            position: 'absolute',
                            top: 8,
                            right: 8,
                        }),
                    }}
                >
                    <SidebarToggleIcon collapsed={collapsed} />
                </IconButton>
            </Box>

            {/* ═════════════════ ESPACE ENTRE LOGO ET MENU ═════════════════ */}
            <Box sx={{ height: collapsed ? 8 : 12 }} />

            {/* ═════════════════ MENU ═════════════════ */}
            <List sx={{ flex: 1, py: 0.5, px: collapsed ? 1 : 1.5 }}>
                {menuItems.map((item, i) => {
                    if (item.type === 'divider') return (
                        <Divider key={i} sx={{ my: collapsed ? 1 : 1.5, borderColor: COLORS.border, mx: collapsed ? 0.5 : 1 }} />
                    );
                    if (item.type === 'header') return !collapsed ? (
                        <Typography key={i} variant="caption" sx={{
                            px: 2, py: 1, display: 'block',
                            color: COLORS.headerText,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                        }}>
                            {item.text}
                        </Typography>
                    ) : null;

                    const active = isActive(item.path);
                    const Icon = item.icon;

                    return (
                        <ListItem key={i} disablePadding sx={{ mb: 0.3 }}>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                sx={{
                                    borderRadius: 2,
                                    py: collapsed ? 0.7 : 0.8,
                                    px: collapsed ? 1 : 2,
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    bgcolor: active ? COLORS.sidebarActiveBgSolid : 'transparent',
                                    background: active ? COLORS.sidebarActiveBg : 'transparent',
                                    color: active ? COLORS.textActive : COLORS.text,
                                    '&:hover': {
                                        bgcolor: active ? undefined : COLORS.sidebarBgHover,
                                        color: COLORS.textHover,
                                    },
                                    transition: 'all 0.15s',
                                    position: 'relative',
                                }}
                            >
                                {active && (
                                    <Box sx={{
                                        position: 'absolute',
                                        left: 0,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: 3,
                                        height: 18,
                                        bgcolor: '#A855F7',
                                        borderRadius: '0 4px 4px 0',
                                    }} />
                                )}

                                <ListItemIcon sx={{
                                    minWidth: 0,
                                    color: active ? '#fff' : 'inherit',
                                    mr: collapsed ? 0 : 1.2,
                                    justifyContent: 'center',
                                }}>
                                    <Icon fontSize="small" />
                                </ListItemIcon>

                                {!collapsed && (
                                    <>
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{
                                                fontSize: '0.85rem',
                                                fontWeight: active ? 600 : 400,
                                            }}
                                        />
                                        {isAdmin() && item.path?.startsWith('/admin') && (
                                            <ChevronRight sx={{
                                                color: active ? '#fff' : 'rgba(255,255,255,0.3)',
                                                fontSize: 16,
                                            }} />
                                        )}
                                    </>
                                )}

                                {active && collapsed && (
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: 4,
                                        width: 4,
                                        height: 4,
                                        borderRadius: '50%',
                                        bgcolor: COLORS.primaryLight,
                                    }} />
                                )}
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* ═════════════════ FOOTER ═════════════════ */}
            <Box sx={{ p: collapsed ? 1 : 1.5, borderTop: `1px solid ${COLORS.border}` }}>
                {!collapsed ? (
                    <Box>
                        <Typography sx={{
                            color: COLORS.textMuted,
                            fontSize: '0.75rem',
                            textAlign: 'center',
                        }}>
                            © 2026 Excellent Training
                        </Typography>
                        <Typography sx={{
                            color: 'rgba(255,255,255,0.3)',
                            fontSize: '0.7rem',
                            textAlign: 'center',
                        }}>
                            Tous droits réservés
                        </Typography>
                    </Box>
                ) : (
                    <Typography sx={{
                        color: 'rgba(255,255,255,0.3)',
                        fontSize: '0.6rem',
                        textAlign: 'center',
                        display: 'block',
                    }}>
                        © 2026
                    </Typography>
                )}
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: COLORS.pageBg }}>
            <AppBar position="fixed" sx={{
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                ml: { sm: `${drawerWidth}px` },
                bgcolor: COLORS.headerBg,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                borderBottom: `1px solid ${COLORS.headerBorder}`,
                transition: 'width 0.2s, margin 0.2s',
            }}>
                <Toolbar sx={{ minHeight: 56, px: { xs: 1.5, sm: 2.5 } }}>
                    <IconButton
                        onClick={() => setMobileOpen(!mobileOpen)}
                        sx={{
                            display: { sm: 'none' },
                            color: '#475569',
                            mr: 1,
                        }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="subtitle1" sx={{
                        flexGrow: 1,
                        fontWeight: 600,
                        color: '#0F172A',
                        fontSize: '0.95rem',
                    }}>
                        {menuItems.find(m => m.path && isActive(m.path))?.label || 'Tableau de bord'}
                    </Typography>

                    <Box
                        onClick={e => setAnchorEl(e.currentTarget)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            px: 1.5,
                            py: 0.7,
                            borderRadius: 2,
                            bgcolor: '#fff',
                            border: '1px solid #E2E8F0',
                            '&:hover': {
                                bgcolor: '#F8FAFC',
                                border: '1px solid #CBD5E1',
                            },
                            transition: 'all 0.15s',
                        }}
                    >
                        <Avatar
                            src={photo || undefined}
                            sx={{
                                width: 30,
                                height: 30,
                                bgcolor: COLORS.primary,
                                fontSize: '0.8rem',
                                fontWeight: 600,
                            }}
                        >
                            {!photo && (user?.login || 'U').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                            <Typography variant="caption" sx={{
                                display: 'block',
                                fontWeight: 600,
                                color: '#0F172A',
                                lineHeight: 1.2,
                                fontSize: '0.78rem'
                            }}>
                                {user?.login}
                            </Typography>
                            <Typography variant="caption" sx={{
                                color: ri.color,
                                fontSize: '0.65rem',
                                fontWeight: 600
                            }}>
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
                                mt: 1.5,
                                minWidth: 190,
                                borderRadius: 2.5,
                                border: '1px solid #E2E8F0',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                overflow: 'hidden',
                            },
                        }}
                    >
                        <Box sx={{
                            px: 2,
                            py: 1.5,
                            borderBottom: '1px solid #F1F5F9',
                        }}>
                            <Typography variant="body2" sx={{
                                fontWeight: 600,
                                color: '#0F172A'
                            }}>
                                {user?.login}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                                {user?.email}
                            </Typography>
                        </Box>
                        <MenuItem
                            onClick={() => { setAnchorEl(null); navigate('/profile'); }}
                            sx={{
                                gap: 1.5,
                                fontSize: '0.85rem',
                                color: '#0F172A',
                                py: 1.2,
                                mx: 0.5,
                                mt: 0.5,
                                borderRadius: 1.5,
                            }}
                        >
                            Mon Profil
                        </MenuItem>
                        <Divider sx={{ my: 0.5 }} />
                        <MenuItem
                            onClick={handleLogout}
                            sx={{
                                gap: 1.5,
                                fontSize: '0.85rem',
                                color: '#EF4444',
                                py: 1.2,
                                mx: 0.5,
                                mb: 0.5,
                                borderRadius: 1.5,
                            }}
                        >
                            <Logout fontSize="small" /> Déconnexion
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {!isProfilePage && (
                <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            width: DRAWER_FULL,
                            border: 'none',
                            bgcolor: COLORS.sidebarBg,
                        },
                    }}
                >
                    {sidebarContent}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            border: 'none',
                            boxShadow: 'none',
                            overflowX: 'hidden',
                            transition: 'width 0.2s',
                            bgcolor: COLORS.sidebarBg,
                        },
                    }}
                    open
                >
                    {sidebarContent}
                </Drawer>
            </Box>
            )}

            <Box component="main" sx={{
                flexGrow: 1,
                p: { xs: 2, sm: 3 },
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                mt: '56px',
                transition: 'width 0.2s',
            }}>
                <Outlet />
            </Box>
        </Box>
    );
}