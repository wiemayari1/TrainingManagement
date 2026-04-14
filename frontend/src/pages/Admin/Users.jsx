import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel,
  Select, MenuItem, Snackbar, Alert, Typography, LinearProgress, Tooltip,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { adminService } from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen]       = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'ROLE_USER' });
  const [snack, setSnack]     = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers();
      setUsers(res.data || []);
    } catch { }
    setLoading(false);
  };

  const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  const handleSubmit = async () => {
    if (!formData.username.trim()) return showSnack('Le login est obligatoire', 'error');
    if (!editing && !formData.password.trim()) return showSnack('Le mot de passe est obligatoire', 'error');
    try {
      // Adapter le champ pour le backend (attend "login" mais AdminController utilise "username")
      const payload = { username: formData.username, email: formData.email, password: formData.password, role: formData.role };
      if (editing) {
        await adminService.updateUser(editing.id, payload);
        showSnack('Utilisateur mis à jour');
      } else {
        await adminService.createUser(payload);
        showSnack('Utilisateur créé');
      }
      setOpen(false);
      setEditing(null);
      setFormData({ username: '', email: '', password: '', role: 'ROLE_USER' });
      loadUsers();
    } catch (e) {
      showSnack(e.response?.data?.message || 'Erreur', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await adminService.deleteUser(id);
      showSnack('Utilisateur supprimé');
      loadUsers();
    } catch { showSnack('Erreur lors de la suppression', 'error'); }
  };

  const openEdit = (u) => {
    setEditing(u);
    setFormData({ username: u.username || u.login || '', email: u.email || '', password: '', role: u.role || 'ROLE_USER' });
    setOpen(true);
  };

  const roleStyle = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return { bg: '#FEE2E2', color: '#DC2626', label: 'Administrateur' };
      case 'ROLE_RESPONSABLE': return { bg: '#FEF3C7', color: '#D97706', label: 'Responsable' };
      default: return { bg: '#DBEAFE', color: '#2563EB', label: 'Utilisateur' };
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>
          {users.length} utilisateur(s)
        </Typography>
        <Button variant="contained" startIcon={<Add />}
          onClick={() => { setEditing(null); setFormData({ username: '', email: '', password: '', role: 'ROLE_USER' }); setOpen(true); }}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
            background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: 'none' }}>
          Nouvel Utilisateur
        </Button>
      </Box>

      <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5, boxShadow: 'none' }}>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                {['ID', 'Login', 'Email', 'Rôle', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem', py: 1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => {
                const rs = roleStyle(u.role);
                return (
                  <TableRow key={u.id} sx={{ '&:hover': { bgcolor: '#FAFBFF' } }}>
                    <TableCell sx={{ color: '#94A3B8', fontSize: '0.78rem' }}>{u.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.855rem' }}>{u.username || u.login}</TableCell>
                    <TableCell sx={{ fontSize: '0.835rem', color: '#64748B' }}>{u.email || '—'}</TableCell>
                    <TableCell>
                      <Chip label={rs.label} size="small"
                        sx={{ bgcolor: rs.bg, color: rs.color, fontWeight: 700, fontSize: '0.72rem' }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.3 }}>
                        <Tooltip title="Modifier">
                          <IconButton size="small" sx={{ color: '#10B981' }} onClick={() => openEdit(u)}>
                            <Edit sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" sx={{ color: '#EF4444' }} onClick={() => handleDelete(u.id)}>
                            <Delete sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? '✏️ Modifier' : '➕ Nouvel'} Utilisateur</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField label="Login *" value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })} fullWidth />
            <TextField label="Email" type="email" value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} fullWidth />
            <TextField label={editing ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *'}
              type="password" value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Rôle</InputLabel>
              <Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} label="Rôle">
                <MenuItem value="ROLE_USER">Utilisateur</MenuItem>
                <MenuItem value="ROLE_RESPONSABLE">Responsable</MenuItem>
                <MenuItem value="ROLE_ADMIN">Administrateur</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpen(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
              background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: 'none' }}>
            {editing ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
