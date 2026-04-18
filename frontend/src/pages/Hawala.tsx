import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { HawalaNetPositionReport } from './HawalaNetPositionReport';
import { HawalaUnpaidReport } from './HawalaUnpaidReport';
import { HawalaCommissionReportPage } from './HawalaCommissionReport';
import { HawalaDailyCashFlowReportPage } from './HawalaDailyCashFlowReport';
import { HawalaTransactionAgingReportPage } from './HawalaTransactionAgingReport';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
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
  Divider,
  Grid,
  Tooltip,
  Tabs,
  Tab
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
  ArrowDownward,
  Balance,
  Schedule,
  TrendingUp,
  AttachMoney,
  CalendarToday,
  ExpandMore,
  ExpandLess,
  Dashboard,
  ChevronLeft,
  ChevronRight
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
  completeHawalaTransactionPayout,
  deleteHawalaTransaction,
  getHawalaReportsSummary,
  getHawalaReportsByAgent,
  getHawalaReportsByCurrency,
  getCurrencies,
  getProvinces,
  getDistricts,
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getAllSavingsAccounts,
  getEligibleSavingsAccounts,
  createSavingsAccount,
  depositToSavingsAccount,
  withdrawFromSavingsAccount,
  getSavingsAccountTransactions
} from '../services/api';
import type { Hawaladar, HawalaTransaction, HawalaReportSummary, HawalaAgentReport, HawalaCurrencyReport, Currency, Province, District, Customer, CustomerAccount, AccountTransaction } from '../types';
import { Loading } from '../components/common/Loading';
import { DraggableDialog } from '../components/common/DraggableDialog';
import { DraggableDialogTitle } from '../components/common/DraggableDialogTitle';
import { useAuth } from '../context/AuthContext';
import { useCollapsibleSidebar, useMobileNav } from '../hooks';
import { StatCard } from '../components/common/StatCard';
import { DialogFooter } from '../components/common/DialogFooter';
import { CollapsibleSidebar, type SidebarMenuItem } from '../components/common/CollapsibleSidebar';

