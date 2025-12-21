import { Dialog } from 'radix-ui';
import React from 'react';
import { X } from 'lucide-react';
import UserInfo from './UserInfo';
import styles from './UserInfoDialog.module.css';
const UserInfoDialog = ({ children, user, onSubmit, open, onOpenChange }) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles['dialog-overlay']} />
        <Dialog.Content className={styles['dialog-content']}>
          <Dialog.Title className={styles['dialog-title']}>
            Edit Profile
          </Dialog.Title>
          <Dialog.Description className={styles['dialog-description']}>
            Make changes to your profile here.
          </Dialog.Description>

          <UserInfo user={user} onSubmit={onSubmit}></UserInfo>

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

export default UserInfoDialog;
