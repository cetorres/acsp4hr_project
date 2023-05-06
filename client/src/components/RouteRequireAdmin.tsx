import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RouteRequireAdmin(props: any) {
  const { authState } = useAuth();

  return authState.user?.isAdmin ? (
    props.children
  ) : (
    <Navigate to="/home" />
  );
}