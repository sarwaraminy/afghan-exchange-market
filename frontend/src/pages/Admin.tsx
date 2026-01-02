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
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  CurrencyExchange,
  Diamond,
  Newspaper,
  People
} from '@mui/icons-material';
import {
  getExchangeRates,
  getGoldRates,
  getAllNews,
  getMarkets,
  getCurrencies,
  updateExchangeRate,
  createExchangeRate,
  deleteExchangeRate,
  updateGoldRate,
  createGoldRate,
  deleteGoldRate,
  createNews,
  updateNews,
  deleteNews,
  getAllUsers,
  updateUser,
  deleteUser
} from '../services/api';
import type { ExchangeRate, GoldRate, News, Market, Currency, User } from '../types';
import { Loading } from '../components/common/Loading';

export const Admin = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getCurrencyName = (code: string) => {
    const translated = t(`currencies.${code}`, { defaultValue: '' });
    return translated || code;
  };

  const getMarketName = (name: string) => {
    const translated = t(`rates.markets.${name}`, { defaultValue: '' });
    return translated || name;
  };

  const getGoldTypeName = (type: string) => {
    const translated = t(`gold.types.${type}`, { defaultValue: '' });
    return translated || type;
  };

  const getCategoryName = (category: string) => {
    return t(`news.${category}`, { defaultValue: category });
  };

  const isRtl = i18n.language === 'fa' || i18n.language === 'ps';

  const [selectedSection, setSelectedSection] = useState(0);
  const [loading, setLoading] = useState(true);

  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [goldRates, setGoldRates] = useState<GoldRate[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [editRateDialog, setEditRateDialog] = useState(false);
  const [createRateDialog, setCreateRateDialog] = useState(false);
  const [editGoldDialog, setEditGoldDialog] = useState(false);
  const [createGoldDialog, setCreateGoldDialog] = useState(false);
  const [newsDialog, setNewsDialog] = useState(false);
  const [userDialog, setUserDialog] = useState(false);

  const [selectedRate, setSelectedRate] = useState<ExchangeRate | null>(null);
  const [selectedGold, setSelectedGold] = useState<GoldRate | null>(null);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [buyRate, setBuyRate] = useState('');
  const [sellRate, setSellRate] = useState('');
  const [priceAfn, setPriceAfn] = useState('');
  const [priceUsd, setPriceUsd] = useState('');

  // New rate form
  const [newRateForm, setNewRateForm] = useState({
    market_id: '',
    currency_id: '',
    buy_rate: '',
    sell_rate: ''
  });

  // New gold form
  const [newGoldForm, setNewGoldForm] = useState({
    type: '',
    price_afn: '',
    price_usd: '',
    unit: 'gram'
  });

  const [newsForm, setNewsForm] = useState({
    title: '',
    title_fa: '',
    title_ps: '',
    content: '',
    content_fa: '',
    content_ps: '',
    category: 'general',
    is_published: false
  });

  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    full_name: '',
    role: 'user',
    language: 'en',
    preferred_market_id: 1,
    preferred_currency_id: 1,
    password: ''
  });

  const [error, setError] = useState('');

  const menuItems = [
    { label: t('admin.manageRates'), icon: <CurrencyExchange /> },
    { label: t('admin.manageGold'), icon: <Diamond /> },
    { label: t('admin.manageNews'), icon: <Newspaper /> },
    { label: t('admin.manageUsers'), icon: <People /> }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ratesData, goldData, newsData, marketsData, currenciesData, usersData] = await Promise.all([
        getExchangeRates(),
        getGoldRates(),
        getAllNews(),
        getMarkets(),
        getCurrencies(),
        getAllUsers()
      ]);
      setRates(ratesData);
      setGoldRates(goldData);
      setNews(newsData.news);
      setMarkets(marketsData);
      setCurrencies(currenciesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditRate = (rate: ExchangeRate) => {
    setSelectedRate(rate);
    setBuyRate(rate.buy_rate.toString());
    setSellRate(rate.sell_rate.toString());
    setEditRateDialog(true);
  };

  const handleSaveRate = async () => {
    if (!selectedRate) return;
    try {
      await updateExchangeRate(selectedRate.id, parseFloat(buyRate), parseFloat(sellRate));
      setEditRateDialog(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || t('admin.failedUpdateRate'));
    }
  };

  const handleNewRate = () => {
    setNewRateForm({
      market_id: '',
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
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || t('admin.failedCreateRate'));
    }
  };

  const handleDeleteRate = async (id: number) => {
    if (confirm(t('admin.confirmDeleteRate'))) {
      try {
        await deleteExchangeRate(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting rate:', error);
      }
    }
  };

  const handleEditGold = (gold: GoldRate) => {
    setSelectedGold(gold);
    setPriceAfn(gold.price_afn.toString());
    setPriceUsd(gold.price_usd.toString());
    setEditGoldDialog(true);
  };

  const handleSaveGold = async () => {
    if (!selectedGold) return;
    try {
      await updateGoldRate(selectedGold.id, parseFloat(priceAfn), parseFloat(priceUsd));
      setEditGoldDialog(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || t('admin.failedUpdateGold'));
    }
  };

  const handleNewGold = () => {
    setNewGoldForm({
      type: '',
      price_afn: '',
      price_usd: '',
      unit: 'gram'
    });
    setError('');
    setCreateGoldDialog(true);
  };

  const handleCreateGold = async () => {
    try {
      await createGoldRate(
        newGoldForm.type,
        parseFloat(newGoldForm.price_afn),
        parseFloat(newGoldForm.price_usd),
        newGoldForm.unit
      );
      setCreateGoldDialog(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || t('admin.failedCreateGold'));
    }
  };

  const handleDeleteGold = async (id: number) => {
    if (confirm(t('admin.confirmDeleteGold'))) {
      try {
        await deleteGoldRate(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting gold rate:', error);
      }
    }
  };

  const handleNewNews = () => {
    setSelectedNews(null);
    setNewsForm({
      title: '',
      title_fa: '',
      title_ps: '',
      content: '',
      content_fa: '',
      content_ps: '',
      category: 'general',
      is_published: false
    });
    setNewsDialog(true);
  };

  const handleEditNews = (item: News) => {
    setSelectedNews(item);
    setNewsForm({
      title: item.title,
      title_fa: item.title_fa || '',
      title_ps: item.title_ps || '',
      content: item.content,
      content_fa: item.content_fa || '',
      content_ps: item.content_ps || '',
      category: item.category,
      is_published: !!item.is_published
    });
    setNewsDialog(true);
  };

  const handleSaveNews = async () => {
    try {
      if (selectedNews) {
        await updateNews(selectedNews.id, newsForm);
      } else {
        await createNews(newsForm);
      }
      setNewsDialog(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || t('admin.failedSaveNews'));
    }
  };

  const handleDeleteNews = async (id: number) => {
    if (confirm(t('admin.confirmDelete'))) {
      try {
        await deleteNews(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting news:', error);
      }
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserForm({
      username: user.username,
      email: user.email,
      full_name: user.full_name || '',
      role: user.role,
      language: user.language,
      preferred_market_id: user.preferred_market_id || 1,
      preferred_currency_id: user.preferred_currency_id || 1,
      password: ''
    });
    setError('');
    setUserDialog(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    try {
      const userData: any = {
        username: userForm.username,
        email: userForm.email,
        full_name: userForm.full_name,
        role: userForm.role,
        language: userForm.language,
        preferred_market_id: userForm.preferred_market_id,
        preferred_currency_id: userForm.preferred_currency_id
      };

      if (userForm.password) {
        userData.password = userForm.password;
      }

      await updateUser(selectedUser.id, userData);
      setUserDialog(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || t('admin.failedUpdateUser'));
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm(t('admin.confirmDeleteUser'))) {
      try {
        await deleteUser(id);
        fetchData();
      } catch (err: any) {
        setError(err.response?.data?.error || t('admin.failedDeleteUser'));
      }
    }
  };

  const rateColumns = useMemo<MRT_ColumnDef<ExchangeRate>[]>(
    () => [
      {
        accessorKey: 'currency_code',
        header: t('rates.currency'),
        Cell: ({ row }) => `${row.original.currency_code} - ${getCurrencyName(row.original.currency_code)}`
      },
      {
        accessorKey: 'market_name',
        header: t('rates.market'),
        Cell: ({ cell }) => getMarketName(cell.getValue<string>())
      },
      { accessorKey: 'buy_rate', header: t('rates.buy') },
      { accessorKey: 'sell_rate', header: t('rates.sell') },
      {
        id: 'actions',
        header: t('admin.actions'),
        Cell: ({ row }) => (
          <Box>
            <IconButton onClick={() => handleEditRate(row.original)}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDeleteRate(row.original.id)} color="error">
              <Delete />
            </IconButton>
          </Box>
        )
      }
    ],
    [t, i18n.language]
  );

  const goldColumns = useMemo<MRT_ColumnDef<GoldRate>[]>(
    () => [
      {
        accessorKey: 'type',
        header: t('gold.type'),
        Cell: ({ cell }) => getGoldTypeName(cell.getValue<string>())
      },
      { accessorKey: 'price_afn', header: t('gold.priceAfn') },
      { accessorKey: 'price_usd', header: t('gold.priceUsd') },
      {
        id: 'actions',
        header: t('admin.actions'),
        Cell: ({ row }) => (
          <Box>
            <IconButton onClick={() => handleEditGold(row.original)}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDeleteGold(row.original.id)} color="error">
              <Delete />
            </IconButton>
          </Box>
        )
      }
    ],
    [t, i18n.language]
  );

  const newsColumns = useMemo<MRT_ColumnDef<News>[]>(
    () => [
      { accessorKey: 'title', header: t('admin.titleEn') },
      {
        accessorKey: 'category',
        header: t('news.category'),
        Cell: ({ cell }) => <Chip label={getCategoryName(cell.getValue<string>())} size="small" />
      },
      {
        accessorKey: 'is_published',
        header: t('admin.published'),
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue<number>() ? t('admin.published') : t('admin.draft')}
            color={cell.getValue<number>() ? 'success' : 'default'}
            size="small"
          />
        )
      },
      {
        id: 'actions',
        header: t('admin.actions'),
        Cell: ({ row }) => (
          <Box>
            <IconButton onClick={() => handleEditNews(row.original)}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDeleteNews(row.original.id)} color="error">
              <Delete />
            </IconButton>
          </Box>
        )
      }
    ],
    [t, i18n.language]
  );

  const userColumns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      { accessorKey: 'username', header: t('auth.username') },
      { accessorKey: 'email', header: t('auth.email') },
      { accessorKey: 'full_name', header: t('auth.fullName') },
      {
        accessorKey: 'role',
        header: t('admin.role'),
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue<string>()}
            color={cell.getValue<string>() === 'admin' ? 'primary' : 'default'}
            size="small"
          />
        )
      },
      { accessorKey: 'language', header: t('common.language') },
      {
        id: 'actions',
        header: t('admin.actions'),
        Cell: ({ row }) => (
          <Box>
            <IconButton onClick={() => handleEditUser(row.original)}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDeleteUser(row.original.id)} color="error">
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
          {t('admin.panel')}
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
              <ListItemIcon sx={{ minWidth: 40 }}>
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

  const renderContent = () => {
    switch (selectedSection) {
      case 0:
        return (
          <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600}>{t('admin.manageRates')}</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={handleNewRate}>
                {t('admin.addNew')}
              </Button>
            </Box>
            <MaterialReactTable
              columns={rateColumns}
              data={rates}
              enablePagination
              enableSorting
              enableGlobalFilter
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
        );
      case 1:
        return (
          <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600}>{t('admin.manageGold')}</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={handleNewGold}>
                {t('admin.addNew')}
              </Button>
            </Box>
            <MaterialReactTable
              columns={goldColumns}
              data={goldRates}
              enablePagination={false}
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
        );
      case 2:
        return (
          <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600}>{t('admin.manageNews')}</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={handleNewNews}>
                {t('admin.addNew')}
              </Button>
            </Box>
            <MaterialReactTable
              columns={newsColumns}
              data={news}
              enablePagination
              enableSorting
              enableGlobalFilter
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
        );
      case 3:
        return (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>{t('admin.manageUsers')}</Typography>
            </Box>
            <MaterialReactTable
              columns={userColumns}
              data={users}
              enablePagination
              enableSorting
              enableGlobalFilter
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
        );
      default:
        return null;
    }
  };

  if (loading) return <Loading />;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('admin.panel')}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 3,
        }}
      >
        {sidebar}

        <Paper sx={{ flex: 1, p: 3, borderRadius: 2 }}>
          {renderContent()}
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
                {getMarketName(market.name)}
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

      {/* Edit Gold Dialog */}
      <Dialog open={editGoldDialog} onClose={() => setEditGoldDialog(false)}>
        <DialogTitle>{t('admin.editGold')} - {selectedGold ? getGoldTypeName(selectedGold.type) : ''}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            type="number"
            label={t('gold.priceAfn')}
            value={priceAfn}
            onChange={(e) => setPriceAfn(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            type="number"
            label={t('gold.priceUsd')}
            value={priceUsd}
            onChange={(e) => setPriceUsd(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditGoldDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveGold}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Create Gold Dialog */}
      <Dialog open={createGoldDialog} onClose={() => setCreateGoldDialog(false)}>
        <DialogTitle>{t('admin.createGold')}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label={t('gold.type')}
            value={newGoldForm.type}
            onChange={(e) => setNewGoldForm({ ...newGoldForm, type: e.target.value })}
            sx={{ mt: 1 }}
            placeholder={t('admin.goldTypePlaceholder')}
          />
          <TextField
            fullWidth
            type="number"
            label={t('gold.priceAfn')}
            value={newGoldForm.price_afn}
            onChange={(e) => setNewGoldForm({ ...newGoldForm, price_afn: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            type="number"
            label={t('gold.priceUsd')}
            value={newGoldForm.price_usd}
            onChange={(e) => setNewGoldForm({ ...newGoldForm, price_usd: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            select
            label={t('gold.unit')}
            value={newGoldForm.unit}
            onChange={(e) => setNewGoldForm({ ...newGoldForm, unit: e.target.value })}
            sx={{ mt: 2 }}
            SelectProps={{ native: true }}
          >
            <option value="gram">{t('gold.units.gram')}</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateGoldDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleCreateGold}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* News Dialog */}
      <Dialog open={newsDialog} onClose={() => setNewsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedNews ? t('admin.editNews') : t('admin.createNews')}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label={t('admin.titleEn')}
            value={newsForm.title}
            onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            label={t('admin.titleFa')}
            value={newsForm.title_fa}
            onChange={(e) => setNewsForm({ ...newsForm, title_fa: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label={t('admin.titlePs')}
            value={newsForm.title_ps}
            onChange={(e) => setNewsForm({ ...newsForm, title_ps: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label={t('admin.contentEn')}
            value={newsForm.content}
            onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label={t('admin.contentFa')}
            value={newsForm.content_fa}
            onChange={(e) => setNewsForm({ ...newsForm, content_fa: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label={t('admin.contentPs')}
            value={newsForm.content_ps}
            onChange={(e) => setNewsForm({ ...newsForm, content_ps: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            select
            label={t('news.category')}
            value={newsForm.category}
            onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
            sx={{ mt: 2 }}
            SelectProps={{ native: true }}
          >
            <option value="general">{t('news.general')}</option>
            <option value="market">{t('news.market')}</option>
            <option value="announcement">{t('news.announcement')}</option>
          </TextField>
          <FormControlLabel
            control={
              <Switch
                checked={newsForm.is_published}
                onChange={(e) => setNewsForm({ ...newsForm, is_published: e.target.checked })}
              />
            }
            label={t('admin.published')}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewsDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveNews}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={userDialog} onClose={() => setUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('admin.editUser')}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label={t('auth.username')}
            value={userForm.username}
            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            label={t('auth.email')}
            type="email"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label={t('auth.fullName')}
            value={userForm.full_name}
            onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            select
            label={t('admin.role')}
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
            sx={{ mt: 2 }}
            SelectProps={{ native: true }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </TextField>
          <TextField
            fullWidth
            select
            label={t('common.language')}
            value={userForm.language}
            onChange={(e) => setUserForm({ ...userForm, language: e.target.value })}
            sx={{ mt: 2 }}
            SelectProps={{ native: true }}
          >
            <option value="en">English</option>
            <option value="fa">فارسی (Dari)</option>
            <option value="ps">پښتو (Pashto)</option>
          </TextField>
          <TextField
            fullWidth
            select
            label={t('admin.preferredMarket')}
            value={userForm.preferred_market_id}
            onChange={(e) => setUserForm({ ...userForm, preferred_market_id: parseInt(e.target.value) })}
            sx={{ mt: 2 }}
            SelectProps={{ native: true }}
          >
            {markets.map((market) => (
              <option key={market.id} value={market.id}>
                {getMarketName(market.name)}
              </option>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label={t('admin.preferredCurrency')}
            value={userForm.preferred_currency_id}
            onChange={(e) => setUserForm({ ...userForm, preferred_currency_id: parseInt(e.target.value) })}
            sx={{ mt: 2 }}
            SelectProps={{ native: true }}
          >
            {currencies.map((currency) => (
              <option key={currency.id} value={currency.id}>
                {getCurrencyName(currency.code)}
              </option>
            ))}
          </TextField>
          <TextField
            fullWidth
            label={t('admin.newPassword')}
            type="password"
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            sx={{ mt: 2 }}
            placeholder={t('admin.leaveBlankToKeep')}
            helperText={t('admin.leaveBlankToKeep')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveUser}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
