import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Chip
} from '@mui/material';
import { Star, Delete, Add, NotificationsActive } from '@mui/icons-material';
import {
  getDashboard,
  getFavorites,
  getAlerts,
  getCurrencies,
  addFavorite,
  removeFavorite,
  createAlert,
  deleteAlert
} from '../services/api';
import type { ExchangeRate, Currency, PriceAlert } from '../types';
import { Loading } from '../components/common/Loading';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ favorites_count: 0, active_alerts_count: 0, recent_rates: [] as ExchangeRate[] });
  const [favorites, setFavorites] = useState<Currency[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const [favoriteDialogOpen, setFavoriteDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [targetRate, setTargetRate] = useState('');
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [dashboardData, favoritesData, alertsData, currenciesData] = await Promise.all([
        getDashboard(),
        getFavorites(),
        getAlerts(),
        getCurrencies()
      ]);
      setStats(dashboardData);
      setFavorites(favoritesData);
      setAlerts(alertsData);
      setCurrencies(currenciesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddFavorite = async () => {
    if (!selectedCurrency) return;
    try {
      await addFavorite(parseInt(selectedCurrency));
      setFavoriteDialogOpen(false);
      setSelectedCurrency('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || t('user.failedAddFavorite'));
    }
  };

  const handleRemoveFavorite = async (currencyId: number) => {
    try {
      await removeFavorite(currencyId);
      fetchData();
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleCreateAlert = async () => {
    if (!selectedCurrency || !targetRate) return;
    try {
      await createAlert(parseInt(selectedCurrency), parseFloat(targetRate), alertType);
      setAlertDialogOpen(false);
      setSelectedCurrency('');
      setTargetRate('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || t('user.failedCreateAlert'));
    }
  };

  const handleDeleteAlert = async (id: number) => {
    try {
      await deleteAlert(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  if (loading) return <Loading />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('user.dashboard')}
      </Typography>
      <Typography color="text.secondary" gutterBottom>
        {t('user.welcomeBack')}, {user?.full_name || user?.username}!
      </Typography>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Star color="warning" />
                <Typography variant="h4" fontWeight={700}>{stats.favorites_count}</Typography>
              </Box>
              <Typography color="text.secondary">{t('user.favorites')}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsActive color="primary" />
                <Typography variant="h4" fontWeight={700}>{stats.active_alerts_count}</Typography>
              </Box>
              <Typography color="text.secondary">{t('user.alerts')}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Favorites */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>{t('user.favorites')}</Typography>
              <Button startIcon={<Add />} onClick={() => setFavoriteDialogOpen(true)}>
                {t('admin.addNew')}
              </Button>
            </Box>
            {favorites.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={3}>
                {t('user.noFavorites')}
              </Typography>
            ) : (
              <List>
                {favorites.map((fav: any) => (
                  <ListItem key={fav.currency_id}>
                    <ListItemText
                      primary={fav.code}
                      secondary={fav.name}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleRemoveFavorite(fav.currency_id)}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Alerts */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>{t('user.alerts')}</Typography>
              <Button startIcon={<Add />} onClick={() => setAlertDialogOpen(true)}>
                {t('user.createAlert')}
              </Button>
            </Box>
            {alerts.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={3}>
                {t('user.noAlerts')}
              </Typography>
            ) : (
              <List>
                {alerts.map((alert) => (
                  <ListItem key={alert.id}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {alert.code}
                          <Chip
                            label={alert.alert_type === 'above' ? t('user.above') : t('user.below')}
                            size="small"
                            color={alert.alert_type === 'above' ? 'success' : 'error'}
                          />
                        </Box>
                      }
                      secondary={`${t('user.target')}: ${alert.target_rate} AFN`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleDeleteAlert(alert.id)}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Add Favorite Dialog */}
      <Dialog open={favoriteDialogOpen} onClose={() => setFavoriteDialogOpen(false)}>
        <DialogTitle>{t('user.addFavorite')}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            select
            fullWidth
            label={t('rates.currency')}
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            sx={{ mt: 1 }}
          >
            {currencies.map((currency) => (
              <MenuItem key={currency.id} value={currency.id}>
                {currency.code} - {currency.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFavoriteDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleAddFavorite}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Create Alert Dialog */}
      <Dialog open={alertDialogOpen} onClose={() => setAlertDialogOpen(false)}>
        <DialogTitle>{t('user.createAlert')}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            select
            fullWidth
            label={t('rates.currency')}
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            sx={{ mt: 1 }}
          >
            {currencies.map((currency) => (
              <MenuItem key={currency.id} value={currency.id}>
                {currency.code} - {currency.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            type="number"
            label={t('user.targetRate')}
            value={targetRate}
            onChange={(e) => setTargetRate(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            select
            fullWidth
            label={t('user.alertType')}
            value={alertType}
            onChange={(e) => setAlertType(e.target.value as 'above' | 'below')}
            sx={{ mt: 2 }}
          >
            <MenuItem value="above">{t('user.above')}</MenuItem>
            <MenuItem value="below">{t('user.below')}</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleCreateAlert}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
