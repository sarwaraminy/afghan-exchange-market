import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Paper,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Store } from '@mui/icons-material';
import { getExchangeRates, getMarkets } from '../services/api';
import type { ExchangeRate, Market } from '../types';
import { RatesTable } from '../components/rates/RatesTable';

export const Rates = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const getMarketName = (market: Market) => {
    if (i18n.language === 'fa' && market.name_fa) return market.name_fa;
    if (i18n.language === 'ps' && market.name_ps) return market.name_ps;
    return market.name;
  };

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const data = await getMarkets();
        // Remove duplicates by id
        const uniqueMarkets = data.filter(
          (market, index, self) => index === self.findIndex((m) => m.id === market.id)
        );
        setMarkets(uniqueMarkets);
        if (uniqueMarkets.length > 0) {
          setSelectedMarket(uniqueMarkets[0].id);
        }
      } catch (error) {
        console.error('Error fetching markets:', error);
      }
    };
    fetchMarkets();
  }, []);

  useEffect(() => {
    const fetchRates = async () => {
      if (selectedMarket === null) return;
      setLoading(true);
      try {
        const data = await getExchangeRates(selectedMarket);
        setRates(data);
      } catch (error) {
        console.error('Error fetching rates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, [selectedMarket]);

  const sidebar = (
    <Paper
      elevation={2}
      sx={{
        width: isMobile ? '100%' : 250,
        flexShrink: 0,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          bgcolor: '#1e3a5f',
          color: 'white',
          p: 2
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          {t('rates.market')}
        </Typography>
      </Box>
      <List disablePadding>
        {markets.map((market) => (
          <ListItem key={market.id} disablePadding>
            <ListItemButton
              selected={selectedMarket === market.id}
              onClick={() => setSelectedMarket(market.id)}
              sx={{
                py: 1.5,
                '&.Mui-selected': {
                  bgcolor: '#e3f2fd',
                  borderRight: '3px solid #1e3a5f',
                  '&:hover': {
                    bgcolor: '#bbdefb',
                  },
                },
                '&:hover': {
                  bgcolor: '#f5f5f5',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Store sx={{ color: selectedMarket === market.id ? '#1e3a5f' : 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText
                primary={getMarketName(market)}
                primaryTypographyProps={{
                  fontWeight: selectedMarket === market.id ? 600 : 400,
                  color: selectedMarket === market.id ? '#1e3a5f' : 'text.primary',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('rates.title')}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 3,
        }}
      >
        {sidebar}

        <Paper sx={{ flex: 1, p: 2, borderRadius: 2 }}>
          <RatesTable rates={rates} isLoading={loading} />
        </Paper>
      </Box>
    </Container>
  );
};
