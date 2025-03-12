import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App.jsx';

// SWR Config Provider
import SWRProvider from './services/SWRProvider';

// Auth Provider
import { AuthProvider } from '@/context/auth-context';

createRoot(document.getElementById('root')).render(
  <SWRProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </SWRProvider>,
);
