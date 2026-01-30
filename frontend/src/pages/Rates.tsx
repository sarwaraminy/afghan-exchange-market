import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import {
  Container,
  Typography,
  Paper,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Fab
} from '@mui/material';
import { Store, Add, Edit, Delete } from '@mui/icons-material';
import {
  getExchangeRates,
  getMarkets,
  getCurrencies,
  updateExchangeRate,
  createExchangeRate,
  deleteExchangeRate
} from '../services/api';
import type { ExchangeRate, Market, Currency } from '../types';
import { RatesTable } from '../components/rates/RatesTable';
import { useAuth } from '../context/AuthContext';

export const Rates = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Admin CRUD states
  const [editRateDialog, setEditRateDialog] = useState(false);
  const [createRateDialog, setCreateRateDialog] = useState(false);
  const [selectedRate, setSelectedRate] = useState<ExchangeRate | null>(null);
  const [buyRate, setBuyRate] = useState('');
  const [sellRate, setSellRate] = useState('');
  const [newRateForm, setNewRateForm] = useState({
    market_id: '',
    currency_id: '',
    buy_rate: '',
    sell_rate: ''
  });
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';
  const isRtl = i18n.language === 'fa' || i18n.language === 'ps';

  const getMarketName = (market: Market) => {
    if (i18n.language === 'fa' && market.name_fa) return market.name_fa;
    if (i18n.language === 'ps' && market.name_ps) return market.name_ps;
    return market.name;
  };

  const getCurrencyName = (code: string) => {
    const translated = t(`currencies.${code}`, { defaultValue: '' });
    return translated || code;
  };

  const getTranslatedMarketName = (name: string) => {
    const translated = t(`rates.markets.${name}`, { defaultValue: '' });
    return translated || name;
  };

  const fetchData = async () => {
    try {
      const [marketsData, currenciesData] = await Promise.all([
        getMarkets(),
        getCurrencies()
      ]);
      // Remove duplicates by id (keep first occurrence)
      const seenIds = new Set<number>();
      const uniqueMarkets = marketsData.filter(market => {
        if (seenIds.has(market.id)) {
          return false;
        }
        seenIds.add(market.id);
        return true;
      });
      setMarkets(uniqueMarkets);
      setCurrencies(currenciesData);
      if (uniqueMarkets.length > 0 && selectedMarket === null) {
        setSelectedMarket(uniqueMarkets[0].id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchRates = async () => {
      if (selectedMarket === null) return;
      setLoading(true);
      try {
        const data = await getExchangeRates(selectedMarket);
        setRates(data);
      } catch (error) {
        console.error('Error fetching rates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, [selectedMarket]);

  // Admin CRUD handlers
  const handleEditRate = (rate: ExchangeRate) => {
    setSelectedRate(rate);
    setBuyRate(rate.buy_rate.toString());
    setSellRate(rate.sell_rate.toString());
    setError('');
    setEditRateDialog(true);
  };

  const handleSaveRate = async () => {
    if (!selectedRate) return;
    try {
      await updateExchangeRate(selectedRate.id, parseFloat(buyRate), parseFloat(sellRate));
      setEditRateDialog(false);
      const data = await getExchangeRates(selectedMarket!);
      setRates(data);
    } catch (err: any) {
      setError(err.response?.data?.error || t('admin.failedUpdateRate'));
    }
  };

  const handleNewRate = () => {
    setNewRateForm({
      market_id: selectedMarket?.toString() || '',
      currency_id: '',
      buy_rate: '',
      sell_rate: ''
    });
    setError('');
    setCreateRateDialog(true);
  };

  const handleCreateRate = async () => {
    try {
      await createExchangeRate(
        parseInt(newRateForm.market_id),
        parseInt(newRateForm.currency_id),
        parseFloat(newRateForm.buy_rate),
        parseFloat(newRateForm.sell_rate)
      );
      setCreateRateDialog(false);
      const data = await getExchangeRates(selectedMarket!);
      setRates(data);
    } catch (err: any) {
      setError(err.response?.data?.error || t('admin.failedCreateRate'));
    }
  };

  const handleDeleteRate = async (id: number) => {
    if (confirm(t('admin.confirmDeleteRate'))) {
      try {
        await deleteExchangeRate(id);
        const data = await getExchangeRates(selectedMarket!);
        setRates(data);
      } catch (error) {
        console.error('Error deleting rate:', error);
      }
    }
  };

  const adminColumns = useMemo<MRT_ColumnDef<ExchangeRate>[]>(
    () => [
      {
        accessorKey: 'currency_code',
        header: t('rates.currency'),
        Cell: ({ row }) => `${row.original.currency_code} - ${getCurrencyName(row.original.currency_code)}`
      },
      {
        accessorKey: 'market_name',
        header: t('rates.market'),
        Cell: ({ cell }) => getTranslatedMarketName(cell.getValue<string>())
      },
      { accessorKey: 'buy_rate', header: t('rates.buy') },
      { accessorKey: 'sell_rate', header: t('rates.sell') },
      {
        id: 'actions',
        header: t('admin.actions'),
        Cell: ({ row }) => (
          <Box>
            <IconButton onClick={() => handleEditRate(row.original)} size="small">
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDeleteRate(row.original.id)} color="error" size="small">
              <Delete />
            </IconButton>
          </Box>
        )
      }
    ],
    [t, i18n.language]
  );

  const sidebar = (
    <Paper
      elevation={2}
      sx={{
        width: isMobile ? '100%' : 250,
        flexShrink: 0,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          bgcolor: '#1e3a5f',
          color: 'white',
          p: 2
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          {t('rates.market')}
        </Typography>
      </Box>
      <List disablePadding>
        {markets.map((market) => (
          <ListItem key={market.id} disablePadding>
            <ListItemButton
              selected={selectedMarket === market.id}
              onClick={() => setSelectedMarket(market.id)}
              sx={{
                py: 1.5,
                '&.Mui-selected': {
                  bgcolor: '#e3f2fd',
                  borderRight: '3px solid #1e3a5f',
                  '&:hover': {
                    bgcolor: '#bbdefb',
                  },
                },
                '&:hover': {
                  bgcolor: '#f5f5f5',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Store sx={{ color: selectedMarket === market.id ? '#1e3a5f' : 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText
                primary={getMarketName(market)}
                primaryTypographyProps={{
                  fontWeight: selectedMarket === market.id ? 600 : 400,
                  color: selectedMarket === market.id ? '#1e3a5f' : 'text.primary',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  return (
    <Container maxWidth={false} sx={{ py: 4, px: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('rates.title')}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 3,
        }}
      >
        {sidebar}

        <Paper sx={{ flex: 1, p: 2, borderRadius: 2 }}>
          {isAdmin ? (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={600}>{t('rates.title')}</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={handleNewRate}>
                  {t('admin.addNew')}
                </Button>
              </Box>
              <MaterialReactTable
                columns={adminColumns}
                data={rates}
                enablePagination
                enableSorting
                enableGlobalFilter
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
            <RatesTable rates={rates} isLoading={loading} />
          )}
        </Paper>
      </Box>

      {/* Edit Rate Dialog */}
      <Dialog open={editRateDialog} onClose={() => setEditRateDialog(false)}>
        <DialogTitle>{t('admin.editRate')} - {selectedRate?.currency_code}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            type="number"
            label={t('rates.buy')}
            value={buyRate}
            onChange={(e) => setBuyRate(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            type="number"
            label={t('rates.sell')}
            value={sellRate}
            onChange={(e) => setSellRate(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRateDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveRate}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Create Rate Dialog */}
      <Dialog open={createRateDialog} onClose={() => setCreateRateDialog(false)}>
        <DialogTitle>{t('admin.createRate')}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            select
            label={t('rates.market')}
            value={newRateForm.market_id}
            onChange={(e) => setNewRateForm({ ...newRateForm, market_id: e.target.value })}
            sx={{ mt: 1 }}
            SelectProps={{ native: true }}
          >
            <option value="">{t('admin.selectMarket')}</option>
            {markets.map((market) => (
              <option key={market.id} value={market.id}>
                {getTranslatedMarketName(market.name)}
              </option>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label={t('rates.currency')}
            value={newRateForm.currency_id}
            onChange={(e) => setNewRateForm({ ...newRateForm, currency_id: e.target.value })}
            sx={{ mt: 2 }}
            SelectProps={{ native: true }}
          >
            <option value="">{t('admin.selectCurrency')}</option>
            {currencies.map((currency) => (
              <option key={currency.id} value={currency.id}>
                {currency.code} - {getCurrencyName(currency.code)}
              </option>
            ))}
          </TextField>
          <TextField
            fullWidth
            type="number"
            label={t('rates.buy')}
            value={newRateForm.buy_rate}
            onChange={(e) => setNewRateForm({ ...newRateForm, buy_rate: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            type="number"
            label={t('rates.sell')}
            value={newRateForm.sell_rate}
            onChange={(e) => setNewRateForm({ ...newRateForm, sell_rate: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateRateDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleCreateRate}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
