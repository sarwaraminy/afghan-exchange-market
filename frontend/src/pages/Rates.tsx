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
  TextField,
  Alert,
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
import { useCollapsibleSidebar, useMobileNav, useCrudState } from '../hooks';
import { CollapsibleSidebar, type SidebarMenuItem } from '../components/common/CollapsibleSidebar';
import { DialogFooter } from '../components/common/DialogFooter';
import { getMarketName as getLocalizedMarketName, getCurrencyName, getTranslatedMarketName } from '../utils/i18nHelpers';

export const Rates = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { isMobile } = useMobileNav();
  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useCollapsibleSidebar('ratesSidebarOpen');

  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // CRUD state management
  const {
    editDialog,
    createDialog,
    selectedItem: selectedRate,
    error,
    formData,
    openEdit,
    openCreate,
    closeEdit,
    closeCreate,
    setError,
    updateFormData
  } = useCrudState<ExchangeRate>({
    market_id: 0,
    currency_id: 0,
    buy_rate: 0,
    sell_rate: 0
  });

  const isAdmin = user?.role === 'admin';
  const isRtl = i18n.language === 'fa' || i18n.language === 'ps';

  // Helper functions using i18nHelpers
  const getMarketName = (market: Market) => getLocalizedMarketName(market, i18n.language);

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
    openEdit(rate);
  };

  const handleSaveRate = async () => {
    if (!selectedRate) return;
    try {
      await updateExchangeRate(selectedRate.id, formData.buy_rate || 0, formData.sell_rate || 0);
      closeEdit();
      const data = await getExchangeRates(selectedMarket!);
      setRates(data);
    } catch (err: any) {
      setError(err.response?.data?.error || t('admin.failedUpdateRate'));
    }
  };

  const handleNewRate = () => {
    updateFormData({
      market_id: selectedMarket || 0,
      currency_id: 0,
      buy_rate: 0,
      sell_rate: 0
    });
    openCreate();
  };

  const handleCreateRate = async () => {
    try {
      await createExchangeRate(
        formData.market_id || 0,
        formData.currency_id || 0,
        formData.buy_rate || 0,
        formData.sell_rate || 0
      );
      closeCreate();
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

  // Sidebar menu items
  const sidebarItems: SidebarMenuItem[] = markets.map((market) => ({
    id: market.id,
    label: getMarketName(market),
    icon: <Store />,
    onClick: () => setSelectedMarket(market.id),
    selected: selectedMarket === market.id
  }));

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
        <CollapsibleSidebar
          title={t('rates.market')}
          items={sidebarItems}
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
        />

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
      <Dialog open={editDialog} onClose={closeEdit}>
        <DialogTitle>{t('admin.editRate')} - {selectedRate?.currency_code}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            type="number"
            label={t('rates.buy')}
            value={formData.buy_rate || ''}
            onChange={(e) => updateFormData({ buy_rate: parseFloat(e.target.value) })}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            type="number"
            label={t('rates.sell')}
            value={formData.sell_rate || ''}
            onChange={(e) => updateFormData({ sell_rate: parseFloat(e.target.value) })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogFooter onCancel={closeEdit} onConfirm={handleSaveRate} />
      </Dialog>

      {/* Create Rate Dialog */}
      <Dialog open={createDialog} onClose={closeCreate}>
        <DialogTitle>{t('admin.createRate')}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            select
            label={t('rates.market')}
            value={formData.market_id || ''}
            onChange={(e) => updateFormData({ market_id: parseInt(e.target.value) })}
            sx={{ mt: 1 }}
            SelectProps={{ native: true }}
          >
            <option value="">{t('admin.selectMarket')}</option>
            {markets.map((market) => (
              <option key={market.id} value={market.id}>
                {getTranslatedMarketName(market.name, t)}
              </option>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label={t('rates.currency')}
            value={formData.currency_id || ''}
            onChange={(e) => updateFormData({ currency_id: parseInt(e.target.value) })}
            sx={{ mt: 2 }}
            SelectProps={{ native: true }}
          >
            <option value="">{t('admin.selectCurrency')}</option>
            {currencies.map((currency) => (
              <option key={currency.id} value={currency.id}>
                {currency.code} - {getCurrencyName(currency.code, t)}
              </option>
            ))}
          </TextField>
          <TextField
            fullWidth
            type="number"
            label={t('rates.buy')}
            value={formData.buy_rate || ''}
            onChange={(e) => updateFormData({ buy_rate: parseFloat(e.target.value) })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            type="number"
            label={t('rates.sell')}
            value={formData.sell_rate || ''}
            onChange={(e) => updateFormData({ sell_rate: parseFloat(e.target.value) })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogFooter onCancel={closeCreate} onConfirm={handleCreateRate} />
      </Dialog>
    </Container>
  );
};
