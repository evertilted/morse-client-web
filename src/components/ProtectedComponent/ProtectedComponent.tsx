import { Navigate } from 'react-router-dom'

type ProtectedRouteProps = {
    children: React.ReactElement;
    redirectTo?: string;
  }
  
  export const ProtectedRoute = ({
    children,
    redirectTo = '/auth'
  }: ProtectedRouteProps): React.ReactElement => {
    const accessToken = localStorage.getItem('accessToken');
    return !accessToken ? <Navigate to={redirectTo} replace /> : children;
  };