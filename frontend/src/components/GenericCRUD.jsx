import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Snackbar, Alert, Typography, LinearProgress,
  Tooltip, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';

/**
 * Composant CRUD générique pour les pages admin (Structures, Domaines, Profils, Employeurs)
 * Props:
 *  - title: titre affiché
 *  - fields: [{name, label, type?, options?}] — colonnes + formulaire
 *  - service: {getAll, create, update, delete}
 *  - color: couleur du bouton
 */
export default function GenericCRUD({ title, fields, service, color = '#6366F1', gradient }) {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen]       = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [snack, setSnack]     = useState({ open: false, msg: '', severity: 'success' });

  const initForm = () => {
    const init = {};
    fields.forEach(f => { init[f.name] = ''; });
    return init;
  };

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await service.getAll();
      setItems(res.data || []);
    } catch { }
    setLoading(false);
  };

  const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  const handleSubmit = async () => {
    const firstRequired = fields.find(f => f.required && !formData[f.name]?.toString().trim());
    if (firstRequired) return showSnack(`${firstRequired.label} est obligatoire`, 'error');
    try {
      if (editing) {
        await service.update(editing.id, formData);
        showSnack(`${title} mis à jour`);
      } else {
        await service.create(formData);
        showSnack(`${title} créé`);
      }
      setOpen(false);
      setEditing(null);
      setFormData(initForm());
      load();
    } catch (e) {
      showSnack(e.response?.data?.message || 'Erreur', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Supprimer cet élément ?`)) return;
    try {
      await service.delete(id);
      showSnack('Supprimé avec succès');
      load();
    } catch { showSnack('Erreur lors de la suppression', 'error'); }
  };

  const openEdit = (item) => {
    setEditing(item);
    const fd = {};
    fields.forEach(f => { fd[f.name] = item[f.name] || ''; });
    setFormData(fd);
    setOpen(true);
  };

  const gradientStyle = gradient || `linear-gradient(135deg, ${color}, ${color}dd)`;

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>
          {items.length} élément(s)
        </Typography>
        <Button variant="contained" startIcon={<Add />}
          onClick={() => { setEditing(null); setFormData(initForm()); setOpen(true); }}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, background: gradientStyle, boxShadow: 'none' }}>
          Nouveau
        </Button>
      </Box>

      <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5, boxShadow: 'none' }}>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem', py: 1.5, width: 60 }}>ID</TableCell>
                {fields.map(f => (
                  <TableCell key={f.name} sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem', py: 1.5 }}>
                    {f.label}
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem', py: 1.5 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={fields.length + 2} align="center" sx={{ py: 5, color: '#94A3B8' }}>
                    Aucun élément
                  </TableCell>
                </TableRow>
              ) : items.map((item) => (
                <TableRow key={item.id} sx={{ '&:hover': { bgcolor: '#FAFBFF' } }}>
                  <TableCell sx={{ color: '#94A3B8', fontSize: '0.78rem' }}>{item.id}</TableCell>
                  {fields.map(f => (
                    <TableCell key={f.name} sx={{ fontWeight: 500, fontSize: '0.855rem', color: '#0F172A' }}>
                      {item[f.name] || '—'}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.3 }}>
                      <Tooltip title="Modifier">
                        <IconButton size="small" sx={{ color: '#10B981', '&:hover': { bgcolor: '#ECFDF5' } }}
                          onClick={() => openEdit(item)}>
                          <Edit sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
                          onClick={() => handleDelete(item.id)}>
                          <Delete sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? '✏️ Modifier' : '➕ Nouveau'} — {title}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {fields.map(f => (
              f.type === 'select' ? (
                <FormControl key={f.name} fullWidth>
                  <InputLabel>{f.label}{f.required ? ' *' : ''}</InputLabel>
                  <Select value={formData[f.name] || ''} label={f.label}
                    onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}>
                    {f.options?.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </Select>
                </FormControl>
              ) : (
                <TextField key={f.name} fullWidth
                  label={`${f.label}${f.required ? ' *' : ''}`}
                  type={f.type || 'text'}
                  value={formData[f.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })} />
              )
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpen(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, background: gradientStyle, boxShadow: 'none' }}>
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
