import { useState } from 'react';

interface UseCollapsibleSidebarOptions {
  defaultOpen?: boolean;
}

export const useCollapsibleSidebar = (
  storageKey: string,
  options: UseCollapsibleSidebarOptions = {}
) => {
  const { defaultOpen = true } = options;

  const [isOpen, setIsOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved !== null ? JSON.parse(saved) : defaultOpen;
  });

  const toggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem(storageKey, JSON.stringify(newState));
  };

  const open = () => {
    setIsOpen(true);
    localStorage.setItem(storageKey, JSON.stringify(true));
  };

  const close = () => {
    setIsOpen(false);
    localStorage.setItem(storageKey, JSON.stringify(false));
  };

  return {
    isOpen,
    toggle,
    open,
    close,
  };
};
