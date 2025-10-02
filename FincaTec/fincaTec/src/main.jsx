import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AddGanado from './AddGanado.jsx'
import VisualizarGanado from './VisualizarGanado.jsx'
import VisualizarPotrero from './VisualizarPotrero.jsx'
import VisualizarGruposPastoreo from './VisualizarGruposPastoreo.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/add-ganado" element={<AddGanado />} />
      <Route path="/visualizar-ganado" element={<VisualizarGanado />} />
      <Route path="/visualizar-potrero" element={<VisualizarPotrero />} />
      <Route path="/visualizar-grupos-pastoreo" element={<VisualizarGruposPastoreo />} />
    </Routes>
  </BrowserRouter>
  
)

/*
onClick={() => navigate('/visualizar-grupos-pastoreo')}*/ 
