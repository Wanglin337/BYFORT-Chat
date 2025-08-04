import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/lib/auth";
import LoginPage from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Switch>
      <Route path="/admin" component={AdminPage} />
      <Route path="/">
        {isAuthenticated ? <Dashboard /> : <LoginPage />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="max-w-md mx-auto bg-white min-h-screen relative">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
