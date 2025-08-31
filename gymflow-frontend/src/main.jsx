import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import GlobalLoadingOverlay from './ui/GlobalLoadingOverlay.jsx'

// Note: StrictMode is intentionally disabled to avoid double-mounting
// in development, which can conflict with route transitions/animations.
createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <GlobalLoadingOverlay />
    <App />
  </AuthProvider>,
)
