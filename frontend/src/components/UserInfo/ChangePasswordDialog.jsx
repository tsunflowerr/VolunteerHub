import { Dialog } from 'radix-ui';
import React from 'react';
import { X } from 'lucide-react';
import ChangePassword from './ChangePassword';
import styles from './UserInfoDialog.module.css';

const ChangePasswordDialog = ({ children, open, onOpenChange }) => {
  const handleSubmit = () => {
    // Close dialog on success (handled in ChangePassword via onSubmit prop if needed, 
    // but ChangePassword handles logic. We can pass a callback to close)
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles['dialog-overlay']} />
        <Dialog.Content className={styles['dialog-content']}>
          <Dialog.Title className={styles['dialog-title']}>
            Security
          </Dialog.Title>
          <Dialog.Description className={styles['dialog-description']}>
            Update your password to keep your account secure.
          </Dialog.Description>

          <ChangePassword onSubmit={handleSubmit} />

          <Dialog.Close asChild>
            <button className={styles['dialog-close']} aria-label="Close">
              <X size={20} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ChangePasswordDialog;
