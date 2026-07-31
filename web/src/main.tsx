import './globals';
import './config.js';
import '@midnight-ntwrk/dapp-connector-api';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(<App />);
