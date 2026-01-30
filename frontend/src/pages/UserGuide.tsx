import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Card,
  CardContent,
  Grid,
  Chip,
  Drawer,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Home,
  CurrencyExchange,
  TrendingUp,
  Calculate,
  SwapHoriz,
  Diamond,
  People,
  Dashboard,
  Person,
  Language,
  CheckCircle,
  HelpOutline,
  Build,
  Security,
  NewReleases,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export const UserGuide = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedSection, setSelectedSection] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const sections = [
    { id: 0, label: t('userGuide.gettingStarted') || 'Getting Started', icon: <Home /> },
    { id: 1, label: t('userGuide.coreFeatures') || 'Core Features', icon: <Dashboard /> },
    { id: 2, label: t('nav.hawala'), icon: <SwapHoriz /> },
    { id: 3, label: t('userGuide.faq'), icon: <HelpOutline /> },
    { id: 4, label: t('userGuide.troubleshooting'), icon: <Build /> },
    ...(user?.role === 'admin' ? [{ id: 5, label: t('admin.role'), icon: <Security /> }] : [])
  ];

  const drawerContent = (
    <Box sx={{ width: 280, height: '100%', bgcolor: 'background.paper' }}>
      {/* Sidebar Header */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {t('nav.userGuide')}
        </Typography>
        <Chip
          label="Version 3.0"
          size="small"
          sx={{ fontWeight: 600, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
        />
      </Box>

      {/* Navigation Menu */}
      <List sx={{ py: 2 }}>
        {sections.map((section) => (
          <ListItem key={section.id} disablePadding>
            <ListItemButton
              selected={selectedSection === section.id}
              onClick={() => {
                setSelectedSection(section.id);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                mx: 1,
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white'
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {section.icon}
              </ListItemIcon>
              <ListItemText
                primary={section.label}
                primaryTypographyProps={{ fontWeight: selectedSection === section.id ? 600 : 400 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const renderContent = () => {
    switch (selectedSection) {
      case 0:
        return (
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
              {t('userGuide.gettingStarted') || 'Getting Started'}
            </Typography>

            <Box sx={{ mb: 4, p: 3, bgcolor: 'info.50', borderRadius: 2, border: '1px solid', borderColor: 'info.200' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom color="info.dark">
                {t('userGuide.welcomeTitle')}
              </Typography>
              <Typography variant="body1" paragraph>
                {t('userGuide.welcomeDesc1')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('userGuide.welcomeDesc2')}
              </Typography>
            </Box>

            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mt: 4 }}>
              {t('userGuide.quickStart')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('userGuide.quickStartDesc')}
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', transition: '0.3s', '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Dashboard sx={{ mr: 2, color: 'primary.main', fontSize: 36 }} />
                      <Typography variant="h6" fontWeight={600}>{t('nav.dashboard')}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('userGuide.dashboardDesc')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', transition: '0.3s', '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CurrencyExchange sx={{ mr: 2, color: 'primary.main', fontSize: 36 }} />
                      <Typography variant="h6" fontWeight={600}>{t('nav.rates')}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('userGuide.ratesDesc')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', transition: '0.3s', '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SwapHoriz sx={{ mr: 2, color: 'primary.main', fontSize: 36 }} />
                      <Typography variant="h6" fontWeight={600}>{t('nav.hawala')}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('userGuide.hawalaDesc')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', transition: '0.3s', '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Calculate sx={{ mr: 2, color: 'primary.main', fontSize: 36 }} />
                      <Typography variant="h6" fontWeight={600}>{t('nav.converter')}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('userGuide.converterDesc')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('userGuide.sysReq')}
              </Typography>
              <Typography variant="body2" paragraph>
                {t('userGuide.sysReqIntro')}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" component="div">
                    <strong>{t('userGuide.sysReqBrowsers')}</strong><br />
                    • {t('userGuide.sysReqBrowser1')}<br />
                    • {t('userGuide.sysReqBrowser2')}<br />
                    • {t('userGuide.sysReqBrowser3')}<br />
                    • {t('userGuide.sysReqBrowser4')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" component="div">
                    <strong>{t('userGuide.sysReqInternet')}</strong><br />
                    • {t('userGuide.sysReqInternet1')}<br />
                    • {t('userGuide.sysReqInternet2')}<br /><br />
                    <strong>{t('userGuide.sysReqScreen')}</strong><br />
                    • {t('userGuide.sysReqScreen1')}<br />
                    • {t('userGuide.sysReqScreen2')}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
              {t('userGuide.coreFeatures') || 'Core Features'}
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary" sx={{ mb: 4 }}>
              {t('userGuide.detailedGuides')}
            </Typography>

            {/* Exchange Rates */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CurrencyExchange sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
                  <Typography variant="h6" fontWeight={600}>
                    {t('nav.rates')}
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  {t('userGuide.ratesGuide')}
                </Typography>
                <Typography variant="body2" paragraph color="text.secondary" sx={{ fontStyle: 'italic', pl: 2, borderLeft: '3px solid', borderColor: 'primary.main' }}>
                  {t('userGuide.ratesExplainer')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText
                      primary={t('userGuide.ratesStep1')}
                      secondary={t('userGuide.ratesStep1Desc')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText
                      primary={t('userGuide.ratesStep2')}
                      secondary={t('userGuide.ratesStep2Desc')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText
                      primary={t('userGuide.ratesStep3')}
                      secondary={t('userGuide.ratesStep3Desc')}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Currency Converter */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Calculate sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
                  <Typography variant="h6" fontWeight={600}>
                    {t('nav.converter')}
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  {t('userGuide.converterGuide')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText
                      primary={t('userGuide.converterStep1')}
                      secondary={t('userGuide.converterStep1Desc')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText
                      primary={t('userGuide.converterStep2')}
                      secondary={t('userGuide.converterStep2Desc')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText
                      primary={t('userGuide.converterStep3')}
                      secondary={t('userGuide.converterStep3Desc')}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Gold Prices */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Diamond sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
                  <Typography variant="h6" fontWeight={600}>
                    {t('nav.gold')}
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  {t('userGuide.goldGuide')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText
                      primary={t('userGuide.goldStep1')}
                      secondary={t('userGuide.goldStep1Desc')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText
                      primary={t('userGuide.goldStep2')}
                      secondary={t('userGuide.goldStep2Desc')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText
                      primary={t('userGuide.goldStep3')}
                      secondary={t('userGuide.goldStep3Desc')}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Profile Settings */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Person sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
                  <Typography variant="h6" fontWeight={600}>
                    {t('nav.profile')}
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  {t('userGuide.profileGuide')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText
                      primary={t('userGuide.profileStep1')}
                      secondary={t('userGuide.profileStep1Desc')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText
                      primary={t('userGuide.profileStep2')}
                      secondary={t('userGuide.profileStep2Desc')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText
                      primary={t('userGuide.profileStep3')}
                      secondary={t('userGuide.profileStep3Desc')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText
                      primary={t('userGuide.profileStep4')}
                      secondary={t('userGuide.profileStep4Desc')}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Typography variant="h5" fontWeight={600} gutterBottom color="primary" sx={{ mt: 4 }}>
              {t('userGuide.tips')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', bgcolor: 'success.50' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrendingUp color="success" />
                      <Typography variant="subtitle1" fontWeight={600} sx={{ ml: 1 }}>
                        {t('userGuide.tip1')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('userGuide.tip1Desc')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', bgcolor: 'info.50' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Language color="info" />
                      <Typography variant="subtitle1" fontWeight={600} sx={{ ml: 1 }}>
                        {t('userGuide.tip2')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('userGuide.tip2Desc')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', bgcolor: 'warning.50' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SwapHoriz color="warning" />
                      <Typography variant="subtitle1" fontWeight={600} sx={{ ml: 1 }}>
                        {t('userGuide.tip3')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('userGuide.tip3Desc')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', bgcolor: 'secondary.50' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircle color="secondary" />
                      <Typography variant="subtitle1" fontWeight={600} sx={{ ml: 1 }}>
                        {t('userGuide.tip4')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('userGuide.tip4Desc')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
              {t('nav.hawala')}
            </Typography>

            <Card variant="outlined" sx={{ mb: 3, border: '2px solid', borderColor: 'primary.main' }}>
              <CardContent>
                <Typography variant="body1" paragraph>
                  {t('userGuide.hawalaGuide')}
                </Typography>
                <Typography variant="body2" paragraph color="text.secondary" sx={{ fontStyle: 'italic', pl: 2, borderLeft: '3px solid', borderColor: 'primary.main' }}>
                  {t('userGuide.hawalaExplainer')}
                </Typography>
              </CardContent>
            </Card>

            {/* What's New in V3 */}
            <Box sx={{ p: 3, bgcolor: 'info.50', borderRadius: 2, mb: 3, border: '1px solid', borderColor: 'info.200' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NewReleases sx={{ color: 'info.dark', mr: 1 }} />
                <Typography variant="h6" fontWeight={600} color="info.dark">
                  {t('userGuide.whatsNewV3')}
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" component="div">
                    • <strong>{t('userGuide.v3Feature1')}</strong> - {t('userGuide.v3Feature1Desc')}<br /><br />
                    • <strong>{t('userGuide.v3Feature2')}</strong> - {t('userGuide.v3Feature2Desc')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" component="div">
                    • <strong>{t('userGuide.v3Feature3')}</strong> - {t('userGuide.v3Feature3Desc')}<br /><br />
                    • <strong>{t('userGuide.v3Feature4')}</strong> - {t('userGuide.v3Feature4Desc')}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Security Notes */}
            <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 1, mb: 3 }}>
              <Typography variant="body2" fontWeight={600} color="warning.dark" gutterBottom>
                ⚠️ {t('userGuide.securityNotes')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • {t('userGuide.securityNote1')}<br />
                • {t('userGuide.securityNote2')}<br />
                • {t('userGuide.securityNote3')}<br />
                • {t('userGuide.securityNote4')}
              </Typography>
            </Box>

            {/* Transaction Types */}
            <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1, mb: 3, border: '1px solid', borderColor: 'info.200' }}>
              <Typography variant="body2" fontWeight={600} color="info.dark" gutterBottom>
                ℹ️ {t('userGuide.transactionTypes')}
              </Typography>
              <Typography variant="body2" color="text.secondary" component="div">
                <strong>{t('hawala.outgoing')}:</strong> {t('userGuide.outgoingExplain')}<br /><br />
                <strong>{t('hawala.incoming')}:</strong> {t('userGuide.incomingExplain')}
              </Typography>
            </Box>

            <Typography variant="h6" fontWeight={600} gutterBottom>
              {t('userGuide.createTransfer')}
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText
                  primary={t('userGuide.hawalaStep1')}
                  secondary={t('userGuide.hawalaStep1Desc')}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText
                  primary={t('userGuide.hawalaStep2')}
                  secondary={t('userGuide.hawalaStep2Desc')}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText
                  primary={t('userGuide.hawalaStep3')}
                  secondary={t('userGuide.hawalaStep3Desc')}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText
                  primary={t('userGuide.hawalaStep4')}
                  secondary={t('userGuide.hawalaStep4Desc')}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText
                  primary={t('userGuide.hawalaStep5')}
                  secondary={t('userGuide.hawalaStep5Desc')}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText
                  primary={t('userGuide.hawalaStep6')}
                  secondary={t('userGuide.hawalaStep6Desc')}
                />
              </ListItem>
            </List>

            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
              {t('userGuide.manageTransfers')}
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText
                  primary={t('userGuide.hawalaManage1')}
                  secondary={t('userGuide.hawalaManage1Desc')}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText
                  primary={t('userGuide.hawalaManage2')}
                  secondary={t('userGuide.hawalaManage2Desc')}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText
                  primary={t('userGuide.hawalaManage3')}
                  secondary={t('userGuide.hawalaManage3Desc')}
                />
              </ListItem>
            </List>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
              {t('userGuide.faq')}
            </Typography>

            <Grid container spacing={2}>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <Grid item xs={12} key={num}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                        {t(`userGuide.faqQ${num}`)}
                      </Typography>
                      <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                        {num === 1 && (
                          <>
                            {t('userGuide.faqA1')}
                            <br /><br />
                            <Typography component="span" color="warning.dark" sx={{ fontWeight: 600 }}>
                              {t('userGuide.faqA1Note')}
                            </Typography>
                          </>
                        )}
                        {num === 2 && (
                          <>
                            {t('userGuide.faqA2Title')}<br />
                            • {t('userGuide.faqA2Point1')}<br />
                            • {t('userGuide.faqA2Point2')}<br />
                            • {t('userGuide.faqA2Point3')}<br /><br />
                            {t('userGuide.faqA2Note')}
                          </>
                        )}
                        {num === 3 && (
                          <>
                            {t('userGuide.faqA3Intro')}<br />
                            • {t('userGuide.faqA3Point1')}<br />
                            • {t('userGuide.faqA3Point2')}<br />
                            • {t('userGuide.faqA3Point3')}<br />
                            • {t('userGuide.faqA3Point4')}<br /><br />
                            {t('userGuide.faqA3Note')}
                          </>
                        )}
                        {num === 4 && (
                          <>
                            {t('userGuide.faqA4Intro')}<br />
                            {t('userGuide.faqA4Step1')}<br />
                            {t('userGuide.faqA4Step2')}<br />
                            {t('userGuide.faqA4Step3')}<br />
                            {t('userGuide.faqA4Step4')}<br /><br />
                            {t('userGuide.faqA4Note')}
                          </>
                        )}
                        {num === 5 && (
                          <>
                            • {t('userGuide.faqA5Pending')}<br />
                            • {t('userGuide.faqA5InTransit')}<br />
                            • {t('userGuide.faqA5Completed')}<br />
                            • {t('userGuide.faqA5Cancelled')}<br /><br />
                            {t('userGuide.faqA5Note')}
                          </>
                        )}
                        {num === 6 && (
                          <>
                            {t('userGuide.faqA6Intro')}<br /><br />
                            • {t('userGuide.faqA6Example1')}<br />
                            • {t('userGuide.faqA6Example2')}<br />
                            • {t('userGuide.faqA6Example3')}<br /><br />
                            {t('userGuide.faqA6Note')}
                          </>
                        )}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
              {t('userGuide.troubleshooting')}
            </Typography>

            <Grid container spacing={2}>
              {['Login', 'Print', 'Hawaladar', 'Rates', 'Language'].map((type) => (
                <Grid item xs={12} md={6} key={type}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom color="error.main">
                        {t(`userGuide.trouble${type}`)}
                      </Typography>
                      <Typography variant="body2" component="div">
                        <strong>{t(`userGuide.trouble${type}Solution`)}</strong><br />
                        {[1, 2, 3, 4, 5].map((num) => (
                          t(`userGuide.trouble${type}Point${num}`) && (
                            <span key={num}>
                              {t(`userGuide.trouble${type}Point${num}`)}<br />
                            </span>
                          )
                        ))}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 5:
        return user?.role === 'admin' ? (
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
              {t('admin.manageUsers')} ({t('admin.role')})
            </Typography>

            <Card variant="outlined" sx={{ border: '2px solid', borderColor: 'secondary.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <People sx={{ mr: 2, color: 'secondary.main', fontSize: 32 }} />
                  <Typography variant="h5" fontWeight={600}>
                    {t('userGuide.adminGuide')}
                  </Typography>
                </Box>
                <List>
                  {[1, 2, 3, 4].map((num) => (
                    <ListItem key={num}>
                      <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                      <ListItemText
                        primary={t(`userGuide.adminStep${num}`)}
                        secondary={t(`userGuide.adminStep${num}Desc`)}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            top: 70,
            left: 16,
            zIndex: 1300,
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: '50%',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 3
          }}
          onClick={handleDrawerToggle}
        >
          <MenuIcon />
        </Box>
      )}

      {/* Sidebar Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { width: 280, boxSizing: 'border-box' }
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              position: 'relative',
              height: '100%'
            }
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          overflow: 'auto',
          height: '100%'
        }}
      >
        <Container maxWidth="lg">
          {renderContent()}

          {/* Footer */}
          <Paper sx={{ mt: 6, p: 3, textAlign: 'center', bgcolor: 'primary.50', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
              {t('userGuide.needHelpTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {t('userGuide.needHelp')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('userGuide.needHelpDesc')}
            </Typography>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};
