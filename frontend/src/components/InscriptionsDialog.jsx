import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box,
  Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, IconButton, Tooltip, Avatar, TextField, FormControl,
  InputLabel, Select, MenuItem, Snackbar, Alert, CircularProgress,
} from '@mui/material';
import { Add, Delete, Edit, Person, CheckCircle, Cancel, HourglassEmpty } from '@mui/icons-material';
import { inscriptionService, participantService } from '../services/api';
import { useAuthStore } from '../store/authStore';

const STATUT_INS = {
  INSCRIT:  { label: 'Inscrit',  color: '#1D4ED8', bg: '#DBEAFE', icon: HourglassEmpty },
  PRESENT:  { label: 'Présent',  color: '#15803D', bg: '#DCFCE7', icon: CheckCircle },
  ABSENT:   { label: 'Absent',   color: '#B91C1C', bg: '#FEE2E2', icon: Cancel },
};

export default function InscriptionsDialog({ open, onClose, formation }) {
  const [inscriptions, setInscriptions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addMode, setAddMode] = useState(false);
  const [selectedPart, setSelectedPart] = useState('');
  const [editRow, setEditRow] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const { canManageFormations } = useAuthStore();

  useEffect(() => {
    if (open) loadData();
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [iRes, pRes] = await Promise.all([
        inscriptionService.getByFormation(formation.id),
        participantService.getAll(),
      ]);
      setInscriptions(iRes.data || []);
      setParticipants(pRes.data || []);
    } catch { }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!selectedPart) return;
    try {
      await inscriptionService.create({
        formation: { id: formation.id },
        participant: { id: selectedPart },
        statut: 'INSCRIT',
      });
      setSnack({ open: true, msg: 'Participant inscrit', severity: 'success' });
      setAddMode(false);
      setSelectedPart('');
      loadData();
    } catch (e) {
      setSnack({ open: true, msg: e.response?.data?.message || 'Erreur', severity: 'error' });
    }
  };

  const handleUpdateStatut = async (id, statut, note) => {
    try {
      await inscriptionService.update(id, {
        ...inscriptions.find(i => i.id === id),
        statut,
        note: note !== undefined ? note : inscriptions.find(i => i.id === id)?.note,
        formation: { id: formation.id },
        participant: { id: inscriptions.find(i => i.id === id)?.participant?.id },
      });
      setSnack({ open: true, msg: 'Mise à jour effectuée', severity: 'success' });
      setEditRow(null);
      loadData();
    } catch {
      setSnack({ open: true, msg: 'Erreur de mise à jour', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Retirer ce participant ?')) return;
    try {
      await inscriptionService.delete(id);
      setSnack({ open: true, msg: 'Inscription supprimée', severity: 'success' });
      loadData();
    } catch {
      setSnack({ open: true, msg: 'Erreur', severity: 'error' });
    }
  };

  const alreadyInscrit = new Set(inscriptions.map(i => i.participant?.id));
  const availableParticipants = participants.filter(p => !alreadyInscrit.has(p.id));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Inscriptions — {formation.titre}
        <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mt: 0.3 }}>
          {inscriptions.length} participant(s) inscrit(s)
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {canManageFormations() && (
              <Box sx={{ mb: 2 }}>
                {addMode ? (
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 280, flex: 1 }}>
                      <InputLabel>Sélectionner un participant</InputLabel>
                      <Select value={selectedPart} onChange={(e) => setSelectedPart(e.target.value)} label="Sélectionner un participant">
                        {availableParticipants.map(p => (
                          <MenuItem key={p.id} value={p.id}>{p.prenom} {p.nom} — {p.structureLibelle}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button onClick={handleAdd} variant="contained" size="small"
                      sx={{ textTransform: 'none', borderRadius: 2, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: 'none' }}>
                      Inscrire
                    </Button>
                    <Button onClick={() => setAddMode(false)} size="small" sx={{ textTransform: 'none' }}>Annuler</Button>
                  </Box>
                ) : (
                  <Button startIcon={<Add />} onClick={() => setAddMode(true)} variant="outlined" size="small"
                    sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#6366F1', color: '#6366F1' }}>
                    Ajouter un participant
                  </Button>
                )}
              </Box>
            )}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    {['Participant', 'Structure', 'Statut', 'Note /20', 'Actions'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#94A3B8' }}>
                        Aucun participant inscrit
                      </TableCell>
                    </TableRow>
                  ) : inscriptions.map(ins => {
                    const cfg = STATUT_INS[ins.statut] || STATUT_INS.INSCRIT;
                    const isEditing = editRow?.id === ins.id;
                    return (
                      <TableRow key={ins.id} sx={{ '&:hover': { bgcolor: '#FAFBFF' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: '#EEF2FF', color: '#6366F1', fontSize: '0.75rem' }}>
                              <Person sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Typography sx={{ fontSize: '0.835rem', fontWeight: 600 }}>
                              {ins.participant?.prenom} {ins.participant?.nom}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                          {ins.participant?.structure?.libelle || '—'}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select value={editRow.statut} onChange={(e) => setEditRow({ ...editRow, statut: e.target.value })}>
                                {Object.entries(STATUT_INS).map(([k, v]) => (
                                  <MenuItem key={k} value={k}>{v.label}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <Chip label={cfg.label} size="small"
                              sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.72rem' }} />
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <TextField size="small" type="number" value={editRow.note ?? ''}
                              onChange={(e) => setEditRow({ ...editRow, note: e.target.value ? parseFloat(e.target.value) : null })}
                              inputProps={{ min: 0, max: 20, step: 0.5 }}
                              sx={{ width: 80 }} />
                          ) : (
                            <Typography sx={{ fontSize: '0.835rem', fontWeight: ins.note ? 700 : 400, color: ins.note ? '#0F172A' : '#94A3B8' }}>
                              {ins.note !== null && ins.note !== undefined ? `${ins.note}/20` : '—'}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {canManageFormations() && (
                            <Box sx={{ display: 'flex', gap: 0.3 }}>
                              {isEditing ? (
                                <>
                                  <Button size="small" onClick={() => handleUpdateStatut(ins.id, editRow.statut, editRow.note)}
                                    sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#10B981' }}>Sauvegarder</Button>
                                  <Button size="small" onClick={() => setEditRow(null)}
                                    sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#94A3B8' }}>Annuler</Button>
                                </>
                              ) : (
                                <>
                                  <Tooltip title="Modifier">
                                    <IconButton size="small" sx={{ color: '#10B981' }}
                                      onClick={() => setEditRow({ id: ins.id, statut: ins.statut, note: ins.note })}>
                                      <Edit sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Retirer">
                                    <IconButton size="small" sx={{ color: '#EF4444' }}
                                      onClick={() => handleDelete(ins.id)}>
                                      <Delete sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', borderRadius: 2 }}>Fermer</Button>
      </DialogActions>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
