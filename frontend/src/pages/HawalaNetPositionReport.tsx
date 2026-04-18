import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import {
  Typography,
  Box,
  MenuItem,
  TextField,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import { TrendingUp, TrendingDown, Balance } from '@mui/icons-material';
import { getCurrencies, getHawalaNetPositions } from '../services/api';
import type { Currency, HawalaNetPosition } from '../types';

export const HawalaNetPositionReport = () => {
  const { t, i18n } = useTranslation();
  const [positions, setPositions] = useState<HawalaNetPosition[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const currenciesData = await getCurrencies();
      setCurrencies(currenciesData);
      fetchPositions(0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
      setLoading(false);
    }
  };

  const fetchPositions = async (currencyId: number) => {
    try {
      setLoading(true);
      const data = await getHawalaNetPositions(currencyId || undefined);
      setPositions(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load net positions');
      setLoading(false);
    }
  };

  const handleCurrencyChange = (currencyId: number) => {
    setSelectedCurrency(currencyId);
    fetchPositions(currencyId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const summary = useMemo(() => {
    const totalPositive = positions
      .filter(p => p.net_position > 0)
      .reduce((sum, p) => sum + Math.abs(p.net_position), 0);

    const totalNegative = positions
      .filter(p => p.net_position < 0)
      .reduce((sum, p) => sum + Math.abs(p.net_position), 0);

    const balanced = positions.filter(p => p.net_position === 0).length;

    return { totalPositive, totalNegative, balanced, total: positions.length };
  }, [positions]);

  const columns = useMemo<MRT_ColumnDef<HawalaNetPosition>[]>(
    () => [
      {
        accessorKey: 'hawaladar1_name',
        header: t('hawala.hawaladar') || 'Hawaladar 1',
        size: 150,
        Cell: ({ row }) => (
          <Typography variant="body2" fontWeight={600}>
            {row.original.hawaladar1_name}
          </Typography>
        )
      },
      {
        accessorKey: 'hawaladar2_name',
        header: t('hawala.hawaladar') || 'Hawaladar 2',
        size: 150,
        Cell: ({ row }) => (
          <Typography variant="body2" fontWeight={600}>
            {row.original.hawaladar2_name}
          </Typography>
        )
      },
      {
        accessorKey: 'sent_to_h2',
        header: t('hawala.sent') || 'Sent',
        size: 120,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ row }) => (
          <Typography variant="body2" color="warning.main">
            {formatCurrency(row.original.sent_to_h2)} {row.original.currency_code}
          </Typography>
        )
      },
      {
        accessorKey: 'received_from_h2',
        header: t('hawala.received') || 'Received',
        size: 120,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ row }) => (
          <Typography variant="body2" color="success.main">
            {formatCurrency(row.original.received_from_h2)} {row.original.currency_code}
          </Typography>
        )
      },
      {
        accessorKey: 'net_position',
        header: t('hawala.netPosition') || 'Net Position',
        size: 150,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ row }) => {
          const value = row.original.net_position;
          const isPositive = value > 0;
          const isZero = value === 0;

          return (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body2"
                fontWeight={700}
                color={isZero ? 'text.secondary' : isPositive ? 'success.main' : 'error.main'}
              >
                {formatCurrency(Math.abs(value))} {row.original.currency_code}
              </Typography>
              {!isZero && (isPositive ? <TrendingUp color="success" /> : <TrendingDown color="error" />)}
            </Box>
          );
        }
      },
      {
        accessorKey: 'debtor',
        header: t('hawala.debtor') || 'Debtor',
        size: 150,
        Cell: ({ row }) => {
          const isBalanced = row.original.net_position === 0;

          if (isBalanced) {
            return (
              <Chip
                icon={<Balance />}
                label={t('hawala.balanced') || 'Balanced'}
                size="small"
                color="default"
              />
            );
          }

          return (
            <Chip
              label={row.original.debtor}
              size="small"
              color={row.original.debtor === row.original.hawaladar2_name ? 'error' : 'success'}
            />
          );
        }
      }
    ],
    [t, i18n.language]
  );

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ py: 1.5 }}>
              <Typography color="text.secondary" gutterBottom variant="body2">
                {t('hawala.totalPairs') || 'Total Pairs'}
              </Typography>
              <Typography variant="h5">
                {summary.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ py: 1.5 }}>
              <Typography color="text.secondary" gutterBottom variant="body2">
                {t('hawala.creditorPositions') || 'Creditor Positions'}
              </Typography>
              <Typography variant="h5" color="success.main">
                {formatCurrency(summary.totalPositive)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedCurrency ? currencies.find(c => c.id === selectedCurrency)?.code : 'All'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ py: 1.5 }}>
              <Typography color="text.secondary" gutterBottom variant="body2">
                {t('hawala.debtorPositions') || 'Debtor Positions'}
              </Typography>
              <Typography variant="h5" color="error.main">
                {formatCurrency(summary.totalNegative)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedCurrency ? currencies.find(c => c.id === selectedCurrency)?.code : 'All'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ py: 1.5 }}>
              <Typography color="text.secondary" gutterBottom variant="body2">
                {t('hawala.balanced') || 'Balanced'}
              </Typography>
              <Typography variant="h5" color="text.secondary">
                {summary.balanced}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table */}
      <MaterialReactTable
        columns={columns}
        data={positions}
        enableColumnActions={false}
        enableColumnFilters={false}
        enablePagination={true}
        enableSorting={true}
        enableBottomToolbar={true}
        enableTopToolbar={true}
        muiTableBodyRowProps={{ hover: true }}
        state={{ isLoading: loading }}
        initialState={{
          density: 'compact',
          sorting: [{ id: 'net_position', desc: true }]
        }}
        renderTopToolbarCustomActions={() => (
          <Box sx={{ p: 1, minWidth: 250 }}>
            <TextField
              select
              size="small"
              fullWidth
              label={t('rates.currency') || 'Currency'}
              value={selectedCurrency}
              onChange={(e) => handleCurrencyChange(Number(e.target.value))}
            >
              <MenuItem value={0}>{t('common.all') || 'All Currencies'}</MenuItem>
              {currencies.map((currency) => (
                <MenuItem key={currency.id} value={currency.id}>
                  {currency.code} - {currency.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        )}
      />
    </Box>
  );
};
