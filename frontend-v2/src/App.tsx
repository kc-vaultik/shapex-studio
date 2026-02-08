import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/components/ui/toast'
import { Header } from '@/components/layout'
import Dashboard from './pages/Dashboard'

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-dark-900">
            <Header />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              {/* More routes will be added here */}
            </Routes>
          </div>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
