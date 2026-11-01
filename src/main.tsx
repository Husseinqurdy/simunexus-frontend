import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { queryClient } from '@/lib/queryClient'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster position="top-right" gutter={10} toastOptions={{
        duration: 4000,
        style: { borderRadius: 12, background: '#fff', color: '#0A1F4D', border: '1px solid #E3E9F4', boxShadow: '0 12px 32px rgba(10,31,107,.14)', fontSize: 14, fontWeight: 500, padding: '12px 14px' },
        success: { iconTheme: { primary: '#137A4E', secondary: '#fff' } },
        error: { iconTheme: { primary: '#B92D2D', secondary: '#fff' } },
      }} />
    </QueryClientProvider>
  </React.StrictMode>
)
