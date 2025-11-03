type LoadingScreenProps = {
  message?: string;
};

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div>
      <h2>Initializing AIRE</h2>
      <p>{message}</p>
    </div>
  );
}