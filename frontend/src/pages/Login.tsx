import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  InputAdornment,
  IconButton,
  Avatar,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  CurrencyExchange,
  AttachMoney,
  Euro,
  CurrencyPound,
  CurrencyYen,
  Diamond,
  Savings,
  AccountBalance,
  TrendingUp,
  ShowChart,
  Paid
} from '@mui/icons-material';
import { login as loginApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLanguageChange = (_: React.MouseEvent<HTMLElement>, newLang: string | null) => {
    if (newLang) {
      i18n.changeLanguage(newLang);
      localStorage.setItem('language', newLang);
      document.dir = newLang === 'en' ? 'ltr' : 'rtl';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginApi(email, password);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Background icons configuration
  const backgroundIcons = [
    { Icon: AttachMoney, top: '5%', left: '8%', size: 60, rotate: -15 },
    { Icon: Euro, top: '15%', right: '12%', size: 50, rotate: 20 },
    { Icon: CurrencyPound, bottom: '20%', left: '5%', size: 45, rotate: -25 },
    { Icon: CurrencyYen, top: '40%', left: '3%', size: 55, rotate: 15 },
    { Icon: Diamond, top: '8%', left: '25%', size: 40, rotate: 30 },
    { Icon: Savings, bottom: '15%', right: '8%', size: 65, rotate: -10 },
    { Icon: AccountBalance, top: '25%', left: '10%', size: 50, rotate: 5 },
    { Icon: TrendingUp, bottom: '35%', right: '5%', size: 55, rotate: -20 },
    { Icon: ShowChart, top: '60%', right: '10%', size: 45, rotate: 25 },
    { Icon: Paid, bottom: '8%', left: '20%', size: 50, rotate: -5 },
    { Icon: CurrencyExchange, top: '75%', left: '8%', size: 60, rotate: 10 },
    { Icon: Diamond, bottom: '30%', left: '15%', size: 35, rotate: -30 },
    { Icon: AttachMoney, top: '50%', right: '3%', size: 48, rotate: 15 },
    { Icon: Euro, bottom: '5%', right: '25%', size: 42, rotate: -15 },
    { Icon: Savings, top: '3%', right: '30%', size: 38, rotate: 20 },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f2744 0%, #1e3a5f 30%, #2d5a87 60%, #1e3a5f 100%)',
        py: 4,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Floating background icons */}
      {backgroundIcons.map((item, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            top: item.top,
            left: item.left,
            right: item.right,
            bottom: item.bottom,
            opacity: 0.08,
            color: 'white',
            transform: `rotate(${item.rotate}deg)`,
            animation: `float${index % 3} ${8 + (index % 5)}s ease-in-out infinite`,
            '@keyframes float0': {
              '0%, 100%': { transform: `rotate(${item.rotate}deg) translateY(0px)` },
              '50%': { transform: `rotate(${item.rotate}deg) translateY(-15px)` },
            },
            '@keyframes float1': {
              '0%, 100%': { transform: `rotate(${item.rotate}deg) translateX(0px)` },
              '50%': { transform: `rotate(${item.rotate}deg) translateX(10px)` },
            },
            '@keyframes float2': {
              '0%, 100%': { transform: `rotate(${item.rotate}deg) translate(0px, 0px)` },
              '50%': { transform: `rotate(${item.rotate}deg) translate(8px, -8px)` },
            },
          }}
        >
          <item.Icon sx={{ fontSize: item.size }} />
        </Box>
      ))}

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Logo/Brand Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: '#1e3a5f',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 8px 32px rgba(30, 58, 95, 0.3)'
              }}
            >
              <CurrencyExchange sx={{ fontSize: 45 }} />
            </Avatar>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              {t('common.appName')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('common.appSubtitle')}
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': { alignItems: 'center' }
              }}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' }
                }
              }}
            />

            <TextField
              fullWidth
              label={t('auth.password')}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' }
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={!loading && <LoginIcon />}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                bgcolor: '#1e3a5f',
                boxShadow: '0 8px 24px rgba(30, 58, 95, 0.3)',
                '&:hover': {
                  bgcolor: '#2d5a87',
                  boxShadow: '0 12px 32px rgba(30, 58, 95, 0.4)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {loading ? (
                <CircularProgress size={26} sx={{ color: 'white' }} />
              ) : (
                t('auth.login')
              )}
            </Button>
          </Box>

          {/* Language Selector */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <ToggleButtonGroup
              value={i18n.language}
              exclusive
              onChange={handleLanguageChange}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  border: '1px solid rgba(30, 58, 95, 0.2)',
                  color: 'text.secondary',
                  px: 2,
                  py: 0.5,
                  '&.Mui-selected': {
                    bgcolor: '#1e3a5f',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#2d5a87',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(30, 58, 95, 0.08)',
                  },
                },
              }}
            >
              <ToggleButton value="en">English</ToggleButton>
              <ToggleButton value="fa">دری</ToggleButton>
              <ToggleButton value="ps">پښتو</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('common.footerNote')}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
