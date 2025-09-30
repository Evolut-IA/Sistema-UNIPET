import { useState, useCallback, useRef, useEffect } from "react";

interface PasswordDialogState {
  isOpen: boolean;
  title?: string;
  description?: string;
  onConfirm?: (password: string) => void;
  isLoading?: boolean;
}

export function usePasswordDialog() {
  const [state, setState] = useState<PasswordDialogState>({
    isOpen: false,
  });
  
  const onConfirmRef = useRef<((password: string) => void) | undefined>();
  
  useEffect(() => {
    onConfirmRef.current = state.onConfirm;
  }, [state.onConfirm]);

  const openDialog = useCallback((options: Omit<PasswordDialogState, 'isOpen'>) => {
    setState({
      isOpen: true,
      title: options.title,
      description: options.description,
      onConfirm: options.onConfirm,
      isLoading: options.isLoading || false,
    });
  }, []);

  const closeDialog = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const confirm = useCallback((password: string) => {
    if (onConfirmRef.current) {
      onConfirmRef.current(password);
    }
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  return {
    isOpen: state.isOpen,
    title: state.title,
    description: state.description,
    isLoading: state.isLoading,
    openDialog,
    closeDialog,
    confirm,
    setLoading,
  };
}
