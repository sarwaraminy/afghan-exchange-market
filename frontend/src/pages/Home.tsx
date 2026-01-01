import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip
} from '@mui/material';
import {
  CurrencyExchange,
  Calculate,
  TrendingUp,
  TrendingDown,
  TrendingFlat
} from '@mui/icons-material';
import { getExchangeRates, getGoldRates } from '../services/api';
import type { ExchangeRate, GoldRate } from '../types';
import { Loading } from '../components/common/Loading';

export const Home = () => {
  const { t } = useTranslation();
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [goldRates, setGoldRates] = useState<GoldRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ratesData, goldData] = await Promise.all([
          getExchangeRates(1),
          getGoldRates()
        ]);
        setRates(ratesData);
        setGoldRates(goldData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getFlagUrl = (code: string) => `https://flagcdn.com/32x24/${code}.png`;

  const formatRate = (rate: number) => {
    if (rate < 1) return rate.toFixed(4);
    if (rate < 100) return rate.toFixed(2);
    return rate.toFixed(0);
  };

  const getChangeIcon = (change: number | undefined) => {
    if (!change || change === 0) return <TrendingFlat sx={{ color: 'text.secondary' }} />;
    if (change > 0) return <TrendingUp sx={{ color: 'success.main' }} />;
    return <TrendingDown sx={{ color: 'error.main' }} />;
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
          color: 'white',
          py: { xs: 6, md: 10 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
            {t('home.title')}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
            {t('home.subtitle')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/rates"
              variant="contained"
              size="large"
              startIcon={<CurrencyExchange />}
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
            >
              {t('home.viewRates')}
            </Button>
            <Button
              component={Link}
              to="/converter"
              variant="outlined"
              size="large"
              startIcon={<Calculate />}
              sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'grey.300', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              {t('home.converter')}
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loading ? (
          <Loading />
        ) : (
          <Grid container spacing={3}>
            {/* Exchange Rates */}
            <Grid size={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight={600}>
                    {t('rates.title')} - {t('rates.markets.Sarai Shahzada')}
                  </Typography>
                  <Button component={Link} to="/rates" size="small">
                    {t('common.viewAll')}
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {rates.slice(0, 6).map((rate) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={rate.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            {rate.flag_code && (
                              <img
                                src={getFlagUrl(rate.flag_code)}
                                alt={rate.currency_code}
                                style={{ width: 32, height: 24, borderRadius: 2 }}
                              />
                            )}
                            <Box>
                              <Typography fontWeight={600}>{rate.currency_code}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {rate.currency_name}
                              </Typography>
                            </Box>
                            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                              {getChangeIcon(rate.change_percent)}
                            </Box>
                          </Box>
                          <Grid container spacing={2}>
                            <Grid size={6}>
                              <Typography variant="caption" color="text.secondary">
                                {t('rates.buy')}
                              </Typography>
                              <Typography fontWeight={600} color="success.main">
                                {formatRate(rate.buy_rate)} AFN
                              </Typography>
                            </Grid>
                            <Grid size={6}>
                              <Typography variant="caption" color="text.secondary">
                                {t('rates.sell')}
                              </Typography>
                              <Typography fontWeight={600} color="error.main">
                                {formatRate(rate.sell_rate)} AFN
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {/* Gold Rates */}
            <Grid size={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight={600}>
                    {t('gold.title')}
                  </Typography>
                  <Button component={Link} to="/gold" size="small">
                    {t('common.viewAll')}
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {goldRates.slice(0, 4).map((gold) => (
                    <Grid size={{ xs: 6, sm: 3 }} key={gold.id}>
                      <Card variant="outlined" sx={{ textAlign: 'center' }}>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            {gold.type}
                          </Typography>
                          <Typography variant="h6" fontWeight={700} color="warning.main">
                            {gold.price_afn.toLocaleString()} AFN
                          </Typography>
                          <Chip
                            label={`$${gold.price_usd.toFixed(2)}`}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};
