import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import CharacterSelect from './pages/CharacterSelect'
import ChatPage from './pages/ChatPage'
import DebatePage from './pages/DebatePage'
import QuizPage from './pages/QuizPage'
import JournalPage from './pages/JournalPage'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/select"
                element={
                  <ProtectedRoute>
                    <CharacterSelect />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:characterId"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:characterId/:conversationId"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/debate"
                element={
                  <ProtectedRoute>
                    <DebatePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz"
                element={
                  <ProtectedRoute>
                    <QuizPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/journal"
                element={
                  <ProtectedRoute>
                    <JournalPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AnimatePresence>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
