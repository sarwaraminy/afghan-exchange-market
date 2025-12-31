import { Box, Container, Typography, Link } from '@mui/material';

export const Footer = () => {
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
          &copy; {year} Sarafi.AF - Afghanistan Exchange Market
        </Typography>
        <Typography variant="caption" align="center" display="block" sx={{ mt: 1, opacity: 0.7 }}>
          Real-time exchange rates from Sarai Shahzada and other markets
        </Typography>
      </Container>
    </Box>
  );
};
