import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { ThemeProvider } from './components/ThemeProvider/theme-provider.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { BreadcrumbProvider } from './components/breadcrumb/BreadcrumbContext.tsx'


const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <BreadcrumbProvider>
            <App />
          </BreadcrumbProvider>
        </BrowserRouter>
      </ThemeProvider>
      <Toaster richColors position='top-right' />
    </QueryClientProvider>
  </StrictMode>,
)
