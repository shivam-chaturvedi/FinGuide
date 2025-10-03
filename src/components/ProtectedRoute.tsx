import { ReactNode } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/signup">Create Account</Link>
              </Button>
            </div>
            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
                className="text-sm"
              >
                ← Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is logged in but trying to access auth pages, redirect to appropriate dashboard
  if (!requireAuth && user) {
    return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
  }

  // If admin user tries to access regular dashboard, redirect to admin dashboard
  if (requireAuth && user && isAdmin && location.pathname === '/dashboard') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
