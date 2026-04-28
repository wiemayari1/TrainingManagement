import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import { AdminPanelSettings, Business, Category, Work, Storefront } from '@mui/icons-material';

const tabs = [
  { path: '/admin/users',      label: 'Utilisateurs', icon: AdminPanelSettings },
  { path: '/admin/structures', label: 'Structures',   icon: Business },
  { path: '/admin/domaines',   label: 'Domaines',     icon: Category },
  { path: '/admin/profils',    label: 'Profils',      icon: Work },
  { path: '/admin/employeurs', label: 'Employeurs',   icon: Storefront },
];

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = Math.max(0, tabs.findIndex(t => location.pathname.startsWith(t.path)));

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
          Administration
        </Typography>
        <Typography sx={{ color: '#64748B', fontSize: '0.875rem' }}>
          Gestion des données de référence du système
        </Typography>
      </Box>

      <Tabs
        value={currentTab}
        onChange={(_, v) => navigate(tabs[v].path)}
        sx={{ mb: 3, borderBottom: '1px solid #E2E8F0',
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', minHeight: 44 },
          '& .Mui-selected': { color: '#6366F1' },
          '& .MuiTabs-indicator': { bgcolor: '#6366F1', height: 3, borderRadius: '3px 3px 0 0' },
        }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.path} icon={<tab.icon sx={{ fontSize: 18 }} />} label={tab.label} iconPosition="start"
            sx={{ gap: 0.5 }} />
        ))}
      </Tabs>

      <Outlet />
    </Box>
  );
}
