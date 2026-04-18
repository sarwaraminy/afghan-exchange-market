import type { ReactNode } from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

interface HoverCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

export const HoverCard = ({ icon, title, description, onClick }: HoverCardProps) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        transition: '0.3s',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ mr: 2, color: 'primary.main', fontSize: 36, display: 'flex', alignItems: 'center' }}>
            {icon}
          </Box>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};
