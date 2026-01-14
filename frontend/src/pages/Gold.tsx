import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import {
  getGoldRates,
  updateGoldRate,
  createGoldRate,
  deleteGoldRate
} from '../services/api';
import type { GoldRate } from '../types';
import { GoldTable } from '../components/rates/GoldTable';
import { useAuth } from '../context/AuthContext';

export const Gold = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [rates, setRates] = useState<GoldRate[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin CRUD states
  const [editGoldDialog, setEditGoldDialog] = useState(false);
  const [createGoldDialog, setCreateGoldDialog] = useState(false);
  const [selectedGold, setSelectedGold] = useState<GoldRate | null>(null);
  const [priceAfn, setPriceAfn] = useState('');
  const [priceUsd, setPriceUsd] = useState('');
  const [newGoldForm, setNewGoldForm] = useState({
    type: '',
    price_afn: '',
    price_usd: '',
    unit: 'gram'
  });
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';
  const isRtl = i18n.language === 'fa' || i18n.language === 'ps';

  const getGoldTypeName = (type: string) => {
    const translated = t(`gold.types.${type}`, { defaultValue: '' });
    return translated || type;
  };

  const fetchRates = async () => {
    setLoading(true);
    try {
      const data = await getGoldRates();
      setRates(data);
    } catch (error) {
      console.error('Error fetching gold rates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  // Admin CRUD handlers
  const handleEditGold = (gold: GoldRate) => {
    setSelectedGold(gold);
    setPriceAfn(gold.price_afn.toString());
    setPriceUsd(gold.price_usd.toString());
    setError('');
    setEditGoldDialog(true);
  };

  const handleSaveGold = async () => {
    if (!selectedGold) return;
    try {
      await updateGoldRate(selectedGold.id, parseFloat(priceAfn), parseFloat(priceUsd));
      setEditGoldDialog(false);
      fetchRates();
    } catch (err: any) {
      setError(err.response?.data?.error || t('admin.failedUpdateGold'));
    }
  };

  const handleNewGold = () => {
    setNewGoldForm({
      type: '',
      price_afn: '',
      price_usd: '',
      unit: 'gram'
    });
    setError('');
    setCreateGoldDialog(true);
  };

  const handleCreateGold = async () => {
    try {
      await createGoldRate(
        newGoldForm.type,
        parseFloat(newGoldForm.price_afn),
        parseFloat(newGoldForm.price_usd),
        newGoldForm.unit
      );
      setCreateGoldDialog(false);
      fetchRates();
    } catch (err: any) {
      setError(err.response?.data?.error || t('admin.failedCreateGold'));
    }
  };

  const handleDeleteGold = async (id: number) => {
    if (confirm(t('admin.confirmDeleteGold'))) {
      try {
        await deleteGoldRate(id);
        fetchRates();
      } catch (error) {
        console.error('Error deleting gold rate:', error);
      }
    }
  };

  const adminColumns = useMemo<MRT_ColumnDef<GoldRate>[]>(
    () => [
      {
        accessorKey: 'type',
        header: t('gold.type'),
        Cell: ({ cell }) => getGoldTypeName(cell.getValue<string>())
      },
      { accessorKey: 'price_afn', header: t('gold.priceAfn') },
      { accessorKey: 'price_usd', header: t('gold.priceUsd') },
      {
        id: 'actions',
        header: t('admin.actions'),
        Cell: ({ row }) => (
          <Box>
            <IconButton onClick={() => handleEditGold(row.original)} size="small">
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDeleteGold(row.original.id)} color="error" size="small">
              <Delete />
            </IconButton>
          </Box>
        )
      }
    ],
    [t, i18n.language]
  );

  return (
    <Container maxWidth={false} sx={{ py: 4, px: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('gold.title')}
      </Typography>

      <Paper sx={{ p: 2 }}>
        {isAdmin ? (
          <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600}>{t('gold.title')}</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={handleNewGold}>
                {t('admin.addNew')}
              </Button>
            </Box>
            <MaterialReactTable
              columns={adminColumns}
              data={rates}
              enablePagination={false}
              state={{ isLoading: loading }}
              muiTableProps={{
                sx: { direction: isRtl ? 'rtl' : 'ltr' }
              }}
              muiTableHeadCellProps={{
                sx: { textAlign: isRtl ? 'right' : 'left' }
              }}
              muiTableBodyCellProps={{
                sx: { textAlign: isRtl ? 'right' : 'left' }
              }}
            />
          </>
        ) : (
          <GoldTable rates={rates} isLoading={loading} />
        )}
      </Paper>

      {/* Edit Gold Dialog */}
      <Dialog open={editGoldDialog} onClose={() => setEditGoldDialog(false)}>
        <DialogTitle>{t('admin.editGold')} - {selectedGold ? getGoldTypeName(selectedGold.type) : ''}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            type="number"
            label={t('gold.priceAfn')}
            value={priceAfn}
            onChange={(e) => setPriceAfn(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            type="number"
            label={t('gold.priceUsd')}
            value={priceUsd}
            onChange={(e) => setPriceUsd(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditGoldDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveGold}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Create Gold Dialog */}
      <Dialog open={createGoldDialog} onClose={() => setCreateGoldDialog(false)}>
        <DialogTitle>{t('admin.createGold')}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label={t('gold.type')}
            value={newGoldForm.type}
            onChange={(e) => setNewGoldForm({ ...newGoldForm, type: e.target.value })}
            sx={{ mt: 1 }}
            placeholder={t('admin.goldTypePlaceholder')}
          />
          <TextField
            fullWidth
            type="number"
            label={t('gold.priceAfn')}
            value={newGoldForm.price_afn}
            onChange={(e) => setNewGoldForm({ ...newGoldForm, price_afn: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            type="number"
            label={t('gold.priceUsd')}
            value={newGoldForm.price_usd}
            onChange={(e) => setNewGoldForm({ ...newGoldForm, price_usd: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            select
            label={t('gold.unit')}
            value={newGoldForm.unit}
            onChange={(e) => setNewGoldForm({ ...newGoldForm, unit: e.target.value })}
            sx={{ mt: 2 }}
            SelectProps={{ native: true }}
          >
            <option value="gram">{t('gold.units.gram')}</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateGoldDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleCreateGold}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
