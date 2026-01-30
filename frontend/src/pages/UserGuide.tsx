import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Grid,
  Chip
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
  NewReleases
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-guide-tabpanel-${index}`}
      aria-labelledby={`user-guide-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const UserGuide = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3}>
        {/* Header */}
        <Box sx={{ px: 4, pt: 4, pb: 2, borderBottom: 1, borderColor: 'divider', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            {t('nav.userGuide')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, opacity: 0.95 }}>
            {t('userGuide.subtitle')}
          </Typography>
          <Chip
            label="Version 3.0"
            sx={{ fontWeight: 600, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
          />
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 2 }}
          >
            <Tab icon={<Home />} iconPosition="start" label={t('userGuide.gettingStarted') || 'Getting Started'} />
            <Tab icon={<Dashboard />} iconPosition="start" label={t('userGuide.coreFeatures') || 'Core Features'} />
            <Tab icon={<SwapHoriz />} iconPosition="start" label={t('nav.hawala')} />
            <Tab icon={<HelpOutline />} iconPosition="start" label={t('userGuide.faq')} />
            <Tab icon={<Build />} iconPosition="start" label={t('userGuide.troubleshooting')} />
            {user?.role === 'admin' && (
              <Tab icon={<Security />} iconPosition="start" label={t('admin.role')} />
            )}
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ px: 4, pb: 4 }}>
          {/* Tab 0: Getting Started */}
          <TabPanel value={selectedTab} index={0}>
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

            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight={600} gutterBottom color="primary">
                {t('userGuide.quickStart')}
              </Typography>
              <Typography variant="body1" paragraph>
                {t('userGuide.quickStartDesc')}
              </Typography>

              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%', transition: '0.3s', '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Dashboard sx={{ mr: 1, color: 'primary.main', fontSize: 36 }} />
                        <Typography variant="h6" fontWeight={600}>{t('nav.dashboard')}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('userGuide.dashboardDesc')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%', transition: '0.3s', '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CurrencyExchange sx={{ mr: 1, color: 'primary.main', fontSize: 36 }} />
                        <Typography variant="h6" fontWeight={600}>{t('nav.rates')}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('userGuide.ratesDesc')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%', transition: '0.3s', '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <SwapHoriz sx={{ mr: 1, color: 'primary.main', fontSize: 36 }} />
                        <Typography variant="h6" fontWeight={600}>{t('nav.hawala')}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('userGuide.hawalaDesc')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%', transition: '0.3s', '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Calculate sx={{ mr: 1, color: 'primary.main', fontSize: 36 }} />
                        <Typography variant="h6" fontWeight={600}>{t('nav.converter')}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('userGuide.converterDesc')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
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
          </TabPanel>

          {/* Tab 1: Core Features */}
          <TabPanel value={selectedTab} index={1}>
            <Typography variant="h5" fontWeight={600} gutterBottom color="primary" sx={{ mb: 3 }}>
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

            <Divider sx={{ my: 4 }} />

            <Typography variant="h5" fontWeight={600} gutterBottom color="primary">
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
          </TabPanel>

          {/* Tab 2: Hawala */}
          <TabPanel value={selectedTab} index={2}>
            <Card variant="outlined" sx={{ mb: 3, border: '2px solid', borderColor: 'primary.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SwapHoriz sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
                  <Typography variant="h5" fontWeight={600}>
                    {t('nav.hawala')}
                  </Typography>
                </Box>
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

            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 3 }}>
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
          </TabPanel>

          {/* Tab 3: FAQ */}
          <TabPanel value={selectedTab} index={3}>
            <Typography variant="h5" fontWeight={600} gutterBottom color="primary">
              {t('userGuide.faq')}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                      {t('userGuide.faqQ1')}
                    </Typography>
                    <Typography variant="body2" paragraph style={{ whiteSpace: 'pre-line' }}>
                      {t('userGuide.faqA1')}
                    </Typography>
                    <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 600 }}>
                      {t('userGuide.faqA1Note')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                      {t('userGuide.faqQ2')}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {t('userGuide.faqA2Title')}
                    </Typography>
                    <Typography variant="body2" component="div">
                      • {t('userGuide.faqA2Point1')}<br />
                      • {t('userGuide.faqA2Point2')}<br />
                      • {t('userGuide.faqA2Point3')}<br /><br />
                      {t('userGuide.faqA2Note')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                      {t('userGuide.faqQ3')}
                    </Typography>
                    <Typography variant="body2">
                      {t('userGuide.faqA3Intro')}<br />
                      • {t('userGuide.faqA3Point1')}<br />
                      • {t('userGuide.faqA3Point2')}<br />
                      • {t('userGuide.faqA3Point3')}<br />
                      • {t('userGuide.faqA3Point4')}<br /><br />
                      {t('userGuide.faqA3Note')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                      {t('userGuide.faqQ4')}
                    </Typography>
                    <Typography variant="body2">
                      {t('userGuide.faqA4Intro')}<br />
                      {t('userGuide.faqA4Step1')}<br />
                      {t('userGuide.faqA4Step2')}<br />
                      {t('userGuide.faqA4Step3')}<br />
                      {t('userGuide.faqA4Step4')}<br /><br />
                      {t('userGuide.faqA4Note')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                      {t('userGuide.faqQ5')}
                    </Typography>
                    <Typography variant="body2" component="div">
                      • {t('userGuide.faqA5Pending')}<br />
                      • {t('userGuide.faqA5InTransit')}<br />
                      • {t('userGuide.faqA5Completed')}<br />
                      • {t('userGuide.faqA5Cancelled')}<br /><br />
                      {t('userGuide.faqA5Note')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                      {t('userGuide.faqQ6')}
                    </Typography>
                    <Typography variant="body2">
                      {t('userGuide.faqA6Intro')}<br /><br />
                      • {t('userGuide.faqA6Example1')}<br />
                      • {t('userGuide.faqA6Example2')}<br />
                      • {t('userGuide.faqA6Example3')}<br /><br />
                      {t('userGuide.faqA6Note')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 4: Troubleshooting */}
          <TabPanel value={selectedTab} index={4}>
            <Typography variant="h5" fontWeight={600} gutterBottom color="primary">
              {t('userGuide.troubleshooting')}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom color="error.main">
                      {t('userGuide.troubleLogin')}
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>{t('userGuide.troubleLoginSolution')}</strong><br />
                      {t('userGuide.troubleLoginPoint1')}<br />
                      {t('userGuide.troubleLoginPoint2')}<br />
                      {t('userGuide.troubleLoginPoint3')}<br />
                      {t('userGuide.troubleLoginPoint4')}<br />
                      {t('userGuide.troubleLoginPoint5')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom color="error.main">
                      {t('userGuide.troublePrint')}
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>{t('userGuide.troublePrintSolution')}</strong><br />
                      {t('userGuide.troublePrintPoint1')}<br />
                      {t('userGuide.troublePrintPoint2')}<br />
                      {t('userGuide.troublePrintPoint3')}<br />
                      {t('userGuide.troublePrintPoint4')}<br />
                      {t('userGuide.troublePrintPoint5')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom color="error.main">
                      {t('userGuide.troubleHawaladar')}
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>{t('userGuide.troubleHawaladarSolution')}</strong><br />
                      {t('userGuide.troubleHawaladarPoint1')}<br />
                      {t('userGuide.troubleHawaladarPoint2')}<br />
                      {t('userGuide.troubleHawaladarPoint3')}<br />
                      {t('userGuide.troubleHawaladarPoint4')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom color="error.main">
                      {t('userGuide.troubleRates')}
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>{t('userGuide.troubleRatesSolution')}</strong><br />
                      {t('userGuide.troubleRatesPoint1')}<br />
                      {t('userGuide.troubleRatesPoint2')}<br />
                      {t('userGuide.troubleRatesPoint3')}<br />
                      {t('userGuide.troubleRatesPoint4')}<br />
                      {t('userGuide.troubleRatesPoint5')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom color="error.main">
                      {t('userGuide.troubleLanguage')}
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>{t('userGuide.troubleLanguageSolution')}</strong><br />
                      {t('userGuide.troubleLanguagePoint1')}<br />
                      {t('userGuide.troubleLanguagePoint2')}<br />
                      {t('userGuide.troubleLanguagePoint3')}<br />
                      {t('userGuide.troubleLanguagePoint4')}<br />
                      {t('userGuide.troubleLanguagePoint5')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 5: Admin (Conditional) */}
          {user?.role === 'admin' && (
            <TabPanel value={selectedTab} index={5}>
              <Card variant="outlined" sx={{ border: '2px solid', borderColor: 'secondary.main' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <People sx={{ mr: 2, color: 'secondary.main', fontSize: 32 }} />
                    <Typography variant="h5" fontWeight={600}>
                      {t('admin.manageUsers')} ({t('admin.role')})
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph>
                    {t('userGuide.adminGuide')}
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                      <ListItemText
                        primary={t('userGuide.adminStep1')}
                        secondary={t('userGuide.adminStep1Desc')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                      <ListItemText
                        primary={t('userGuide.adminStep2')}
                        secondary={t('userGuide.adminStep2Desc')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                      <ListItemText
                        primary={t('userGuide.adminStep3')}
                        secondary={t('userGuide.adminStep3Desc')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                      <ListItemText
                        primary={t('userGuide.adminStep4')}
                        secondary={t('userGuide.adminStep4Desc')}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </TabPanel>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 2, p: 3, bgcolor: 'primary.50', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
            {t('userGuide.needHelpTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t('userGuide.needHelp')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('userGuide.needHelpDesc')}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};
