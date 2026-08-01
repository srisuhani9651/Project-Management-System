import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import ScrollToTop from "@/components/ScrollToTop"
import Navbar from "@/components/Navbar"
import Home from "@/pages/Home"
import Login from "@/pages/Login"
import Signup from "@/pages/Signup"

export function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        {/* Navbar - Visible on every page */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/40 py-6 bg-background text-center text-xs text-muted-foreground">
          <div className="container max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} ProjectFlow Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#privacy" className="hover:underline">Privacy Policy</a>
              <a href="#terms" className="hover:underline">Terms of Service</a>
              <a href="#support" className="hover:underline">Contact Support</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
