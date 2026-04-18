import { useState } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

export const useMobileNav = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const closeMobileDrawer = () => {
    setMobileOpen(false);
  };

  const openMobileDrawer = () => {
    setMobileOpen(true);
  };

  return {
    isMobile,
    mobileOpen,
    handleDrawerToggle,
    closeMobileDrawer,
    openMobileDrawer,
  };
};
