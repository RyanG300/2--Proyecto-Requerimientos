// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AddGanado from './AddGanado.jsx'
import VisualizarGanado from './VisualizarGanado.jsx'
import VisualizarPotrero from './VisualizarPotrero.jsx'
import VisualizarGruposPastoreo from './VisualizarGruposPastoreo.jsx'
import AddPotreros from './AddPotreros.jsx'
import MainMenu from './mainMenu.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'
import CompanyView from './CompanyView.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      {/* Ruta principal, login, register */}
      <Route path="/" element={<MainMenu />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/*Company view*/}
      <Route path="/company-view" element={<CompanyView/>} />

      <Route path="/App" element={<App />} />
      <Route path="/add-ganado" element={<AddGanado />} />

      {/* permite ver un animal por su ID (B-001, B-002, O-001, etc.) */}
      <Route path="/visualizar-ganado/:id" element={<VisualizarGanado />} />
      {/* Compatibilidad con la ruta anterior sin ID */}
      <Route path="/visualizar-ganado" element={<VisualizarGanado />} />

      <Route path="/visualizar-potrero" element={<VisualizarPotrero />} />

      {/* Ruta con parámetro :tipo para Bovino | Ovino | Caprino */}
      <Route path="/visualizar-grupos-pastoreo/:tipo" element={<VisualizarGruposPastoreo />} />

      <Route path="/add-potreros" element={<AddPotreros />} />
    </Routes>
  </BrowserRouter>
)

/*
Ahora, en tu listado de "Cabezas de ganado",
haz que cada botón navegue con su ID, por ejemplo:
  navigate('/visualizar-ganado/B-001')
  navigate('/visualizar-ganado/B-002')
  navigate('/visualizar-ganado/B-003')

Y dentro de VisualizarGanado, usa useParams() para leer `id`
y buscarlo en el objeto GANADO.
*/
