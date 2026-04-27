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

const GraduationCapLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5"/>
  </svg>
);

const SidebarToggleIcon = ({ collapsed }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {collapsed ? (
      <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
    ) : (
      <><line x1="3" y1="12" x2="21" y2="12"/></>
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
  const drawerWidth = collapsed ? DRAWER_MINI : DRAWER_FULL;

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0F172A' }}>
      <Box sx={{
        p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box sx={{ color: '#6366F1' }}><GraduationCapLogo size={22} /></Box>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2, fontSize: '0.85rem' }}>
                Excellent Training
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem' }}>
                Gestion de Formation
              </Typography>
            </Box>
          </Box>
        )}
        {collapsed && (
          <Box sx={{ color: '#6366F1', mx: 'auto' }}><GraduationCapLogo size={22} /></Box>
        )}
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          sx={{
            color: 'rgba(255,255,255,0.4)',
            '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
            borderRadius: 1.5, p: 0.8,
          }}
        >
          <SidebarToggleIcon collapsed={collapsed} />
        </IconButton>
      </Box>

      <List sx={{ flex: 1, py: 1.5, px: 1 }}>
        {menuItems.map((item, i) => {
          if (item.type === 'divider') return (
            <Divider key={i} sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />
          );
          if (item.type === 'header') return !collapsed ? (
            <Typography key={i} variant="caption" sx={{
              px: 1.5, py: 0.8, display: 'block', color: 'rgba(255,255,255,0.25)',
              fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {item.text}
            </Typography>
          ) : null;

          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <ListItem key={i} disablePadding sx={{ mb: 0.4 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2, py: 0.9, px: collapsed ? 1 : 1.5,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  position: 'relative', overflow: 'hidden',
                  bgcolor: active ? 'rgba(99,102,241,0.18)' : 'transparent',
                  color: active ? '#A5B4FC' : 'rgba(255,255,255,0.45)',
                  '&:hover': {
                    bgcolor: active ? 'rgba(99,102,241,0.22)' : 'rgba(255,255,255,0.05)',
                    color: active ? '#A5B4FC' : 'rgba(255,255,255,0.8)',
                  },
                  transition: 'all 0.15s',
                }}
              >
                {active && (
                  <Box sx={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: 20, bgcolor: '#6366F1', borderRadius: '0 4px 4px 0',
                  }} />
                )}
                <ListItemIcon sx={{
                  minWidth: collapsed ? 0 : 36, color: 'inherit', mr: collapsed ? 0 : 1.2,
                  justifyContent: 'center',
                }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                {!collapsed && (
                  <>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: active ? 600 : 500 }}
                    />
                    {active && (
                      <KeyboardArrowRight fontSize="small" sx={{ color: '#6366F1', ml: 'auto' }} />
                    )}
                  </>
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {!collapsed && (
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', display: 'block', textAlign: 'center', fontSize: '0.65rem' }}>
            © 2026 Excellent Training
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <AppBar position="fixed" sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` },
        bgcolor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderBottom: '1px solid #E2E8F0',
      }}>
        <Toolbar sx={{ minHeight: 56, px: { xs: 1.5, sm: 2.5 } }}>
          <IconButton onClick={() => setMobileOpen(!mobileOpen)} sx={{ display: { sm: 'none' }, color: '#475569', mr: 1 }}>
            <MenuIcon />
          </IconButton>

          <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 600, color: '#0F172A', fontSize: '0.95rem' }}>
            {menuItems.find(m => m.path && isActive(m.path))?.label || 'Tableau de bord'}
          </Typography>

          <Box
            onClick={e => setAnchorEl(e.currentTarget)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              cursor: 'pointer', px: 1.5, py: 0.7, borderRadius: 2,
              bgcolor: '#fff', border: '1px solid #E8EAF0',
              '&:hover': { bgcolor: '#EEF2FF', border: '1px solid #C7D2FE' },
              transition: 'all 0.15s',
            }}
          >
            <Avatar sx={{ width: 30, height: 30, bgcolor: '#6366F1', fontSize: '0.8rem', fontWeight: 600 }}>
              {photo ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                (!photo && (user?.login || 'U')).charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: '#0F172A', lineHeight: 1.2, fontSize: '0.78rem' }}>
                {user?.login}
              </Typography>
              <Typography variant="caption" sx={{ color: ri.color, fontSize: '0.65rem', fontWeight: 600 }}>
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
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{user?.login}</Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>{user?.email}</Typography>
            </Box>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }} sx={{ gap: 1.5, fontSize: '0.85rem', color: '#0F172A', py: 1.2, mx: 0.5, mt: 0.5, borderRadius: 1.5 }}>
              Mon Profil
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={handleLogout} sx={{ gap: 1.5, fontSize: '0.85rem', color: '#EF4444', py: 1.2, mx: 0.5, mb: 0.5, borderRadius: 1.5 }}>
              <Logout fontSize="small" /> Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
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
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth, border: 'none', boxShadow: 'none', overflowX: 'hidden', transition: 'width 0.2s' },
          }}
          open
        >
          {sidebarContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{
        flexGrow: 1, p: { xs: 2, sm: 3 }, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: '56px',
      }}>
        <Outlet />
      </Box>
    </Box>
  );
}
