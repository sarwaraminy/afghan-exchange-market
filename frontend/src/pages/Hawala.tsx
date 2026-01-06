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
  Search,
  AccountBalance,
  ArrowUpward,
  ArrowDownward
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
  getCurrencies,
  getProvinces,
  getDistricts,
  getCustomers,
  searchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getAllSavingsAccounts,
  getCustomerSavingsAccounts,
  createSavingsAccount,
  depositToSavingsAccount,
  withdrawFromSavingsAccount,
  getSavingsAccountTransactions,
  getCustomerAccount
} from '../services/api';
import type { Hawaladar, HawalaTransaction, HawalaReportSummary, HawalaAgentReport, HawalaCurrencyReport, Currency, Province, District, Customer, CustomerAccount, AccountTransaction } from '../types';
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
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
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
    province_id: '',
    district_id: '',
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

  // Savings account states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [savingsAccounts, setSavingsAccounts] = useState<CustomerAccount[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<CustomerAccount | null>(null);
  const [accountTransactions, setAccountTransactions] = useState<AccountTransaction[]>([]);

  // Dialog states for savings
  const [customerDialog, setCustomerDialog] = useState(false);
  const [accountDialog, setAccountDialog] = useState(false);
  const [depositDialog, setDepositDialog] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(false);

  // Form states
  const [customerForm, setCustomerForm] = useState({
    first_name: '',
    last_name: '',
    tazkira_number: '',
    phone: ''
  });
  const [accountForm, setAccountForm] = useState({
    customer_id: 0,
    saraf_id: 1,
    currency_id: 1
  });
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transactionNotes, setTransactionNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { label: t('hawala.transactions'), icon: <Receipt /> },
    { label: t('hawala.agents'), icon: <People /> },
    { label: t('hawala.reports'), icon: <Assessment /> },
    { label: t('hawala.savingsAccount'), icon: <AccountBalance /> }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transactionsData, hawaladarsData, currenciesData, provincesData, districtsData] = await Promise.all([
        getHawalaTransactions(),
        getHawaladars(),
        getCurrencies(),
        getProvinces(),
        getDistricts()
      ]);
      setTransactions(transactionsData.transactions);
      setHawaladars(hawaladarsData);
      setCurrencies(currenciesData);
      setProvinces(provincesData);
      setDistricts(districtsData);

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

  // Fetch savings account data
  const fetchSavingsData = async () => {
    try {
      const [customersData, accountsData] = await Promise.all([
        getCustomers(),
        getAllSavingsAccounts()
      ]);
      setCustomers(customersData);
      setSavingsAccounts(accountsData);
    } catch (error: any) {
      console.error('Error fetching savings data:', error);
      setCustomers([]);
      setSavingsAccounts([]);
    }
  };

  // Fetch savings data when switching to savings section
  useEffect(() => {
    if (selectedSection === 3) {
      fetchSavingsData();
    }
  }, [selectedSection]);

  // Customer handlers
  const handleNewCustomer = () => {
    setSelectedCustomer(null);
    setCustomerForm({
      first_name: '',
      last_name: '',
      tazkira_number: '',
      phone: ''
    });
    setError('');
    setCustomerDialog(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerForm({
      first_name: customer.first_name,
      last_name: customer.last_name,
      tazkira_number: customer.tazkira_number,
      phone: customer.phone
    });
    setError('');
    setCustomerDialog(true);
  };

  const handleSaveCustomer = async () => {
    try {
      setError('');
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, customerForm);
      } else {
        await createCustomer(customerForm);
      }
      setCustomerDialog(false);
      await fetchSavingsData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save customer');
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id);
        await fetchSavingsData();
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to delete customer');
      }
    }
  };

  // Account handlers
  const handleNewAccount = () => {
    setSelectedAccount(null);
    setAccountForm({
      customer_id: 0,
      saraf_id: hawaladars.find(h => h.is_active)?.id || 1,
      currency_id: currencies[0]?.id || 1
    });
    setError('');
    setAccountDialog(true);
  };

  const handleSaveAccount = async () => {
    try {
      setError('');
      await createSavingsAccount(accountForm);
      setAccountDialog(false);
      await fetchSavingsData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create account');
    }
  };

  // Transaction handlers
  const handleDeposit = async () => {
    if (!selectedAccount) return;
    try {
      setError('');
      const amount = parseFloat(depositAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        return;
      }
      await depositToSavingsAccount(selectedAccount.id, amount, transactionNotes || undefined);
      setDepositDialog(false);
      setDepositAmount('');
      setTransactionNotes('');
      await fetchSavingsData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to deposit');
    }
  };

  const handleWithdraw = async () => {
    if (!selectedAccount) return;
    try {
      setError('');
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        return;
      }
      if (amount > selectedAccount.balance) {
        setError('Insufficient balance');
        return;
      }
      await withdrawFromSavingsAccount(selectedAccount.id, amount, transactionNotes || undefined);
      setWithdrawDialog(false);
      setWithdrawAmount('');
      setTransactionNotes('');
      await fetchSavingsData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to withdraw');
    }
  };

  const handleViewTransactions = async (account: CustomerAccount) => {
    try {
      const transactions = await getSavingsAccountTransactions(account.id);
      setAccountTransactions(transactions);
      setSelectedAccount(account);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      setAccountTransactions([]);
    }
  };

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
    setError('');
    setStatusDialog(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedTransaction) return;

    // Clear any previous errors
    setError('');

    try {
      console.log('Updating transaction status:', selectedTransaction.id, 'to:', newStatus);
      await updateHawalaTransactionStatus(selectedTransaction.id, newStatus as 'pending' | 'in_transit' | 'completed' | 'cancelled');
      console.log('Status updated successfully');
      setStatusDialog(false);
      await fetchData();
    } catch (err: any) {
      console.error('Error updating status:', err);
      const errorMessage = err.response?.data?.error || t('hawala.failedUpdateStatus');
      setError(errorMessage);
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
      province_id: '',
      district_id: '',
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
      province_id: hawaladar.province_id?.toString() || '',
      district_id: hawaladar.district_id?.toString() || '',
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
        province_id: hawaladarForm.province_id ? parseInt(hawaladarForm.province_id) : undefined,
        district_id: hawaladarForm.district_id ? parseInt(hawaladarForm.district_id) : undefined,
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
            {new Date(cell.getValue()).toLocaleDateString()}
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
        size: 150,
        Cell: ({ row }) => (
          <Typography variant="body2" noWrap>
            {i18n.language === 'fa'
              ? row.original.name_fa || row.original.name
              : i18n.language === 'ps'
              ? row.original.name_ps || row.original.name
              : row.original.name}
          </Typography>
        )
      },
      {
        accessorKey: 'location',
        header: t('hawala.location'),
        size: 150,
        Cell: ({ row }) => {
          const locationText = i18n.language === 'fa'
            ? row.original.location_fa || row.original.location
            : i18n.language === 'ps'
            ? row.original.location_ps || row.original.location
            : row.original.location;

          const districtName = i18n.language === 'fa'
            ? row.original.district_name_fa || row.original.district_name
            : i18n.language === 'ps'
            ? row.original.district_name_ps || row.original.district_name
            : row.original.district_name;

          const provinceName = i18n.language === 'fa'
            ? row.original.province_name_fa || row.original.province_name
            : i18n.language === 'ps'
            ? row.original.province_name_ps || row.original.province_name
            : row.original.province_name;

          return (
            <Box>
              <Typography variant="body2" noWrap>{locationText}</Typography>
              {(provinceName || districtName) && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                  {districtName && `${districtName}, `}{provinceName}
                </Typography>
              )}
            </Box>
          );
        }
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

  const agentReportColumns = useMemo<MRT_ColumnDef<HawalaAgentReport>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('hawala.agent'),
        size: 150
      },
      {
        accessorKey: 'location',
        header: t('hawala.location'),
        size: 150
      },
      {
        accessorKey: 'sent_count',
        header: t('hawala.sent'),
        size: 100,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ cell }) => (
          <Box sx={{ textAlign: 'right' }}>{cell.getValue<number>()}</Box>
        )
      },
      {
        accessorKey: 'received_count',
        header: t('hawala.received'),
        size: 100,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ cell }) => (
          <Box sx={{ textAlign: 'right' }}>{cell.getValue<number>()}</Box>
        )
      },
      {
        accessorKey: 'commission_earned',
        header: t('hawala.commissionEarned'),
        size: 140,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ cell }) => (
          <Box sx={{ textAlign: 'right' }}>{formatCurrency(cell.getValue<number>())}</Box>
        )
      }
    ],
    [t, i18n.language]
  );

  const currencyReportColumns = useMemo<MRT_ColumnDef<HawalaCurrencyReport>[]>(
    () => [
      {
        accessorKey: 'code',
        header: t('hawala.currency'),
        size: 100,
        Cell: ({ row }) => (
          <Box>
            <Typography variant="body2">{row.original.code}</Typography>
            <Typography variant="caption" color="text.secondary">{row.original.name}</Typography>
          </Box>
        )
      },
      {
        accessorKey: 'transaction_count',
        header: t('hawala.transactionCount'),
        size: 130,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ cell }) => (
          <Box sx={{ textAlign: 'right' }}>{cell.getValue<number>()}</Box>
        )
      },
      {
        accessorKey: 'total_amount',
        header: t('hawala.totalAmount'),
        size: 140,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ cell }) => (
          <Box sx={{ textAlign: 'right' }}>{formatCurrency(cell.getValue<number>())}</Box>
        )
      },
      {
        accessorKey: 'total_commission',
        header: t('hawala.totalCommission'),
        size: 140,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ cell }) => (
          <Box sx={{ textAlign: 'right' }}>{formatCurrency(cell.getValue<number>())}</Box>
        )
      }
    ],
    [t, i18n.language]
  );

  const accountTransactionColumns = useMemo<MRT_ColumnDef<AccountTransaction>[]>(
    () => [
      {
        accessorKey: 'created_at',
        header: t('hawala.date'),
        size: 160,
        Cell: ({ cell }) => (
          <Typography variant="body2" noWrap>
            {new Date(cell.getValue<string>()).toLocaleString()}
          </Typography>
        )
      },
      {
        accessorKey: 'transaction_type',
        header: t('hawala.type'),
        size: 120,
        Cell: ({ row }) => {
          const type = row.original.transaction_type;
          const isDeposit = type === 'deposit';
          return (
            <Chip
              icon={isDeposit ? <ArrowDownward fontSize="small" /> : <ArrowUpward fontSize="small" />}
              label={type === 'deposit' ? t('hawala.deposit') : t('hawala.withdraw')}
              color={isDeposit ? 'success' : 'warning'}
              size="small"
            />
          );
        }
      },
      {
        accessorKey: 'amount',
        header: t('hawala.amount'),
        size: 120,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 600 }}>
            {formatCurrency(row.original.amount)} {row.original.currency_code}
          </Typography>
        )
      },
      {
        accessorKey: 'balance_after',
        header: t('hawala.balanceAfter'),
        size: 120,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'right' }}>
            {formatCurrency(row.original.balance_after)} {row.original.currency_code}
          </Typography>
        )
      },
      ...(!isMobile ? [{
        accessorKey: 'notes' as const,
        header: t('hawala.notes'),
        size: 180,
        Cell: ({ cell }: { cell: any }) => (
          <Typography variant="body2" noWrap>
            {cell.getValue() || '-'}
          </Typography>
        )
      }] : [])
    ],
    [t, i18n.language, isMobile]
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
      <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={600} gutterBottom>{t('hawala.reports')}</Typography>

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
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>{t('hawala.byAgent')}</Typography>
      <Box sx={{ mb: 3, overflowX: 'auto', width: '100%' }}>
        <MaterialReactTable
          columns={agentReportColumns}
          data={agentReports}
          enablePagination
          enableSorting
          enableGlobalFilter
          enableDensityToggle={!isMobile}
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
              minWidth: isMobile ? 500 : 650
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

      <Divider sx={{ my: 3 }} />

      {/* Currency Reports */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>{t('hawala.byCurrency')}</Typography>
      <Box sx={{ overflowX: 'auto', width: '100%' }}>
        <MaterialReactTable
          columns={currencyReportColumns}
          data={currencyReports}
          enablePagination
          enableSorting
          enableGlobalFilter
          enableDensityToggle={!isMobile}
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
              minWidth: isMobile ? 450 : 550
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

  const customerColumns = useMemo<MRT_ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: 'first_name',
        header: 'First Name',
        size: 130,
        Cell: ({ row }) => (
          <Typography variant="body2" noWrap>
            {row.original.first_name} {row.original.last_name}
          </Typography>
        )
      },
      {
        accessorKey: 'tazkira_number',
        header: 'Tazkira',
        size: 120
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        size: 120
      },
      {
        id: 'actions',
        header: t('admin.actions'),
        size: 110,
        muiTableHeadCellProps: { sx: { textAlign: 'center' } },
        muiTableBodyCellProps: { sx: { textAlign: 'center' } },
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton size="small" onClick={() => handleEditCustomer(row.original)}>
              <Edit fontSize="small" />
            </IconButton>
            {isAdmin && (
              <IconButton size="small" onClick={() => handleDeleteCustomer(row.original.id)} color="error">
                <Delete fontSize="small" />
              </IconButton>
            )}
          </Box>
        )
      }
    ],
    [t, isAdmin]
  );

  const savingsAccountColumns = useMemo<MRT_ColumnDef<CustomerAccount>[]>(
    () => [
      {
        accessorKey: 'first_name',
        header: 'Customer',
        size: 150,
        Cell: ({ row }) => (
          <Typography variant="body2" noWrap>
            {row.original.first_name} {row.original.last_name}
          </Typography>
        )
      },
      {
        accessorKey: 'saraf_name',
        header: 'Saraf',
        size: 130,
        Cell: ({ cell }) => (
          <Typography variant="body2" noWrap>{cell.getValue<string>()}</Typography>
        )
      },
      {
        accessorKey: 'balance',
        header: 'Balance',
        size: 140,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 600 }}>
            {formatCurrency(row.original.balance)} {row.original.currency_code}
          </Typography>
        )
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        size: 110,
        Cell: ({ cell }) => (
          <Typography variant="body2" noWrap>
            {new Date(cell.getValue<string>()).toLocaleDateString()}
          </Typography>
        )
      },
      {
        id: 'actions',
        header: 'Actions',
        size: 150,
        muiTableHeadCellProps: { sx: { textAlign: 'center' } },
        muiTableBodyCellProps: { sx: { textAlign: 'center' } },
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              color="success"
              onClick={() => {
                setSelectedAccount(row.original);
                setDepositAmount('');
                setTransactionNotes('');
                setError('');
                setDepositDialog(true);
              }}
              title="Deposit"
            >
              <ArrowDownward fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="warning"
              onClick={() => {
                setSelectedAccount(row.original);
                setWithdrawAmount('');
                setTransactionNotes('');
                setError('');
                setWithdrawDialog(true);
              }}
              disabled={row.original.balance <= 0}
              title="Withdraw"
            >
              <ArrowUpward fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleViewTransactions(row.original)}
              title="View Transactions"
            >
              <Receipt fontSize="small" />
            </IconButton>
          </Box>
        )
      }
    ],
    [t, isAdmin]
  );

  const renderSavingsAccount = () => {
    return (
      <>
        <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={600} gutterBottom>
          {t('hawala.savingsAccount')}
        </Typography>

        {/* Customers Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={600}>Customers</Typography>
            <Button
              variant="contained"
              startIcon={!isMobile ? <Add /> : undefined}
              onClick={handleNewCustomer}
              size={isMobile ? 'small' : 'medium'}
            >
              {isMobile ? <Add /> : 'Add Customer'}
            </Button>
          </Box>
          <Box sx={{ overflowX: 'auto', width: '100%' }}>
            <MaterialReactTable
              columns={customerColumns}
              data={customers}
              enablePagination
              enableSorting
              enableGlobalFilter
              enableDensityToggle={!isMobile}
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
                  minWidth: isMobile ? 400 : 550
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
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Savings Accounts Section */}
        <Box>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={600}>Savings Accounts</Typography>
            <Button
              variant="contained"
              startIcon={!isMobile ? <Add /> : undefined}
              onClick={handleNewAccount}
              size={isMobile ? 'small' : 'medium'}
            >
              {isMobile ? <Add /> : 'Create Account'}
            </Button>
          </Box>
          <Box sx={{ overflowX: 'auto', width: '100%' }}>
            <MaterialReactTable
              columns={savingsAccountColumns}
              data={savingsAccounts}
              enablePagination
              enableSorting
              enableGlobalFilter
              enableDensityToggle={!isMobile}
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
                  minWidth: isMobile ? 500 : 700
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
        </Box>
      </>
    );
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 0:
        return renderTransactions();
      case 1:
        return renderHawaladars();
      case 2:
        return renderReports();
      case 3:
        return renderSavingsAccount();
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
                {hawaladars.filter(h => h.is_active).map((h) => {
                  const name = i18n.language === 'fa' ? h.name_fa || h.name : i18n.language === 'ps' ? h.name_ps || h.name : h.name;
                  const location = i18n.language === 'fa' ? h.location_fa || h.location : i18n.language === 'ps' ? h.location_ps || h.location : h.location;
                  return (
                    <MenuItem key={h.id} value={h.id}>{name} - {location}</MenuItem>
                  );
                })}
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
                {hawaladars.filter(h => h.is_active).map((h) => {
                  const name = i18n.language === 'fa' ? h.name_fa || h.name : i18n.language === 'ps' ? h.name_ps || h.name : h.name;
                  const location = i18n.language === 'fa' ? h.location_fa || h.location : i18n.language === 'ps' ? h.location_ps || h.location : h.location;
                  return (
                    <MenuItem key={h.id} value={h.id}>{name} - {location}</MenuItem>
                  );
                })}
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
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
            select
            label="Province"
            value={hawaladarForm.province_id}
            onChange={(e) => {
              setHawaladarForm({ ...hawaladarForm, province_id: e.target.value, district_id: '' });
            }}
            sx={{ mt: 2 }}
          >
            <MenuItem value="">Select Province</MenuItem>
            {provinces.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {i18n.language === 'fa' ? p.name_fa || p.name : i18n.language === 'ps' ? p.name_ps || p.name : p.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="District"
            value={hawaladarForm.district_id}
            onChange={(e) => setHawaladarForm({ ...hawaladarForm, district_id: e.target.value })}
            sx={{ mt: 2 }}
            disabled={!hawaladarForm.province_id}
          >
            <MenuItem value="">Select District</MenuItem>
            {districts
              .filter(d => d.province_id === parseInt(hawaladarForm.province_id))
              .map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {i18n.language === 'fa' ? d.name_fa || d.name : i18n.language === 'ps' ? d.name_ps || d.name : d.name}
                </MenuItem>
              ))}
          </TextField>
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

      {/* Customer Dialog */}
      <Dialog open={customerDialog} onClose={() => setCustomerDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                value={customerForm.first_name}
                onChange={(e) => setCustomerForm({ ...customerForm, first_name: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                value={customerForm.last_name}
                onChange={(e) => setCustomerForm({ ...customerForm, last_name: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Tazkira Number"
                value={customerForm.tazkira_number}
                onChange={(e) => setCustomerForm({ ...customerForm, tazkira_number: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomerDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveCustomer}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Create Savings Account Dialog */}
      <Dialog open={accountDialog} onClose={() => setAccountDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Savings Account</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                label="Customer"
                value={accountForm.customer_id}
                onChange={(e) => setAccountForm({ ...accountForm, customer_id: Number(e.target.value) })}
                required
              >
                <MenuItem value={0}>Select Customer</MenuItem>
                {customers.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.first_name} {c.last_name} - {c.tazkira_number}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                label="Saraf"
                value={accountForm.saraf_id}
                onChange={(e) => setAccountForm({ ...accountForm, saraf_id: Number(e.target.value) })}
                required
              >
                {hawaladars.filter(h => h.is_active).map((h) => {
                  const name = i18n.language === 'fa' ? h.name_fa || h.name : i18n.language === 'ps' ? h.name_ps || h.name : h.name;
                  return (
                    <MenuItem key={h.id} value={h.id}>
                      {name}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                label={t('hawala.currency')}
                value={accountForm.currency_id}
                onChange={(e) => setAccountForm({ ...accountForm, currency_id: Number(e.target.value) })}
                required
              >
                {currencies.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccountDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveAccount}>{t('common.create')}</Button>
        </DialogActions>
      </Dialog>

      {/* Deposit Dialog */}
      <Dialog open={depositDialog} onClose={() => setDepositDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('hawala.deposit')}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {selectedAccount && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              Customer: {selectedAccount.first_name} {selectedAccount.last_name}
            </Typography>
          )}
          <TextField
            fullWidth
            type="number"
            label={t('hawala.amount')}
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            required
            InputProps={{
              endAdornment: selectedAccount?.currency_code
            }}
          />
          <TextField
            fullWidth
            multiline
            rows={2}
            label={t('hawala.notes')}
            value={transactionNotes}
            onChange={(e) => setTransactionNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepositDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" color="success" onClick={handleDeposit}>{t('hawala.deposit')}</Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialog} onClose={() => setWithdrawDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('hawala.withdraw')}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {selectedAccount && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Customer: {selectedAccount.first_name} {selectedAccount.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('hawala.availableBalance')}: {formatCurrency(selectedAccount.balance)} {selectedAccount.currency_code}
              </Typography>
            </>
          )}
          <TextField
            fullWidth
            type="number"
            label={t('hawala.amount')}
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            required
            InputProps={{
              endAdornment: selectedAccount?.currency_code
            }}
          />
          <TextField
            fullWidth
            multiline
            rows={2}
            label={t('hawala.notes')}
            value={transactionNotes}
            onChange={(e) => setTransactionNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" color="warning" onClick={handleWithdraw}>{t('hawala.withdraw')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
