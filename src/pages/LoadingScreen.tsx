import { Placeholder } from '@telegram-apps/telegram-ui';

type LoadingScreenProps = {
  message?: string;
};

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <Placeholder
      header="Initializing AIRE"
      description={message}
    >
      {/* You could add a loading spinner here later */}
    </Placeholder>
  );
}