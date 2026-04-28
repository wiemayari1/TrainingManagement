import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, TextField, InputAdornment,
  IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Grid, Avatar, Tooltip,
  Snackbar, Alert, LinearProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
} from '@mui/material';
import { Add, Search, Edit, Delete } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formateurService, employeurService } from '../services/api';
import { useAuthStore } from '../store/authStore';

const EMPTY_FORM = { nom: '', prenom: '', email: '', tel: '', type: 'INTERNE', employeur: null };

export default function Formateurs() {
  const [formateurs, setFormateurs]   = useState([]);
  const [employeurs, setEmployeurs]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterType, setFilterType]   = useState('');
  const [page, setPage]               = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog]   = useState(false);
  const [editing, setEditing]         = useState(null);
  const [formData, setFormData]       = useState(EMPTY_FORM);
  const [snack, setSnack]             = useState({ open: false, msg: '', severity: 'success' });
  const { canManageFormateurs } = useAuthStore();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, eRes] = await Promise.allSettled([
        formateurService.getAll(), employeurService.getAll(),
      ]);
      if (fRes.status === 'fulfilled') setFormateurs(fRes.value.data || []);
      if (eRes.status === 'fulfilled') setEmployeurs(eRes.value.data || []);
    } catch { }
    setLoading(false);
  };

  const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  const handleSubmit = async () => {
    if (!formData.nom.trim())   return showSnack('Le nom est obligatoire', 'error');
    if (!formData.prenom.trim()) return showSnack('Le prénom est obligatoire', 'error');

    const payload = {
      ...formData,
      employeur: formData.type === 'EXTERNE' && formData.employeur?.id
        ? { id: Number(formData.employeur.id) } : null,
    };
    try {
      if (editing) {
        await formateurService.update(editing.id, payload);
        showSnack('Formateur mis à jour');
      } else {
        await formateurService.create(payload);
        showSnack('Formateur créé');
      }
      setOpenDialog(false);
      resetForm();
      loadData();
    } catch (e) {
      showSnack(e.response?.data?.message || 'Erreur', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce formateur ?')) return;
    try {
      await formateurService.delete(id);
      showSnack('Formateur supprimé');
      loadData();
    } catch { showSnack('Erreur lors de la suppression', 'error'); }
  };

  const openEdit = (row) => {
    setEditing(row);
    setFormData({
      nom: row.nom || '', prenom: row.prenom || '',
      email: row.email || '', tel: row.tel || '',
      type: row.type || 'INTERNE',
      employeur: row.employeurId ? { id: row.employeurId } : null,
    });
    setOpenDialog(true);
  };

  const resetForm = () => { setEditing(null); setFormData(EMPTY_FORM); };

  const filtered = formateurs.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.nom?.toLowerCase().includes(q) || f.prenom?.toLowerCase().includes(q) || f.email?.toLowerCase().includes(q);
    const matchType   = !filterType || f.type === filterType;
    return matchSearch && matchType;
  });
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const internesCount = formateurs.filter(f => f.type === 'INTERNE').length;
  const externesCount = formateurs.filter(f => f.type === 'EXTERNE').length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
            Gestion des Formateurs
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.875rem' }}>
            {internesCount} interne(s) · {externesCount} externe(s)
          </Typography>
        </Box>
        {canManageFormateurs() && (
          <Button variant="contained" startIcon={<Add />} onClick={() => { resetForm(); setOpenDialog(true); }}
            sx={{ borderRadius: 2.5, fontWeight: 600, textTransform: 'none',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)', boxShadow: 'none' }}>
            Nouveau Formateur
          </Button>
        )}
      </Box>

      <Card sx={{ mb: 2, border: '1px solid #E2E8F0', borderRadius: 2.5, boxShadow: 'none' }}>
        <CardContent sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField placeholder="Rechercher..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }} size="small"
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#94A3B8', fontSize: 18 }} /></InputAdornment> }}
            sx={{ minWidth: 220, flex: 1, maxWidth: 320 }} />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(0); }} label="Type">
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="INTERNE">Interne</MenuItem>
              <MenuItem value="EXTERNE">Externe</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5, boxShadow: 'none' }}>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                {['Formateur', 'Type', 'Employeur', 'Email', 'Téléphone', 'Sessions', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem', py: 1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: '#94A3B8' }}>Aucun formateur</TableCell></TableRow>
              ) : paginated.map((f, i) => (
                <TableRow key={f.id} sx={{ '&:hover': { bgcolor: '#FFFBEB' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 34, height: 34, bgcolor: f.type === 'INTERNE' ? '#DCFCE7' : '#EDE9FE',
                        color: f.type === 'INTERNE' ? '#15803D' : '#7C3AED', fontSize: '0.8rem', fontWeight: 700 }}>
                        {f.prenom?.charAt(0)}{f.nom?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.855rem', color: '#0F172A' }}>
                          {f.prenom} {f.nom}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                          {f.moyenneNotes ? `Note moy.: ${f.moyenneNotes.toFixed(1)}/20` : 'Pas encore noté'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={f.type} size="small"
                      sx={{ bgcolor: f.type === 'INTERNE' ? '#DCFCE7' : '#EDE9FE',
                        color: f.type === 'INTERNE' ? '#15803D' : '#7C3AED', fontWeight: 700, fontSize: '0.72rem' }} />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.835rem', color: '#64748B' }}>{f.employeurNom || '—'}</TableCell>
                  <TableCell sx={{ fontSize: '0.835rem', color: '#64748B' }}>{f.email || '—'}</TableCell>
                  <TableCell sx={{ fontSize: '0.835rem', color: '#64748B' }}>{f.tel || '—'}</TableCell>
                  <TableCell>
                    <Chip label={`${f.nbFormations || 0}`} size="small" color="warning" variant="outlined"
                      sx={{ fontWeight: 700, fontSize: '0.78rem' }} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.3 }}>
                      {canManageFormateurs() && (
                        <Tooltip title="Modifier">
                          <IconButton size="small" sx={{ color: '#10B981', '&:hover': { bgcolor: '#ECFDF5' } }}
                            onClick={() => openEdit(f)}>
                            <Edit sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canManageFormateurs() && (
                        <Tooltip title="Supprimer">
                          <IconButton size="small" sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
                            onClick={() => handleDelete(f.id)}>
                            <Delete sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filtered.length}
          rowsPerPage={rowsPerPage} page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
          labelRowsPerPage="Lignes par page"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`} />
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editing ? '✏️ Modifier le Formateur' : '➕ Nouveau Formateur'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2.5} sx={{ pt: 1 }}>
            <Grid item xs={6}>
              <TextField fullWidth label="Nom *" value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Prénom *" value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Email" type="email" value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Téléphone" value={formData.tel || ''}
                onChange={(e) => setFormData({ ...formData, tel: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Type *</InputLabel>
                <Select value={formData.type} label="Type *"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value, employeur: null })}>
                  <MenuItem value="INTERNE">Interne</MenuItem>
                  <MenuItem value="EXTERNE">Externe</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth disabled={formData.type === 'INTERNE'}>
                <InputLabel>Employeur</InputLabel>
                <Select value={formData.employeur?.id || ''} label="Employeur"
                  onChange={(e) => setFormData({ ...formData, employeur: e.target.value ? { id: e.target.value } : null })}>
                  <MenuItem value="">Aucun</MenuItem>
                  {employeurs.map(e => <MenuItem key={e.id} value={e.id}>{e.nomEmployeur}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => { setOpenDialog(false); resetForm(); }} variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
              background: 'linear-gradient(135deg, #F59E0B, #D97706)', boxShadow: 'none' }}>
            {editing ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
