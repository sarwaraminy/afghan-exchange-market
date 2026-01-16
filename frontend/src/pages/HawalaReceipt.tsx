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
  Grid,
  Chip,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import {
  Print,
  ArrowBack,
  CheckCircle,
  Schedule,
  Cancel,
  LocalShipping,
  Person,
  Phone,
  LocationOn,
  Store,
  AccountBalance,
  Receipt as ReceiptIcon,
  CalendarToday,
  AttachMoney
} from '@mui/icons-material';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'in_transit': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'pending': return <Schedule />;
      case 'in_transit': return <LocalShipping />;
      case 'cancelled': return <Cancel />;
      default: return <Schedule />;
    }
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
          {t('common.back')}
        </Button>
      </Container>
    );
  }

  return (
    <>
      {/* Print Button - Hidden during print */}
      <Box className="no-print" sx={{ p: 3, display: 'flex', justifyContent: 'center', gap: 2, bgcolor: '#f8fafc' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/hawala')}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          {t('common.back')}
        </Button>
        <Button
          variant="contained"
          startIcon={<Print />}
          onClick={handlePrint}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a4091 100%)',
            }
          }}
        >
          {t('hawala.printReceipt')}
        </Button>
      </Box>

      {/* Receipt Content */}
      <Container
        maxWidth="sm"
        sx={{
          py: 4,
          '@media print': { py: 0, px: 0, maxWidth: '80mm' }
        }}
      >
        <Paper
          elevation={8}
          sx={{
            overflow: 'hidden',
            borderRadius: 3,
            '@media print': {
              boxShadow: 'none',
              borderRadius: 0,
              margin: 0
            }
          }}
        >
          {/* Modern Header with Gradient */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 4,
              textAlign: 'center',
              position: 'relative',
              '@media print': {
                background: '#667eea',
                p: 1.5
              }
            }}
          >
            <ReceiptIcon sx={{ fontSize: 48, mb: 1, '@media print': { fontSize: 32, mb: 0.5 } }} />
            <Typography
              variant="h4"
              fontWeight={700}
              gutterBottom
              sx={{ '@media print': { fontSize: '1.2rem', mb: 0.5 } }}
            >
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
            <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" flexWrap="wrap">
              <LocationOn sx={{ fontSize: 18 }} />
              <Typography variant="body2" sx={{ '@media print': { fontSize: '0.75rem' } }}>
                {
                  i18n.language === 'fa'
                    ? transaction.sender_hawaladar_location_fa || transaction.sender_hawaladar_location
                    : i18n.language === 'ps'
                    ? transaction.sender_hawaladar_location_ps || transaction.sender_hawaladar_location
                    : transaction.sender_hawaladar_location
                }
              </Typography>
            </Stack>
            {(transaction.sender_hawaladar_floor_number || transaction.sender_hawaladar_shop_number) && (
              <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" flexWrap="wrap" sx={{ mt: 0.5 }}>
                <Store sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ '@media print': { fontSize: '0.7rem' } }}>
                  {[
                    transaction.sender_hawaladar_floor_number && `${t('hawala.floor')}: ${transaction.sender_hawaladar_floor_number}`,
                    transaction.sender_hawaladar_shop_number && `${t('hawala.shop')}: ${transaction.sender_hawaladar_shop_number}`
                  ].filter(Boolean).join(', ')}
                </Typography>
              </Stack>
            )}
            {transaction.sender_hawaladar_phone && (
              <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" sx={{ mt: 0.5 }}>
                <Phone sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ '@media print': { fontSize: '0.7rem' } }}>
                  {transaction.sender_hawaladar_phone}
                </Typography>
              </Stack>
            )}
          </Box>

          <Box sx={{ p: 4, '@media print': { p: 1.5 } }}>
            {/* Reference Code & Status */}
            <Card
              variant="outlined"
              sx={{
                mb: 3,
                border: '2px solid',
                borderColor: 'primary.light',
                bgcolor: 'primary.50',
                '@media print': {
                  mb: 1,
                  bgcolor: 'transparent',
                  border: '1px solid #ccc'
                }
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, '@media print': { p: 1 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ '@media print': { fontSize: '0.6rem' } }}>
                      {t('hawala.referenceCode')}
                    </Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ '@media print': { fontSize: '0.9rem' } }}>
                      {transaction.reference_code}
                    </Typography>
                  </Box>
                  <Chip
                    icon={getStatusIcon(transaction.status)}
                    label={t(`hawala.statuses.${transaction.status}`)}
                    color={getStatusColor(transaction.status)}
                    sx={{
                      fontWeight: 600,
                      '@media print': {
                        fontSize: '0.65rem',
                        height: 'auto',
                        '& .MuiChip-icon': { fontSize: '0.9rem' }
                      }
                    }}
                  />
                </Stack>
                <Divider sx={{ my: 1.5, '@media print': { my: 0.5 } }} />
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ '@media print': { fontSize: '0.65rem' } }}>
                    {new Date(transaction.created_at).toLocaleString(i18n.language)}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Sender & Receiver Info */}
            <Grid container spacing={2} sx={{ mb: 3, '@media print': { mb: 1, spacing: 0.5 } }}>
              {/* Sender */}
              <Grid item xs={12} md={6}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    borderLeft: '4px solid',
                    borderLeftColor: 'success.main',
                    '@media print': {
                      border: '1px solid #ccc',
                      borderLeftWidth: '2px'
                    }
                  }}
                >
                  <CardContent sx={{ '@media print': { p: 1 } }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                      <Person sx={{ color: 'success.main', fontSize: 24, '@media print': { fontSize: 18 } }} />
                      <Typography variant="subtitle1" fontWeight={700} sx={{ '@media print': { fontSize: '0.8rem' } }}>
                        {t('hawala.senderInfo')}
                      </Typography>
                    </Stack>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" sx={{ '@media print': { fontSize: '0.7rem' } }}>
                        <strong>{t('hawala.name')}:</strong> {transaction.sender_name}
                      </Typography>
                      {transaction.sender_phone && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Phone sx={{ fontSize: 14 }} />
                          <Typography variant="body2" sx={{ '@media print': { fontSize: '0.7rem' } }}>
                            {transaction.sender_phone}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Receiver */}
              <Grid item xs={12} md={6}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    borderLeft: '4px solid',
                    borderLeftColor: 'info.main',
                    '@media print': {
                      border: '1px solid #ccc',
                      borderLeftWidth: '2px'
                    }
                  }}
                >
                  <CardContent sx={{ '@media print': { p: 1 } }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                      <Person sx={{ color: 'info.main', fontSize: 24, '@media print': { fontSize: 18 } }} />
                      <Typography variant="subtitle1" fontWeight={700} sx={{ '@media print': { fontSize: '0.8rem' } }}>
                        {t('hawala.receiverInfo')}
                      </Typography>
                    </Stack>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" sx={{ '@media print': { fontSize: '0.7rem' } }}>
                        <strong>{t('hawala.name')}:</strong> {transaction.receiver_name}
                      </Typography>
                      {transaction.receiver_phone && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Phone sx={{ fontSize: 14 }} />
                          <Typography variant="body2" sx={{ '@media print': { fontSize: '0.7rem' } }}>
                            {transaction.receiver_phone}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Receiver Hawaladar */}
            {transaction.receiver_hawaladar_name && (
              <Card
                variant="outlined"
                sx={{
                  mb: 3,
                  bgcolor: 'grey.50',
                  '@media print': {
                    mb: 1,
                    bgcolor: 'transparent',
                    border: '1px solid #ccc'
                  }
                }}
              >
                <CardContent sx={{ '@media print': { p: 1 } }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <AccountBalance sx={{ color: 'primary.main', fontSize: 24, '@media print': { fontSize: 18 } }} />
                    <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ '@media print': { fontSize: '0.8rem' } }}>
                      {t('hawala.receiverAgent')}
                    </Typography>
                  </Stack>
                  <Stack spacing={0.5}>
                    <Typography variant="body2" sx={{ '@media print': { fontSize: '0.7rem' } }}>
                      <strong>{t('hawala.name')}:</strong> {
                        i18n.language === 'fa'
                          ? transaction.receiver_hawaladar_name_fa || transaction.receiver_hawaladar_name
                          : i18n.language === 'ps'
                          ? transaction.receiver_hawaladar_name_ps || transaction.receiver_hawaladar_name
                          : transaction.receiver_hawaladar_name
                      }
                    </Typography>
                    {transaction.receiver_hawaladar_location && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <LocationOn sx={{ fontSize: 14 }} />
                        <Typography variant="body2" sx={{ '@media print': { fontSize: '0.7rem' } }}>
                          {
                            i18n.language === 'fa'
                              ? transaction.receiver_hawaladar_location_fa || transaction.receiver_hawaladar_location
                              : i18n.language === 'ps'
                              ? transaction.receiver_hawaladar_location_ps || transaction.receiver_hawaladar_location
                              : transaction.receiver_hawaladar_location
                          }
                        </Typography>
                      </Stack>
                    )}
                    {(transaction.receiver_hawaladar_floor_number || transaction.receiver_hawaladar_shop_number) && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Store sx={{ fontSize: 14 }} />
                        <Typography variant="body2" sx={{ '@media print': { fontSize: '0.7rem' } }}>
                          {[
                            transaction.receiver_hawaladar_floor_number && `${t('hawala.floor')}: ${transaction.receiver_hawaladar_floor_number}`,
                            transaction.receiver_hawaladar_shop_number && `${t('hawala.shop')}: ${transaction.receiver_hawaladar_shop_number}`
                          ].filter(Boolean).join(', ')}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Amount Details - Highlighted */}
            <Card
              variant="outlined"
              sx={{
                mb: 3,
                border: '2px solid',
                borderColor: 'success.light',
                bgcolor: 'success.50',
                '@media print': {
                  mb: 1,
                  bgcolor: 'transparent',
                  border: '1px solid #ccc'
                }
              }}
            >
              <CardContent sx={{ '@media print': { p: 1 } }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <AttachMoney sx={{ color: 'success.main', fontSize: 28, '@media print': { fontSize: 20 } }} />
                  <Typography variant="h6" fontWeight={700} sx={{ '@media print': { fontSize: '0.85rem' } }}>
                    {t('hawala.amountDetails')}
                  </Typography>
                </Stack>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ border: 'none', pl: 0, '@media print': { fontSize: '0.7rem', py: 0.25 } }}>
                        {t('hawala.amount')}:
                      </TableCell>
                      <TableCell align="right" sx={{ border: 'none', pr: 0, fontWeight: 600, '@media print': { fontSize: '0.7rem', py: 0.25 } }}>
                        {formatCurrency(transaction.amount)} {transaction.currency_code}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ border: 'none', pl: 0, '@media print': { fontSize: '0.7rem', py: 0.25 } }}>
                        {t('hawala.commission')} ({transaction.commission_rate}%):
                      </TableCell>
                      <TableCell align="right" sx={{ border: 'none', pr: 0, fontWeight: 600, '@media print': { fontSize: '0.7rem', py: 0.25 } }}>
                        {formatCurrency(transaction.commission_amount)} {transaction.currency_code}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2} sx={{ border: 'none', p: 0 }}>
                        <Divider sx={{ my: 1, '@media print': { my: 0.25 } }} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{
                          border: 'none',
                          pl: 0,
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: 'success.dark',
                          '@media print': { fontSize: '0.75rem', py: 0.25 }
                        }}
                      >
                        {t('hawala.totalAmount')}:
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          border: 'none',
                          pr: 0,
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: 'success.dark',
                          '@media print': { fontSize: '0.8rem', py: 0.25 }
                        }}
                      >
                        {formatCurrency(transaction.total_amount)} {transaction.currency_code}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Notes */}
            {transaction.notes && (
              <Card
                variant="outlined"
                sx={{
                  mb: 3,
                  bgcolor: 'warning.50',
                  '@media print': {
                    mb: 1,
                    bgcolor: 'transparent',
                    border: '1px solid #ccc'
                  }
                }}
              >
                <CardContent sx={{ '@media print': { p: 1 } }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ '@media print': { fontSize: '0.75rem' } }}>
                    {t('hawala.notes')}:
                  </Typography>
                  <Typography variant="body2" sx={{ '@media print': { fontSize: '0.7rem' } }}>
                    {transaction.notes}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Footer Info */}
            <Box sx={{ textAlign: 'center', mb: 3, '@media print': { mb: 1 } }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ '@media print': { fontSize: '0.6rem' } }}>
                {t('hawala.createdBy')}: {transaction.created_by_name}
              </Typography>
              {transaction.completed_at && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ '@media print': { fontSize: '0.6rem' } }}>
                  {t('hawala.completedAt')}: {new Date(transaction.completed_at).toLocaleString(i18n.language)}
                </Typography>
              )}
            </Box>

            {/* Signature Section */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box
                  sx={{
                    borderTop: '2px solid',
                    borderColor: 'grey.400',
                    pt: 1,
                    textAlign: 'center',
                    '@media print': {
                      borderTop: '1px solid #000',
                      pt: 0.25
                    }
                  }}
                >
                  <Typography variant="caption" fontWeight={600} sx={{ '@media print': { fontSize: '0.6rem' } }}>
                    {t('hawala.senderSignature')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    borderTop: '2px solid',
                    borderColor: 'grey.400',
                    pt: 1,
                    textAlign: 'center',
                    '@media print': {
                      borderTop: '1px solid #000',
                      pt: 0.25
                    }
                  }}
                >
                  <Typography variant="caption" fontWeight={600} sx={{ '@media print': { fontSize: '0.6rem' } }}>
                    {t('hawala.agentSignature')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Thank You Message */}
            <Box
              sx={{
                mt: 3,
                pt: 2,
                borderTop: '1px dashed',
                borderColor: 'grey.300',
                textAlign: 'center',
                '@media print': { mt: 1, pt: 0.5 }
              }}
            >
              <Typography
                variant="body2"
                fontWeight={600}
                color="primary"
                sx={{ '@media print': { fontSize: '0.7rem' } }}
              >
                {t('common.appSubtitle')}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ '@media print': { fontSize: '0.6rem' } }}
              >
                {t('common.footerNote')}
              </Typography>
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

          /* Hide Header and Footer during print */
          header, footer {
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
          .MuiGrid-root,
          .MuiCard-root {
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
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
          }

          .MuiDivider-root {
            margin-top: 1mm !important;
            margin-bottom: 1mm !important;
          }

          .MuiCard-root {
            box-shadow: none !important;
          }

          .MuiCardContent-root {
            padding: 2mm !important;
          }

          /* Remove gradients and backgrounds for printing */
          * {
            background: transparent !important;
            color: black !important;
          }

          /* But keep borders visible */
          .MuiCard-root {
            border: 1px solid #ccc !important;
          }
        }
      `}</style>
    </>
  );
};
