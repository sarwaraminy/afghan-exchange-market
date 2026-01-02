import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  MenuItem
} from '@mui/material';
import { register as registerApi, getMarkets, getCurrencies } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Market, Currency } from '../types';

export const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    language: 'en',
    preferred_market_id: 1,
    preferred_currency_id: 1
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [marketsData, currenciesData] = await Promise.all([
          getMarkets(),
          getCurrencies()
        ]);
        setMarkets(marketsData);
        setCurrencies(currenciesData);
      } catch (err) {
        console.error('Failed to fetch markets or currencies:', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      const data = await registerApi({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        language: formData.language,
        preferred_market_id: formData.preferred_market_id,
        preferred_currency_id: formData.preferred_currency_id
      });

      if (isAuthenticated) {
        // If admin is registering a new user, show success and clear form
        setSuccess(t('auth.userCreated'));
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          full_name: '',
          language: 'en',
          preferred_market_id: 1,
          preferred_currency_id: 1
        });
      } else {
        // If self-registration, login and redirect
        login(data.token, data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
          {isAuthenticated ? t('auth.createUser') : t('auth.register')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={t('auth.username')}
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label={t('auth.fullName')}
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label={t('auth.email')}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label={t('auth.password')}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label={t('auth.confirmPassword')}
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            select
            label={t('common.language')}
            name="language"
            value={formData.language}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="fa">فارسی (Dari)</MenuItem>
            <MenuItem value="ps">پښتو (Pashto)</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label="Preferred Market"
            name="preferred_market_id"
            value={formData.preferred_market_id}
            onChange={handleChange}
            margin="normal"
          >
            {markets.map((market) => (
              <MenuItem key={market.id} value={market.id}>
                {market.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Preferred Currency"
            name="preferred_currency_id"
            value={formData.preferred_currency_id}
            onChange={handleChange}
            margin="normal"
          >
            {currencies.map((currency) => (
              <MenuItem key={currency.id} value={currency.id}>
                {currency.name} ({currency.code})
              </MenuItem>
            ))}
          </TextField>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : t('auth.register')}
          </Button>
        </Box>

        {!isAuthenticated && (
          <Typography textAlign="center" sx={{ mt: 2 }}>
            {t('auth.hasAccount')}{' '}
            <Link to="/login">{t('auth.login')}</Link>
          </Typography>
        )}
      </Paper>
    </Container>
  );
};
