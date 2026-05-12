import { Routes, Route } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { HomePage } from "@/pages/HomePage"
import { CalculatorPage } from "@/pages/CalculatorPage"
import { AdminPage } from "@/pages/AdminPage"
import { ActivitiesPage } from "@/pages/ActivitiesPage"
import { LoginPage } from "@/pages/LoginPage"
import { UserProfilePage } from "@/pages/UserProfilePage"
import { ResetPasswordPage } from "@/pages/ResetPasswordPage"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminPage /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
