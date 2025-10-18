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
import { UserProvider } from './UserContext.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import Perfil from './Perfil.jsx'
import AddGrupos from './AddGrupos.jsx';
import AgendarCita from './AgendarCita.jsx';
import EditarCita from './EditarCita.jsx';
import AuthenticatedHome from './AuthenticatedHome.jsx';

import RegisterVet from './RegisterVet.jsx';
import VetProfile from './VetProfile.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta principal que maneja automáticamente la autenticación */}
          <Route path="/" element={<AuthenticatedHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          


         

          <Route path="/App" element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          } />

          <Route path="/add-ganado" element={
            <ProtectedRoute>
              <AddGanado />
            </ProtectedRoute>
          } />

          {/* permite ver un animal por su ID (B-001, B-002, O-001, etc.) */}
          <Route path="/visualizar-ganado/:id" element={
            <ProtectedRoute>
              <VisualizarGanado />
            </ProtectedRoute>
          } />

          {/* Compatibilidad con la ruta anterior sin ID */}
          <Route path="/visualizar-ganado" element={
            <ProtectedRoute>
              <VisualizarGanado />
            </ProtectedRoute>
          } />

          <Route path="/visualizar-potrero/:potreroId" element={
            <ProtectedRoute>
              <VisualizarPotrero />
            </ProtectedRoute>
          } />

          {/* Compatibilidad con la ruta anterior sin ID */}
          <Route path="/visualizar-potrero" element={
            <ProtectedRoute>
              <VisualizarPotrero />
            </ProtectedRoute>
          } />

          <Route path="/visualizar-grupos-pastoreo/:grupoId" element={
            <ProtectedRoute>
              <VisualizarGruposPastoreo />
            </ProtectedRoute>
          } />

          <Route path="/add-potreros" element={
            <ProtectedRoute>
              <AddPotreros />
            </ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          } />
          <Route path="/add-grupos" element={
            <ProtectedRoute>
              <AddGrupos />
            </ProtectedRoute>
          } />

          <Route path="/agendar-cita" element={
            <ProtectedRoute>
              <AgendarCita />
            </ProtectedRoute>
          } />

          <Route path="/editar-cita/:citaId" element={
            <ProtectedRoute>
              <EditarCita />
            </ProtectedRoute>
          } />

        </Routes>
      </BrowserRouter>
    </UserProvider>
  </StrictMode>
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
