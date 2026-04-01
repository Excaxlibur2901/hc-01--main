import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

import { SocketProvider } from './context/SocketContext';
import { QueueProvider } from './context/QueueContext';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SocketProvider>
        <QueueProvider>
          <App />
          <Toaster 
            position="top-right" 
            toastOptions={{ 
              duration: 4000,
              style: {
                backdropFilter: 'blur(10px)',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
              }
            }} 
          />
        </QueueProvider>
      </SocketProvider>
    </BrowserRouter>
  </React.StrictMode>,
)


