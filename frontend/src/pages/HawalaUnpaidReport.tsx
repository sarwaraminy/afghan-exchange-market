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
import { Warning, Pending, Error as ErrorIcon } from '@mui/icons-material';
import { getHawaladars, getHawalaUnpaidTransactions } from '../services/api';
import type { Hawaladar, HawalaUnpaidTransaction } from '../types';

export const HawalaUnpaidReport = () => {
  const { t, i18n } = useTranslation();
  const [transactions, setTransactions] = useState<HawalaUnpaidTransaction[]>([]);
  const [hawaladars, setHawaladars] = useState<Hawaladar[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedHawaladar, setSelectedHawaladar] = useState<number>(0);
  const [minDays, setMinDays] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const hawaladarsData = await getHawaladars();
      setHawaladars(hawaladarsData);
      fetchTransactions();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
      setLoading(false);
    }
  };

  const fetchTransactions = async (status?: string, hawaladarId?: number, days?: number) => {
    try {
      setLoading(true);
      const params: any = {};
      if (status && status !== 'all') params.status = status;
      if (hawaladarId) params.hawaladar_id = hawaladarId;
      if (days) params.min_days = days;

      const data = await getHawalaUnpaidTransactions(params);
      setTransactions(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load unpaid transactions');
      setLoading(false);
    }
  };

  const handleFilterChange = (status: string, hawaladarId: number, days: number) => {
    setSelectedStatus(status);
    setSelectedHawaladar(hawaladarId);
    setMinDays(days);
    fetchTransactions(status, hawaladarId, days);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getAgingColor = (days: number): 'success' | 'warning' | 'error' => {
    if (days >= 7) return 'error';
    if (days >= 3) return 'warning';
    return 'success';
  };

  const summary = useMemo(() => {
    if (!Array.isArray(transactions)) {
      return { total: 0, totalAmount: 0, expiringSoon: 0, aged: 0 };
    }
    const total = transactions.length;
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const expiringSoon = transactions.filter(t => t.days_pending >= 5).length;
    const aged = transactions.filter(t => t.days_pending >= 3).length;

    return { total, totalAmount, expiringSoon, aged };
  }, [transactions]);

  const columns = useMemo<MRT_ColumnDef<HawalaUnpaidTransaction>[]>(
    () => [
      {
        accessorKey: 'reference_code',
        header: t('hawala.referenceCode') || 'Reference Code',
        size: 130,
        Cell: ({ cell }) => (
          <Chip label={cell.getValue<string>()} size="small" variant="outlined" />
        )
      },
      {
        accessorKey: 'sender_name',
        header: t('hawala.sender') || 'Sender',
        size: 120
      },
      {
        accessorKey: 'receiver_name',
        header: t('hawala.receiver') || 'Receiver',
        size: 120
      },
      {
        accessorKey: 'sender_hawaladar_name',
        header: t('hawala.senderAgent') || 'Sender Hawaladar',
        size: 130
      },
      {
        accessorKey: 'receiver_hawaladar_name',
        header: t('hawala.receiverAgent') || 'Receiver Hawaladar',
        size: 130
      },
      {
        accessorKey: 'amount',
        header: t('hawala.amount') || 'Amount',
        size: 120,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ row }) => (
          <Typography variant="body2" fontWeight={600}>
            {formatCurrency(row.original.amount)} {row.original.currency_code}
          </Typography>
        )
      },
      {
        accessorKey: 'status',
        header: t('hawala.status') || 'Status',
        size: 100,
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();
          const color = status === 'pending' ? 'warning' : 'info';
          return (
            <Chip
              label={t(`hawala.statuses.${status}`) || status}
              size="small"
              color={color}
            />
          );
        }
      },
      {
        accessorKey: 'days_pending',
        header: t('hawala.daysPending') || 'Days Pending',
        size: 100,
        muiTableHeadCellProps: { sx: { textAlign: 'center' } },
        muiTableBodyCellProps: { sx: { textAlign: 'center' } },
        Cell: ({ row }) => {
          const days = row.original.days_pending;
          const color = getAgingColor(days);

          return (
            <Chip
              label={`${days} ${t('common.days') || 'days'}`}
              size="small"
              color={color}
              icon={days >= 7 ? <ErrorIcon /> : days >= 3 ? <Warning /> : <Pending />}
            />
          );
        }
      },
      {
        accessorKey: 'created_at',
        header: t('hawala.createdAt') || 'Created',
        size: 110,
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString()
      },
      {
        accessorKey: 'expires_at',
        header: t('hawala.expiresAt') || 'Expires',
        size: 110,
        Cell: ({ row }) => {
          if (!row.original.expires_at) return '-';

          const expiresAt = new Date(row.original.expires_at);
          const now = new Date();
          const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          return (
            <Box>
              <Typography variant="body2">
                {expiresAt.toLocaleDateString()}
              </Typography>
              {daysUntilExpiry <= 0 && (
                <Typography variant="caption" color="error.main" fontWeight={600}>
                  {t('hawala.expired') || 'Expired'}
                </Typography>
              )}
            </Box>
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
                {t('hawala.totalUnpaid') || 'Total Unpaid'}
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
                {t('hawala.totalAmount') || 'Total Amount'}
              </Typography>
              <Typography variant="h5" color="primary.main">
                {formatCurrency(summary.totalAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'warning.light' }}>
            <CardContent sx={{ py: 1.5 }}>
              <Typography color="warning.dark" gutterBottom variant="body2" fontWeight={600}>
                {t('hawala.aged3Plus') || 'Aged 3+ Days'}
              </Typography>
              <Typography variant="h5" color="warning.dark">
                {summary.aged}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'error.light' }}>
            <CardContent sx={{ py: 1.5 }}>
              <Typography color="error.dark" gutterBottom variant="body2" fontWeight={600}>
                {t('hawala.expiringSoon') || 'Expiring Soon (5+ days)'}
              </Typography>
              <Typography variant="h5" color="error.dark">
                {summary.expiringSoon}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table */}
      <MaterialReactTable
        columns={columns}
        data={transactions}
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
          sorting: [{ id: 'days_pending', desc: true }]
        }}
        renderTopToolbarCustomActions={() => (
          <Box sx={{ p: 1, display: 'flex', gap: 1, flexWrap: 'wrap', width: '100%' }}>
            <TextField
              select
              size="small"
              label={t('hawala.status') || 'Status'}
              value={selectedStatus}
              onChange={(e) => handleFilterChange(e.target.value, selectedHawaladar, minDays)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">{t('common.all') || 'All'}</MenuItem>
              <MenuItem value="pending">{t('hawala.statuses.pending') || 'Pending'}</MenuItem>
              <MenuItem value="in_transit">{t('hawala.statuses.in_transit') || 'In Transit'}</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label={t('hawala.hawaladar') || 'Hawaladar'}
              value={selectedHawaladar}
              onChange={(e) => handleFilterChange(selectedStatus, Number(e.target.value), minDays)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value={0}>{t('common.all') || 'All Hawaladars'}</MenuItem>
              {hawaladars.map((hawaladar) => (
                <MenuItem key={hawaladar.id} value={hawaladar.id}>
                  {hawaladar.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label={t('hawala.minimumDays') || 'Minimum Days'}
              value={minDays}
              onChange={(e) => handleFilterChange(selectedStatus, selectedHawaladar, Number(e.target.value))}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value={0}>{t('common.all') || 'All'}</MenuItem>
              <MenuItem value={1}>1+ {t('common.days') || 'days'}</MenuItem>
              <MenuItem value={3}>3+ {t('common.days') || 'days'}</MenuItem>
              <MenuItem value={5}>5+ {t('common.days') || 'days'}</MenuItem>
              <MenuItem value={7}>7+ {t('common.days') || 'days'}</MenuItem>
            </TextField>
          </Box>
        )}
      />
    </Box>
  );
};
