// Dans un composant de test
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Test() {
  return (
    <div>
      <h1>Test Spinner</h1>
      <LoadingSpinner fullScreen={true} time={0.5} />
    </div>
  );
}
