import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const Loading = () => {
  const { t } = useTranslation();

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="200px" gap={2}>
      <CircularProgress />
      <Typography color="text.secondary">{t('common.loading')}</Typography>
    </Box>
  );
};
