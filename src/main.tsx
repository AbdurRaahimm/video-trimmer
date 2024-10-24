// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import InstallPWAButton from '@/components/InstallPWAButton.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <>
    <App />
    <InstallPWAButton />
  </>,
)
