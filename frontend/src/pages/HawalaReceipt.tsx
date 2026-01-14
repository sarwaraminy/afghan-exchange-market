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
      <Container maxWidth="xs" sx={{ py: 4, '@media print': { py: 0, px: 0 } }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            '@media print': {
              boxShadow: 'none',
              p: 1,
              margin: 0
            }
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3, '@media print': { mb: 1 } }}>
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
            {(transaction.sender_hawaladar_floor_number || transaction.sender_hawaladar_shop_number) && (
              <Typography variant="body2" color="text.secondary">
                {[
                  transaction.sender_hawaladar_floor_number && `${t('hawala.floor')}: ${transaction.sender_hawaladar_floor_number}`,
                  transaction.sender_hawaladar_shop_number && `${t('hawala.shop')}: ${transaction.sender_hawaladar_shop_number}`
                ].filter(Boolean).join(', ')}
              </Typography>
            )}
            {transaction.sender_hawaladar_phone && (
              <Typography variant="body2" color="text.secondary">
                {t('hawala.phone')}: {transaction.sender_hawaladar_phone}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2, '@media print': { my: 0.5 } }} />

          {/* Transaction Details */}
          <Box sx={{ mb: 3, '@media print': { mb: 0.5 } }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ '@media print': { display: 'none' } }}>
              {t('hawala.hawalaTransferReceipt')}
            </Typography>

            <Table size="small" sx={{ '@media print': { '& .MuiTableCell-root': { fontSize: '0.7rem' } } }}>
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

          <Divider sx={{ my: 2, '@media print': { my: 0.5 } }} />

          {/* Hawaladar Information */}
          <Box sx={{ mb: 3, '@media print': { mb: 1 } }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {t('hawala.agents')}
            </Typography>
            <Grid container spacing={3} sx={{ '@media print': { spacing: 0.5 } }}>
              {/* Receiver Hawaladar */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, '@media print': { p: 0.75, bgcolor: 'transparent', border: '1px solid #ccc' } }}>
                  <Typography variant="body2" fontWeight={600} color="primary" gutterBottom>
                    {t('hawala.receiverAgent')}
                  </Typography>
                  {transaction.receiver_hawaladar_name ? (
                    <>
                      <Typography variant="body2">
                        <strong>{t('hawala.name')}:</strong> {
                          i18n.language === 'fa'
                            ? transaction.receiver_hawaladar_name_fa || transaction.receiver_hawaladar_name
                            : i18n.language === 'ps'
                            ? transaction.receiver_hawaladar_name_ps || transaction.receiver_hawaladar_name
                            : transaction.receiver_hawaladar_name
                        }
                      </Typography>
                      {transaction.receiver_hawaladar_location && (
                        <Typography variant="body2">
                          <strong>{t('hawala.location')}:</strong> {
                            i18n.language === 'fa'
                              ? transaction.receiver_hawaladar_location_fa || transaction.receiver_hawaladar_location
                              : i18n.language === 'ps'
                              ? transaction.receiver_hawaladar_location_ps || transaction.receiver_hawaladar_location
                              : transaction.receiver_hawaladar_location
                          }
                        </Typography>
                      )}
                      {(transaction.receiver_hawaladar_floor_number || transaction.receiver_hawaladar_shop_number) && (
                        <Typography variant="body2">
                          <strong>{t('hawala.floor')}/{t('hawala.shop')}:</strong> {
                            [
                              transaction.receiver_hawaladar_floor_number && `${t('hawala.floor')}: ${transaction.receiver_hawaladar_floor_number}`,
                              transaction.receiver_hawaladar_shop_number && `${t('hawala.shop')}: ${transaction.receiver_hawaladar_shop_number}`
                            ].filter(Boolean).join(', ')
                          }
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">-</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2, '@media print': { my: 0.5 } }} />

          {/* Sender and Receiver Information */}
          <Grid container spacing={3} sx={{ mb: 3, '@media print': { mb: 1, spacing: 0.5 } }}>
            {/* Sender */}
            <Grid size={{ xs: 12 }}>
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
            </Grid>

            {/* Receiver */}
            <Grid size={{ xs: 12 }}>
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
            </Grid>
          </Grid>

          <Divider sx={{ my: 2, '@media print': { my: 0.5 } }} />

          {/* Amount Details */}
          <Box sx={{ mb: 3, '@media print': { mb: 0.5 } }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ '@media print': { fontSize: '0.8rem', mb: 0.25 } }}>
              {t('hawala.amountDetails')}
            </Typography>
            <Table size="small" sx={{ '@media print': { '& .MuiTableCell-root': { fontSize: '0.7rem', padding: '1mm' } } }}>
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
                  <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem', '@media print': { fontSize: '0.75rem', fontWeight: 700 } }}>
                    {t('hawala.totalAmount')}:
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem', '@media print': { fontSize: '0.75rem', fontWeight: 700 } }}>
                    {formatCurrency(transaction.total_amount)} {transaction.currency_code}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>

          {/* Notes */}
          {transaction.notes && (
            <>
              <Divider sx={{ my: 2, '@media print': { my: 0.5 } }} />
              <Box sx={{ mb: 3, '@media print': { mb: 0.5 } }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ '@media print': { fontSize: '0.75rem', mb: 0.25 } }}>
                  {t('hawala.notes')}:
                </Typography>
                <Typography variant="body2" sx={{ '@media print': { fontSize: '0.7rem' } }}>{transaction.notes}</Typography>
              </Box>
            </>
          )}

          {/* Footer */}
          <Divider sx={{ my: 2, '@media print': { my: 0.5 } }} />
          <Box sx={{ textAlign: 'center', mt: 2, mb: 2, '@media print': { mt: 0.5, mb: 0.5 } }}>
            <Typography variant="caption" color="text.secondary" sx={{ '@media print': { fontSize: '0.6rem' } }}>
              {t('hawala.createdBy')}: {transaction.created_by_name}
            </Typography>
            {transaction.completed_at && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ '@media print': { fontSize: '0.6rem' } }}>
                {t('hawala.completedAt')}: {new Date(transaction.completed_at).toLocaleString(i18n.language)}
              </Typography>
            )}
          </Box>

          {/* Signature Line */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', gap: 1, '@media print': { mt: 0.5, gap: 0.5 } }}>
            <Box sx={{ borderTop: '1px solid #000', pt: 1, minWidth: 150, textAlign: 'center', '@media print': { minWidth: '35mm', pt: 0.25 } }}>
              <Typography variant="caption" sx={{ '@media print': { fontSize: '0.6rem' } }}>{t('hawala.senderSignature')}</Typography>
            </Box>
            <Box sx={{ borderTop: '1px solid #000', pt: 1, minWidth: 150, textAlign: 'center', '@media print': { minWidth: '35mm', pt: 0.25 } }}>
              <Typography variant="caption" sx={{ '@media print': { fontSize: '0.6rem' } }}>{t('hawala.agentSignature')}</Typography>
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
            width: 80mm;
          }

          @page {
            margin: 2mm;
            size: 80mm auto;
          }

          /* Control page breaks */
          .MuiBox-root,
          .MuiTable-root,
          .MuiGrid-root {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .MuiTableRow-root {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* Reduce spacing for thermal print */
          .MuiContainer-root {
            max-width: 80mm !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .MuiPaper-root {
            padding: 3mm !important;
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
          }

          .MuiDivider-root {
            margin-top: 2mm !important;
            margin-bottom: 2mm !important;
          }

          .MuiBox-root {
            margin-bottom: 2mm !important;
          }

          .MuiTypography-h4 {
            font-size: 1.1rem !important;
            margin-bottom: 1mm !important;
          }

          .MuiTypography-h6 {
            font-size: 0.9rem !important;
            margin-bottom: 1mm !important;
          }

          .MuiTypography-subtitle1 {
            font-size: 0.85rem !important;
            margin-bottom: 1mm !important;
            font-weight: 700 !important;
          }

          .MuiTypography-body2 {
            font-size: 0.75rem !important;
            line-height: 1.2 !important;
          }

          .MuiTypography-caption {
            font-size: 0.65rem !important;
          }

          .MuiTableCell-root {
            padding: 1mm 2mm !important;
            font-size: 0.75rem !important;
            border: none !important;
          }

          img {
            max-height: 40px !important;
            margin-bottom: 2mm !important;
          }

          .header-logo {
            max-height: 35px !important;
            margin-bottom: 2mm !important;
          }

          .MuiGrid-root {
            margin: 0 !important;
            width: 100% !important;
          }

          .MuiGrid-item {
            padding: 0 !important;
            margin-bottom: 2mm !important;
          }

          /* Remove backgrounds for thermal printing */
          * {
            background-color: transparent !important;
            color: black !important;
          }
        }
      `}</style>
    </>
  );
};
