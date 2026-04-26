import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
    Box, Drawer, AppBar, Toolbar, List, Typography, Divider,
    IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Avatar, Menu, MenuItem, Tooltip,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard, School, People, Person,
    Assessment, AdminPanelSettings, Business, Category, Work,
    Logout, Notifications, ChevronLeft, ChevronRight, Storefront,
    AccountCircle, ManageAccounts,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const DRAWER_FULL = 268;
const DRAWER_MINI = 72;

export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const { user, logout, canManageFormations, canViewStats, isAdmin } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => { logout(); navigate('/login'); };

    const roleInfo = (role) => {
        switch (role) {
            case 'ROLE_ADMIN': return { label: 'Administrateur', color: '#EF4444', bg: '#FEF2F2' };
            case 'ROLE_RESPONSABLE': return { label: 'Responsable', color: '#F59E0B', bg: '#FFFBEB' };
            default: return { label: 'Utilisateur', color: '#10B981', bg: '#ECFDF5' };
        }
    };
    const ri = roleInfo(user?.role);

    const buildMenu = () => {
        const items = [
            { path: '/dashboard', label: 'Tableau de Bord', icon: Dashboard, show: true },
        ];

        if (canManageFormations()) {
            items.push(
                { path: '/formations', label: 'Formations', icon: School, show: true },
                { path: '/participants', label: 'Participants', icon: People, show: true },
                { path: '/formateurs', label: 'Formateurs', icon: Person, show: true }
            );
        }

        if (canViewStats()) {
            items.push({ path: '/stats', label: 'Statistiques & Rapports', icon: Assessment, show: true });
        }

        if (isAdmin()) {
            items.push(
                { type: 'divider' },
                { type: 'header', text: 'Administration' },
                { path: '/admin/users', label: 'Utilisateurs', icon: AdminPanelSettings, show: true },
                { path: '/admin/structures', label: 'Structures', icon: Business, show: true },
                { path: '/admin/domaines', label: 'Domaines', icon: Category, show: true },
                { path: '/admin/profils', label: 'Profils', icon: Work, show: true },
                { path: '/admin/employeurs', label: 'Employeurs', icon: Storefront, show: true }
            );
        }

        // Profile link — always visible
        items.push(
            { type: 'divider' },
            { path: '/profile', label: 'Mon Profil', icon: ManageAccounts, show: true }
        );

        return items;
    };

    const menuItems = buildMenu();
    const drawerWidth = collapsed ? DRAWER_MINI : DRAWER_FULL;

    const sidebarContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Logo */}
            <Box sx={{
                p: collapsed ? 1.5 : 2.5,
                display: 'flex', alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between',
                borderBottom: '1px solid #F1F5F9', minHeight: 68,
            }}>
                {!collapsed && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 38, height: 38, borderRadius: '10px',
                            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0,
                        }}>ET</Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#1E293B', lineHeight: 1.2 }}>
                                Excellent Training
                            </Typography>
                            <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                                Gestion de Formation
                            </Typography>
                        </Box>
                    </Box>
                )}
                {collapsed && (
                    <Box sx={{
                        width: 38, height: 38, borderRadius: '10px',
                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 800, fontSize: 14,
                    }}>ET</Box>
                )}
                {!collapsed && (
                    <IconButton size="small" onClick={() => setCollapsed(true)} sx={{ color: '#94A3B8' }}>
                        <ChevronLeft fontSize="small" />
                    </IconButton>
                )}
            </Box>

            {/* Profil utilisateur */}
            {!collapsed && (
                <Box
                    onClick={() => navigate('/profile')}
                    sx={{
                        px: 2, py: 1.5, mx: 1.5, mt: 1.5, mb: 0.5,
                        bgcolor: '#F8FAFC', borderRadius: 2, cursor: 'pointer',
                        transition: 'all 0.15s',
                        '&:hover': { bgcolor: '#EEF2FF', borderColor: '#C7D2FE' },
                        border: '1px solid transparent',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: ri.color, fontSize: '0.8rem', fontWeight: 700 }}>
                            {user?.login?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ overflow: 'hidden', flex: 1 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.login}
                            </Typography>
                            <Box sx={{
                                display: 'inline-block', px: 1, py: 0.2, borderRadius: 1,
                                bgcolor: ri.bg, color: ri.color, fontSize: '0.62rem', fontWeight: 700, mt: 0.3,
                            }}>
                                {ri.label}
                            </Box>
                        </Box>
                        <ManageAccounts sx={{ fontSize: 16, color: '#94A3B8', flexShrink: 0 }} />
                    </Box>
                </Box>
            )}

            {/* Navigation */}
            <List sx={{ px: 1.5, py: 1, flex: 1, overflow: 'auto' }}>
                {menuItems.map((item, i) => {
                    if (item.type === 'divider') return <Divider key={i} sx={{ my: 1, borderColor: '#F1F5F9' }} />;
                    if (item.type === 'header') {
                        return !collapsed ? (
                            <Typography key={i} sx={{
                                px: 1.5, py: 0.5, color: '#94A3B8', fontSize: '0.65rem',
                                fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                            }}>{item.text}</Typography>
                        ) : null;
                    }
                    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                    const Icon = item.icon;
                    return (
                        <Tooltip key={item.path} title={collapsed ? item.label : ''} placement="right" arrow>
                            <ListItem disablePadding sx={{ mb: 0.3 }}>
                                <ListItemButton
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        borderRadius: '10px', py: 1, px: collapsed ? 1 : 1.5,
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        bgcolor: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                                        color: isActive ? '#6366F1' : '#64748B',
                                        '&:hover': {
                                            bgcolor: isActive ? 'rgba(99,102,241,0.15)' : '#F8FAFC',
                                            color: isActive ? '#6366F1' : '#1E293B',
                                        },
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <ListItemIcon sx={{ color: 'inherit', minWidth: collapsed ? 0 : 34, mr: collapsed ? 0 : 1 }}>
                                        <Icon sx={{ fontSize: 19 }} />
                                    </ListItemIcon>
                                    {!collapsed && (
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{ fontSize: '0.855rem', fontWeight: isActive ? 600 : 500 }}
                                        />
                                    )}
                                    {isActive && !collapsed && (
                                        <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#6366F1', ml: 'auto', flexShrink: 0 }} />
                                    )}
                                </ListItemButton>
                            </ListItem>
                        </Tooltip>
                    );
                })}
            </List>

            {/* Footer */}
            <Box sx={{ p: 1.5, borderTop: '1px solid #F1F5F9' }}>
                {collapsed && (
                    <ListItemButton
                        onClick={() => setCollapsed(false)}
                        sx={{ borderRadius: '10px', justifyContent: 'center', mb: 0.5, color: '#94A3B8', '&:hover': { bgcolor: '#F8FAFC' } }}
                    >
                        <ChevronRight fontSize="small" />
                    </ListItemButton>
                )}
                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        borderRadius: '10px', color: '#EF4444',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        '&:hover': { bgcolor: '#FEF2F2' },
                    }}
                >
                    <ListItemIcon sx={{ color: '#EF4444', minWidth: collapsed ? 0 : 34, mr: collapsed ? 0 : 1 }}>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    {!collapsed && (
                        <ListItemText primary="Déconnexion" primaryTypographyProps={{ fontSize: '0.855rem', fontWeight: 500 }} />
                    )}
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
            {/* AppBar */}
            <AppBar position="fixed" elevation={0} sx={{
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                ml: { sm: `${drawerWidth}px` },
                bgcolor: '#FFFFFF', borderBottom: '1px solid #F1F5F9',
                transition: 'width 0.25s ease, margin 0.25s ease',
            }}>
                <Toolbar sx={{ justifyContent: 'space-between', minHeight: '60px !important' }}>
                    <IconButton onClick={() => setMobileOpen(!mobileOpen)}
                                sx={{ mr: 2, display: { sm: 'none' }, color: '#64748B' }}>
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ flex: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton sx={{ color: '#64748B' }}>
                            <Notifications sx={{ fontSize: 20 }} />
                        </IconButton>
                        <Box
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer',
                                px: 1.5, py: 0.75, borderRadius: '10px',
                                '&:hover': { bgcolor: '#F8FAFC' }, transition: 'background 0.15s',
                            }}
                        >
                            <Avatar sx={{ width: 30, height: 30, bgcolor: ri.color, fontSize: '0.78rem', fontWeight: 700 }}>
                                {user?.login?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#1E293B', lineHeight: 1.2 }}>
                                    {user?.login}
                                </Typography>
                                <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8' }}>{ri.label}</Typography>
                            </Box>
                        </Box>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                              PaperProps={{ sx: { mt: 1.5, minWidth: 180, borderRadius: 2, border: '1px solid #F1F5F9' } }}>
                            <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}
                                      sx={{ gap: 1.5, borderRadius: 1, mx: 0.5, color: '#1E293B' }}>
                                <ManageAccounts fontSize="small" sx={{ color: '#6366F1' }} /> Mon Profil
                            </MenuItem>
                            <Divider sx={{ my: 0.5 }} />
                            <MenuItem onClick={handleLogout} sx={{ color: '#EF4444', gap: 1.5, borderRadius: 1, mx: 0.5 }}>
                                <Logout fontSize="small" /> Déconnexion
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 }, transition: 'width 0.25s ease' }}>
                <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
                        ModalProps={{ keepMounted: true }}
                        sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_FULL, border: 'none' } }}>
                    {sidebarContent}
                </Drawer>
                <Drawer variant="permanent" open
                        sx={{
                            display: { xs: 'none', sm: 'block' },
                            '& .MuiDrawer-paper': {
                                width: drawerWidth, border: 'none',
                                boxShadow: '1px 0 20px rgba(0,0,0,0.04)',
                                transition: 'width 0.25s ease', overflowX: 'hidden',
                            },
                        }}>
                    {sidebarContent}
                </Drawer>
            </Box>

            {/* Main */}
            <Box component="main" sx={{
                flexGrow: 1, mt: '60px',
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                transition: 'width 0.25s ease',
                minHeight: 'calc(100vh - 60px)',
            }}>
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    style={{ height: '100%' }}
                >
                    <Outlet />
                </motion.div>
            </Box>
        </Box>
    );
}