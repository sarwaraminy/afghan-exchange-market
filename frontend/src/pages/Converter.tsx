import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  MenuItem,
  IconButton,
  Grid,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { SwapVert } from '@mui/icons-material';
import { getCurrencies, convert } from '../services/api';
import type { Currency, ConversionResult } from '../types';

export const Converter = () => {
  const { t } = useTranslation();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('AFN');
  const [amount, setAmount] = useState('1');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const data = await getCurrencies();
        setCurrencies([{ id: 0, code: 'AFN', name: 'Afghan Afghani', is_active: 1 }, ...data]);
      } catch (error) {
        console.error('Error fetching currencies:', error);
      }
    };
    fetchCurrencies();
  }, []);

  useEffect(() => {
    const doConvert = async () => {
      if (!amount || parseFloat(amount) <= 0) {
        setResult(null);
        return;
      }

      setLoading(true);
      try {
        const data = await convert(fromCurrency, toCurrency, parseFloat(amount));
        setResult(data);
      } catch (error) {
        console.error('Error converting:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(doConvert, 300);
    return () => clearTimeout(debounce);
  }, [fromCurrency, toCurrency, amount]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getFlagUrl = (code: string) => {
    const flags: Record<string, string> = {
      USD: 'us', EUR: 'eu', GBP: 'gb', PKR: 'pk', INR: 'in',
      IRR: 'ir', SAR: 'sa', AED: 'ae', CNY: 'cn', TRY: 'tr', AFN: 'af'
    };
    return `https://flagcdn.com/24x18/${flags[code] || 'xx'}.png`;
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom textAlign="center">
        {t('converter.title')}
      </Typography>

      <Paper sx={{ p: 4, mt: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t('converter.amount')}
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ min: 0, step: 'any' }}
          />
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid size={5}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('converter.from')}
            </Typography>
            <TextField
              select
              fullWidth
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
            >
              {currencies.map((currency) => (
                <MenuItem key={currency.code} value={currency.code}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <img src={getFlagUrl(currency.code)} alt={currency.code} style={{ width: 20, height: 15 }} />
                    {currency.code}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={2} sx={{ textAlign: 'center' }}>
            <IconButton onClick={handleSwap} sx={{ bgcolor: 'grey.100' }}>
              <SwapVert />
            </IconButton>
          </Grid>

          <Grid size={5}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('converter.to')}
            </Typography>
            <TextField
              select
              fullWidth
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
            >
              {currencies.map((currency) => (
                <MenuItem key={currency.code} value={currency.code}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <img src={getFlagUrl(currency.code)} alt={currency.code} style={{ width: 20, height: 15 }} />
                    {currency.code}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Card sx={{ mt: 4, bgcolor: 'grey.50' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            {loading ? (
              <CircularProgress size={24} />
            ) : result ? (
              <>
                <Typography variant="caption" color="text.secondary">
                  {t('converter.result')}
                </Typography>
                <Typography variant="h3" fontWeight={700} color="primary.main">
                  {result.result.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </Typography>
                <Typography color="text.secondary">
                  {result.to}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {t('converter.rate')}: 1 {result.from} = {result.rate.toFixed(4)} {result.to}
                </Typography>
              </>
            ) : (
              <Typography color="text.secondary">
                {t('converter.enterAmount')}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Paper>
    </Container>
  );
};
