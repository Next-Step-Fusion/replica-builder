import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ReplicaBuilderPage } from './pages/ReplicaBuilderPage';
import { theme } from './theme';

export function Root() {
  return (
    <MantineProvider defaultColorScheme="light" forceColorScheme="light" theme={theme}>
      <Notifications autoClose={false} position="top-center" containerWidth="500" />
      <ReplicaBuilderPage />
    </MantineProvider>
  );
}
