import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="text-center px-6 py-10 rounded-2xl bg-gradient-to-b from-white/80 to-primary/10 border border-primary/10 shadow-xl max-w-full">
        <h1 className="mb-4 text-3xl sm:text-4xl font-bold">404</h1>
        <p className="mb-6 text-lg sm:text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-lg bg-primary text-primary-foreground font-medium touch-manipulation hover:opacity-90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
