import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Box,
  Paper,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { getExchangeRates, getMarkets } from '../services/api';
import type { ExchangeRate, Market } from '../types';
import { RatesTable } from '../components/rates/RatesTable';

export const Rates = () => {
  const { t } = useTranslation();
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const data = await getMarkets();
        setMarkets(data);
        if (data.length > 0) {
          setSelectedMarket(data[0].id);
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
              {market.name}
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
