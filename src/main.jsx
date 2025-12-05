import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app.jsx'
import './index.css'
import { EmpresaProvider } from './contextos/EmpresaContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <EmpresaProvider>
      <App />
    </EmpresaProvider>
  </React.StrictMode>,
)