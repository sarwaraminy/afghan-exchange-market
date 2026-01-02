import { useState, useEffect, useRef } from 'react';
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
  Avatar,
  Divider,
  MenuItem,
  InputAdornment,
  IconButton,
  Snackbar,
  Badge
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Save,
  Language,
  CameraAlt,
  Delete
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, getMarkets, getCurrencies, uploadProfilePicture, deleteProfilePicture, getProfilePictureUrl } from '../services/api';
import type { User, Market, Currency } from '../types';

export const Profile = () => {
  const { t, i18n } = useTranslation();
  const { user, login: updateAuthUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState<Partial<User>>({
    username: '',
    email: '',
    full_name: '',
    language: 'en',
    preferred_market_id: 1,
    preferred_currency_id: 1
  });

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [markets, setMarkets] = useState<Market[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileData, marketsData, currenciesData] = await Promise.all([
        getProfile(),
        getMarkets(),
        getCurrencies()
      ]);
      setProfile(profileData);
      setMarkets(marketsData);
      setCurrencies(currenciesData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(t('profile.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field: string, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
  };

  const handlePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('profile.fileTooLarge'));
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError(t('profile.invalidFileType'));
      return;
    }

    try {
      setUploadingPicture(true);
      setError('');
      const updatedUser = await uploadProfilePicture(file);
      setProfile(updatedUser);

      // Update auth context
      const token = localStorage.getItem('token');
      if (token) {
        updateAuthUser(token, updatedUser as User);
      }

      setSuccess(t('profile.pictureUploaded'));
    } catch (err: any) {
      setError(err.response?.data?.error || t('profile.pictureUploadError'));
    } finally {
      setUploadingPicture(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePicture = async () => {
    try {
      setUploadingPicture(true);
      setError('');
      const updatedUser = await deleteProfilePicture();
      setProfile(updatedUser);

      // Update auth context
      const token = localStorage.getItem('token');
      if (token) {
        updateAuthUser(token, updatedUser as User);
      }

      setSuccess(t('profile.pictureDeleted'));
    } catch (err: any) {
      setError(err.response?.data?.error || t('profile.pictureDeleteError'));
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError('');

      const updateData: any = {
        full_name: profile.full_name,
        language: profile.language,
        preferred_market_id: profile.preferred_market_id,
        preferred_currency_id: profile.preferred_currency_id
      };

      // If changing password
      if (passwords.new_password) {
        if (!passwords.current_password) {
          setError(t('profile.currentPasswordRequired'));
          setSaving(false);
          return;
        }
        if (passwords.new_password !== passwords.confirm_password) {
          setError(t('profile.passwordMismatch'));
          setSaving(false);
          return;
        }
        if (passwords.new_password.length < 8) {
          setError(t('profile.passwordTooShort'));
          setSaving(false);
          return;
        }
        updateData.current_password = passwords.current_password;
        updateData.new_password = passwords.new_password;
      }

      const updatedUser = await updateProfile(updateData);

      // Update auth context with new user data
      const token = localStorage.getItem('token');
      if (token) {
        updateAuthUser(token, updatedUser as User);
      }

      // Update language if changed
      if (profile.language && profile.language !== i18n.language) {
        i18n.changeLanguage(profile.language);
        localStorage.setItem('language', profile.language);
        document.dir = profile.language === 'en' ? 'ltr' : 'rtl';
      }

      // Clear password fields
      setPasswords({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

      setSuccess(t('profile.saveSuccess'));
    } catch (err: any) {
      setError(err.response?.data?.error || t('profile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
        {/* Header with Profile Picture */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ position: 'relative' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                uploadingPicture ? (
                  <CircularProgress size={24} />
                ) : (
                  <IconButton
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      bgcolor: '#1e3a5f',
                      color: 'white',
                      '&:hover': { bgcolor: '#2d5a87' },
                      width: 32,
                      height: 32
                    }}
                  >
                    <CameraAlt fontSize="small" />
                  </IconButton>
                )
              }
            >
              <Avatar
                src={getProfilePictureUrl(profile.profile_picture) || undefined}
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: '#1e3a5f',
                  fontSize: '2.5rem',
                  border: '4px solid #e0e0e0'
                }}
              >
                {profile.username?.charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
            {profile.profile_picture && (
              <IconButton
                size="small"
                onClick={handleDeletePicture}
                disabled={uploadingPicture}
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'error.dark' },
                  width: 28,
                  height: 28
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            )}
            <Box
              component="input"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              sx={{ display: 'none' }}
              onChange={handlePictureUpload}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="h4" fontWeight={700}>
              {t('profile.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {profile.email}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {t('profile.pictureHint')}
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Personal Information */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          {t('profile.personalInfo')}
        </Typography>

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, mb: 4 }}>
          <TextField
            label={t('profile.username')}
            value={profile.username || ''}
            disabled
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              )
            }}
          />
          <TextField
            label={t('profile.email')}
            value={profile.email || ''}
            disabled
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              )
            }}
          />
          <TextField
            label={t('profile.fullName')}
            value={profile.full_name || ''}
            onChange={(e) => handleProfileChange('full_name', e.target.value)}
            fullWidth
          />
          <TextField
            select
            label={t('profile.language')}
            value={profile.language || 'en'}
            onChange={(e) => handleProfileChange('language', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Language color="action" />
                </InputAdornment>
              )
            }}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="fa">دری (Dari)</MenuItem>
            <MenuItem value="ps">پښتو (Pashto)</MenuItem>
          </TextField>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Preferences */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          {t('profile.preferences')}
        </Typography>

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, mb: 4 }}>
          <TextField
            select
            label={t('profile.preferredMarket')}
            value={profile.preferred_market_id || 1}
            onChange={(e) => handleProfileChange('preferred_market_id', Number(e.target.value))}
          >
            {markets.map((market) => (
              <MenuItem key={market.id} value={market.id}>
                {i18n.language === 'fa' ? market.name_fa :
                 i18n.language === 'ps' ? market.name_ps : market.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label={t('profile.preferredCurrency')}
            value={profile.preferred_currency_id || 1}
            onChange={(e) => handleProfileChange('preferred_currency_id', Number(e.target.value))}
          >
            {currencies.map((currency) => (
              <MenuItem key={currency.id} value={currency.id}>
                {currency.code} - {i18n.language === 'fa' ? currency.name_fa :
                 i18n.language === 'ps' ? currency.name_ps : currency.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Change Password */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          {t('profile.changePassword')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('profile.passwordHint')}
        </Typography>

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, mb: 4 }}>
          <TextField
            label={t('profile.currentPassword')}
            type={showPasswords.current ? 'text' : 'password'}
            value={passwords.current_password}
            onChange={(e) => handlePasswordChange('current_password', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    edge="end"
                    size="small"
                  >
                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            label={t('profile.newPassword')}
            type={showPasswords.new ? 'text' : 'password'}
            value={passwords.new_password}
            onChange={(e) => handlePasswordChange('new_password', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    edge="end"
                    size="small"
                  >
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            label={t('profile.confirmPassword')}
            type={showPasswords.confirm ? 'text' : 'password'}
            value={passwords.confirm_password}
            onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    edge="end"
                    size="small"
                  >
                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
            onClick={handleSaveProfile}
            disabled={saving}
            sx={{
              bgcolor: '#1e3a5f',
              '&:hover': { bgcolor: '#2d5a87' },
              px: 4
            }}
          >
            {saving ? t('common.saving') : t('profile.save')}
          </Button>
        </Box>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};
