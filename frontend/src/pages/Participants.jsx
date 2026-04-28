import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, TextField, InputAdornment,
  IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Grid, Avatar, Tooltip,
  Snackbar, Alert, LinearProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
} from '@mui/material';
import { Add, Search, Edit, Delete, Person } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { participantService, structureService, profilService } from '../services/api';
import { useAuthStore } from '../store/authStore';

const EMPTY_FORM = { nom: '', prenom: '', email: '', tel: '', structure: { id: '' }, profil: { id: '' } };
const AVATAR_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Participants() {
  const [participants, setParticipants] = useState([]);
  const [structures, setStructures]     = useState([]);
  const [profils, setProfils]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterStructure, setFilterStructure] = useState('');
  const [page, setPage]                 = useState(0);
  const [rowsPerPage, setRowsPerPage]   = useState(10);
  const [openDialog, setOpenDialog]     = useState(false);
  const [editing, setEditing]           = useState(null);
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [snack, setSnack]               = useState({ open: false, msg: '', severity: 'success' });
  const { canManageParticipants } = useAuthStore();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, sRes, prRes] = await Promise.allSettled([
        participantService.getAll(), structureService.getAll(), profilService.getAll(),
      ]);
      if (pRes.status === 'fulfilled')  setParticipants(pRes.value.data || []);
      if (sRes.status === 'fulfilled')  setStructures(sRes.value.data || []);
      if (prRes.status === 'fulfilled') setProfils(prRes.value.data || []);
    } catch { }
    setLoading(false);
  };

  const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  const handleSubmit = async () => {
    if (!formData.nom.trim())   return showSnack('Le nom est obligatoire', 'error');
    if (!formData.prenom.trim()) return showSnack('Le prénom est obligatoire', 'error');
    if (!formData.structure?.id) return showSnack('La structure est obligatoire', 'error');
    if (!formData.profil?.id)    return showSnack('Le profil est obligatoire', 'error');

    const payload = {
      ...formData,
      structure: { id: Number(formData.structure.id) },
      profil: { id: Number(formData.profil.id) },
    };
    try {
      if (editing) {
        await participantService.update(editing.id, payload);
        showSnack('Participant mis à jour');
      } else {
        await participantService.create(payload);
        showSnack('Participant créé');
      }
      setOpenDialog(false);
      resetForm();
      loadData();
    } catch (e) {
      showSnack(e.response?.data?.message || 'Erreur', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce participant ?')) return;
    try {
      await participantService.delete(id);
      showSnack('Participant supprimé');
      loadData();
    } catch { showSnack('Erreur lors de la suppression', 'error'); }
  };

  const openEdit = (row) => {
    setEditing(row);
    setFormData({
      nom: row.nom || '', prenom: row.prenom || '',
      email: row.email || '', tel: row.tel || '',
      structure: { id: row.structureId || '' },
      profil: { id: row.profilId || '' },
    });
    setOpenDialog(true);
  };

  const resetForm = () => { setEditing(null); setFormData(EMPTY_FORM); };

  const filtered = participants.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.nom?.toLowerCase().includes(q) || p.prenom?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q);
    const matchStruct = !filterStructure || String(p.structureId) === String(filterStructure);
    return matchSearch && matchStruct;
  });
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
            Gestion des Participants
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.875rem' }}>{participants.length} participant(s)</Typography>
        </Box>
        {canManageParticipants() && (
          <Button variant="contained" startIcon={<Add />} onClick={() => { resetForm(); setOpenDialog(true); }}
            sx={{ borderRadius: 2.5, fontWeight: 600, textTransform: 'none',
              background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: 'none' }}>
            Nouveau Participant
          </Button>
        )}
      </Box>

      <Card sx={{ mb: 2, border: '1px solid #E2E8F0', borderRadius: 2.5, boxShadow: 'none' }}>
        <CardContent sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField placeholder="Rechercher..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }} size="small"
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#94A3B8', fontSize: 18 }} /></InputAdornment> }}
            sx={{ minWidth: 220, flex: 1, maxWidth: 320 }} />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Structure</InputLabel>
            <Select value={filterStructure} onChange={(e) => { setFilterStructure(e.target.value); setPage(0); }} label="Structure">
              <MenuItem value="">Toutes</MenuItem>
              {structures.map(s => <MenuItem key={s.id} value={s.id}>{s.libelle}</MenuItem>)}
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
                {['Participant', 'Structure', 'Profil', 'Téléphone', 'Formations', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem', py: 1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5, color: '#94A3B8' }}>Aucun participant</TableCell></TableRow>
              ) : paginated.map((p, i) => (
                <TableRow key={p.id} sx={{ '&:hover': { bgcolor: '#FAFBFF' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 34, height: 34, bgcolor: AVATAR_COLORS[i % AVATAR_COLORS.length], fontSize: '0.8rem', fontWeight: 700 }}>
                        {p.prenom?.charAt(0)}{p.nom?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.855rem', color: '#0F172A' }}>
                          {p.prenom} {p.nom}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>{p.email || '—'}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={p.structureLibelle || '—'} size="small" variant="outlined"
                      sx={{ fontSize: '0.72rem', fontWeight: 500 }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={p.profilLibelle || '—'} size="small"
                      sx={{ bgcolor: '#DBEAFE', color: '#1D4ED8', fontSize: '0.72rem', fontWeight: 500 }} />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.835rem', color: '#64748B' }}>{p.tel || '—'}</TableCell>
                  <TableCell>
                    <Chip label={`${p.nbFormations || 0}`} size="small" color="primary" variant="outlined"
                      sx={{ fontWeight: 700, fontSize: '0.78rem' }} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.3 }}>
                      {canManageParticipants() && (
                        <Tooltip title="Modifier">
                          <IconButton size="small" sx={{ color: '#10B981', '&:hover': { bgcolor: '#ECFDF5' } }}
                            onClick={() => openEdit(p)}>
                            <Edit sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canManageParticipants() && (
                        <Tooltip title="Supprimer">
                          <IconButton size="small" sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
                            onClick={() => handleDelete(p.id)}>
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
          {editing ? '✏️ Modifier le Participant' : '➕ Nouveau Participant'}
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
              <TextField fullWidth label="Email" type="email" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Téléphone" value={formData.tel}
                onChange={(e) => setFormData({ ...formData, tel: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Structure *</InputLabel>
                <Select value={formData.structure?.id || ''} label="Structure *"
                  onChange={(e) => setFormData({ ...formData, structure: { id: e.target.value } })}>
                  {structures.map(s => <MenuItem key={s.id} value={s.id}>{s.libelle}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Profil *</InputLabel>
                <Select value={formData.profil?.id || ''} label="Profil *"
                  onChange={(e) => setFormData({ ...formData, profil: { id: e.target.value } })}>
                  {profils.map(p => <MenuItem key={p.id} value={p.id}>{p.libelle}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => { setOpenDialog(false); resetForm(); }} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} variant="contained"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
              background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: 'none' }}>
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
