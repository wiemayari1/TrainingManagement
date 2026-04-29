import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography,
} from '@mui/material';
import { WarningAmber } from '@mui/icons-material';

/**
 * Modale de confirmation sécurisée.
 *
 * Remplace window.confirm() qui est vulnérable au clickjacking
 * et non personnalisable par les navigateurs modernes.
 *
 * Usage :
 *   const [confirm, setConfirm] = useState(null);
 *
 *   <ConfirmDialog
 *     open={!!confirm}
 *     message={confirm?.msg}
 *     onConfirm={() => { confirm?.action(); setConfirm(null); }}
 *     onCancel={() => setConfirm(null)}
 *   />
 *
 *   // Pour déclencher :
 *   setConfirm({ msg: 'Supprimer ce formateur ?', action: () => handleDelete(id) });
 */
export default function ConfirmDialog({ open, message, onConfirm, onCancel, severity = 'warning' }) {
    const colors = {
        warning: { icon: '#F59E0B', btn: 'error' },
        danger:  { icon: '#EF4444', btn: 'error' },
        info:    { icon: '#6366F1', btn: 'primary' },
    };
    const c = colors[severity] || colors.warning;

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pt: 3 }}>
                <WarningAmber sx={{ color: c.icon, fontSize: 24 }} />
                Confirmation
            </DialogTitle>
            <DialogContent>
                <Typography sx={{ fontSize: '0.9rem', color: '#374151' }}>
                    {message || 'Êtes-vous sûr de vouloir effectuer cette action ?'}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, gap: 1 }}>
                <Button
                    onClick={onCancel}
                    variant="outlined"
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                    Annuler
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color={c.btn}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    autoFocus
                >
                    Confirmer
                </Button>
            </DialogActions>
        </Dialog>
    );
}
