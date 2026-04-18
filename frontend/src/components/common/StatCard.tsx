import type { ReactNode } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  bgColor?: string;
  valueColor?: string;
  isMobile?: boolean;
}

export const StatCard = ({
  label,
  value,
  icon,
  bgColor = '#e3f2fd',
  valueColor = 'primary.main',
  isMobile = false
}: StatCardProps) => {
  return (
    <Card sx={{ bgcolor: bgColor }}>
      <CardContent sx={{ py: isMobile ? 1.5 : 2 }}>
        {icon && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            {icon}
            <Typography variant="h6" fontWeight={600}>
              {label}
            </Typography>
          </Box>
        )}
        {!icon && (
          <Typography variant="h6" fontWeight={600}>
            {label}
          </Typography>
        )}
        <Typography variant="h4" sx={{ mt: 1, color: valueColor }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};
