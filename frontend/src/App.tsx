import { useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';

import { Rates } from './pages/Rates';
import { Converter } from './pages/Converter';
import { Gold } from './pages/Gold';
import { News } from './pages/News';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { Profile } from './pages/Profile';
import { Hawala } from './pages/Hawala';

import './i18n';

const queryClient = new QueryClient();

const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const ltrCache = createCache({
  key: 'muiltr',
  stylisPlugins: [prefixer],
});

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/rates" element={<PrivateRoute><Rates /></PrivateRoute>} />
    <Route path="/converter" element={<PrivateRoute><Converter /></PrivateRoute>} />
    <Route path="/gold" element={<PrivateRoute><Gold /></PrivateRoute>} />
    <Route path="/news" element={<PrivateRoute><News /></PrivateRoute>} />
    <Route path="/hawala" element={<PrivateRoute><Hawala /></PrivateRoute>} />
    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
    <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
  </Routes>
);

function App() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'fa' || i18n.language === 'ps';

  useEffect(() => {
    document.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRtl]);

  const theme = useMemo(() => createTheme({
    direction: isRtl ? 'rtl' : 'ltr',
    palette: {
      primary: { main: '#1e40af', light: '#3b82f6', dark: '#1e3a8a' },
      secondary: { main: '#059669' },
      background: { default: '#f8fafc' },
    },
    typography: {
      fontFamily: isRtl
        ? '"Vazirmatn", "Tahoma", "Arial", sans-serif'
        : '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    components: {
      MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 8 } } },
      MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
      MuiCard: { styleOverrides: { root: { borderRadius: 12 } } },
      MuiTableCell: { styleOverrides: { root: { textAlign: isRtl ? 'right' : 'left' } } },
    },
  }), [isRtl]);

  return (
    <CacheProvider value={isRtl ? rtlCache : ltrCache}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <BrowserRouter>
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header />
                <Box component="main" sx={{ flex: 1 }}><AppRoutes /></Box>
                <Footer />
              </Box>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </CacheProvider>
  );
}

export default App;
