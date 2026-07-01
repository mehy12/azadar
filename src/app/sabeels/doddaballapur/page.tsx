import ClientSabeelPage from './ClientSabeelPage';
import sabeelsData from '@/data/doddaballapur_sabeels.json';

export const metadata = {
  title: "Doddaballapur Sabeel Info",
  description: "Sabeels on the Bangalore to Doddaballapur route for 16th Muharram."
};

export default function Page() {
  return <ClientSabeelPage sabeels={sabeelsData} />;
}