export const Hawala = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isMobile } = useMobileNav();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useCollapsibleSidebar('hawalaSidebarOpen');

  const isRtl = i18n.language === 'fa' || i18n.language === 'ps';

  const [selectedSection, setSelectedSection] = useState(0);
  const [transactionTab, setTransactionTab] = useState(0); // 0 = Sending, 1 = Receiving
  const [savingsTab, setSavingsTab] = useState(0); // 0 = Customers, 1 = Savings Accounts
  const [selectedReport, setSelectedReport] = useState<string | null>(null); // null = summary view, or specific report name
  const [reportsExpanded, setReportsExpanded] = useState(false);
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
  const [payoutDialog, setPayoutDialog] = useState(false);
  const [searchDialog, setSearchDialog] = useState(false);

  // Selected items
  const [selectedTransaction, setSelectedTransaction] = useState<HawalaTransaction | null>(null);
  const [selectedHawaladar, setSelectedHawaladar] = useState<Hawaladar | null>(null);

  // Forms
  const [transactionForm, setTransactionForm] = useState({
    transaction_direction: 'outgoing' as 'outgoing' | 'incoming',
    reference_code: '',
    sender_name: '',
    sender_phone: '',
    sender_hawaladar_id: '',
    receiver_name: '',
    receiver_phone: '',
    receiver_hawaladar_id: '',
    amount: '',
    currency_id: '',
    commission_rate: '2.0',
    commission_type: 'add' as 'add' | 'deduct',
    notes: '',
    customer_id: '',
    customer_savings_account_id: ''
  });

  // Eligible savings accounts state
  const [eligibleSavingsAccounts, setEligibleSavingsAccounts] = useState<CustomerAccount[]>([]);

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
    floor_number: '',
    shop_number: '',
    commission_rate: '2.0',
    is_active: 1
  });

  const [newStatus, setNewStatus] = useState<string>('');
  const [payoutForm, setPayoutForm] = useState({
    receiver_tazkira_number: '',
    receiver_phone: '',
    receiver_name_verification: ''
  });
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
  const [transactionsHistoryDialog, setTransactionsHistoryDialog] = useState(false);

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

  const sidebarItems: SidebarMenuItem[] = [
    {
      id: 0,
      label: t('hawala.transactions'),
      icon: <Receipt />,
      onClick: () => {
        setSelectedSection(0);
        setReportsExpanded(false);
      },
      selected: selectedSection === 0
    },
    {
      id: 1,
      label: t('hawala.agents'),
      icon: <People />,
      onClick: () => {
        setSelectedSection(1);
        setReportsExpanded(false);
      },
      selected: selectedSection === 1
    },
    {
      id: 2,
      label: t('hawala.reports'),
      icon: <Assessment />,
      onClick: () => {
        if (selectedSection === 2) {
          setReportsExpanded(!reportsExpanded);
        } else {
          setSelectedSection(2);
          setReportsExpanded(true);
          setSelectedReport(null);
        }
      },
      selected: selectedSection === 2,
      expanded: reportsExpanded,
      subItems: [
        { id: 'summary', label: t('hawala.summary') || 'Summary', icon: <Dashboard fontSize="small" />, onClick: () => setSelectedReport(null), selected: selectedReport === null },
        { id: 'netPosition', label: t('hawala.netPosition'), icon: <Balance fontSize="small" />, onClick: () => setSelectedReport('netPosition'), selected: selectedReport === 'netPosition' },
        { id: 'unpaid', label: t('hawala.unpaid'), icon: <Schedule fontSize="small" />, onClick: () => setSelectedReport('unpaid'), selected: selectedReport === 'unpaid' },
        { id: 'commission', label: t('hawala.commission'), icon: <AttachMoney fontSize="small" />, onClick: () => setSelectedReport('commission'), selected: selectedReport === 'commission' },
        { id: 'cashFlow', label: t('hawala.cashFlow'), icon: <TrendingUp fontSize="small" />, onClick: () => setSelectedReport('cashFlow'), selected: selectedReport === 'cashFlow' },
        { id: 'aging', label: t('hawala.aging'), icon: <CalendarToday fontSize="small" />, onClick: () => setSelectedReport('aging'), selected: selectedReport === 'aging' }
      ]
    },
    {
      id: 3,
      label: t('hawala.savingsAccount'),
      icon: <AccountBalance />,
      onClick: () => {
        setSelectedSection(3);
        setReportsExpanded(false);
      },
      selected: selectedSection === 3
    }
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
      console.log('Fetched customers:', customersData);
      console.log('Fetched accounts:', accountsData);
      setCustomers(customersData);
      setSavingsAccounts(accountsData);
    } catch (error: any) {
      console.error('Error fetching savings data:', error);
      // Don't clear existing data on error
      setError(error.response?.data?.error || 'Failed to load data');
    }
  };

  // Fetch savings data when switching to savings section
  useEffect(() => {
    if (selectedSection === 3) {
      fetchSavingsData();
    }
  }, [selectedSection]);

  // Fetch eligible savings accounts when transaction form changes
  useEffect(() => {
    const fetchEligibleAccounts = async () => {
      if (!transactionForm.customer_id ||
          !transactionForm.sender_hawaladar_id ||
          !transactionForm.currency_id ||
          !transactionForm.amount) {
        setEligibleSavingsAccounts([]);
        return;
      }

      try {
        const amount = parseFloat(transactionForm.amount);
        const rate = parseFloat(transactionForm.commission_rate);
        const commissionAmount = amount * (rate / 100);
        // If 'add': sender pays amount + commission
        // If 'deduct': sender pays only amount (commission deducted from amount, receiver gets less)
        const totalAmount = transactionForm.commission_type === 'add'
          ? amount + commissionAmount
          : amount;

        const accounts = await getEligibleSavingsAccounts(
          parseInt(transactionForm.customer_id),
          parseInt(transactionForm.sender_hawaladar_id),
          parseInt(transactionForm.currency_id),
          totalAmount
        );
        setEligibleSavingsAccounts(accounts);
      } catch (error) {
        console.error('Error fetching eligible savings accounts:', error);
        setEligibleSavingsAccounts([]);
      }
    };

    fetchEligibleAccounts();
  }, [
    transactionForm.customer_id,
    transactionForm.sender_hawaladar_id,
    transactionForm.currency_id,
    transactionForm.amount,
    transactionForm.commission_rate,
    transactionForm.commission_type
  ]);

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
      // Refresh the customer list
      await fetchSavingsData();
      // Reset form
      setCustomerForm({
        first_name: '',
        last_name: '',
        tazkira_number: '',
        phone: ''
      });
    } catch (err: any) {
      console.error('Error saving customer:', err);
      setError(err.response?.data?.error || 'Failed to save customer');
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (confirm(t('common.confirmDelete'))) {
      try {
        await deleteCustomer(id);
        await fetchSavingsData();
      } catch (error: any) {
        setError(error.response?.data?.error || t('common.error'));
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
        setError(t('common.pleaseEnterValidAmount'));
        return;
      }
      await depositToSavingsAccount(selectedAccount.id, amount, transactionNotes || undefined);
      setDepositDialog(false);
      setDepositAmount('');
      setTransactionNotes('');
      await fetchSavingsData();
    } catch (err: any) {
      setError(err.response?.data?.error || t('common.error'));
    }
  };

  const handleWithdraw = async () => {
    if (!selectedAccount) return;
    try {
      setError('');
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
        setError(t('common.pleaseEnterValidAmount'));
        return;
      }
      if (amount > selectedAccount.balance) {
        setError(t('common.insufficientBalance'));
        return;
      }
      await withdrawFromSavingsAccount(selectedAccount.id, amount, transactionNotes || undefined);
      setWithdrawDialog(false);
      setWithdrawAmount('');
      setTransactionNotes('');
      await fetchSavingsData();
    } catch (err: any) {
      setError(err.response?.data?.error || t('common.error'));
    }
  };

  const handleViewTransactions = async (account: CustomerAccount) => {
    try {
      setSelectedAccount(account);
      const transactions = await getSavingsAccountTransactions(account.id);
      setAccountTransactions(transactions);
      setTransactionsHistoryDialog(true);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      setError(error.response?.data?.error || 'Failed to load transactions');
      setAccountTransactions([]);
    }
  };

  // Transaction handlers
  const handleNewTransaction = () => {
    setSelectedTransaction(null);
    setTransactionForm({
      transaction_direction: 'outgoing',
      reference_code: '',
      sender_name: '',
      sender_phone: '',
      sender_hawaladar_id: '',
      receiver_name: '',
      receiver_phone: '',
      receiver_hawaladar_id: '',
      amount: '',
      currency_id: currencies[0]?.id.toString() || '',
      commission_rate: '2.0',
      commission_type: 'add',
      notes: '',
      customer_id: '',
      customer_savings_account_id: ''
    });
    setError('');
    setTransactionDialog(true);
  };

  const handleEditTransaction = (transaction: HawalaTransaction) => {
    setSelectedTransaction(transaction);
    setTransactionForm({
      transaction_direction: transaction.transaction_direction || 'outgoing',
      reference_code: transaction.reference_code || '',
      sender_name: transaction.sender_name,
      sender_phone: transaction.sender_phone || '',
      sender_hawaladar_id: transaction.sender_hawaladar_id?.toString() || '',
      receiver_name: transaction.receiver_name,
      receiver_phone: transaction.receiver_phone || '',
      receiver_hawaladar_id: transaction.receiver_hawaladar_id?.toString() || '',
      amount: transaction.amount.toString(),
      currency_id: transaction.currency_id.toString(),
      commission_rate: transaction.commission_rate.toString(),
      commission_type: transaction.commission_type || 'add',
      notes: transaction.notes || '',
      customer_id: '',
      customer_savings_account_id: ''
    });
    setError('');
    setTransactionDialog(true);
  };

  const handleSaveTransaction = async () => {
    try {
      // Validate reference code for incoming transactions
      if (transactionForm.transaction_direction === 'incoming' && !transactionForm.reference_code.trim()) {
        setError(t('hawala.referenceCodeRequired'));
        return;
      }

      const data = {
        transaction_direction: transactionForm.transaction_direction,
        reference_code: transactionForm.transaction_direction === 'incoming' ? transactionForm.reference_code.trim().toUpperCase() : undefined,
        sender_name: transactionForm.sender_name,
        sender_phone: transactionForm.sender_phone || undefined,
        sender_hawaladar_id: transactionForm.sender_hawaladar_id ? parseInt(transactionForm.sender_hawaladar_id) : undefined,
        receiver_name: transactionForm.receiver_name,
        receiver_phone: transactionForm.receiver_phone || undefined,
        receiver_hawaladar_id: transactionForm.receiver_hawaladar_id ? parseInt(transactionForm.receiver_hawaladar_id) : undefined,
        amount: parseFloat(transactionForm.amount),
        currency_id: parseInt(transactionForm.currency_id),
        commission_rate: parseFloat(transactionForm.commission_rate),
        commission_type: transactionForm.commission_type,
        notes: transactionForm.notes || undefined,
        customer_savings_account_id: transactionForm.customer_savings_account_id ? parseInt(transactionForm.customer_savings_account_id) : undefined
      };

      if (selectedTransaction) {
        await updateHawalaTransaction(selectedTransaction.id, data);
        setTransactionDialog(false);
        fetchData();
      } else {
        await createHawalaTransaction(data);
        setTransactionDialog(false);
        fetchData();
      }
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

  const handleCompletePayout = (transaction: HawalaTransaction) => {
    setSelectedTransaction(transaction);
    setPayoutForm({
      receiver_tazkira_number: '',
      receiver_phone: transaction.receiver_phone || '',
      receiver_name_verification: transaction.receiver_name
    });
    setError('');
    setPayoutDialog(true);
  };

  const handleSavePayout = async () => {
    if (!selectedTransaction) return;

    setError('');

    if (!payoutForm.receiver_tazkira_number.trim()) {
      setError(t('hawala.receiverTazkiraRequired'));
      return;
    }

    if (payoutForm.receiver_tazkira_number.trim().length < 6 || payoutForm.receiver_tazkira_number.trim().length > 20) {
      setError(t('hawala.receiverTazkiraHelp'));
      return;
    }

    if (!payoutForm.receiver_phone.trim()) {
      setError(t('hawala.receiverPhoneRequired'));
      return;
    }

    if (payoutForm.receiver_phone.trim().length < 8 || payoutForm.receiver_phone.trim().length > 20) {
      setError(t('hawala.receiverPhoneHelp'));
      return;
    }

    // Warn if receiver name doesn't match verification name
    if (payoutForm.receiver_name_verification &&
        payoutForm.receiver_name_verification.trim().toLowerCase() !== selectedTransaction.receiver_name.toLowerCase()) {
      if (!confirm(t('hawala.receiverNameMismatchWarning'))) {
        return;
      }
    }

    try {
      await completeHawalaTransactionPayout(
        selectedTransaction.id,
        payoutForm.receiver_tazkira_number.trim(),
        payoutForm.receiver_phone.trim()
      );
      setPayoutDialog(false);
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || t('hawala.failedCompletePayout');
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
      floor_number: '',
      shop_number: '',
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
      floor_number: hawaladar.floor_number || '',
      shop_number: hawaladar.shop_number || '',
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
        floor_number: hawaladarForm.floor_number || undefined,
        shop_number: hawaladarForm.shop_number || undefined,
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
        accessorKey: 'transaction_direction',
        header: t('hawala.transactionDirection'),
        size: 120,
        Cell: ({ row }) => {
          const direction = row.original.transaction_direction || 'outgoing';
          const isOutgoing = direction === 'outgoing';
          return (
            <Chip
              label={t(`hawala.${direction}`)}
              size="small"
              color={isOutgoing ? 'warning' : 'success'}
              icon={isOutgoing ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
            />
          );
        }
      },
      {
        accessorKey: 'sender_name',
        header: t('hawala.sender'),
        size: 130,
        Cell: ({ row }) => (
          <Box>
            <Typography variant="body2" noWrap>{row.original.sender_name}</Typography>
            {row.original.sender_phone && (
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                {row.original.sender_phone}
              </Typography>
            )}
          </Box>
        )
      },
      {
        accessorKey: 'sender_hawaladar_name',
        header: t('hawala.senderAgent'),
        size: 150,
        Cell: ({ row }) => {
          const senderHawaladarName = i18n.language === 'fa'
            ? row.original.sender_hawaladar_name_fa || row.original.sender_hawaladar_name
            : i18n.language === 'ps'
            ? row.original.sender_hawaladar_name_ps || row.original.sender_hawaladar_name
            : row.original.sender_hawaladar_name;

          const senderHawaladarLocation = i18n.language === 'fa'
            ? row.original.sender_hawaladar_location_fa || row.original.sender_hawaladar_location
            : i18n.language === 'ps'
            ? row.original.sender_hawaladar_location_ps || row.original.sender_hawaladar_location
            : row.original.sender_hawaladar_location;

          const senderFloorShopText = [
            row.original.sender_hawaladar_floor_number && `${t('hawala.floor')}: ${row.original.sender_hawaladar_floor_number}`,
            row.original.sender_hawaladar_shop_number && `${t('hawala.shop')}: ${row.original.sender_hawaladar_shop_number}`
          ].filter(Boolean).join(', ');

          return (
            <Box>
              <Typography variant="body2" noWrap>
                {senderHawaladarName || '-'}
              </Typography>
              {senderHawaladarLocation && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                  {senderHawaladarLocation}
                </Typography>
              )}
              {senderFloorShopText && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                  {senderFloorShopText}
                </Typography>
              )}
            </Box>
          );
        }
      },
      {
        accessorKey: 'receiver_name',
        header: t('hawala.receiver'),
        size: 130,
        Cell: ({ row }) => (
          <Box>
            <Typography variant="body2" noWrap>{row.original.receiver_name}</Typography>
            {row.original.receiver_phone && (
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                {row.original.receiver_phone}
              </Typography>
            )}
          </Box>
        )
      },
      {
        accessorKey: 'receiver_hawaladar_name',
        header: t('hawala.receiverAgent'),
        size: 150,
        Cell: ({ row }) => {
          const receiverHawaladarName = i18n.language === 'fa'
            ? row.original.receiver_hawaladar_name_fa || row.original.receiver_hawaladar_name
            : i18n.language === 'ps'
            ? row.original.receiver_hawaladar_name_ps || row.original.receiver_hawaladar_name
            : row.original.receiver_hawaladar_name;

          const receiverHawaladarLocation = i18n.language === 'fa'
            ? row.original.receiver_hawaladar_location_fa || row.original.receiver_hawaladar_location
            : i18n.language === 'ps'
            ? row.original.receiver_hawaladar_location_ps || row.original.receiver_hawaladar_location
            : row.original.receiver_hawaladar_location;

          const receiverFloorShopText = [
            row.original.receiver_hawaladar_floor_number && `${t('hawala.floor')}: ${row.original.receiver_hawaladar_floor_number}`,
            row.original.receiver_hawaladar_shop_number && `${t('hawala.shop')}: ${row.original.receiver_hawaladar_shop_number}`
          ].filter(Boolean).join(', ');

          return (
            <Box>
              <Typography variant="body2" noWrap>
                {receiverHawaladarName || '-'}
              </Typography>
              {receiverHawaladarLocation && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                  {receiverHawaladarLocation}
                </Typography>
              )}
              {receiverFloorShopText && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                  {receiverFloorShopText}
                </Typography>
              )}
            </Box>
          );
        }
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
          </Box>
        )
      },
      {
        accessorKey: 'commission_amount',
        header: t('hawala.commission'),
        size: 120,
        muiTableHeadCellProps: { sx: { textAlign: 'right' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right' } },
        Cell: ({ row }) => (
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" noWrap>
              {formatCurrency(row.original.commission_amount)} {row.original.currency_code}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {row.original.commission_rate}%
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
      }, {
        accessorKey: 'expires_at' as const,
        header: t('hawala.expiresAt') || 'Expires',
        size: 120,
        muiTableHeadCellProps: { sx: { textAlign: 'center' } },
        muiTableBodyCellProps: { sx: { textAlign: 'center' } },
        Cell: ({ row }: { row: any }) => {
          const transaction = row.original;
          if (!transaction.expires_at || transaction.status === 'completed' || transaction.status === 'cancelled') {
            return <Box sx={{ textAlign: 'center' }}>-</Box>;
          }

          const expiresAt = new Date(transaction.expires_at);
          const now = new Date();
          const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          let color: 'success' | 'warning' | 'error' = 'success';
          let label = '';

          if (daysUntilExpiry < 0) {
            color = 'error';
            label = t('hawala.expired') || 'Expired';
          } else if (daysUntilExpiry === 0) {
            color = 'error';
            label = t('hawala.today') || 'Today';
          } else if (daysUntilExpiry <= 1) {
            color = 'error';
            label = `${daysUntilExpiry}d`;
          } else if (daysUntilExpiry <= 3) {
            color = 'warning';
            label = `${daysUntilExpiry}d`;
          } else {
            color = 'success';
            label = `${daysUntilExpiry}d`;
          }

          return (
            <Box sx={{ textAlign: 'center' }}>
              <Chip
                label={label}
                size="small"
                color={color}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {expiresAt.toLocaleDateString()}
              </Typography>
            </Box>
          );
        }
      }] : []),
      {
        id: 'actions',
        header: t('admin.actions'),
        size: 120,
        muiTableHeadCellProps: { sx: { textAlign: 'center' } },
        muiTableBodyCellProps: { sx: { textAlign: 'center' } },
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton
              size="small"
              onClick={() => navigate(`/hawala/receipt/${row.original.id}`)}
              title={t('hawala.printReceipt')}
            >
              <Receipt fontSize="small" />
            </IconButton>
            {(row.original.status === 'pending' || row.original.status === 'in_transit') && (
              <Tooltip title={t('hawala.completePayout')}>
                <IconButton
                  size="small"
                  onClick={() => handleCompletePayout(row.original)}
                  color="success"
                >
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
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
        size: 300,
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

          const floorShopText = [
            row.original.floor_number && `${t('hawala.floor')}: ${row.original.floor_number}`,
            row.original.shop_number && `${t('hawala.shop')}: ${row.original.shop_number}`
          ].filter(Boolean).join(', ');

          const fullLocationText = [
            locationText,
            floorShopText
          ].filter(Boolean).join(' - ');

          return (
            <Tooltip title={fullLocationText} placement="top" arrow>
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    wordBreak: 'break-word'
                  }}
                >
                  {locationText}
                </Typography>
                {floorShopText && (
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                    {floorShopText}
                  </Typography>
                )}
                {(provinceName || districtName) && (
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                    {districtName && `${districtName}, `}{provinceName}
                  </Typography>
                )}
              </Box>
            </Tooltip>
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
        size: 150,
        Cell: ({ row }) => {
          const name = i18n.language === 'fa'
            ? row.original.name_fa || row.original.name
            : i18n.language === 'ps'
            ? row.original.name_ps || row.original.name
            : row.original.name;

          return <Typography variant="body2" noWrap>{name}</Typography>;
        }
      },
      {
        accessorKey: 'location',
        header: t('hawala.location'),
        size: 150,
        Cell: ({ row }) => {
          const location = i18n.language === 'fa'
            ? row.original.location_fa || row.original.location
            : i18n.language === 'ps'
            ? row.original.location_ps || row.original.location
            : row.original.location;

          return <Typography variant="body2" noWrap>{location}</Typography>;
        }
      },
      {
        accessorKey: 'sent_count',
        header: t('hawala.sent'),
        size: 100,
        muiTableHeadCellProps: { sx: { textAlign: 'right !important' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right !important' } },
        Cell: ({ cell }) => (
          <Box sx={{ textAlign: 'right' }}>{cell.getValue<number>()}</Box>
        )
      },
      {
        accessorKey: 'received_count',
        header: t('hawala.received'),
        size: 100,
        muiTableHeadCellProps: { sx: { textAlign: 'right !important' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right !important' } },
        Cell: ({ cell }) => (
          <Box sx={{ textAlign: 'right' }}>{cell.getValue<number>()}</Box>
        )
      },
      {
        accessorKey: 'commission_earned',
        header: t('hawala.commissionEarned'),
        size: 140,
        muiTableHeadCellProps: { sx: { textAlign: 'right !important' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right !important' } },
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
        muiTableHeadCellProps: { sx: { textAlign: 'right !important' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right !important' } },
        Cell: ({ cell }) => (
          <Box sx={{ textAlign: 'right' }}>{cell.getValue<number>()}</Box>
        )
      },
      {
        accessorKey: 'total_amount',
        header: t('hawala.totalAmount'),
        size: 140,
        muiTableHeadCellProps: { sx: { textAlign: 'right !important' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right !important' } },
        Cell: ({ cell }) => (
          <Box sx={{ textAlign: 'right' }}>{formatCurrency(cell.getValue<number>())}</Box>
        )
      },
      {
        accessorKey: 'total_commission',
        header: t('hawala.totalCommission'),
        size: 140,
        muiTableHeadCellProps: { sx: { textAlign: 'right !important' } },
        muiTableBodyCellProps: { sx: { textAlign: 'right !important' } },
        Cell: ({ cell }) => (
          <Box sx={{ textAlign: 'right' }}>{formatCurrency(cell.getValue<number>())}</Box>
        )
      }
    ],
    [t, i18n.language]
  );

  // Custom renderer for the Reports submenu
  const renderReportsSubmenu = (item: SidebarMenuItem) => {
    if (!item.expanded || !item.subItems) return null;

    return (
      <List disablePadding sx={{ bgcolor: '#f5f5f5' }}>
        {item.subItems.map((subItem) => (
          <ListItem key={subItem.id} disablePadding>
            <ListItemButton
              selected={subItem.selected}
              onClick={subItem.onClick}
              sx={{
                pl: 6,
                py: 1,
                '&.Mui-selected': {
                  bgcolor: '#bbdefb',
                  borderRight: '3px solid #1976d2',
                  '&:hover': {
                    bgcolor: '#90caf9',
                  },
                },
                '&:hover': {
                  bgcolor: '#e3f2fd',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: subItem.selected ? '#1976d2' : 'text.secondary' }}>
                {subItem.icon}
              </ListItemIcon>
              <ListItemText
                primary={subItem.label}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: subItem.selected ? 600 : 400,
                  color: subItem.selected ? '#1976d2' : 'text.primary',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    );
  };

  const renderTransactions = () => {
    // Filter transactions based on selected tab
    const filteredTransactions = transactions.filter(tx => {
      if (transactionTab === 0) {
        return tx.transaction_direction === 'outgoing';
      } else {
        return tx.transaction_direction === 'incoming';
      }
    });

    return (
      <Box>
        <MaterialReactTable
          columns={transactionColumns}
          data={filteredTransactions}
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
          renderTopToolbarCustomActions={() => (
            <Box sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              width: '100%',
              gap: 2,
              p: 1
            }}>
              {/* Transaction Type Tabs */}
              <Tabs
                value={transactionTab}
                onChange={(_event, newValue) => setTransactionTab(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    minHeight: 42,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.85rem' : '0.95rem',
                    fontWeight: 500,
                  },
                }}
              >
                <Tab
                  icon={<ArrowUpward fontSize="small" />}
                  iconPosition="start"
                  label={t('hawala.outgoing')}
                  sx={{ gap: 0.5 }}
                />
                <Tab
                  icon={<ArrowDownward fontSize="small" />}
                  iconPosition="start"
                  label={t('hawala.incoming')}
                  sx={{ gap: 0.5 }}
                />
              </Tabs>

              {/* Action Buttons */}
              <Box sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                justifyContent: isMobile ? 'stretch' : 'flex-end'
              }}>
                <Button
                  variant="outlined"
                  startIcon={!isMobile ? <Search /> : undefined}
                  onClick={() => setSearchDialog(true)}
                  size={isMobile ? 'small' : 'medium'}
                  fullWidth={isMobile}
                >
                  {isMobile ? <Search /> : t('hawala.searchByCode')}
                </Button>
                {isAdmin && (
                  <Button
                    variant="contained"
                    startIcon={!isMobile ? <Add /> : undefined}
                    onClick={handleNewTransaction}
                    size={isMobile ? 'small' : 'medium'}
                    fullWidth={isMobile}
                  >
                    {isMobile ? <Add /> : t('hawala.newTransaction')}
                  </Button>
                )}
              </Box>
            </Box>
          )}
        />
      </Box>
    );
  };

  const renderHawaladars = () => (
    <Box>
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
        muiTopToolbarProps={{
          sx: { flexWrap: 'wrap', gap: 1 }
        }}
        renderTopToolbarCustomActions={() => (
          isAdmin ? (
            <Box sx={{ p: 1 }}>
              <Button
                variant="contained"
                startIcon={!isMobile ? <Add /> : undefined}
                onClick={handleNewHawaladar}
                size={isMobile ? 'small' : 'medium'}
                fullWidth={isMobile}
              >
                {isMobile ? <Add /> : t('hawala.addAgent')}
              </Button>
            </Box>
          ) : null
        )}
      />
    </Box>
  );

  const renderReports = () => {
    // Summary view - shown when selectedReport is null
    if (selectedReport === null) {
      return (
        <>
          {/* Summary Cards */}
          <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                label={t('hawala.totalTransactions')}
                value={reportSummary?.total_transactions || 0}
                bgColor="#e3f2fd"
                isMobile={isMobile}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                label={t('hawala.pending')}
                value={reportSummary?.pending_count || 0}
                bgColor="#fff3e0"
                isMobile={isMobile}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                label={t('hawala.completed')}
                value={reportSummary?.completed_count || 0}
                bgColor="#e8f5e9"
                isMobile={isMobile}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                label={t('hawala.statuses.cancelled')}
                value={reportSummary?.cancelled_count || 0}
                bgColor="#ffebee"
                isMobile={isMobile}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Agent Reports */}
          <Box sx={{ mb: 2 }}>
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
              renderTopToolbarCustomActions={() => (
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>{t('hawala.byAgent')}</Typography>
                </Box>
              )}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Currency Reports */}
          <Box>
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
              renderTopToolbarCustomActions={() => (
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>{t('hawala.byCurrency')}</Typography>
                </Box>
              )}
            />
          </Box>
        </>
      );
    }

    // Specific report views
    return (
      <>
        {selectedReport === 'netPosition' && <HawalaNetPositionReport />}
        {selectedReport === 'unpaid' && <HawalaUnpaidReport />}
        {selectedReport === 'commission' && <HawalaCommissionReportPage />}
        {selectedReport === 'cashFlow' && <HawalaDailyCashFlowReportPage />}
        {selectedReport === 'aging' && <HawalaTransactionAgingReportPage />}
      </>
    );
  };

  const customerColumns = useMemo<MRT_ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: 'first_name',
        header: t('hawala.firstName'),
        size: 130,
        Cell: ({ row }) => (
          <Typography variant="body2" noWrap>
            {row.original.first_name} {row.original.last_name}
          </Typography>
        )
      },
      {
        accessorKey: 'tazkira_number',
        header: t('hawala.tazkira'),
        size: 120
      },
      {
        accessorKey: 'phone',
        header: t('hawala.phone'),
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
        header: t('hawala.customer'),
        size: 150,
        Cell: ({ row }) => (
          <Typography variant="body2" noWrap>
            {row.original.first_name} {row.original.last_name}
          </Typography>
        )
      },
      {
        accessorKey: 'saraf_name',
        header: t('hawala.saraf'),
        size: 130,
        Cell: ({ row }) => {
          const sarafName = i18n.language === 'fa'
            ? row.original.saraf_name_fa || row.original.saraf_name
            : i18n.language === 'ps'
            ? row.original.saraf_name_ps || row.original.saraf_name
            : row.original.saraf_name;

          return <Typography variant="body2" noWrap>{sarafName}</Typography>;
        }
      },
      {
        accessorKey: 'balance',
        header: t('hawala.balance'),
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
        header: t('hawala.created'),
        size: 110,
        Cell: ({ cell }) => (
          <Typography variant="body2" noWrap>
            {new Date(cell.getValue<string>()).toLocaleDateString()}
          </Typography>
        )
      },
      {
        id: 'actions',
        header: t('admin.actions'),
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
              title={t('hawala.deposit')}
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
              title={t('hawala.withdraw')}
            >
              <ArrowUpward fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleViewTransactions(row.original)}
              title={t('hawala.viewTransactions')}
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
    const renderTopToolbar = () => (
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        width: '100%',
        gap: 2,
        p: 1
      }}>
        {/* Savings Tabs */}
        <Tabs
          value={savingsTab}
          onChange={(_event, newValue) => setSavingsTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              minHeight: 42,
              textTransform: 'none',
              fontSize: isMobile ? '0.85rem' : '0.95rem',
              fontWeight: 500,
            },
          }}
        >
          <Tab
            icon={<People fontSize="small" />}
            iconPosition="start"
            label={t('hawala.customers')}
            sx={{ gap: 0.5 }}
          />
          <Tab
            icon={<AccountBalance fontSize="small" />}
            iconPosition="start"
            label={t('hawala.savingsAccounts')}
            sx={{ gap: 0.5 }}
          />
        </Tabs>

        {/* Action Button */}
        <Box sx={{
          display: 'flex',
          gap: 1,
          justifyContent: isMobile ? 'stretch' : 'flex-end'
        }}>
          <Button
            variant="contained"
            startIcon={!isMobile ? <Add /> : undefined}
            onClick={savingsTab === 0 ? handleNewCustomer : handleNewAccount}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
          >
            {isMobile ? <Add /> : (savingsTab === 0 ? t('hawala.addCustomer') : t('hawala.createAccount'))}
          </Button>
        </Box>
      </Box>
    );

    return (
      <Box>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {savingsTab === 0 ? (
          <MaterialReactTable
            columns={customerColumns}
            data={customers || []}
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
            muiTopToolbarProps={{
              sx: { flexWrap: 'wrap', gap: 1 }
            }}
            renderTopToolbarCustomActions={renderTopToolbar}
          />
        ) : (
          <MaterialReactTable
            columns={savingsAccountColumns}
            data={savingsAccounts || []}
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
            muiTopToolbarProps={{
              sx: { flexWrap: 'wrap', gap: 1 }
            }}
            renderTopToolbarCustomActions={renderTopToolbar}
          />
        )}
      </Box>
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
    <Container maxWidth={false} sx={{ py: isMobile ? 1.5 : 3, px: isMobile ? 1.5 : 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1.5 : 2,
        }}
      >
        <CollapsibleSidebar
          title={t('hawala.title')}
          items={sidebarItems}
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          renderSubItems={renderReportsSubmenu}
        />

        <Paper sx={{ flex: 1, p: isMobile ? 1.5 : 2.5, borderRadius: 2, overflow: 'hidden' }}>
          {renderContent()}
        </Paper>
      </Box>

      {/* Transaction Dialog */}
      <DraggableDialog open={transactionDialog} onClose={() => setTransactionDialog(false)} maxWidth="md" fullWidth>
        <DraggableDialogTitle>{selectedTransaction ? t('hawala.editTransaction') : t('hawala.newTransaction')}</DraggableDialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Transaction Direction */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
            <Typography variant="subtitle2" fontWeight={600} color="info.dark" gutterBottom>
              {t('hawala.transactionDirection')}
            </Typography>
            <TextField
              fullWidth
              select
              value={transactionForm.transaction_direction}
              onChange={(e) => setTransactionForm({ ...transactionForm, transaction_direction: e.target.value as 'outgoing' | 'incoming' })}
              size="small"
            >
              <MenuItem value="outgoing">
                <Box>
                  <Typography variant="body2" fontWeight={600}>{t('hawala.outgoing')}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('hawala.outgoingDesc')}
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="incoming">
                <Box>
                  <Typography variant="body2" fontWeight={600}>{t('hawala.incoming')}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('hawala.incomingDesc')}
                  </Typography>
                </Box>
              </MenuItem>
            </TextField>
          </Box>

          {/* Reference Code Field - Only for Incoming Transactions */}
          {transactionForm.transaction_direction === 'incoming' && (
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label={t('hawala.referenceCode')}
                value={transactionForm.reference_code}
                onChange={(e) => setTransactionForm({ ...transactionForm, reference_code: e.target.value.toUpperCase() })}
                placeholder={t('common.referencePlaceholder')}
                required
                helperText={t('hawala.enterReferenceCodeFromSender')}
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Box>
          )}

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
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                select
                label={t('hawala.commissionType')}
                value={transactionForm.commission_type}
                onChange={(e) => setTransactionForm({ ...transactionForm, commission_type: e.target.value as 'add' | 'deduct' })}
                SelectProps={{ native: false }}
              >
                <MenuItem value="add">{t('hawala.commissionAdd')}</MenuItem>
                <MenuItem value="deduct">{t('hawala.commissionDeduct')}</MenuItem>
              </TextField>
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

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>
            {t('hawala.paymentMethod')}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label={t('hawala.selectCustomerOptional')}
                value={transactionForm.customer_id}
                onChange={(e) => {
                  setTransactionForm({
                    ...transactionForm,
                    customer_id: e.target.value,
                    customer_savings_account_id: '' // Reset account when customer changes
                  });
                }}
              >
                <MenuItem value="">{t('hawala.cashPayment')}</MenuItem>
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.first_name} {customer.last_name} - {customer.phone}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {transactionForm.customer_id && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  label={t('hawala.selectSavingsAccount')}
                  value={transactionForm.customer_savings_account_id}
                  onChange={(e) => setTransactionForm({
                    ...transactionForm,
                    customer_savings_account_id: e.target.value
                  })}
                  disabled={eligibleSavingsAccounts.length === 0}
                  helperText={
                    eligibleSavingsAccounts.length === 0
                      ? t('hawala.noEligibleAccounts')
                      : undefined
                  }
                >
                  <MenuItem value="">{t('hawala.selectAccount')}</MenuItem>
                  {eligibleSavingsAccounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.currency_code}: {new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }).format(account.balance)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransactionDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveTransaction}>{t('common.save')}</Button>
        </DialogActions>
      </DraggableDialog>

      {/* Status Update Dialog */}
      <DraggableDialog open={statusDialog} onClose={() => setStatusDialog(false)}>
        <DraggableDialogTitle>{t('hawala.changeStatus')}</DraggableDialogTitle>
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
      </DraggableDialog>

      {/* Search Dialog */}
      <DraggableDialog open={searchDialog} onClose={() => { setSearchDialog(false); setSearchResult(null); setSearchError(''); setSearchCode(''); }}>
        <DraggableDialogTitle>{t('hawala.searchByCode')}</DraggableDialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField
              fullWidth
              label={t('hawala.referenceCode')}
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              placeholder={t('common.referencePlaceholder')}
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
      </DraggableDialog>

      {/* Payout Dialog */}
      <DraggableDialog open={payoutDialog} onClose={() => setPayoutDialog(false)} maxWidth="sm" fullWidth>
        <DraggableDialogTitle>{t('hawala.completePayout')}</DraggableDialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {selectedTransaction && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom color="primary" fontWeight={600}>
                {t('hawala.transactionDetails')}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'grid', gap: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('hawala.referenceCode')}:</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedTransaction.reference_code}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('hawala.sender')}:</Typography>
                  <Typography variant="body2">{selectedTransaction.sender_name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('hawala.receiver')}:</Typography>
                  <Typography variant="body2" fontWeight={600} color="primary">{selectedTransaction.receiver_name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('hawala.amount')}:</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatCurrency(selectedTransaction.amount)} {selectedTransaction.currency_code}</Typography>
                </Box>
                {selectedTransaction.commission_amount > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">{t('hawala.commission')}:</Typography>
                    <Typography variant="body2">{formatCurrency(selectedTransaction.commission_amount)} {selectedTransaction.currency_code}</Typography>
                  </Box>
                )}
                {selectedTransaction.commission_type === 'deduct' && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">{t('hawala.payoutAmount')}:</Typography>
                    <Typography variant="body1" fontWeight={700} color="success.main">
                      {formatCurrency(selectedTransaction.amount - selectedTransaction.commission_amount)} {selectedTransaction.currency_code}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          <Alert severity="warning" sx={{ mb: 2 }}>
            {t('hawala.payoutWarning')}
          </Alert>

          <TextField
            fullWidth
            label={t('hawala.receiverNameVerification')}
            value={payoutForm.receiver_name_verification}
            onChange={(e) => setPayoutForm({ ...payoutForm, receiver_name_verification: e.target.value })}
            helperText={t('hawala.receiverNameVerificationHelp')}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            required
            label={t('hawala.receiverTazkira')}
            value={payoutForm.receiver_tazkira_number}
            onChange={(e) => setPayoutForm({ ...payoutForm, receiver_tazkira_number: e.target.value })}
            helperText={t('hawala.receiverTazkiraHelp')}
            inputProps={{ minLength: 6, maxLength: 20 }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            required
            label={t('hawala.receiverPhoneNumber')}
            value={payoutForm.receiver_phone}
            onChange={(e) => setPayoutForm({ ...payoutForm, receiver_phone: e.target.value })}
            helperText={t('hawala.receiverPhoneNumberHelp')}
            inputProps={{ minLength: 8, maxLength: 20 }}
            sx={{ mb: 2 }}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayoutDialog(false)}>{t('common.cancel')}</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSavePayout}
            disabled={!payoutForm.receiver_tazkira_number.trim() || !payoutForm.receiver_phone.trim()}
          >
            {t('hawala.confirmPayout')}
          </Button>
        </DialogActions>
      </DraggableDialog>


      {/* Hawaladar Dialog */}
      <DraggableDialog open={hawaladarDialog} onClose={() => setHawaladarDialog(false)} maxWidth="md" fullWidth>
        <DraggableDialogTitle>{selectedHawaladar ? t('hawala.editAgent') : t('hawala.addAgent')}</DraggableDialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label={t('hawala.nameEn')}
                value={hawaladarForm.name}
                onChange={(e) => setHawaladarForm({ ...hawaladarForm, name: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label={t('hawala.nameFa')}
                value={hawaladarForm.name_fa}
                onChange={(e) => setHawaladarForm({ ...hawaladarForm, name_fa: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label={t('hawala.namePs')}
                value={hawaladarForm.name_ps}
                onChange={(e) => setHawaladarForm({ ...hawaladarForm, name_ps: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label={t('hawala.phone')}
                value={hawaladarForm.phone}
                onChange={(e) => setHawaladarForm({ ...hawaladarForm, phone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                select
                label={t('hawala.province')}
                value={hawaladarForm.province_id}
                onChange={(e) => {
                  setHawaladarForm({ ...hawaladarForm, province_id: e.target.value, district_id: '' });
                }}
              >
                <MenuItem value="">{t('hawala.selectProvince')}</MenuItem>
                {provinces.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {i18n.language === 'fa' ? p.name_fa || p.name : i18n.language === 'ps' ? p.name_ps || p.name : p.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                select
                label={t('hawala.district')}
                value={hawaladarForm.district_id}
                onChange={(e) => setHawaladarForm({ ...hawaladarForm, district_id: e.target.value })}
                disabled={!hawaladarForm.province_id}
              >
                <MenuItem value="">{t('hawala.selectDistrict')}</MenuItem>
                {districts
                  .filter(d => d.province_id === parseInt(hawaladarForm.province_id))
                  .map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {i18n.language === 'fa' ? d.name_fa || d.name : i18n.language === 'ps' ? d.name_ps || d.name : d.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label={t('hawala.locationEn')}
                value={hawaladarForm.location}
                onChange={(e) => setHawaladarForm({ ...hawaladarForm, location: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label={t('hawala.locationFa')}
                value={hawaladarForm.location_fa}
                onChange={(e) => setHawaladarForm({ ...hawaladarForm, location_fa: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label={t('hawala.locationPs')}
                value={hawaladarForm.location_ps}
                onChange={(e) => setHawaladarForm({ ...hawaladarForm, location_ps: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label={t('hawala.floorNumber')}
                value={hawaladarForm.floor_number}
                onChange={(e) => setHawaladarForm({ ...hawaladarForm, floor_number: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label={t('hawala.shopNumber')}
                value={hawaladarForm.shop_number}
                onChange={(e) => setHawaladarForm({ ...hawaladarForm, shop_number: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="number"
                label={t('hawala.commissionRate')}
                value={hawaladarForm.commission_rate}
                onChange={(e) => setHawaladarForm({ ...hawaladarForm, commission_rate: e.target.value })}
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>

            {/* Status Field */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                select
                label={t('hawala.statusActive')}
                value={hawaladarForm.is_active}
                onChange={(e) => setHawaladarForm({ ...hawaladarForm, is_active: Number(e.target.value) })}
              >
                <MenuItem value={1}>{t('hawala.active')}</MenuItem>
                <MenuItem value={0}>{t('hawala.inactive')}</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHawaladarDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveHawaladar}>{t('common.save')}</Button>
        </DialogActions>
      </DraggableDialog>

      {/* Customer Dialog */}
      <DraggableDialog open={customerDialog} onClose={() => setCustomerDialog(false)} maxWidth="sm" fullWidth>
        <DraggableDialogTitle>{selectedCustomer ? t('hawala.editCustomer') : t('hawala.addCustomer')}</DraggableDialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('hawala.firstName')}
                value={customerForm.first_name}
                onChange={(e) => setCustomerForm({ ...customerForm, first_name: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('hawala.lastName')}
                value={customerForm.last_name}
                onChange={(e) => setCustomerForm({ ...customerForm, last_name: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('hawala.tazkiraNumber')}
                value={customerForm.tazkira_number}
                onChange={(e) => setCustomerForm({ ...customerForm, tazkira_number: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('hawala.phone')}
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
      </DraggableDialog>

      {/* Create Savings Account Dialog */}
      <DraggableDialog open={accountDialog} onClose={() => setAccountDialog(false)} maxWidth="sm" fullWidth>
        <DraggableDialogTitle>{t('hawala.createAccount')}</DraggableDialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                label={t('hawala.customer')}
                value={accountForm.customer_id}
                onChange={(e) => setAccountForm({ ...accountForm, customer_id: Number(e.target.value) })}
                required
              >
                <MenuItem value={0}>{t('hawala.selectCustomer')}</MenuItem>
                {customers?.map((c) => (
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
                label={t('hawala.saraf')}
                value={accountForm.saraf_id}
                onChange={(e) => setAccountForm({ ...accountForm, saraf_id: Number(e.target.value) })}
                required
              >
                {hawaladars?.filter(h => h.is_active).map((h) => {
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
                {currencies?.map((c) => (
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
      </DraggableDialog>

      {/* Deposit Dialog */}
      <DraggableDialog open={depositDialog} onClose={() => setDepositDialog(false)} maxWidth="xs" fullWidth>
        <DraggableDialogTitle>{t('hawala.deposit')}</DraggableDialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {selectedAccount && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              {t('hawala.customerLabel')}: {selectedAccount.first_name} {selectedAccount.last_name}
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
      </DraggableDialog>

      {/* Withdraw Dialog */}
      <DraggableDialog open={withdrawDialog} onClose={() => setWithdrawDialog(false)} maxWidth="xs" fullWidth>
        <DraggableDialogTitle>{t('hawala.withdraw')}</DraggableDialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {selectedAccount && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('hawala.customerLabel')}: {selectedAccount.first_name} {selectedAccount.last_name}
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
      </DraggableDialog>

      {/* Transaction History Dialog */}
      <DraggableDialog open={transactionsHistoryDialog} onClose={() => setTransactionsHistoryDialog(false)} maxWidth="md" fullWidth>
        <DraggableDialogTitle>{t('hawala.transactionHistory')}</DraggableDialogTitle>
        <DialogContent>
          {selectedAccount && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t('hawala.customerLabel')}: {selectedAccount.first_name} {selectedAccount.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('hawala.sarafLabel')}: {
                  i18n.language === 'fa'
                    ? selectedAccount.saraf_name_fa || selectedAccount.saraf_name
                    : i18n.language === 'ps'
                    ? selectedAccount.saraf_name_ps || selectedAccount.saraf_name
                    : selectedAccount.saraf_name
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('hawala.currentBalanceLabel')}: {formatCurrency(selectedAccount.balance)} {selectedAccount.currency_code}
              </Typography>
            </Box>
          )}
          {accountTransactions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              {t('hawala.noTransactionsYet')}
            </Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>{t('hawala.date')}</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>{t('hawala.type')}</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>{t('hawala.amount')}</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>{t('hawala.balanceAfter')}</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>{t('hawala.notes')}</th>
                  </tr>
                </thead>
                <tbody>
                  {accountTransactions.map((txn) => (
                    <tr key={txn.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px' }}>
                        {new Date(txn.created_at).toLocaleDateString()} {new Date(txn.created_at).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: '8px' }}>
                        <Chip
                          label={txn.transaction_type}
                          color={txn.transaction_type === 'deposit' ? 'success' : 'warning'}
                          size="small"
                        />
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>
                        {txn.transaction_type === 'deposit' ? '+' : '-'}{formatCurrency(txn.amount)} {txn.currency_code}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>
                        {formatCurrency(txn.balance_after)} {txn.currency_code}
                      </td>
                      <td style={{ padding: '8px' }}>
                        {txn.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransactionsHistoryDialog(false)}>{t('common.close')}</Button>
        </DialogActions>
      </DraggableDialog>
    </Container>
  );
};
