import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';
import EventHero from './EventHero';
import EventContent from './EventContent';
import EventSidebar from './EventSidebar';
import React from 'react';
import styles from './EventDetail.module.css';

const EventPreviewDialog = ({ event, children }) => {
  return (
    <div>
      <Dialog.Root>
        <Dialog.Trigger asChild>{children}</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className={styles['dialog-overlay']} />
          <Dialog.Content className={styles['dialog-content']}>
            <Dialog.Title className={styles['dialog-title']}>
              Preview
            </Dialog.Title>
            <Dialog.Description className={styles['dialog-description']}>
              This is your event look like.
            </Dialog.Description>

            <div className={styles['event-detail__container']}>
              <EventHero thumbnail={event.thumbnail} />
              <div className={styles['event-detail__content']}>
                <EventContent event={event} />
                <EventSidebar event={event} previewMode={true} />
              </div>
            </div>

            <Dialog.Close asChild>
              <button className={styles['dialog-close']} aria-label="Close">
                <X size={20} />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default EventPreviewDialog;
