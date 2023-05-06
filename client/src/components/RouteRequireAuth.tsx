import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RouteRequireAuth(props: any) {
  const { authState } = useAuth();

  return authState.isAuthenticated ? (
    props.children
  ) : (
    <Navigate to={props.redirectTo} />
  );
}
