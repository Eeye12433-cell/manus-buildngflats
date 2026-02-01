import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Apartments from "./pages/Apartments";
import Payments from "./pages/Payments";
import Fees from "./pages/Fees";
import Reports from "./pages/Reports";
import DashboardLayout from "./components/DashboardLayout";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard">
        <DashboardLayout><Dashboard /></DashboardLayout>
      </Route>
      <Route path="/apartments">
        <DashboardLayout><Apartments /></DashboardLayout>
      </Route>
      <Route path="/payments">
        <DashboardLayout><Payments /></DashboardLayout>
      </Route>
      <Route path="/fees">
        <DashboardLayout><Fees /></DashboardLayout>
      </Route>
      <Route path="/reports">
        <DashboardLayout><Reports /></DashboardLayout>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
