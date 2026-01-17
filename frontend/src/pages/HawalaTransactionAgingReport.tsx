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
  Grid,
  Chip
} from '@mui/material';
import { Schedule, Warning, Error as ErrorIcon, CheckCircle } from '@mui/icons-material';
import { getHawaladars, getHawalaTransactionAging } from '../services/api';
import type { Hawaladar, HawalaTransactionAging } from '../types';

export const HawalaTransactionAgingReportPage = () => {
  const { t, i18n } = useTranslation();
  const [reports, setReports] = useState<HawalaTransactionAging[]>([]);
  const [hawaladars, setHawaladars] = useState<Hawaladar[]>([]);
  const [selectedHawaladar, setSelectedHawaladar] = useState<number>(0);
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
      fetchReports(0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
      setLoading(false);
    }
  };

  const fetchReports = async (hawaladarId?: number) => {
    try {
      setLoading(true);
      const data = await getHawalaTransactionAging(hawaladarId || undefined);
      setReports(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load transaction aging');
      setLoading(false);
    }
  };

  const handleHawaladarChange = (hawaladarId: number) => {
    setSelectedHawaladar(hawaladarId);
    fetchReports(hawaladarId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getAgeBracketInfo = (bracket: string): { color: 'success' | 'info' | 'warning' | 'error', icon: React.ReactNode, label: string } => {
    if (bracket.includes('0-24')) {
      return { color: 'success', icon: <CheckCircle />, label: t('hawala.fresh') || '0-24 hours' };
    } else if (bracket.includes('1-3')) {
      return { color: 'info', icon: <Schedule />, label: t('hawala.recent') || '1-3 days' };
    } else if (bracket.includes('3-7')) {
      return { color: 'warning', icon: <Warning />, label: t('hawala.aging') || '3-7 days' };
    } else {
      return { color: 'error', icon: <ErrorIcon />, label: t('hawala.critical') || '7+ days' };
    }
  };

  const summary = useMemo(() => {
    const totalTransactions = reports.reduce((sum, r) => sum + r.count, 0);
    const totalAmount = reports.reduce((sum, r) => sum + r.total_amount, 0);
    const critical = reports.find(r => r.age_bracket.includes('7+'))?.count || 0;
    const aging = reports.find(r => r.age_bracket.includes('3-7'))?.count || 0;

    return { totalTransactions, totalAmount, critical, aging };
  }, [reports]);

  const columns = useMemo<MRT_ColumnDef<HawalaTransactionAging>[]>(
    () => [
      {
        accessorKey: 'age_bracket',
        header: t('hawala.ageBracket') || 'Age Bracket',
        size: 200,
        Cell: ({ cell }) => {
          const bracket = cell.getValue<string>();
          const info = getAgeBracketInfo(bracket);

          return (
            <Chip
              icon={info.icon}
              label={bracket}
              color={info.color}
              variant="outlined"
            />
          );
        }
      },
      {
        accessorKey: 'count',
        header: t('hawala.transactionCount') || 'Transaction Count',
        size: 150,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ row }) => {
          const bracket = row.original.age_bracket;
          const info = getAgeBracketInfo(bracket);

          return (
            <Typography variant="h6" fontWeight={700} color={`${info.color}.main`}>
              {row.original.count.toLocaleString()}
            </Typography>
          );
        }
      },
      {
        accessorKey: 'total_amount',
        header: t('hawala.totalAmount') || 'Total Amount',
        size: 180,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ row }) => (
          <Typography variant="body2" fontWeight={600}>
            {formatCurrency(row.original.total_amount)} {row.original.currency_code}
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
        id: 'percentage',
        header: t('common.percentage') || 'Percentage',
        size: 120,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ row }) => {
          const total = reports.reduce((sum, r) => sum + r.count, 0);
          const percentage = total > 0 ? (row.original.count / total) * 100 : 0;

          return (
            <Typography variant="body2" color="text.secondary">
              {percentage.toFixed(1)}%
            </Typography>
          );
        }
      },
      {
        id: 'avg_amount',
        header: t('hawala.avgAmount') || 'Avg Amount',
        size: 150,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ row }) => {
          const avg = row.original.count > 0
            ? row.original.total_amount / row.original.count
            : 0;

          return (
            <Typography variant="body2" color="text.secondary">
              {formatCurrency(avg)} {row.original.currency_code}
            </Typography>
          );
        }
      }
    ],
    [t, i18n.language, reports]
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('hawala.transactionAgingReport') || 'Transaction Aging Report'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('hawala.transactionAgingDescription') || 'Analyze pending transactions by age brackets'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                {t('hawala.totalPending') || 'Total Pending'}
              </Typography>
              <Typography variant="h4">
                {summary.totalTransactions.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                {t('hawala.totalAmount') || 'Total Amount'}
              </Typography>
              <Typography variant="h4" color="primary.main">
                {formatCurrency(summary.totalAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Warning fontSize="small" />
                <Typography color="warning.dark" variant="body2" fontWeight={600}>
                  {t('hawala.aging') || 'Aging (3-7 days)'}
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.dark">
                {summary.aging.toLocaleString()}
              </Typography>
              {summary.totalTransactions > 0 && (
                <Typography variant="caption" color="warning.dark">
                  {((summary.aging / summary.totalTransactions) * 100).toFixed(1)}%
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ErrorIcon fontSize="small" />
                <Typography color="error.dark" variant="body2" fontWeight={600}>
                  {t('hawala.critical') || 'Critical (7+ days)'}
                </Typography>
              </Box>
              <Typography variant="h4" color="error.dark">
                {summary.critical.toLocaleString()}
              </Typography>
              {summary.totalTransactions > 0 && (
                <Typography variant="caption" color="error.dark">
                  {((summary.critical / summary.totalTransactions) * 100).toFixed(1)}%
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          select
          fullWidth
          label={t('hawala.hawaladar') || 'Hawaladar'}
          value={selectedHawaladar}
          onChange={(e) => handleHawaladarChange(Number(e.target.value))}
        >
          <MenuItem value={0}>{t('common.all') || 'All Hawaladars'}</MenuItem>
          {hawaladars.map((hawaladar) => (
            <MenuItem key={hawaladar.id} value={hawaladar.id}>
              {hawaladar.name}
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {/* Visual Breakdown */}
      {reports.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('hawala.agingBreakdown') || 'Aging Breakdown'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
            {reports.map((report) => {
              const info = getAgeBracketInfo(report.age_bracket);
              const percentage = summary.totalTransactions > 0
                ? (report.count / summary.totalTransactions) * 100
                : 0;

              return (
                <Card key={report.age_bracket} sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {info.icon}
                      <Typography variant="body2" fontWeight={600} color={`${info.color}.main`}>
                        {report.age_bracket}
                      </Typography>
                    </Box>
                    <Typography variant="h5" color={`${info.color}.main`}>
                      {report.count.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(report.total_amount)} {report.currency_code}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {percentage.toFixed(1)}% {t('common.ofTotal') || 'of total'}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Paper>
      )}

      {/* Table */}
      <Paper>
        <MaterialReactTable
          columns={columns}
          data={reports}
          enableColumnActions={false}
          enableColumnFilters={false}
          enablePagination={false}
          enableSorting={false}
          enableBottomToolbar={false}
          enableTopToolbar={false}
          muiTableBodyRowProps={{ hover: true }}
          state={{ isLoading: loading }}
        />
      </Paper>

      {/* Alert for Critical Transactions */}
      {summary.critical > 0 && (
        <Alert severity="error" sx={{ mt: 3 }}>
          <Typography variant="body2" fontWeight={600}>
            ⚠️ {t('hawala.criticalAlert') || 'Action Required'}
          </Typography>
          <Typography variant="body2">
            {summary.critical} {t('hawala.transactionsExpiringSoon') || 'transactions are 7+ days old and will expire soon. Please follow up immediately.'}
          </Typography>
        </Alert>
      )}

      {summary.aging > 0 && summary.critical === 0 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2" fontWeight={600}>
            {t('hawala.agingAlert') || 'Monitor Required'}
          </Typography>
          <Typography variant="body2">
            {summary.aging} {t('hawala.transactionsAging') || 'transactions are 3-7 days old. Consider following up with customers.'}
          </Typography>
        </Alert>
      )}
    </Container>
  );
};
