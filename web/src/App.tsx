import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './lib/AppContext';
import { Footer, NavBar } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { ProvePage } from './pages/ProvePage';
import { RegistryPage } from './pages/RegistryPage';
import { PrivacyPage } from './pages/PrivacyPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="shell">
          <div className="grain" aria-hidden />
          <NavBar />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/app" element={<ProvePage />} />
              <Route path="/registry" element={<RegistryPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
