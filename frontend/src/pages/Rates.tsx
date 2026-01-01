import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Paper,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { getExchangeRates, getMarkets } from '../services/api';
import type { ExchangeRate, Market } from '../types';
import { RatesTable } from '../components/rates/RatesTable';

export const Rates = () => {
  const { t, i18n } = useTranslation();
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('rates.title')}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {t('rates.market')}
        </Typography>
        <ToggleButtonGroup
          value={selectedMarket}
          exclusive
          onChange={(_, value) => value !== null && setSelectedMarket(value)}
          sx={{ flexWrap: 'wrap' }}
        >
          {markets.map((market) => (
            <ToggleButton key={market.id} value={market.id}>
              {getMarketName(market)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <RatesTable rates={rates} isLoading={loading} />
      </Paper>
    </Container>
  );
};
