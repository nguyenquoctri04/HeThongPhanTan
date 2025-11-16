import "./App.css"
import { Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "./components/Layout"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { UIProvider } from "./context/UIContext"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Transaction from "./pages/Transaction"
import TransactionHistory from "./pages/TransactionHistory"
import Users from "./pages/Users"
import Profile from "./pages/Profile"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  return !user ? <>{children}</> : <Navigate to="/dashboard" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/transfer" element={
        <ProtectedRoute>
          <Layout>
            <Transaction />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/transactions" element={
        <ProtectedRoute>
          <Layout>
            <TransactionHistory />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <Layout>
            <Users />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <AppRoutes />
      </UIProvider>
    </AuthProvider>
  )
}

export default App
