import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import {
  Container,
  Typography,
  Paper,
  Box,
  MenuItem,
  TextField,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalance } from '@mui/icons-material';
import { getHawaladars, getHawalaDailyCashFlow } from '../services/api';
import type { Hawaladar, HawalaDailyCashFlow } from '../types';

export const HawalaDailyCashFlowReportPage = () => {
  const { t, i18n } = useTranslation();
  const [reports, setReports] = useState<HawalaDailyCashFlow[]>([]);
  const [hawaladars, setHawaladars] = useState<Hawaladar[]>([]);
  const [selectedHawaladar, setSelectedHawaladar] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isRtl = i18n.language === 'fa' || i18n.language === 'ps';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const hawaladarsData = await getHawaladars();
      setHawaladars(hawaladarsData);

      // Set default date (today)
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);

      fetchReports(today, 0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
      setLoading(false);
    }
  };

  const fetchReports = async (date?: string, hawaladarId?: number) => {
    try {
      setLoading(true);
      const params: any = {};
      if (date) params.date = date;
      if (hawaladarId) params.hawaladar_id = hawaladarId;

      const data = await getHawalaDailyCashFlow(params);
      setReports(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load daily cash flow');
      setLoading(false);
    }
  };

  const handleFilterChange = (date: string, hawaladarId: number) => {
    setSelectedDate(date);
    setSelectedHawaladar(hawaladarId);
    fetchReports(date, hawaladarId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const summary = useMemo(() => {
    if (!Array.isArray(reports)) {
      return {
        totalCashIn: 0,
        totalCashOut: 0,
        netFlow: 0,
        totalTransactionsIn: 0,
        totalTransactionsOut: 0,
        totalHawaladars: 0
      };
    }
    const totalCashIn = reports.reduce((sum, r) => sum + r.cash_in, 0);
    const totalCashOut = reports.reduce((sum, r) => sum + r.cash_out, 0);
    const netFlow = totalCashIn - totalCashOut;
    const totalTransactionsIn = reports.reduce((sum, r) => sum + r.transactions_in_count, 0);
    const totalTransactionsOut = reports.reduce((sum, r) => sum + r.transactions_out_count, 0);

    return {
      totalCashIn,
      totalCashOut,
      netFlow,
      totalTransactionsIn,
      totalTransactionsOut,
      totalHawaladars: reports.length
    };
  }, [reports]);

  const columns = useMemo<MRT_ColumnDef<HawalaDailyCashFlow>[]>(
    () => [
      {
        accessorKey: 'hawaladar_name',
        header: t('hawala.hawaladar') || 'Hawaladar',
        size: 180,
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalance fontSize="small" color="primary" />
            <Typography variant="body2" fontWeight={600}>
              {row.original.hawaladar_name}
            </Typography>
          </Box>
        )
      },
      {
        accessorKey: 'opening_balance',
        header: t('hawala.openingBalance') || 'Opening Balance',
        size: 140,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {formatCurrency(row.original.opening_balance)} {row.original.currency_code}
          </Typography>
        )
      },
      {
        accessorKey: 'cash_in',
        header: t('hawala.cashIn') || 'Cash In',
        size: 140,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ row }) => (
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" fontWeight={600} color="success.main">
              {formatCurrency(row.original.cash_in)} {row.original.currency_code}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.transactions_in_count} {t('hawala.transactions') || 'txns'}
            </Typography>
          </Box>
        )
      },
      {
        accessorKey: 'cash_out',
        header: t('hawala.cashOut') || 'Cash Out',
        size: 140,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ row }) => (
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" fontWeight={600} color="error.main">
              {formatCurrency(row.original.cash_out)} {row.original.currency_code}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.transactions_out_count} {t('hawala.transactions') || 'txns'}
            </Typography>
          </Box>
        )
      },
      {
        id: 'net_flow',
        header: t('hawala.netFlow') || 'Net Flow',
        size: 140,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ row }) => {
          const netFlow = row.original.cash_in - row.original.cash_out;
          const isPositive = netFlow > 0;

          return (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body2"
                fontWeight={700}
                color={isPositive ? 'success.main' : netFlow < 0 ? 'error.main' : 'text.secondary'}
              >
                {isPositive && '+'}{formatCurrency(netFlow)} {row.original.currency_code}
              </Typography>
              {netFlow !== 0 && (isPositive ? <TrendingUp color="success" /> : <TrendingDown color="error" />)}
            </Box>
          );
        }
      },
      {
        accessorKey: 'closing_balance',
        header: t('hawala.closingBalance') || 'Closing Balance',
        size: 140,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ row }) => (
          <Typography variant="body2" fontWeight={700} color="primary.main">
            {formatCurrency(row.original.closing_balance)} {row.original.currency_code}
          </Typography>
        )
      }
    ],
    [t, i18n.language]
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('hawala.dailyCashFlowReport') || 'Daily Cash Flow Report'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('hawala.dailyCashFlowDescription') || 'View daily cash flow activity for hawaladars'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUp fontSize="small" />
                <Typography color="success.dark" variant="body2" fontWeight={600}>
                  {t('hawala.totalCashIn') || 'Total Cash In'}
                </Typography>
              </Box>
              <Typography variant="h5" color="success.dark">
                {formatCurrency(summary.totalCashIn)}
              </Typography>
              <Typography variant="caption" color="success.dark">
                {summary.totalTransactionsIn} {t('hawala.transactions') || 'transactions'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingDown fontSize="small" />
                <Typography color="error.dark" variant="body2" fontWeight={600}>
                  {t('hawala.totalCashOut') || 'Total Cash Out'}
                </Typography>
              </Box>
              <Typography variant="h5" color="error.dark">
                {formatCurrency(summary.totalCashOut)}
              </Typography>
              <Typography variant="caption" color="error.dark">
                {summary.totalTransactionsOut} {t('hawala.transactions') || 'transactions'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: summary.netFlow >= 0 ? 'success.light' : 'error.light' }}>
            <CardContent>
              <Typography
                color={summary.netFlow >= 0 ? 'success.dark' : 'error.dark'}
                gutterBottom
                variant="body2"
                fontWeight={600}
              >
                {t('hawala.netFlow') || 'Net Flow'}
              </Typography>
              <Typography variant="h5" color={summary.netFlow >= 0 ? 'success.dark' : 'error.dark'}>
                {summary.netFlow >= 0 && '+'}{formatCurrency(summary.netFlow)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                {t('hawala.activeHawaladars') || 'Active Hawaladars'}
              </Typography>
              <Typography variant="h5">
                {summary.totalHawaladars}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label={t('common.date') || 'Date'}
              value={selectedDate}
              onChange={(e) => handleFilterChange(e.target.value, selectedHawaladar)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label={t('hawala.hawaladar') || 'Hawaladar'}
              value={selectedHawaladar}
              onChange={(e) => handleFilterChange(selectedDate, Number(e.target.value))}
            >
              <MenuItem value={0}>{t('common.all') || 'All Hawaladars'}</MenuItem>
              {hawaladars.map((hawaladar) => (
                <MenuItem key={hawaladar.id} value={hawaladar.id}>
                  {hawaladar.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <Paper>
        <MaterialReactTable
          columns={columns}
          data={reports}
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
            sorting: [{ id: 'closing_balance', desc: true }]
          }}
        />
      </Paper>
    </Container>
  );
};
