import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  ListItemIcon,
  Divider,
  FormControl,
  Select,
  Avatar,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab
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
  PersonAdd
} from '@mui/icons-material';

export const Header = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const navItems = isAuthenticated ? [
    { label: t('nav.rates'), path: '/rates', icon: <CurrencyExchange /> },
    { label: t('nav.converter'), path: '/converter', icon: <Calculate /> },
    { label: t('nav.gold'), path: '/gold', icon: <TrendingUp /> },
    { label: t('nav.news'), path: '/news', icon: <Newspaper /> },
  ] : [];

  // Get current tab value based on path
  const getCurrentTab = () => {
    const currentPath = location.pathname;
    const tabIndex = navItems.findIndex(item => item.path === currentPath);
    return tabIndex >= 0 ? tabIndex : false;
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    navigate(navItems[newValue].path);
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, bgcolor: '#1e3a5f', color: 'white' }}>
        <Typography variant="h6" fontWeight="bold">
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
              selected={location.pathname === item.path}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
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
      <AppBar
        position="sticky"
        elevation={2}
        sx={{
          bgcolor: '#1e3a5f',
          color: 'white'
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2, color: 'white' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={Link}
            to={isAuthenticated ? "/dashboard" : "/"}
            sx={{
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
              flexGrow: isMobile ? 1 : 0,
              mr: 4
            }}
          >
            {t('common.appName')}
          </Typography>

          {!isMobile && isAuthenticated && navItems.length > 0 && (
            <Tabs
              value={getCurrentTab()}
              onChange={handleTabChange}
              TabIndicatorProps={{ style: { display: 'none' } }}
              sx={{
                flexGrow: 1,
                alignSelf: 'flex-end',
                minHeight: 'auto',
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  minHeight: 58,
                  py: 1,
                  px: 2,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  borderRadius: '8px 8px 0 0',
                  mx: 0.3,
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    color: '#1e3a5f',
                    bgcolor: 'white',
                    fontWeight: 600,
                  },
                  '&:hover:not(.Mui-selected)': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                },
              }}
            >
              {navItems.map((item) => (
                <Tab
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  iconPosition="start"
                  sx={{ gap: 1 }}
                />
              ))}
            </Tabs>
          )}

          {!isMobile && (
            <FormControl size="small" sx={{ mr: 2, minWidth: 140 }}>
              <Select
                value={i18n.language}
                onChange={changeLanguage}
                startAdornment={<Language sx={{ mr: 1, color: 'rgba(255,255,255,0.7)' }} />}
                sx={{
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '.MuiSvgIcon-root': {
                    color: 'white',
                  },
                }}
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
              <Button
                component={Link}
                to="/admin"
                startIcon={<AdminPanelSettings />}
                sx={{
                  mr: 1,
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                {!isMobile && t('nav.admin')}
              </Button>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#4fc3f7', color: '#1e3a5f' }}>
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
                <MenuItem component={Link} to="/register" onClick={() => setAnchorEl(null)}>
                  <PersonAdd sx={{ mr: 1 }} /> {t('nav.register')}
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} /> {t('nav.logout')}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                sx={{
                  bgcolor: '#4fc3f7',
                  color: '#1e3a5f',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#81d4fa',
                  }
                }}
              >
                {t('nav.login')}
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
