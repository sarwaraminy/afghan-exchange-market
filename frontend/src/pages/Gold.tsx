import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Typography, Paper } from '@mui/material';
import { getGoldRates } from '../services/api';
import type { GoldRate } from '../types';
import { GoldTable } from '../components/rates/GoldTable';

export const Gold = () => {
  const { t } = useTranslation();
  const [rates, setRates] = useState<GoldRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const data = await getGoldRates();
        setRates(data);
      } catch (error) {
        console.error('Error fetching gold rates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('gold.title')}
      </Typography>

      <Paper sx={{ p: 2 }}>
        <GoldTable rates={rates} isLoading={loading} />
      </Paper>
    </Container>
  );
};
