import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  FormControl,
  Select,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Language } from '@mui/icons-material';
import {
  Menu as MenuIcon,
  Person,
  Logout,
  Dashboard,
  AdminPanelSettings,
  CurrencyExchange,
  TrendingUp,
  Newspaper,
  Calculate,
  Home
} from '@mui/icons-material';

export const Header = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const changeLanguage = (event: SelectChangeEvent) => {
    const lang = event.target.value;
    if (lang) {
      i18n.changeLanguage(lang);
      localStorage.setItem('language', lang);
      document.dir = lang === 'en' ? 'ltr' : 'rtl';
    }
  };

  const languages = [
    { code: 'en', label: 'English (en)', flag: '🇺🇸' },
    { code: 'fa', label: 'دری (fa)', flag: '🇦🇫' },
    { code: 'ps', label: 'پښتو (ps)', flag: '🇦🇫' }
  ];

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    navigate('/');
  };

  const navItems = [
    { label: t('nav.home'), path: '/', icon: <Home /> },
    { label: t('nav.rates'), path: '/rates', icon: <CurrencyExchange /> },
    { label: t('nav.converter'), path: '/converter', icon: <Calculate /> },
    { label: t('nav.gold'), path: '/gold', icon: <TrendingUp /> },
    { label: t('nav.news'), path: '/news', icon: <Newspaper /> },
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          {t('common.appName')}
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              onClick={() => setMobileOpen(false)}
            >
              {item.icon}
              <ListItemText primary={item.label} sx={{ ml: 2 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <FormControl fullWidth size="small">
          <Select
            value={i18n.language}
            onChange={changeLanguage}
            startAdornment={<Language sx={{ mr: 1, color: 'text.secondary' }} />}
          >
            {languages.map((lang) => (
              <MenuItem key={lang.code} value={lang.code}>
                {lang.flag} {lang.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
              flexGrow: isMobile ? 1 : 0,
              mr: 4
            }}
          >
            {t('common.appName')}
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  sx={{
                    color: 'text.secondary',
                    '&.active': {
                      color: 'primary.main',
                      bgcolor: 'primary.lighter',
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {!isMobile && (
            <FormControl size="small" sx={{ mr: 2, minWidth: 140 }}>
              <Select
                value={i18n.language}
                onChange={changeLanguage}
                startAdornment={<Language sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                {languages.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Button
                  component={Link}
                  to="/admin"
                  startIcon={<AdminPanelSettings />}
                  sx={{ mr: 1 }}
                >
                  {!isMobile && t('nav.admin')}
                </Button>
              )}
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem component={Link} to="/dashboard" onClick={() => setAnchorEl(null)}>
                  <Dashboard sx={{ mr: 1 }} /> {t('nav.dashboard')}
                </MenuItem>
                <MenuItem component={Link} to="/profile" onClick={() => setAnchorEl(null)}>
                  <Person sx={{ mr: 1 }} /> {t('nav.profile')}
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} /> {t('nav.logout')}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={Link} to="/login" variant="outlined">
                {t('nav.login')}
              </Button>
              <Button component={Link} to="/register" variant="contained">
                {t('nav.register')}
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>
    </>
  );
};
