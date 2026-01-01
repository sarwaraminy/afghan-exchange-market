import { Box, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'grey.300',
        py: 3,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" align="center">
          &copy; {year} {t('common.appName')} - {t('common.appSubtitle')}
        </Typography>
        <Typography variant="caption" align="center" display="block" sx={{ mt: 1, opacity: 0.7 }}>
          {t('common.footerNote')}
        </Typography>
      </Container>
    </Box>
  );
};
