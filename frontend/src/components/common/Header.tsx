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
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
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

  const changeLanguage = (lang: string) => {
    if (lang) {
      i18n.changeLanguage(lang);
      localStorage.setItem('language', lang);
      document.dir = lang === 'en' ? 'ltr' : 'rtl';
    }
  };

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
          Sarafi.AF
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
        <ToggleButtonGroup
          value={i18n.language}
          exclusive
          onChange={(_, val) => changeLanguage(val)}
          size="small"
          fullWidth
        >
          <ToggleButton value="en">EN</ToggleButton>
          <ToggleButton value="fa">فا</ToggleButton>
          <ToggleButton value="ps">پښ</ToggleButton>
        </ToggleButtonGroup>
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
            Sarafi.AF
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
            <ToggleButtonGroup
              value={i18n.language}
              exclusive
              onChange={(_, val) => changeLanguage(val)}
              size="small"
              sx={{ mr: 2 }}
            >
              <ToggleButton value="en">EN</ToggleButton>
              <ToggleButton value="fa">فا</ToggleButton>
              <ToggleButton value="ps">پښ</ToggleButton>
            </ToggleButtonGroup>
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
