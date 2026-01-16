import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  ExpandMore,
  CurrencyExchange,
  TrendingUp,
  Calculate,
  SwapHoriz,
  Diamond,
  People,
  Dashboard,
  Person,
  Language,
  CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export const UserGuide = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom color="primary">
            {t('nav.userGuide')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('userGuide.subtitle')}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Introduction */}
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

        {/* Quick Start */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom color="primary">
            {t('userGuide.quickStart')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('userGuide.quickStartDesc')}
          </Typography>
          <Typography variant="body2" paragraph color="text.secondary">
            {t('userGuide.quickStartIntro')}
          </Typography>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Dashboard sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={600}>{t('nav.dashboard')}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('userGuide.dashboardDesc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CurrencyExchange sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={600}>{t('nav.rates')}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('userGuide.ratesDesc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SwapHoriz sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={600}>{t('nav.hawala')}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('userGuide.hawalaDesc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Calculate sx={{ mr: 1, color: 'primary.main' }} />
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

        <Divider sx={{ my: 3 }} />

        {/* Detailed Guides */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom color="primary" sx={{ mb: 3 }}>
            {t('userGuide.detailedGuides')}
          </Typography>

          {/* Exchange Rates */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CurrencyExchange sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  {t('nav.rates')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
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
            </AccordionDetails>
          </Accordion>

          {/* Currency Converter */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Calculate sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  {t('nav.converter')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
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
            </AccordionDetails>
          </Accordion>

          {/* Hawala Transfers */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SwapHoriz sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  {t('nav.hawala')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                {t('userGuide.hawalaGuide')}
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary" sx={{ fontStyle: 'italic', pl: 2, borderLeft: '3px solid', borderColor: 'primary.main' }}>
                {t('userGuide.hawalaExplainer')}
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 1, mb: 2 }}>
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
              <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1, mb: 2, border: '1px solid', borderColor: 'info.200' }}>
                <Typography variant="body2" fontWeight={600} color="info.dark" gutterBottom>
                  ℹ️ {t('userGuide.transactionTypes')}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div">
                  <strong>{t('hawala.outgoing')}:</strong> {t('userGuide.outgoingExplain')}<br />
                  <strong>{t('hawala.incoming')}:</strong> {t('userGuide.incomingExplain')}
                </Typography>
              </Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
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
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
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
            </AccordionDetails>
          </Accordion>

          {/* Gold Prices */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Diamond sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  {t('nav.gold')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
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
            </AccordionDetails>
          </Accordion>

          {/* Profile Settings */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  {t('nav.profile')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
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
            </AccordionDetails>
          </Accordion>

          {/* Admin Functions */}
          {user?.role === 'admin' && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <People sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    {t('admin.manageUsers')} ({t('admin.role')})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
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
              </AccordionDetails>
            </Accordion>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Additional Tips */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom color="primary">
            {t('userGuide.tips')}
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><TrendingUp color="primary" /></ListItemIcon>
              <ListItemText
                primary={t('userGuide.tip1')}
                secondary={t('userGuide.tip1Desc')}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Language color="primary" /></ListItemIcon>
              <ListItemText
                primary={t('userGuide.tip2')}
                secondary={t('userGuide.tip2Desc')}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><SwapHoriz color="primary" /></ListItemIcon>
              <ListItemText
                primary={t('userGuide.tip3')}
                secondary={t('userGuide.tip3Desc')}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
              <ListItemText
                primary={t('userGuide.tip4')}
                secondary={t('userGuide.tip4Desc')}
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* FAQ Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom color="primary">
            {t('userGuide.faq')}
          </Typography>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight={600}>
                {t('userGuide.faqQ1')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph style={{ whiteSpace: 'pre-line' }}>
                {t('userGuide.faqA1')}
              </Typography>
              <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 600 }}>
                {t('userGuide.faqA1Note')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight={600}>
                {t('userGuide.faqQ2')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                {t('userGuide.faqA2Title')}
              </Typography>
              <Typography variant="body2" component="div">
                • {t('userGuide.faqA2Point1')}<br />
                • {t('userGuide.faqA2Point2')}<br />
                • {t('userGuide.faqA2Point3')}<br /><br />
                {t('userGuide.faqA2Note')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight={600}>
                {t('userGuide.faqQ3')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {t('userGuide.faqA3Intro')}<br />
                • {t('userGuide.faqA3Point1')}<br />
                • {t('userGuide.faqA3Point2')}<br />
                • {t('userGuide.faqA3Point3')}<br />
                • {t('userGuide.faqA3Point4')}<br /><br />
                {t('userGuide.faqA3Note')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight={600}>
                {t('userGuide.faqQ4')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {t('userGuide.faqA4Intro')}<br />
                {t('userGuide.faqA4Step1')}<br />
                {t('userGuide.faqA4Step2')}<br />
                {t('userGuide.faqA4Step3')}<br />
                {t('userGuide.faqA4Step4')}<br /><br />
                {t('userGuide.faqA4Note')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight={600}>
                {t('userGuide.faqQ5')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" component="div">
                • {t('userGuide.faqA5Pending')}<br />
                • {t('userGuide.faqA5InTransit')}<br />
                • {t('userGuide.faqA5Completed')}<br />
                • {t('userGuide.faqA5Cancelled')}<br /><br />
                {t('userGuide.faqA5Note')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight={600}>
                {t('userGuide.faqQ6')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {t('userGuide.faqA6Intro')}<br /><br />
                • {t('userGuide.faqA6Example1')}<br />
                • {t('userGuide.faqA6Example2')}<br />
                • {t('userGuide.faqA6Example3')}<br /><br />
                {t('userGuide.faqA6Note')}
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Troubleshooting Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom color="primary">
            {t('userGuide.troubleshooting')}
          </Typography>

          <Card variant="outlined" sx={{ mb: 2 }}>
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

          <Card variant="outlined" sx={{ mb: 2 }}>
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

          <Card variant="outlined" sx={{ mb: 2 }}>
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

          <Card variant="outlined" sx={{ mb: 2 }}>
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
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* System Requirements */}
        <Box sx={{ mb: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {t('userGuide.sysReq')}
          </Typography>
          <Typography variant="body2" paragraph>
            {t('userGuide.sysReqIntro')}
          </Typography>
          <Typography variant="body2" component="div">
            <strong>{t('userGuide.sysReqBrowsers')}</strong><br />
            • {t('userGuide.sysReqBrowser1')}<br />
            • {t('userGuide.sysReqBrowser2')}<br />
            • {t('userGuide.sysReqBrowser3')}<br />
            • {t('userGuide.sysReqBrowser4')}<br /><br />

            <strong>{t('userGuide.sysReqInternet')}</strong><br />
            • {t('userGuide.sysReqInternet1')}<br />
            • {t('userGuide.sysReqInternet2')}<br /><br />

            <strong>{t('userGuide.sysReqScreen')}</strong><br />
            • {t('userGuide.sysReqScreen1')}<br />
            • {t('userGuide.sysReqScreen2')}<br /><br />

            <strong>{t('userGuide.sysReqPrinter')}</strong><br />
            • {t('userGuide.sysReqPrinter1')}<br />
            • {t('userGuide.sysReqPrinter2')}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4, p: 3, bgcolor: 'primary.50', borderRadius: 2 }}>
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
