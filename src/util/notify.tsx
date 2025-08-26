import { rem } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconX } from '@tabler/icons-react';
import type { ReactNode } from 'react';

const xIcon = <IconX style={{ width: rem(20), height: rem(20) }} />;

export function notifyError({ title, message }: { title?: string; message: ReactNode }) {
  notifications.show({
    title: title || 'Error',
    message,
    color: 'red',
    icon: xIcon,
    styles: {
      body: {
        background: 'transparent'
      },
      root: {
        alignItems: 'flex-start',
        padding: rem(20)
      }
    }
  });
}
