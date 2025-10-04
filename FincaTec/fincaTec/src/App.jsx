import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { useNavigate } from 'react-router-dom';
//import './App.css'

// Importar datos reales
import { GANADO } from './data'

// Importar los iconos del menú
//import iconoPerfil from 'images/Menu_finqueros/icono_perfil.png'
//import iconoSalir from 'images/Menu_finqueros/icono_salir.png'

function App() {
  const [count, setCount] = useState(0)
  const navigate = useNavigate();

  // Aplana todas las especies en una sola lista, conservando el nombre de la especie
  const listaGanado = Object.entries(GANADO).flatMap(([especie, arr]) =>
    arr.map(item => ({ ...item, especie }))
  );

  return (
    <>
      {/* Menú superior vacío con iconos alineados a la derecha */}
      <div className="min-h-screen bg-gray-100">
        {/* Menú superior */}
        <header className="w-full flex items-center justify-between px-6 py-3 bg-gradient-to-r from-green-500 via-green-400 to-green-300 shadow-md">
          <img src="images/Menu_finqueros/icono_FincaTec.png" alt="Logo FincaTec" width="100" height="50" className="bg-white rounded-3xl p-1 shadow-md"/>
          {/* Bienvenida usuario*/}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-gradient-to-r from-green-200 via-green-100 to-green-300 shadow-lg border border-green-400">
              <svg className="w-7 h-7 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg>
              <span className="text-xl font-bold text-green-900 tracking-wide">¡Bienvenido, Juan Pérez!</span>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <button className="bg-white hover:bg-blue-200 rounded-xl flex flex-col items-center shadow px-2 py-1 transition">
              <img src="images/Menu_finqueros/icono_perfil.png" alt="Perfil" className="w-10 h-10" />
              <span className="font-bold text-green-700">Perfil</span>
            </button>
            <button className="bg-white hover:bg-blue-200 rounded-xl flex flex-col items-center shadow px-2 py-1 transition">
              <img src="images/Menu_finqueros/icono_salir.png" alt="Salir" className="w-10 h-10" />
              <span className="font-bold text-green-700">Salir</span>
            </button>
          </div>
        </header>

        {/* Rectángulo principal con logo, nombre y descripción */}
        <section className="mx-auto mt-6 mb-8 max-w-3xl w-full bg-white rounded-xl shadow-lg border-2 border-green-400 flex items-center gap-6 px-8 py-6">
          <img src="images/Menu_finqueros/icono_FincaTec.png" alt="Logo FincaTec" className="w-24 h-24 rounded-2xl border border-green-300" />
          <div>
            <h2 className="text-2xl font-bold text-green-700">Finca Ganadera El Roble</h2>
            <p className="text-gray-700 mt-2">Empresa dedicada a la producción y comercialización de ganado bovino de alta calidad, comprometida con la sostenibilidad y el bienestar animal.</p>
          </div>
        </section>

        {/* Dos rectángulos con buscadores */}
        <main className="flex flex-col items-center gap-8">
          <div className="flex flex-row justify-between w-full max-w-6xl mx-auto gap-12">
            {/* Contenedor de ganado */}
            <section className="bg-white rounded-xl shadow-lg border-2 border-green-400 w-[520px] h-[600px] flex flex-col items-center p-8">
              <div className="w-full flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-green-700">Cabezas de ganado</span>
                <button onClick={() => navigate('/add-ganado')} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition">
                  Añadir cabeza de ganado
                </button>
              </div>
              <div className="w-full flex items-center border-2 border-green-300 rounded-lg mb-4 px-2 py-1 bg-gray-50">
                <input type="text" placeholder="Buscar..." className="flex-1 bg-transparent outline-none px-2" />
                <button className="p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" /></svg>
                </button>
              </div>

              {/* Lista de ganado registrado - AHORA DINÁMICO CON TU DATA */}
              <div className="w-full flex-1 overflow-y-auto">
                {listaGanado.map((animal) => (
                  <div key={animal.id} className="flex items-center gap-4 bg-green-50 rounded-lg p-3 mb-4 shadow">
                    <img
                      src={animal.foto}               // viene como /images/...
                      alt={animal.nombre}
                      className="w-20 h-20 object-cover rounded-lg border border-green-300"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-green-800">Nombre: {animal.nombre}</div>
                      <div className="text-sm text-gray-700">ID: {animal.id}</div>
                      <div className="text-sm text-gray-700">Especie: {animal.especie}</div>
                      <div className="text-sm text-gray-700">Raza: {animal.raza}</div>
                      <div className="text-sm text-gray-700">Sexo: {animal.sexo}</div>
                    </div>
                    <button
                      onClick={() => navigate(`/visualizar-ganado/${animal.id}`)}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
                    >
                      Visualizar
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Contenedor de potreros/lotes */}
            <section className="bg-white rounded-xl shadow-lg border-2 border-green-400 w-[520px] h-[600px] flex flex-col items-center p-8">
              {/* Titulo potreros y boton añadir*/}
              <div className="w-full flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-green-700 mb-4">Potreros / Lotes</span>
                <button onClick={() => navigate('/add-potreros')} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition mb-4">Añadir potrero</button>
              </div>
              {/* Buscador potreros*/}
              <div className="w-full flex items-center border-2 border-green-300 rounded-lg mb-4 px-2 py-1 bg-gray-50">
                <input type="text" placeholder="Buscar..." className="flex-1 bg-transparent outline-none px-2" />
                <button className="p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" /></svg>
                </button>
              </div>
              {/* Lista de potreros registrados */}
              <div className="w-full flex-1 overflow-y-auto">
                {/* Potrero 1 */}
                <div className="flex items-center gap-4 bg-green-50 rounded-lg p-3 mb-4 shadow">
                  <img src="images/Potreros_relleno/potrero_1.png" alt="Potrero 1" className="w-20 h-20 object-cover rounded-lg border border-green-300" />
                  <div className="flex-1">
                    <div className="text-xl font-bold text-green-900 mb-1">Potrero La Esperanza</div>
                    <div className="font-bold text-green-800">Capacidad: 30 cabezas</div>
                    <div className="text-sm text-gray-700">Ubicación: Norte</div>
                  </div>
                  <button onClick={() => navigate('/visualizar-potrero')} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition">Detalles</button>
                </div>
                {/* Potrero 2 */}
                <div className="flex items-center gap-4 bg-green-50 rounded-lg p-3 mb-4 shadow">
                  <img src="images/Potreros_relleno/potrero_2.png" alt="Potrero 2" className="w-20 h-20 object-cover rounded-lg border border-green-300" />
                  <div className="flex-1">
                    <div className="text-xl font-bold text-green-900 mb-1">Potrero El Roble</div>
                    <div className="font-bold text-green-800">Capacidad: 25 cabezas</div>
                    <div className="text-sm text-gray-700">Ubicación: Sur</div>
                  </div>
                  <button onClick={() => navigate('/visualizar-potrero')} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition">Detalles</button>
                </div>
                {/* Potrero 3 */}
                <div className="flex items-center gap-4 bg-green-50 rounded-lg p-3 mb-4 shadow">
                  <img src="images/Potreros_relleno/potrero_3.png" alt="Potrero 3" className="w-20 h-20 object-cover rounded-lg border border-green-300" />
                  <div className="flex-1">
                    <div className="text-xl font-bold text-green-900 mb-1">Potrero Las Palmas</div>
                    <div className="font-bold text-green-800">Capacidad: 40 cabezas</div>
                    <div className="text-sm text-gray-700">Ubicación: Este</div>
                  </div>
                  <button onClick={() => navigate('/visualizar-potrero')} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition">Detalles</button>
                </div>
              </div>
            </section>
          </div>

          {/* Nueva fila de rectángulos abajo */}
          <div className="flex flex-row justify-between w-full max-w-6xl mx-auto gap-12">
            {/* Rectángulo de grupos de pastoreo */}
            <section className="bg-white rounded-xl shadow-lg border-2 border-green-400 w-[520px] h-[400px] flex flex-col items-center p-8">
              <div className="w-full flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-green-700">Grupos de pastoreo</span>
                <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition">Crear grupo</button>
              </div>
              <div className="w-full flex items-center border-2 border-green-300 rounded-lg mb-4 px-2 py-1 bg-gray-50">
                <input type="text" placeholder="Buscar grupo..." className="flex-1 bg-transparent outline-none px-2" />
                <button className="p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" /></svg>
                </button>
              </div>
              {/* Lista de grupos de pastoreo */}
              <div className="w-full flex-1 overflow-y-auto">
                {/* Grupo 1 */}
                <div className="flex items-center gap-4 bg-green-50 rounded-lg p-3 mb-4 shadow">
                  <div className="flex-1">
                    <div className="font-bold text-green-800">ID Grupo: G-001</div>
                    <div className="text-sm text-gray-700">Especie: Bovino</div>
                  </div>
                  {/* CAMBIO: navegar al tipo "Bovino" */}
                  <button onClick={() => navigate('/visualizar-grupos-pastoreo/Bovino')} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition">Visualizar</button>
                </div>
                {/* Grupo 2 */}
                <div className="flex items-center gap-4 bg-green-50 rounded-lg p-3 mb-4 shadow">
                  <div className="flex-1">
                    <div className="font-bold text-green-800">ID Grupo: G-002</div>
                    <div className="text-sm text-gray-700">Especie: Ovino</div>
                  </div>
                  {/* CAMBIO: navegar al tipo "Ovino" */}
                  <button onClick={() => navigate('/visualizar-grupos-pastoreo/Ovino')} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition">Visualizar</button>
                </div>
                {/* Grupo 3 */}
                <div className="flex items-center gap-4 bg-green-50 rounded-lg p-3 mb-4 shadow">
                  <div className="flex-1">
                    <div className="font-bold text-green-800">ID Grupo: G-003</div>
                    <div className="text-sm text-gray-700">Especie: Caprino</div>
                  </div>
                  {/* CAMBIO: navegar al tipo "Caprino" */}
                  <button onClick={() => navigate('/visualizar-grupos-pastoreo/Caprino')} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition">Visualizar</button>
                </div>
              </div>
            </section>
            {/* Segundo rectángulo vacío para futuro uso */}
            <section className="bg-white rounded-xl shadow-lg border-2 border-green-400 w-[520px] h-[400px] flex flex-col items-center p-8">
              {/* Puedes agregar contenido aquí más adelante */}
            </section>
          </div>
        </main>

        {/* Separador */}
        <div className="size-15"></div>

        {/* Footer */}
        <footer className="bottom-0 left-0 w-full bg-gradient-to-r from-green-500 via-green-400 to-green-300 text-white text-center py-3 shadow-lg font-semibold tracking-wide">
          <p>&copy; 2025 FincaTec. All rights reserved.</p>
        </footer>
      </div>

      {/* ...resto de la interfaz demo... */}
    </>
  )
}

export default App
