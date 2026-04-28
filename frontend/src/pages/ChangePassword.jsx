import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Box, Typography, TextField, Button, Alert, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';

const API_BASE = 'http://localhost:8081/api';

export default function ChangePassword() {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.oldPassword || !form.newPassword || !form.confirm) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (form.newPassword !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ oldPassword: form.oldPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Erreur lors du changement de mot de passe.');
      }
    } catch {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', p: 4, textAlign: 'center', maxWidth: 400 }}>
            <Typography sx={{ fontSize: '3rem', mb: 2 }}>✅</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#0F172A', mb: 1 }}>
              Mot de passe changé avec succès !
            </Typography>
            <Typography sx={{ color: '#64748B', mb: 3 }}>
              Veuillez vous reconnecter avec votre nouveau mot de passe.
            </Typography>
            <Typography sx={{ color: '#94A3B8', fontSize: '0.875rem' }}>
              Redirection vers la page de connexion...
            </Typography>
          </Card>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC', p: 3 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420 }}>
        <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0F172A', mb: 0.5 }}>
              🔐 Changement de mot de passe
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '0.875rem', mb: 3 }}>
              Vous devez changer votre mot de passe avant de continuer.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Mot de passe actuel"
                type="password"
                value={form.oldPassword}
                onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                label="Nouveau mot de passe"
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                label="Confirmer le nouveau mot de passe"
                type="password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  boxShadow: 'none',
                }}
              >
                {loading ? 'Changement en cours...' : 'Changer mon mot de passe'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
