import type { ReactNode } from 'react';
import { DialogTitle } from '@mui/material';
import type { DialogTitleProps } from '@mui/material';

interface DraggableDialogTitleProps extends DialogTitleProps {
  children: ReactNode;
}

export const DraggableDialogTitle = ({ children, sx, ...props }: DraggableDialogTitleProps) => {
  return (
    <DialogTitle
      {...props}
      id="draggable-dialog-title"
      sx={{
        cursor: 'move',
        userSelect: 'none',
        ...sx
      }}
    >
      {children}
    </DialogTitle>
  );
};
