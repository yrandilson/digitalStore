import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";
import AdminSettings from "./pages/AdminSettings";
import AdminUsers from "./pages/AdminUsers";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import Downloads from "./pages/Downloads";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Product from "./pages/Product";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/products"} component={Products} />
      <Route path={"/products/:slug"} component={Product} />
      <Route path={"/cart"} component={Cart} />

      {/* Authenticated user routes */}
      <Route path={"/checkout"}>
        <ProtectedRoute><Checkout /></ProtectedRoute>
      </Route>
      <Route path={"/orders"}>
        <ProtectedRoute><Orders /></ProtectedRoute>
      </Route>
      <Route path={"/downloads"}>
        <ProtectedRoute><Downloads /></ProtectedRoute>
      </Route>
      <Route path={"/profile"}>
        <ProtectedRoute><Profile /></ProtectedRoute>
      </Route>

      {/* Admin routes */}
      <Route path={"/dashboard"}>
        <ProtectedRoute requireAdmin><Dashboard /></ProtectedRoute>
      </Route>
      <Route path={"/dashboard/products"}>
        <ProtectedRoute requireAdmin><AdminProducts /></ProtectedRoute>
      </Route>
      <Route path={"/dashboard/orders"}>
        <ProtectedRoute requireAdmin><AdminOrders /></ProtectedRoute>
      </Route>
      <Route path={"/dashboard/users"}>
        <ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>
      </Route>
      <Route path={"/dashboard/settings"}>
        <ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>
      </Route>

      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
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
      <ThemeProvider defaultTheme="light">
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
