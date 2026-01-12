import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Grid
} from '@mui/material';
import { Print, ArrowBack } from '@mui/icons-material';
import { getHawalaTransactionById } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const HawalaReceipt = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [transaction, setTransaction] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!id) {
        setError(t('common.transactionIdNotProvided'));
        setLoading(false);
        return;
      }

      try {
        const data = await getHawalaTransactionById(parseInt(id));
        setTransaction(data);
      } catch (err: any) {
        console.error('Error fetching transaction:', err);
        setError(err.response?.data?.error || t('common.failedToLoadTransaction'));
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id, t]);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getLogoUrl = (logoFilename?: string): string | undefined => {
    if (!logoFilename) return undefined;
    return `${API_BASE_URL}/uploads/logos/${logoFilename}`;
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>{t('common.loading')}</Typography>
      </Container>
    );
  }

  if (error || !transaction) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error">{error || t('common.transactionNotFound')}</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/hawala')} sx={{ mt: 2 }}>
          Back
        </Button>
      </Container>
    );
  }

  return (
    <>
      {/* Print Button - Hidden during print */}
      <Box className="no-print" sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/hawala')}
        >
          {t('common.back')}
        </Button>
        <Button
          variant="contained"
          startIcon={<Print />}
          onClick={handlePrint}
        >
          {t('hawala.printReceipt')}
        </Button>
      </Box>

      {/* Receipt Content */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            '@media print': {
              boxShadow: 'none',
              p: 2
            }
          }}
        >
          {/* Header with Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            {transaction.sender_hawaladar_logo && (
              <img
                src={getLogoUrl(transaction.sender_hawaladar_logo)}
                alt="Hawaladar Logo"
                style={{ maxHeight: '100px', marginBottom: '16px' }}
              />
            )}
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {
                transaction.sender_hawaladar_name
                  ? (i18n.language === 'fa'
                      ? transaction.sender_hawaladar_name_fa || transaction.sender_hawaladar_name
                      : i18n.language === 'ps'
                      ? transaction.sender_hawaladar_name_ps || transaction.sender_hawaladar_name
                      : transaction.sender_hawaladar_name)
                  : t('hawala.receipt')
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {
                i18n.language === 'fa'
                  ? transaction.sender_hawaladar_location_fa || transaction.sender_hawaladar_location
                  : i18n.language === 'ps'
                  ? transaction.sender_hawaladar_location_ps || transaction.sender_hawaladar_location
                  : transaction.sender_hawaladar_location
              }
            </Typography>
            {transaction.sender_hawaladar_phone && (
              <Typography variant="body2" color="text.secondary">
                {t('hawala.phone')}: {transaction.sender_hawaladar_phone}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Transaction Details */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {t('hawala.hawalaTransferReceipt')}
            </Typography>

            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('hawala.referenceCode')}:</TableCell>
                  <TableCell>{transaction.reference_code}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('hawala.date')}:</TableCell>
                  <TableCell>{new Date(transaction.created_at).toLocaleString(i18n.language)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('hawala.status')}:</TableCell>
                  <TableCell>{t(`hawala.statuses.${transaction.status}`)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Sender and Receiver Information */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Sender */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {t('hawala.senderInfo')}
              </Typography>
              <Typography variant="body2">
                <strong>{t('hawala.name')}:</strong> {transaction.sender_name}
              </Typography>
              {transaction.sender_phone && (
                <Typography variant="body2">
                  <strong>{t('hawala.phone')}:</strong> {transaction.sender_phone}
                </Typography>
              )}
              {transaction.sender_hawaladar_name && (
                <Typography variant="body2">
                  <strong>{t('hawala.agent')}:</strong> {
                    i18n.language === 'fa'
                      ? transaction.sender_hawaladar_name_fa || transaction.sender_hawaladar_name
                      : i18n.language === 'ps'
                      ? transaction.sender_hawaladar_name_ps || transaction.sender_hawaladar_name
                      : transaction.sender_hawaladar_name
                  }
                </Typography>
              )}
            </Grid>

            {/* Receiver */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {t('hawala.receiverInfo')}
              </Typography>
              <Typography variant="body2">
                <strong>{t('hawala.name')}:</strong> {transaction.receiver_name}
              </Typography>
              {transaction.receiver_phone && (
                <Typography variant="body2">
                  <strong>{t('hawala.phone')}:</strong> {transaction.receiver_phone}
                </Typography>
              )}
              {transaction.receiver_hawaladar_name && (
                <Typography variant="body2">
                  <strong>{t('hawala.agent')}:</strong> {
                    i18n.language === 'fa'
                      ? transaction.receiver_hawaladar_name_fa || transaction.receiver_hawaladar_name
                      : i18n.language === 'ps'
                      ? transaction.receiver_hawaladar_name_ps || transaction.receiver_hawaladar_name
                      : transaction.receiver_hawaladar_name
                  }
                </Typography>
              )}
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Amount Details */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {t('hawala.amountDetails')}
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>{t('hawala.amount')}:</TableCell>
                  <TableCell align="right">
                    {formatCurrency(transaction.amount)} {transaction.currency_code}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    {t('hawala.commission')} ({transaction.commission_rate}%):
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(transaction.commission_amount)} {transaction.currency_code}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    {t('hawala.totalAmount')}:
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    {formatCurrency(transaction.total_amount)} {transaction.currency_code}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>

          {/* Notes */}
          {transaction.notes && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {t('hawala.notes')}:
                </Typography>
                <Typography variant="body2">{transaction.notes}</Typography>
              </Box>
            </>
          )}

          {/* Footer */}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="caption" color="text.secondary">
              {t('hawala.createdBy')}: {transaction.created_by_name}
            </Typography>
            {transaction.completed_at && (
              <Typography variant="caption" color="text.secondary" display="block">
                {t('hawala.completedAt')}: {new Date(transaction.completed_at).toLocaleString(i18n.language)}
              </Typography>
            )}
          </Box>

          {/* Signature Line */}
          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ borderTop: '1px solid #000', pt: 1, minWidth: 150, textAlign: 'center' }}>
              <Typography variant="caption">{t('hawala.senderSignature')}</Typography>
            </Box>
            <Box sx={{ borderTop: '1px solid #000', pt: 1, minWidth: 150, textAlign: 'center' }}>
              <Typography variant="caption">{t('hawala.agentSignature')}</Typography>
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            margin: 0;
            padding: 0;
          }

          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </>
  );
};
