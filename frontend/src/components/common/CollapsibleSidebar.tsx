import type { ReactNode } from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { ChevronLeft, ChevronRight, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export interface SidebarMenuItem {
  id: string | number;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  selected?: boolean;
  subItems?: SidebarMenuItem[];
  expanded?: boolean;
}

interface CollapsibleSidebarProps {
  title: string;
  items: SidebarMenuItem[];
  isOpen: boolean;
  onToggle: () => void;
  headerBgColor?: string;
  collapsedWidth?: number;
  expandedWidth?: number;
  renderSubItems?: (item: SidebarMenuItem) => ReactNode;
}

export const CollapsibleSidebar = ({
  title,
  items,
  isOpen,
  onToggle,
  headerBgColor = '#1e3a5f',
  collapsedWidth = 70,
  expandedWidth = 250,
  renderSubItems
}: CollapsibleSidebarProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const sidebarWidth = !isMobile && !isOpen ? collapsedWidth : (isMobile ? '100%' : expandedWidth);

  return (
    <Paper
      elevation={2}
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'width 0.2s ease'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: headerBgColor,
          color: 'white',
          p: 1.5,
          display: 'flex',
          justifyContent: !isMobile && !isOpen ? 'center' : 'space-between',
          alignItems: 'center'
        }}
      >
        {(isOpen || isMobile) && (
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
        )}
        {!isMobile && (
          <Tooltip
            title={isOpen ? (t('common.collapseSidebar') || 'Collapse sidebar') : (t('common.expandSidebar') || 'Expand sidebar')}
            arrow
          >
            <IconButton onClick={onToggle} size="small" sx={{ color: 'white' }}>
              {isOpen ? <ChevronLeft /> : <ChevronRight />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Menu Items */}
      <List disablePadding>
        {items.map((item) => (
          <Box key={item.id}>
            <ListItem disablePadding>
              <Tooltip title={!isMobile && !isOpen ? item.label : ''} placement="right" arrow>
                <ListItemButton
                  selected={item.selected}
                  onClick={item.onClick}
                  sx={{
                    py: 1.5,
                    justifyContent: !isMobile && !isOpen ? 'center' : 'initial',
                    '&.Mui-selected': {
                      bgcolor: '#e3f2fd',
                      borderRight: '3px solid #1e3a5f',
                      '&:hover': {
                        bgcolor: '#bbdefb',
                      },
                    },
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: !isMobile && !isOpen ? 'auto' : 40,
                      justifyContent: 'center',
                      color: item.selected ? '#1e3a5f' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {(isOpen || isMobile) && (
                    <>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: item.selected ? 600 : 400,
                          color: item.selected ? '#1e3a5f' : 'text.primary',
                        }}
                      />
                      {item.subItems && (
                        <Box sx={{ color: item.selected ? '#1e3a5f' : 'text.secondary' }}>
                          {item.expanded ? <ExpandLess /> : <ExpandMore />}
                        </Box>
                      )}
                    </>
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
            {/* Render sub-items if provided */}
            {renderSubItems && item.subItems && renderSubItems(item)}
          </Box>
        ))}
      </List>
    </Paper>
  );
};
