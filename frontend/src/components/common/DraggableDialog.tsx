import type { ReactNode } from 'react';
import { useRef } from 'react';
import { Dialog, Paper } from '@mui/material';
import type { DialogProps, PaperProps } from '@mui/material';
import Draggable from 'react-draggable';

interface DraggablePaperProps extends PaperProps {
  handle?: string;
}

function DraggablePaper(props: DraggablePaperProps) {
  const nodeRef = useRef(null);
  return (
    <Draggable
      nodeRef={nodeRef}
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper ref={nodeRef} {...props} />
    </Draggable>
  );
}

interface DraggableDialogProps extends Omit<DialogProps, 'PaperComponent'> {
  children: ReactNode;
}

export const DraggableDialog = ({ children, ...props }: DraggableDialogProps) => {
  return (
    <Dialog
      {...props}
      PaperComponent={DraggablePaper}
      aria-labelledby="draggable-dialog-title"
    >
      {children}
    </Dialog>
  );
};
