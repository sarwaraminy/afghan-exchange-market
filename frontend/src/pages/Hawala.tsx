import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Receipt,
  People,
  Assessment,
  CheckCircle,
  LocalShipping,
  Cancel,
  Search
} from '@mui/icons-material';
import {
  getHawaladars,
  createHawaladar,
  updateHawaladar,
  deleteHawaladar,
  getHawalaTransactions,
  getHawalaTransactionByCode,
  createHawalaTransaction,
  updateHawalaTransaction,
  updateHawalaTransactionStatus,
  deleteHawalaTransaction,
  getHawalaReportsSummary,
  getHawalaReportsByAgent,
  getHawalaReportsByCurrency,
  getCurrencies
} from '../services/api';
import type { Hawaladar, HawalaTransaction, HawalaReportSummary, HawalaAgentReport, HawalaCurrencyReport, Currency } from '../types';
import { Loading } from '../components/common/Loading';
import { useAuth } from '../context/AuthContext';

export const Hawala = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const isRtl = i18n.language === 'fa' || i18n.language === 'ps';

  const [selectedSection, setSelectedSection] = useState(0);
  const [loading, setLoading] = useState(true);

  // Data states
  const [transactions, setTransactions] = useState<HawalaTransaction[]>([]);
  const [hawaladars, setHawaladars] = useState<Hawaladar[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [reportSummary, setReportSummary] = useState<HawalaReportSummary | null>(null);
  const [agentReports, setAgentReports] = useState<HawalaAgentReport[]>([]);
  const [currencyReports, setCurrencyReports] = useState<HawalaCurrencyReport[]>([]);

  // Dialog states
  const [transactionDialog, setTransactionDialog] = useState(false);
  const [hawaladarDialog, setHawaladarDialog] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);
  const [searchDialog, setSearchDialog] = useState(false);

  // Selected items
  const [selectedTransaction, setSelectedTransaction] = useState<HawalaTransaction | null>(null);
  const [selectedHawaladar, setSelectedHawaladar] = useState<Hawaladar | null>(null);

  // Forms
  const [transactionForm, setTransactionForm] = useState({
    sender_name: '',
    sender_phone: '',
    sender_hawaladar_id: '',
    receiver_name: '',
    receiver_phone: '',
    receiver_hawaladar_id: '',
    amount: '',
    currency_id: '',
    commission_rate: '2.0',
    notes: ''
  });

  const [hawaladarForm, setHawaladarForm] = useState({
    name: '',
    name_fa: '',
    name_ps: '',
    phone: '',
    location: '',
    location_fa: '',
    location_ps: '',
    commission_rate: '2.0',
    is_active: 1
  });

  const [newStatus, setNewStatus] = useState<string>('');
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState<HawalaTransaction | null>(null);
  const [searchError, setSearchError] = useState('');

  const [error, setError] = useState('');

  const menuItems = [
    { label: t('hawala.transactions'), icon: <Receipt /> },
    { label: t('hawala.agents'), icon: <People /> },
    { label: t('hawala.reports'), icon: <Assessment /> }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transactionsData, hawaladarsData, currenciesData] = await Promise.all([
        getHawalaTransactions(),
        getHawaladars(),
        getCurrencies()
      ]);
      setTransactions(transactionsData.transactions);
      setHawaladars(hawaladarsData);
      setCurrencies(currenciesData);

      // Fetch reports
      const [summaryData, agentData, currencyData] = await Promise.all([
        getHawalaReportsSummary(),
        getHawalaReportsByAgent(),
        getHawalaReportsByCurrency()
      ]);
      setReportSummary(summaryData.summary);
      setAgentReports(agentData);
      setCurrencyReports(currencyData);
    } catch (error) {
      console.error('Error fetching hawala data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Transaction handlers
  const handleNewTransaction = () => {
    setSelectedTransaction(null);
    setTransactionForm({
      sender_name: '',
      sender_phone: '',
      sender_hawaladar_id: '',
      receiver_name: '',
      receiver_phone: '',
      receiver_hawaladar_id: '',
      amount: '',
      currency_id: currencies[0]?.id.toString() || '',
      commission_rate: '2.0',
      notes: ''
    });
    setError('');
    setTransactionDialog(true);
  };

  const handleEditTransaction = (transaction: HawalaTransaction) => {
    setSelectedTransaction(transaction);
    setTransactionForm({
      sender_name: transaction.sender_name,
      sender_phone: transaction.sender_phone || '',
      sender_hawaladar_id: transaction.sender_hawaladar_id?.toString() || '',
      receiver_name: transaction.receiver_name,
      receiver_phone: transaction.receiver_phone || '',
      receiver_hawaladar_id: transaction.receiver_hawaladar_id?.toString() || '',
      amount: transaction.amount.toString(),
      currency_id: transaction.currency_id.toString(),
      commission_rate: transaction.commission_rate.toString(),
      notes: transaction.notes || ''
    });
    setError('');
    setTransactionDialog(true);
  };

  const handleSaveTransaction = async () => {
    try {
      const data = {
        sender_name: transactionForm.sender_name,
        sender_phone: transactionForm.sender_phone || undefined,
        sender_hawaladar_id: transactionForm.sender_hawaladar_id ? parseInt(transactionForm.sender_hawaladar_id) : undefined,
        receiver_name: transactionForm.receiver_name,
        receiver_phone: transactionForm.receiver_phone || undefined,
        receiver_hawaladar_id: transactionForm.receiver_hawaladar_id ? parseInt(transactionForm.receiver_hawaladar_id) : undefined,
        amount: parseFloat(transactionForm.amount),
        currency_id: parseInt(transactionForm.currency_id),
        commission_rate: parseFloat(transactionForm.commission_rate),
        notes: transactionForm.notes || undefined
      };

      if (selectedTransaction) {
        await updateHawalaTransaction(selectedTransaction.id, data);
      } else {
        await createHawalaTransaction(data);
      }
      setTransactionDialog(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || t('hawala.failedSaveTransaction'));
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (confirm(t('hawala.confirmDeleteTransaction'))) {
      try {
        await deleteHawalaTransaction(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const handleChangeStatus = (transaction: HawalaTransaction) => {
    setSelectedTransaction(transaction);
    setNewStatus(transaction.status);
    setStatusDialog(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedTransaction) return;
    try {
      await updateHawalaTransactionStatus(selectedTransaction.id, newStatus as 'pending' | 'in_transit' | 'completed' | 'cancelled');
      setStatusDialog(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || t('hawala.failedUpdateStatus'));
    }
  };

  const handleSearchByCode = async () => {
    if (!searchCode.trim()) return;
    setSearchError('');
    setSearchResult(null);
    try {
      const result = await getHawalaTransactionByCode(searchCode.trim());
      setSearchResult(result);
    } catch (err: any) {
      setSearchError(err.response?.data?.error || t('hawala.transactionNotFound'));
    }
  };

  // Hawaladar handlers
  const handleNewHawaladar = () => {
    setSelectedHawaladar(null);
    setHawaladarForm({
      name: '',
      name_fa: '',
      name_ps: '',
      phone: '',
      location: '',
      location_fa: '',
      location_ps: '',
      commission_rate: '2.0',
      is_active: 1
    });
    setError('');
    setHawaladarDialog(true);
  };

  const handleEditHawaladar = (hawaladar: Hawaladar) => {
    setSelectedHawaladar(hawaladar);
    setHawaladarForm({
      name: hawaladar.name,
      name_fa: hawaladar.name_fa || '',
      name_ps: hawaladar.name_ps || '',
      phone: hawaladar.phone || '',
      location: hawaladar.location,
      location_fa: hawaladar.location_fa || '',
      location_ps: hawaladar.location_ps || '',
      commission_rate: hawaladar.commission_rate.toString(),
      is_active: hawaladar.is_active
    });
    setError('');
    setHawaladarDialog(true);
  };

  const handleSaveHawaladar = async () => {
    try {
      const data = {
        name: hawaladarForm.name,
        name_fa: hawaladarForm.name_fa || undefined,
        name_ps: hawaladarForm.name_ps || undefined,
        phone: hawaladarForm.phone || undefined,
        location: hawaladarForm.location,
        location_fa: hawaladarForm.location_fa || undefined,
        location_ps: hawaladarForm.location_ps || undefined,
        commission_rate: parseFloat(hawaladarForm.commission_rate),
        is_active: hawaladarForm.is_active
      };

      if (selectedHawaladar) {
        await updateHawaladar(selectedHawaladar.id, data);
      } else {
        await createHawaladar(data);
      }
      setHawaladarDialog(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || t('hawala.failedSaveHawaladar'));
    }
  };

  const handleDeleteHawaladar = async (id: number) => {
    if (confirm(t('hawala.confirmDeleteHawaladar'))) {
      try {
        await deleteHawaladar(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting hawaladar:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_transit': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Receipt fontSize="small" />;
      case 'in_transit': return <LocalShipping fontSize="small" />;
      case 'completed': return <CheckCircle fontSize="small" />;
      case 'cancelled': return <Cancel fontSize="small" />;
      default: return undefined;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  const transactionColumns = useMemo<MRT_ColumnDef<HawalaTransaction>[]>(
    () => [
      {
        accessorKey: 'reference_code',
        header: t('hawala.referenceCode'),
        size: 130,
        Cell: ({ cell }) => (
          <Chip label={cell.getValue<string>()} size="small" variant="outlined" />
        )
      },
      {
        accessorKey: 'sender_name',
        header: t('hawala.sender'),
        size: 150,
        Cell: ({ row }) => (
          <Box>
            <Typography variant="body2" noWrap>{row.original.sender_name}</Typography>
            {row.original.sender_hawaladar_name && (
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                {row.original.sender_hawaladar_name}
              </Typography>
            )}
          </Box>
        )
      },
      {
        accessorKey: 'receiver_name',
        header: t('hawala.receiver'),
        size: 150,
        Cell: ({ row }) => (
          <Box>
            <Typography variant="body2" noWrap>{row.original.receiver_name}</Typography>
            {row.original.receiver_hawaladar_name && (
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                {row.original.receiver_hawaladar_name}
              </Typography>
            )}
          </Box>
        )
      },
      {
        accessorKey: 'amount',
        header: t('hawala.amount'),
        size: 140,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ row }) => (
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" noWrap>
              {formatCurrency(row.original.amount)} {row.original.currency_code}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              +{formatCurrency(row.original.commission_amount)}
            </Typography>
          </Box>
        )
      },
      {
        accessorKey: 'status',
        header: t('hawala.status'),
        size: 130,
        muiTableHeadCellProps: { sx: { textAlign: 'center' } },
        muiTableBodyCellProps: { sx: { textAlign: 'center' } },
        Cell: ({ cell }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Chip
              icon={getStatusIcon(cell.getValue<string>())}
              label={isMobile ? undefined : t(`hawala.statuses.${cell.getValue<string>()}`)}
              color={getStatusColor(cell.getValue<string>()) as any}
              size="small"
            />
          </Box>
        )
      },
      ...(!isMobile ? [{
        accessorKey: 'created_at' as const,
        header: t('hawala.date'),
        size: 110,
        muiTableHeadCellProps: { sx: { textAlign: 'center' } },
        muiTableBodyCellProps: { sx: { textAlign: 'center' } },
        Cell: ({ cell }: { cell: any }) => (
          <Box sx={{ textAlign: 'center' }}>
            {new Date(cell.getValue<string>()).toLocaleDateString()}
          </Box>
        )
      }] : []),
      {
        id: 'actions',
        header: t('admin.actions'),
        size: 120,
        muiTableHeadCellProps: { sx: { textAlign: 'center' } },
        muiTableBodyCellProps: { sx: { textAlign: 'center' } },
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            {isAdmin && (
              <>
                <IconButton size="small" onClick={() => handleChangeStatus(row.original)} title={t('hawala.changeStatus')}>
                  <LocalShipping fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleEditTransaction(row.original)}>
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDeleteTransaction(row.original.id)} color="error">
                  <Delete fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        )
      }
    ],
    [t, i18n.language, isAdmin, isMobile]
  );

  const hawaladarColumns = useMemo<MRT_ColumnDef<Hawaladar>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('hawala.name'),
        size: 150
      },
      {
        accessorKey: 'location',
        header: t('hawala.location'),
        size: 150
      },
      ...(!isMobile ? [{
        accessorKey: 'phone' as const,
        header: t('hawala.phone'),
        size: 130
      }] : []),
      {
        accessorKey: 'commission_rate',
        header: isMobile ? '%' : t('hawala.commissionRate'),
        size: 100,
        muiTableHeadCellProps: { sx: { textAlign: 'center' } },
        muiTableBodyCellProps: { sx: { textAlign: 'center' } },
        Cell: ({ cell }) => (
          <Box sx={{ textAlign: 'center' }}>{cell.getValue<number>()}%</Box>
        )
      },
      {
        accessorKey: 'is_active',
        header: t('hawala.statusActive'),
        size: 100,
        muiTableHeadCellProps: { sx: { textAlign: 'center' } },
        muiTableBodyCellProps: { sx: { textAlign: 'center' } },
        Cell: ({ cell }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Chip
              label={cell.getValue<number>() ? t('hawala.active') : t('hawala.inactive')}
              color={cell.getValue<number>() ? 'success' : 'default'}
              size="small"
            />
          </Box>
        )
      },
      {
        id: 'actions',
        size: 110,
        header: t('admin.actions'),
        muiTableHeadCellProps: { sx: { textAlign: 'center' } },
        muiTableBodyCellProps: { sx: { textAlign: 'center' } },
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            {isAdmin && (
              <>
                <IconButton size="small" onClick={() => handleEditHawaladar(row.original)}>
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDeleteHawaladar(row.original.id)} color="error">
                  <Delete fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        )
      }
    ],
    [t, i18n.language, isAdmin, isMobile]
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
          {t('hawala.title')}
        </Typography>
      </Box>
      <List disablePadding>
        {menuItems.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              selected={selectedSection === index}
              onClick={() => setSelectedSection(index)}
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
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: selectedSection === index ? '#1e3a5f' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: selectedSection === index ? 600 : 400,
                  color: selectedSection === index ? '#1e3a5f' : 'text.primary',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  const renderTransactions = () => (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={600}>{t('hawala.transactions')}</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={!isMobile ? <Search /> : undefined}
            onClick={() => setSearchDialog(true)}
            size={isMobile ? 'small' : 'medium'}
          >
            {isMobile ? <Search /> : t('hawala.searchByCode')}
          </Button>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={!isMobile ? <Add /> : undefined}
              onClick={handleNewTransaction}
              size={isMobile ? 'small' : 'medium'}
            >
              {isMobile ? <Add /> : t('hawala.newTransaction')}
            </Button>
          )}
        </Box>
      </Box>
      <Box sx={{ overflowX: 'auto', width: '100%' }}>
        <MaterialReactTable
          columns={transactionColumns}
          data={transactions}
          enablePagination
          enableSorting
          enableGlobalFilter
          enableDensityToggle
          initialState={{
            density: isMobile ? 'compact' : 'comfortable',
            pagination: { pageSize: isMobile ? 5 : 10, pageIndex: 0 }
          }}
          muiTableContainerProps={{
            sx: { maxWidth: '100%' }
          }}
          muiTableProps={{
            sx: {
              direction: isRtl ? 'rtl' : 'ltr',
              minWidth: isMobile ? 600 : 800
            }
          }}
          muiTableHeadCellProps={{
            sx: {
              py: isMobile ? 1 : 1.5,
              px: isMobile ? 1 : 2,
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              fontWeight: 600
            }
          }}
          muiTableBodyCellProps={{
            sx: {
              py: isMobile ? 0.5 : 1,
              px: isMobile ? 1 : 2
            }
          }}
          muiTopToolbarProps={{
            sx: { flexWrap: 'wrap', gap: 1 }
          }}
        />
      </Box>
    </>
  );

  const renderHawaladars = () => (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={600}>{t('hawala.agents')}</Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={!isMobile ? <Add /> : undefined}
            onClick={handleNewHawaladar}
            size={isMobile ? 'small' : 'medium'}
          >
            {isMobile ? <Add /> : t('hawala.addAgent')}
          </Button>
        )}
      </Box>
      <Box sx={{ overflowX: 'auto', width: '100%' }}>
        <MaterialReactTable
          columns={hawaladarColumns}
          data={hawaladars}
          enablePagination
          enableSorting
          enableGlobalFilter
          enableDensityToggle
          initialState={{
            density: isMobile ? 'compact' : 'comfortable',
            pagination: { pageSize: isMobile ? 5 : 10, pageIndex: 0 }
          }}
          muiTableContainerProps={{
            sx: { maxWidth: '100%' }
          }}
          muiTableProps={{
            sx: {
              direction: isRtl ? 'rtl' : 'ltr',
              minWidth: isMobile ? 450 : 650
            }
          }}
          muiTableHeadCellProps={{
            sx: {
              py: isMobile ? 1 : 1.5,
              px: isMobile ? 1 : 2,
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              fontWeight: 600
            }
          }}
          muiTableBodyCellProps={{
            sx: {
              py: isMobile ? 0.5 : 1,
              px: isMobile ? 1 : 2
            }
          }}
        />
      </Box>
    </>
  );

  const renderReports = () => (
    <>
      <Typography variant="h6" fontWeight={600} gutterBottom>{t('hawala.reports')}</Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">{t('hawala.totalTransactions')}</Typography>
              <Typography variant="h4" fontWeight={700}>{reportSummary?.total_transactions || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">{t('hawala.pending')}</Typography>
              <Typography variant="h4" fontWeight={700}>{reportSummary?.pending_count || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">{t('hawala.completed')}</Typography>
              <Typography variant="h4" fontWeight={700}>{reportSummary?.completed_count || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: '#f3e5f5' }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">{t('hawala.totalCommission')}</Typography>
              <Typography variant="h4" fontWeight={700}>{formatCurrency(reportSummary?.total_commission || 0)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Agent Reports */}
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>{t('hawala.byAgent')}</Typography>
      <Paper sx={{ mb: 3, overflow: 'auto' }}>
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
          <Box component="thead">
            <Box component="tr" sx={{ bgcolor: '#f5f5f5' }}>
              <Box component="th" sx={{ p: 1.5, textAlign: 'left' }}>{t('hawala.agent')}</Box>
              <Box component="th" sx={{ p: 1.5, textAlign: 'left' }}>{t('hawala.location')}</Box>
              <Box component="th" sx={{ p: 1.5, textAlign: 'right' }}>{t('hawala.sent')}</Box>
              <Box component="th" sx={{ p: 1.5, textAlign: 'right' }}>{t('hawala.received')}</Box>
              <Box component="th" sx={{ p: 1.5, textAlign: 'right' }}>{t('hawala.commissionEarned')}</Box>
            </Box>
          </Box>
          <Box component="tbody">
            {agentReports.map((agent) => (
              <Box component="tr" key={agent.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                <Box component="td" sx={{ p: 1.5, borderTop: '1px solid #eee' }}>{agent.name}</Box>
                <Box component="td" sx={{ p: 1.5, borderTop: '1px solid #eee' }}>{agent.location}</Box>
                <Box component="td" sx={{ p: 1.5, borderTop: '1px solid #eee', textAlign: 'right' }}>{agent.sent_count}</Box>
                <Box component="td" sx={{ p: 1.5, borderTop: '1px solid #eee', textAlign: 'right' }}>{agent.received_count}</Box>
                <Box component="td" sx={{ p: 1.5, borderTop: '1px solid #eee', textAlign: 'right' }}>{formatCurrency(agent.commission_earned)}</Box>
              </Box>
            ))}
            {agentReports.length === 0 && (
              <Box component="tr">
                <Box component="td" colSpan={5} sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                  {t('hawala.noData')}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Currency Reports */}
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>{t('hawala.byCurrency')}</Typography>
      <Paper sx={{ overflow: 'auto' }}>
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
          <Box component="thead">
            <Box component="tr" sx={{ bgcolor: '#f5f5f5' }}>
              <Box component="th" sx={{ p: 1.5, textAlign: 'left' }}>{t('hawala.currency')}</Box>
              <Box component="th" sx={{ p: 1.5, textAlign: 'right' }}>{t('hawala.transactionCount')}</Box>
              <Box component="th" sx={{ p: 1.5, textAlign: 'right' }}>{t('hawala.totalAmount')}</Box>
              <Box component="th" sx={{ p: 1.5, textAlign: 'right' }}>{t('hawala.totalCommission')}</Box>
            </Box>
          </Box>
          <Box component="tbody">
            {currencyReports.map((currency) => (
              <Box component="tr" key={currency.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                <Box component="td" sx={{ p: 1.5, borderTop: '1px solid #eee' }}>{currency.code} - {currency.name}</Box>
                <Box component="td" sx={{ p: 1.5, borderTop: '1px solid #eee', textAlign: 'right' }}>{currency.transaction_count}</Box>
                <Box component="td" sx={{ p: 1.5, borderTop: '1px solid #eee', textAlign: 'right' }}>{formatCurrency(currency.total_amount)}</Box>
                <Box component="td" sx={{ p: 1.5, borderTop: '1px solid #eee', textAlign: 'right' }}>{formatCurrency(currency.total_commission)}</Box>
              </Box>
            ))}
            {currencyReports.length === 0 && (
              <Box component="tr">
                <Box component="td" colSpan={4} sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                  {t('hawala.noData')}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </>
  );

  const renderContent = () => {
    switch (selectedSection) {
      case 0:
        return renderTransactions();
      case 1:
        return renderHawaladars();
      case 2:
        return renderReports();
      default:
        return null;
    }
  };

  if (loading) return <Loading />;

  return (
    <Container maxWidth="xl" sx={{ py: isMobile ? 2 : 4, px: isMobile ? 1 : 3 }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} gutterBottom>
        {t('hawala.title')}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 3,
        }}
      >
        {sidebar}

        <Paper sx={{ flex: 1, p: isMobile ? 1.5 : 3, borderRadius: 2, overflow: 'hidden' }}>
          {renderContent()}
        </Paper>
      </Box>

      {/* Transaction Dialog */}
      <Dialog open={transactionDialog} onClose={() => setTransactionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedTransaction ? t('hawala.editTransaction') : t('hawala.newTransaction')}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>{t('hawala.senderInfo')}</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('hawala.senderName')}
                value={transactionForm.sender_name}
                onChange={(e) => setTransactionForm({ ...transactionForm, sender_name: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('hawala.senderPhone')}
                value={transactionForm.sender_phone}
                onChange={(e) => setTransactionForm({ ...transactionForm, sender_phone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                label={t('hawala.senderAgent')}
                value={transactionForm.sender_hawaladar_id}
                onChange={(e) => setTransactionForm({ ...transactionForm, sender_hawaladar_id: e.target.value })}
              >
                <MenuItem value="">{t('hawala.selectAgent')}</MenuItem>
                {hawaladars.filter(h => h.is_active).map((h) => (
                  <MenuItem key={h.id} value={h.id}>{h.name} - {h.location}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>{t('hawala.receiverInfo')}</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('hawala.receiverName')}
                value={transactionForm.receiver_name}
                onChange={(e) => setTransactionForm({ ...transactionForm, receiver_name: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('hawala.receiverPhone')}
                value={transactionForm.receiver_phone}
                onChange={(e) => setTransactionForm({ ...transactionForm, receiver_phone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                label={t('hawala.receiverAgent')}
                value={transactionForm.receiver_hawaladar_id}
                onChange={(e) => setTransactionForm({ ...transactionForm, receiver_hawaladar_id: e.target.value })}
              >
                <MenuItem value="">{t('hawala.selectAgent')}</MenuItem>
                {hawaladars.filter(h => h.is_active).map((h) => (
                  <MenuItem key={h.id} value={h.id}>{h.name} - {h.location}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>{t('hawala.amountInfo')}</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="number"
                label={t('hawala.amount')}
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                select
                label={t('hawala.currency')}
                value={transactionForm.currency_id}
                onChange={(e) => setTransactionForm({ ...transactionForm, currency_id: e.target.value })}
                required
              >
                {currencies.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.code} - {c.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="number"
                label={t('hawala.commissionRate')}
                value={transactionForm.commission_rate}
                onChange={(e) => setTransactionForm({ ...transactionForm, commission_rate: e.target.value })}
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label={t('hawala.notes')}
                value={transactionForm.notes}
                onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransactionDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveTransaction}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)}>
        <DialogTitle>{t('hawala.changeStatus')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t('hawala.currentStatus')}: <Chip label={t(`hawala.statuses.${selectedTransaction?.status}`)} size="small" />
          </Typography>
          <TextField
            fullWidth
            select
            label={t('hawala.newStatus')}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            sx={{ mt: 1 }}
          >
            <MenuItem value="pending">{t('hawala.statuses.pending')}</MenuItem>
            <MenuItem value="in_transit">{t('hawala.statuses.in_transit')}</MenuItem>
            <MenuItem value="completed">{t('hawala.statuses.completed')}</MenuItem>
            <MenuItem value="cancelled">{t('hawala.statuses.cancelled')}</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveStatus}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Search Dialog */}
      <Dialog open={searchDialog} onClose={() => { setSearchDialog(false); setSearchResult(null); setSearchError(''); setSearchCode(''); }}>
        <DialogTitle>{t('hawala.searchByCode')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField
              fullWidth
              label={t('hawala.referenceCode')}
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              placeholder="HWL-XXXXXX"
            />
            <Button variant="contained" onClick={handleSearchByCode}>
              <Search />
            </Button>
          </Box>
          {searchError && <Alert severity="error" sx={{ mt: 2 }}>{searchError}</Alert>}
          {searchResult && (
            <Paper sx={{ mt: 2, p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>{t('hawala.transactionDetails')}</Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                <Box><strong>{t('hawala.referenceCode')}:</strong> {searchResult.reference_code}</Box>
                <Box><strong>{t('hawala.sender')}:</strong> {searchResult.sender_name}</Box>
                <Box><strong>{t('hawala.receiver')}:</strong> {searchResult.receiver_name}</Box>
                <Box><strong>{t('hawala.amount')}:</strong> {formatCurrency(searchResult.amount)} {searchResult.currency_code}</Box>
                <Box><strong>{t('hawala.status')}:</strong> <Chip label={t(`hawala.statuses.${searchResult.status}`)} color={getStatusColor(searchResult.status) as any} size="small" /></Box>
                <Box><strong>{t('hawala.date')}:</strong> {new Date(searchResult.created_at).toLocaleString()}</Box>
              </Box>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSearchDialog(false); setSearchResult(null); setSearchError(''); setSearchCode(''); }}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>

      {/* Hawaladar Dialog */}
      <Dialog open={hawaladarDialog} onClose={() => setHawaladarDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedHawaladar ? t('hawala.editAgent') : t('hawala.addAgent')}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label={t('hawala.nameEn')}
            value={hawaladarForm.name}
            onChange={(e) => setHawaladarForm({ ...hawaladarForm, name: e.target.value })}
            sx={{ mt: 1 }}
            required
          />
          <TextField
            fullWidth
            label={t('hawala.nameFa')}
            value={hawaladarForm.name_fa}
            onChange={(e) => setHawaladarForm({ ...hawaladarForm, name_fa: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label={t('hawala.namePs')}
            value={hawaladarForm.name_ps}
            onChange={(e) => setHawaladarForm({ ...hawaladarForm, name_ps: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label={t('hawala.phone')}
            value={hawaladarForm.phone}
            onChange={(e) => setHawaladarForm({ ...hawaladarForm, phone: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label={t('hawala.locationEn')}
            value={hawaladarForm.location}
            onChange={(e) => setHawaladarForm({ ...hawaladarForm, location: e.target.value })}
            sx={{ mt: 2 }}
            required
          />
          <TextField
            fullWidth
            label={t('hawala.locationFa')}
            value={hawaladarForm.location_fa}
            onChange={(e) => setHawaladarForm({ ...hawaladarForm, location_fa: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label={t('hawala.locationPs')}
            value={hawaladarForm.location_ps}
            onChange={(e) => setHawaladarForm({ ...hawaladarForm, location_ps: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            type="number"
            label={t('hawala.commissionRate')}
            value={hawaladarForm.commission_rate}
            onChange={(e) => setHawaladarForm({ ...hawaladarForm, commission_rate: e.target.value })}
            sx={{ mt: 2 }}
            InputProps={{ endAdornment: '%' }}
          />
          <TextField
            fullWidth
            select
            label={t('hawala.statusActive')}
            value={hawaladarForm.is_active}
            onChange={(e) => setHawaladarForm({ ...hawaladarForm, is_active: Number(e.target.value) })}
            sx={{ mt: 2 }}
          >
            <MenuItem value={1}>{t('hawala.active')}</MenuItem>
            <MenuItem value={0}>{t('hawala.inactive')}</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHawaladarDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveHawaladar}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
