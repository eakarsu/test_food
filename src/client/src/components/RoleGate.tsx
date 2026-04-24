import { useAuthStore } from '../stores/authStore';

interface Props {
  children: React.ReactNode;
  role: 'ADMIN' | 'USER';
}

const RoleGate = ({ children, role }: Props) => {
  const { user } = useAuthStore();
  if (user?.role !== role) return null;
  return <>{children}</>;
};

export default RoleGate;
