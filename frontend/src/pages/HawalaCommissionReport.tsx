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
import { AccountBalance, TrendingUp } from '@mui/icons-material';
import { getHawaladars, getHawalaCommissionReport } from '../services/api';
import type { Hawaladar, HawalaCommissionReport } from '../types';

export const HawalaCommissionReportPage = () => {
  const { t, i18n } = useTranslation();
  const [reports, setReports] = useState<HawalaCommissionReport[]>([]);
  const [hawaladars, setHawaladars] = useState<Hawaladar[]>([]);
  const [selectedHawaladar, setSelectedHawaladar] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
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

      // Set default date range (last 30 days)
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);

      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];

      setStartDate(startStr);
      setEndDate(endStr);

      fetchReports(startStr, endStr, 0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
      setLoading(false);
    }
  };

  const fetchReports = async (start?: string, end?: string, hawaladarId?: number) => {
    try {
      setLoading(true);
      const params: any = {};
      if (start) params.start_date = start;
      if (end) params.end_date = end;
      if (hawaladarId) params.hawaladar_id = hawaladarId;

      const data = await getHawalaCommissionReport(params);
      setReports(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load commission report');
      setLoading(false);
    }
  };

  const handleFilterChange = (start: string, end: string, hawaladarId: number) => {
    setStartDate(start);
    setEndDate(end);
    setSelectedHawaladar(hawaladarId);
    fetchReports(start, end, hawaladarId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const summary = useMemo(() => {
    const totalTransactions = reports.reduce((sum, r) => sum + r.total_transactions, 0);
    const totalCommission = reports.reduce((sum, r) => sum + r.total_commission, 0);
    const topEarner = reports.length > 0
      ? reports.reduce((max, r) => r.total_commission > max.total_commission ? r : max, reports[0])
      : null;

    return { totalTransactions, totalCommission, topEarner, totalHawaladars: reports.length };
  }, [reports]);

  const columns = useMemo<MRT_ColumnDef<HawalaCommissionReport>[]>(
    () => [
      {
        accessorKey: 'hawaladar_name',
        header: t('hawala.hawaladar') || 'Hawaladar',
        size: 200,
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
        accessorKey: 'total_transactions',
        header: t('hawala.totalTransactions') || 'Total Transactions',
        size: 150,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ cell }) => (
          <Typography variant="body2">
            {cell.getValue<number>().toLocaleString()}
          </Typography>
        )
      },
      {
        accessorKey: 'total_commission',
        header: t('hawala.totalCommission') || 'Total Commission',
        size: 180,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ row }) => (
          <Typography variant="body2" fontWeight={700} color="success.main">
            {formatCurrency(row.original.total_commission)} {row.original.currency_code}
          </Typography>
        )
      },
      {
        accessorKey: 'currency_code',
        header: t('rates.currency') || 'Currency',
        size: 100,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontWeight={600}>
            {cell.getValue<string>()}
          </Typography>
        )
      },
      {
        id: 'avg_commission',
        header: t('hawala.avgCommission') || 'Avg per Transaction',
        size: 150,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ row }) => {
          const avg = row.original.total_transactions > 0
            ? row.original.total_commission / row.original.total_transactions
            : 0;

          return (
            <Typography variant="body2" color="text.secondary">
              {formatCurrency(avg)} {row.original.currency_code}
            </Typography>
          );
        }
      }
    ],
    [t, i18n.language]
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('hawala.commissionReport') || 'Commission Report'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('hawala.commissionReportDescription') || 'View commission earnings by hawaladar'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                {t('hawala.totalHawaladars') || 'Total Hawaladars'}
              </Typography>
              <Typography variant="h4">
                {summary.totalHawaladars}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                {t('hawala.totalTransactions') || 'Total Transactions'}
              </Typography>
              <Typography variant="h4">
                {summary.totalTransactions.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light' }}>
            <CardContent>
              <Typography color="success.dark" gutterBottom variant="body2" fontWeight={600}>
                {t('hawala.totalCommission') || 'Total Commission'}
              </Typography>
              <Typography variant="h4" color="success.dark">
                {formatCurrency(summary.totalCommission)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUp fontSize="small" />
                <Typography color="primary.dark" variant="body2" fontWeight={600}>
                  {t('hawala.topEarner') || 'Top Earner'}
                </Typography>
              </Box>
              <Typography variant="body1" color="primary.dark" fontWeight={700} noWrap>
                {summary.topEarner?.hawaladar_name || '-'}
              </Typography>
              <Typography variant="caption" color="primary.dark">
                {summary.topEarner ? formatCurrency(summary.topEarner.total_commission) : ''}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label={t('common.startDate') || 'Start Date'}
              value={startDate}
              onChange={(e) => handleFilterChange(e.target.value, endDate, selectedHawaladar)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label={t('common.endDate') || 'End Date'}
              value={endDate}
              onChange={(e) => handleFilterChange(startDate, e.target.value, selectedHawaladar)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label={t('hawala.hawaladar') || 'Hawaladar'}
              value={selectedHawaladar}
              onChange={(e) => handleFilterChange(startDate, endDate, Number(e.target.value))}
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
            sorting: [{ id: 'total_commission', desc: true }]
          }}
        />
      </Paper>
    </Container>
  );
};
