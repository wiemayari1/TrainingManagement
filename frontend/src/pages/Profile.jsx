import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField,
  Avatar, Chip, Divider, Alert, Snackbar, InputAdornment, IconButton,
  Tab, Tabs,
} from '@mui/material';
import {
  Person, Lock, Edit, Save, Cancel, Visibility, VisibilityOff,
  AdminPanelSettings, Badge, Email, CheckCircle,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const API_BASE = 'http://localhost:8081/api';

const roleConfig = {
  ROLE_ADMIN:       { label: 'Administrateur', color: '#EF4444', bg: '#FEF2F2', icon: AdminPanelSettings },
  ROLE_RESPONSABLE: { label: 'Responsable',    color: '#F59E0B', bg: '#FFFBEB', icon: Badge },
  ROLE_USER:        { label: 'Utilisateur',    color: '#10B981', bg: '#ECFDF5', icon: Person },
};

export default function Profile() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState(0);

  // Password change state
  const [pwdForm, setPwdForm]     = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [showOld, setShowOld]     = useState(false);
  const [showNew, setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdLoading, setPwdLoading]   = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const rc = roleConfig[user?.role] || roleConfig.ROLE_USER;
  const RoleIcon = rc.icon;

  // Password strength
  const getStrength = (p) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength = getStrength(pwdForm.newPassword);
  const strengthLabel = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];
  const strengthColor = ['', '#EF4444', '#F59E0B', '#10B981', '#10B981'];

  const handleChangePassword = async () => {
    if (!pwdForm.oldPassword) return setSnack({ open: true, msg: 'L\'ancien mot de passe est requis', severity: 'error' });
    if (pwdForm.newPassword.length < 6) return setSnack({ open: true, msg: 'Le nouveau mot de passe doit contenir au moins 6 caractères', severity: 'error' });
    if (pwdForm.newPassword !== pwdForm.confirm) return setSnack({ open: true, msg: 'Les mots de passe ne correspondent pas', severity: 'error' });

    setPwdLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSnack({ open: true, msg: 'Mot de passe changé avec succès !', severity: 'success' });
        setPwdForm({ oldPassword: '', newPassword: '', confirm: '' });
      } else {
        setSnack({ open: true, msg: data.message || 'Erreur', severity: 'error' });
      }
    } catch {
      setSnack({ open: true, msg: 'Erreur de connexion', severity: 'error' });
    }
    setPwdLoading(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
            Mon Profil
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.875rem' }}>
            Consultez vos informations et gérez votre mot de passe
          </Typography>
        </Box>
      </motion.div>

      {/* ── Profile card ───────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}>
        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none', mb: 3, overflow: 'hidden' }}>
          {/* Banner */}
          <Box sx={{
            height: 90,
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            position: 'relative',
          }} />
          <CardContent sx={{ pt: 0, pb: '24px !important', px: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2.5, mt: -5, mb: 2.5, flexWrap: 'wrap' }}>
              {/* Avatar */}
              <Avatar sx={{
                width: 80, height: 80,
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                fontSize: '2rem', fontWeight: 800,
                border: '4px solid #fff',
                boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                flexShrink: 0,
              }}>
                {(user?.login || user?.username || 'U').charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ pb: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A' }}>
                  {user?.login || user?.username}
                </Typography>
                <Chip
                  icon={<RoleIcon sx={{ fontSize: '14px !important' }} />}
                  label={rc.label}
                  size="small"
                  sx={{ bgcolor: rc.bg, color: rc.color, fontWeight: 700, fontSize: '0.72rem', mt: 0.5 }}
                />
              </Box>
            </Box>

            <Divider sx={{ mb: 2.5, borderColor: '#F1F5F9' }} />

            {/* Info grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <InfoRow icon={<Person sx={{ fontSize: 17, color: '#6366F1' }} />} label="Nom d'utilisateur" value={user?.login || user?.username} />
              <InfoRow icon={<Email sx={{ fontSize: 17, color: '#6366F1' }} />} label="Email" value={user?.email || 'Non renseigné'} />
              <InfoRow icon={<RoleIcon sx={{ fontSize: 17, color: rc.color }} />} label="Rôle" value={rc.label} valueColor={rc.color} />
              <InfoRow icon={<CheckCircle sx={{ fontSize: 17, color: '#10B981' }} />} label="Statut" value="Compte actif" valueColor="#10B981" />
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}>
        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              borderBottom: '1px solid #F1F5F9', px: 2,
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', minHeight: 48 },
              '& .Mui-selected': { color: '#6366F1' },
              '& .MuiTabs-indicator': { bgcolor: '#6366F1', height: 3, borderRadius: '3px 3px 0 0' },
            }}
          >
            <Tab icon={<Lock sx={{ fontSize: 17 }} />} label="Changer le mot de passe" iconPosition="start" />
          </Tabs>

          <CardContent sx={{ p: 3 }}>
            {/* Password change form */}
            <Box sx={{ maxWidth: 460 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', mb: 0.5 }}>
                Modifier votre mot de passe
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#64748B', mb: 3 }}>
                Choisissez un mot de passe fort d'au moins 6 caractères.
              </Typography>

              {/* Old password */}
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                  Mot de passe actuel *
                </Typography>
                <TextField
                  fullWidth
                  type={showOld ? 'text' : 'password'}
                  value={pwdForm.oldPassword}
                  onChange={e => setPwdForm({ ...pwdForm, oldPassword: e.target.value })}
                  placeholder="Votre mot de passe actuel"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowOld(!showOld)} sx={{ color: '#94A3B8' }}>
                          {showOld ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2, bgcolor: '#F8FAFC' },
                  }}
                />
              </Box>

              {/* New password */}
              <Box sx={{ mb: 1.5 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                  Nouveau mot de passe *
                </Typography>
                <TextField
                  fullWidth
                  type={showNew ? 'text' : 'password'}
                  value={pwdForm.newPassword}
                  onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                  placeholder="Nouveau mot de passe"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowNew(!showNew)} sx={{ color: '#94A3B8' }}>
                          {showNew ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2, bgcolor: '#F8FAFC' },
                  }}
                />
              </Box>

              {/* Strength indicator */}
              {pwdForm.newPassword && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                    {[0, 1, 2, 3].map(i => (
                      <Box key={i} sx={{
                        flex: 1, height: 4, borderRadius: 2,
                        bgcolor: i < strength ? strengthColor[strength] : '#E2E8F0',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </Box>
                  <Typography sx={{ fontSize: '0.72rem', color: strengthColor[strength], fontWeight: 600 }}>
                    Force : {strengthLabel[strength] || 'Trop court'}
                  </Typography>
                </Box>
              )}

              {/* Confirm password */}
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', mb: 0.8 }}>
                  Confirmer le nouveau mot de passe *
                </Typography>
                <TextField
                  fullWidth
                  type={showConfirm ? 'text' : 'password'}
                  value={pwdForm.confirm}
                  onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                  placeholder="Répétez le nouveau mot de passe"
                  size="small"
                  error={pwdForm.confirm.length > 0 && pwdForm.newPassword !== pwdForm.confirm}
                  helperText={
                    pwdForm.confirm.length > 0
                      ? pwdForm.newPassword === pwdForm.confirm
                        ? '✓ Les mots de passe correspondent'
                        : 'Les mots de passe ne correspondent pas'
                      : ''
                  }
                  FormHelperTextProps={{
                    sx: { color: pwdForm.newPassword === pwdForm.confirm && pwdForm.confirm.length > 0 ? '#10B981' : undefined }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowConfirm(!showConfirm)} sx={{ color: '#94A3B8' }}>
                          {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2, bgcolor: '#F8FAFC' },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  onClick={handleChangePassword}
                  disabled={pwdLoading}
                  variant="contained"
                  startIcon={<Save sx={{ fontSize: 17 }} />}
                  sx={{
                    borderRadius: 2, textTransform: 'none', fontWeight: 600,
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    boxShadow: 'none',
                    '&:hover': { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' },
                  }}
                >
                  {pwdLoading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button
                  onClick={() => setPwdForm({ oldPassword: '', newPassword: '', confirm: '' })}
                  variant="outlined"
                  startIcon={<Cancel sx={{ fontSize: 17 }} />}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: '#E2E8F0', color: '#64748B' }}
                >
                  Annuler
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ── Helper component ──────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, valueColor }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC' }}>
      <Box sx={{ mt: 0.2, flexShrink: 0 }}>{icon}</Box>
      <Box>
        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: valueColor || '#0F172A', mt: 0.2 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}
