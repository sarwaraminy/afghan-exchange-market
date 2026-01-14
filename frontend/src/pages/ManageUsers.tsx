import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
  MenuItem
} from '@mui/material';
import {
  Edit,
  Delete,
  Add
} from '@mui/icons-material';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getMarkets,
  getCurrencies
} from '../services/api';
import type { User, Market, Currency } from '../types';
import { Loading } from '../components/common/Loading';
import { useAuth } from '../context/AuthContext';

export const ManageUsers = () => {
  const { t, i18n } = useTranslation();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [userDialog, setUserDialog] = useState(false);
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState('');

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

  const isRtl = i18n.language === 'fa' || i18n.language === 'ps';
  const isAdmin = currentUser?.role === 'admin';

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  const getMarketName = (name: string) => {
    const translated = t(`rates.markets.${name}`, { defaultValue: '' });
    return translated || name;
  };

  const getCurrencyName = (code: string) => {
    const translated = t(`currencies.${code}`, { defaultValue: '' });
    return translated || code;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, marketsData, currenciesData] = await Promise.all([
        getAllUsers(),
        getMarkets(),
        getCurrencies()
      ]);
      setUsers(usersData);
      setMarkets(marketsData);
      setCurrencies(currenciesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

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

  const handleNewUser = () => {
    setSelectedUser(null);
    setUserForm({
      username: '',
      email: '',
      full_name: '',
      role: 'user',
      language: 'en',
      preferred_market_id: 1,
      preferred_currency_id: 1,
      password: ''
    });
    setError('');
    setCreateUserDialog(true);
  };

  const handleCreateUser = async () => {
    try {
      await createUser({
        username: userForm.username,
        email: userForm.email,
        password: userForm.password,
        full_name: userForm.full_name || undefined,
        role: userForm.role,
        language: userForm.language,
        preferred_market_id: userForm.preferred_market_id,
        preferred_currency_id: userForm.preferred_currency_id
      });
      setCreateUserDialog(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || t('admin.failedCreateUser'));
    }
  };

  const userColumns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      { accessorKey: 'username', header: t('auth.username') },
      { accessorKey: 'email', header: t('auth.email') },
      { accessorKey: 'full_name', header: t('auth.fullName') },
      {
        accessorKey: 'role',
        header: t('admin.roleLabel'),
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
            <IconButton onClick={() => handleEditUser(row.original)} size="small">
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDeleteUser(row.original.id)} color="error" size="small">
              <Delete />
            </IconButton>
          </Box>
        )
      }
    ],
    [t, i18n.language]
  );

  if (loading) return <Loading />;
  if (!isAdmin) return null;

  return (
    <Container maxWidth={false} sx={{ py: 4, px: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('admin.manageUsers')}
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>{t('admin.manageUsers')}</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleNewUser}>
            {t('admin.addNew')}
          </Button>
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
      </Paper>

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
            label={t('admin.roleLabel')}
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
            sx={{ mt: 2 }}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label={t('common.language')}
            value={userForm.language}
            onChange={(e) => setUserForm({ ...userForm, language: e.target.value })}
            sx={{ mt: 2 }}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="fa">فارسی (Dari)</MenuItem>
            <MenuItem value="ps">پښتو (Pashto)</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label={t('admin.preferredMarket')}
            value={userForm.preferred_market_id}
            onChange={(e) => setUserForm({ ...userForm, preferred_market_id: Number(e.target.value) })}
            sx={{ mt: 2 }}
          >
            {markets.map((market) => (
              <MenuItem key={market.id} value={market.id}>
                {getMarketName(market.name)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label={t('admin.preferredCurrency')}
            value={userForm.preferred_currency_id}
            onChange={(e) => setUserForm({ ...userForm, preferred_currency_id: Number(e.target.value) })}
            sx={{ mt: 2 }}
          >
            {currencies.map((currency) => (
              <MenuItem key={currency.id} value={currency.id}>
                {getCurrencyName(currency.code)} ({currency.code})
              </MenuItem>
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

      {/* Create User Dialog */}
      <Dialog open={createUserDialog} onClose={() => setCreateUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('admin.createUser')}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label={t('auth.username')}
            value={userForm.username}
            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
            sx={{ mt: 1 }}
            required
          />
          <TextField
            fullWidth
            label={t('auth.email')}
            type="email"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            sx={{ mt: 2 }}
            required
          />
          <TextField
            fullWidth
            label={t('auth.password')}
            type="password"
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            sx={{ mt: 2 }}
            required
            helperText={t('admin.passwordRequirements')}
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
            label={t('admin.roleLabel')}
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
            sx={{ mt: 2 }}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label={t('common.language')}
            value={userForm.language}
            onChange={(e) => setUserForm({ ...userForm, language: e.target.value })}
            sx={{ mt: 2 }}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="fa">فارسی (Dari)</MenuItem>
            <MenuItem value="ps">پښتو (Pashto)</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label={t('admin.preferredMarket')}
            value={userForm.preferred_market_id}
            onChange={(e) => setUserForm({ ...userForm, preferred_market_id: Number(e.target.value) })}
            sx={{ mt: 2 }}
          >
            {markets.map((market) => (
              <MenuItem key={market.id} value={market.id}>
                {getMarketName(market.name)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label={t('admin.preferredCurrency')}
            value={userForm.preferred_currency_id}
            onChange={(e) => setUserForm({ ...userForm, preferred_currency_id: Number(e.target.value) })}
            sx={{ mt: 2 }}
          >
            {currencies.map((currency) => (
              <MenuItem key={currency.id} value={currency.id}>
                {getCurrencyName(currency.code)} ({currency.code})
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateUserDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleCreateUser}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
