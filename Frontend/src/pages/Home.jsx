import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();
  return <p>Signed in as {user.name} ({user.email})</p>;
}