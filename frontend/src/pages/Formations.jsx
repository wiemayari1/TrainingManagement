import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, TextField, InputAdornment,
  IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Grid, Avatar, Tooltip,
  Snackbar, Alert, LinearProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, TablePagination,
} from '@mui/material';
import {
  Add, Search, Edit, Delete, Visibility, School, FilterList,
  CalendarToday, AttachMoney,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formationService, domaineService, formateurService, inscriptionService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import InscriptionsDialog from '../components/InscriptionsDialog';

const STATUT_CONFIG = {
  TERMINEE:  { label: 'Terminée',  color: '#15803D', bg: '#DCFCE7' },
  EN_COURS:  { label: 'En cours',  color: '#B45309', bg: '#FEF3C7' },
  PLANIFIEE: { label: 'Planifiée', color: '#1D4ED8', bg: '#DBEAFE' },
  ANNULEE:   { label: 'Annulée',   color: '#B91C1C', bg: '#FEE2E2' },
};

const DOMAIN_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const EMPTY_FORM = {
  titre: '', annee: new Date().getFullYear(), duree: 1, budget: 0,
  statut: 'PLANIFIEE', domaine: { id: '' }, formateur: null,
  dateDebut: '', dateFin: '', lieu: '',
};

export default function Formations() {
  const [formations, setFormations] = useState([]);
  const [domaines, setDomaines]     = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterDomaine, setFilterDomaine] = useState('');
  const [page, setPage]             = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingFormation, setEditingFormation] = useState(null);
  const [formData, setFormData]     = useState(EMPTY_FORM);

  const [openInscriptions, setOpenInscriptions] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);

  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const { canManageFormations, isAdmin } = useAuthStore();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, dRes, frRes] = await Promise.allSettled([
        formationService.getAll(),
        domaineService.getAll(),
        formateurService.getAll(),
      ]);
      if (fRes.status === 'fulfilled')  setFormations(fRes.value.data || []);
      if (dRes.status === 'fulfilled')  setDomaines(dRes.value.data || []);
      if (frRes.status === 'fulfilled') setFormateurs(frRes.value.data || []);
    } catch (e) {
      showSnack('Erreur de chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnack = (msg, severity = 'success') =>
    setSnack({ open: true, msg, severity });

  const handleSubmit = async () => {
    if (!formData.titre.trim()) return showSnack('Le titre est obligatoire', 'error');
    if (!formData.domaine?.id)  return showSnack('Le domaine est obligatoire', 'error');
    if (!formData.annee)        return showSnack("L'année est obligatoire", 'error');
    if (formData.duree < 1)     return showSnack('La durée doit être ≥ 1 jour', 'error');
    if (formData.budget <= 0)   return showSnack('Le budget doit être positif', 'error');

    const payload = {
      ...formData,
      domaine: { id: Number(formData.domaine.id) },
      formateur: formData.formateur?.id ? { id: Number(formData.formateur.id) } : null,
      dateDebut: formData.dateDebut || null,
      dateFin: formData.dateFin || null,
    };

    try {
      if (editingFormation) {
        await formationService.update(editingFormation.id, payload);
        showSnack('Formation mise à jour avec succès');
      } else {
        await formationService.create(payload);
        showSnack('Formation créée avec succès');
      }
      setOpenDialog(false);
      resetForm();
      loadData();
    } catch (e) {
      showSnack(e.response?.data?.message || 'Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette formation ?')) return;
    try {
      await formationService.delete(id);
      showSnack('Formation supprimée');
      loadData();
    } catch (e) {
      showSnack('Erreur lors de la suppression', 'error');
    }
  };

  const openEdit = (row) => {
    setEditingFormation(row);
    setFormData({
      titre: row.titre || '',
      annee: row.annee || new Date().getFullYear(),
      duree: row.duree || 1,
      budget: row.budget || 0,
      statut: row.statut || 'PLANIFIEE',
      domaine: { id: row.domaineId || '' },
      formateur: row.formateurId ? { id: row.formateurId } : null,
      dateDebut: row.dateDebut || '',
      dateFin: row.dateFin || '',
      lieu: row.lieu || '',
    });
    setOpenDialog(true);
  };

  const resetForm = () => { setEditingFormation(null); setFormData(EMPTY_FORM); };

  const filtered = formations.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.titre?.toLowerCase().includes(q) || f.domaineLibelle?.toLowerCase().includes(q);
    const matchStatut = !filterStatut || f.statut === filterStatut;
    const matchDomaine = !filterDomaine || String(f.domaineId) === String(filterDomaine);
    return matchSearch && matchStatut && matchDomaine;
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
            Gestion des Formations
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.875rem' }}>
            {formations.length} formation(s) enregistrée(s)
          </Typography>
        </Box>
        {canManageFormations() && (
          <Button variant="contained" startIcon={<Add />}
            onClick={() => { resetForm(); setOpenDialog(true); }}
            sx={{ borderRadius: 2.5, fontWeight: 600, textTransform: 'none',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: 'none',
              '&:hover': { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' } }}>
            Nouvelle Formation
          </Button>
        )}
      </Box>

      {/* Filtres */}
      <Card sx={{ mb: 2, border: '1px solid #E2E8F0', borderRadius: 2.5, boxShadow: 'none' }}>
        <CardContent sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            size="small"
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#94A3B8', fontSize: 18 }} /></InputAdornment> }}
            sx={{ minWidth: 220, flex: 1, maxWidth: 320 }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Statut</InputLabel>
            <Select value={filterStatut} onChange={(e) => { setFilterStatut(e.target.value); setPage(0); }} label="Statut">
              <MenuItem value="">Tous</MenuItem>
              {Object.entries(STATUT_CONFIG).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Domaine</InputLabel>
            <Select value={filterDomaine} onChange={(e) => { setFilterDomaine(e.target.value); setPage(0); }} label="Domaine">
              <MenuItem value="">Tous</MenuItem>
              {domaines.map(d => <MenuItem key={d.id} value={d.id}>{d.libelle}</MenuItem>)}
            </Select>
          </FormControl>
          {(filterStatut || filterDomaine) && (
            <Button size="small" onClick={() => { setFilterStatut(''); setFilterDomaine(''); setPage(0); }}
              sx={{ textTransform: 'none', color: '#EF4444' }}>
              Réinitialiser
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5, boxShadow: 'none' }}>
        {loading && <LinearProgress sx={{ borderRadius: '10px 10px 0 0' }} />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                {['Formation', 'Domaine', 'Durée', 'Budget', 'Période', 'Statut', 'Participants', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem', py: 1.5, whiteSpace: 'nowrap' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5, color: '#94A3B8' }}>
                    Aucune formation trouvée
                  </TableCell>
                </TableRow>
              ) : paginated.map((f, i) => {
                const cfg = STATUT_CONFIG[f.statut] || STATUT_CONFIG.PLANIFIEE;
                const color = DOMAIN_COLORS[i % DOMAIN_COLORS.length];
                return (
                  <motion.tr key={f.id} component={TableRow}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    sx={{ '&:hover': { bgcolor: '#FAFBFF' }, transition: 'background 0.15s' }}>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: `${color}18`, color }}>
                          <School sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.855rem', color: '#0F172A' }}>
                            {f.titre}
                          </Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                            {f.formateurNom || 'Aucun formateur'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={f.domaineLibelle || '-'} size="small"
                        sx={{ bgcolor: `${color}18`, color, fontWeight: 600, fontSize: '0.72rem' }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.855rem', color: '#475569', whiteSpace: 'nowrap' }}>
                      {f.duree} jour{f.duree > 1 ? 's' : ''}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.855rem', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {(f.budget || 0).toLocaleString()} DT
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.78rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                      {f.dateDebut ? f.dateDebut : `${f.annee}`}
                    </TableCell>
                    <TableCell>
                      <Chip label={cfg.label} size="small"
                        sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: '0.72rem' }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={`${f.nbParticipants || 0}`} size="small" variant="outlined"
                        sx={{ fontWeight: 600, fontSize: '0.78rem' }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.3 }}>
                        <Tooltip title="Voir les inscriptions">
                          <IconButton size="small" sx={{ color: '#3B82F6', '&:hover': { bgcolor: '#EFF6FF' } }}
                            onClick={() => { setSelectedFormation(f); setOpenInscriptions(true); }}>
                            <Visibility sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                        {canManageFormations() && (
                          <Tooltip title="Modifier">
                            <IconButton size="small" sx={{ color: '#10B981', '&:hover': { bgcolor: '#ECFDF5' } }}
                              onClick={() => openEdit(f)}>
                              <Edit sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(canManageFormations()) && (
                          <Tooltip title="Supprimer">
                            <IconButton size="small" sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
                              onClick={() => handleDelete(f.id)}>
                              <Delete sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
          labelRowsPerPage="Lignes par page"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
        />
      </Card>

      {/* Dialog Formulaire */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editingFormation ? '✏️ Modifier la Formation' : '➕ Nouvelle Formation'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2.5} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Titre de la formation *" value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Année *" type="number" value={formData.annee}
                onChange={(e) => setFormData({ ...formData, annee: parseInt(e.target.value) })}
                inputProps={{ min: 2020, max: 2030 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Durée (jours) *" type="number" value={formData.duree}
                onChange={(e) => setFormData({ ...formData, duree: parseInt(e.target.value) })}
                inputProps={{ min: 1 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Budget (DT) *" type="number" value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                inputProps={{ min: 0, step: 100 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoney sx={{ fontSize: 18, color: '#94A3B8' }} /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Domaine *</InputLabel>
                <Select value={formData.domaine?.id || ''} label="Domaine *"
                  onChange={(e) => setFormData({ ...formData, domaine: { id: e.target.value } })}>
                  {domaines.map(d => <MenuItem key={d.id} value={d.id}>{d.libelle}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Formateur</InputLabel>
                <Select value={formData.formateur?.id || ''}  label="Formateur"
                  onChange={(e) => setFormData({ ...formData, formateur: e.target.value ? { id: e.target.value } : null })}>
                  <MenuItem value="">Aucun</MenuItem>
                  {formateurs.map(f => (
                    <MenuItem key={f.id} value={f.id}>{f.prenom} {f.nom} ({f.type})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Date de début" type="date" value={formData.dateDebut || ''}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarToday sx={{ fontSize: 18, color: '#94A3B8' }} /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Date de fin" type="date" value={formData.dateFin || ''}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarToday sx={{ fontSize: 18, color: '#94A3B8' }} /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Lieu" value={formData.lieu || ''}
                onChange={(e) => setFormData({ ...formData, lieu: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select value={formData.statut} label="Statut"
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value })}>
                  {Object.entries(STATUT_CONFIG).map(([k, v]) => (
                    <MenuItem key={k} value={k}>{v.label}</MenuItem>
                  ))}
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
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: 'none' }}>
            {editingFormation ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Inscriptions */}
      {openInscriptions && selectedFormation && (
        <InscriptionsDialog
          open={openInscriptions}
          onClose={() => setOpenInscriptions(false)}
          formation={selectedFormation}
        />
      )}

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
