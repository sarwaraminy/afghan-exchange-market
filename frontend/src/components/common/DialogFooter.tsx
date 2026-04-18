import { DialogActions, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface DialogFooterProps {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  loading?: boolean;
  disabled?: boolean;
}

export const DialogFooter = ({
  onCancel,
  onConfirm,
  confirmLabel,
  cancelLabel,
  confirmColor = 'primary',
  loading = false,
  disabled = false
}: DialogFooterProps) => {
  const { t } = useTranslation();

  return (
    <DialogActions>
      <Button onClick={onCancel} disabled={loading}>
        {cancelLabel || t('common.cancel')}
      </Button>
      <Button
        variant="contained"
        color={confirmColor}
        onClick={onConfirm}
        disabled={loading || disabled}
      >
        {confirmLabel || t('common.save')}
      </Button>
    </DialogActions>
  );
};
