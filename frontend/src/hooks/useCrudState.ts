import { useState, useCallback } from 'react';

export interface UseCrudStateReturn<T> {
  // Dialog states
  editDialog: boolean;
  createDialog: boolean;
  deleteDialog: boolean;

  // Selected item
  selectedItem: T | null;

  // Error state
  error: string;

  // Form data
  formData: Partial<T>;

  // Handlers
  openEdit: (item: T) => void;
  openCreate: () => void;
  openDelete: (item: T) => void;
  closeEdit: () => void;
  closeCreate: () => void;
  closeDelete: () => void;
  closeAll: () => void;
  setError: (error: string) => void;
  clearError: () => void;
  updateFormData: (data: Partial<T>) => void;
  resetFormData: () => void;
}

export const useCrudState = <T extends Record<string, any>>(
  initialFormData: Partial<T> = {}
): UseCrudStateReturn<T> => {
  const [editDialog, setEditDialog] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Partial<T>>(initialFormData);

  const openEdit = useCallback((item: T) => {
    setSelectedItem(item);
    setFormData(item);
    setError('');
    setEditDialog(true);
  }, []);

  const openCreate = useCallback(() => {
    setSelectedItem(null);
    setFormData(initialFormData);
    setError('');
    setCreateDialog(true);
  }, [initialFormData]);

  const openDelete = useCallback((item: T) => {
    setSelectedItem(item);
    setError('');
    setDeleteDialog(true);
  }, []);

  const closeEdit = useCallback(() => {
    setEditDialog(false);
    setSelectedItem(null);
    setFormData(initialFormData);
    setError('');
  }, [initialFormData]);

  const closeCreate = useCallback(() => {
    setCreateDialog(false);
    setFormData(initialFormData);
    setError('');
  }, [initialFormData]);

  const closeDelete = useCallback(() => {
    setDeleteDialog(false);
    setSelectedItem(null);
    setError('');
  }, []);

  const closeAll = useCallback(() => {
    setEditDialog(false);
    setCreateDialog(false);
    setDeleteDialog(false);
    setSelectedItem(null);
    setFormData(initialFormData);
    setError('');
  }, [initialFormData]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const updateFormData = useCallback((data: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const resetFormData = useCallback(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  return {
    editDialog,
    createDialog,
    deleteDialog,
    selectedItem,
    error,
    formData,
    openEdit,
    openCreate,
    openDelete,
    closeEdit,
    closeCreate,
    closeDelete,
    closeAll,
    setError,
    clearError,
    updateFormData,
    resetFormData,
  };
};
