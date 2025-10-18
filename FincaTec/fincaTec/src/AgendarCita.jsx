// src/AgendarCita.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

function AgendarCita() {
  const navigate = useNavigate();
  const { addCita, getCompanyLivestock, getCompanyGroups, isCompanyOwner } = useUser();

  const [formData, setFormData] = useState({
    tipo: 'individual', // 'individual' o 'grupo'
    objetivoId: '',
    servicio: 'chequeo', // 'chequeo', 'vacunacion', 'desparasitacion'
    fechaCita: '',
    horaCita: '09:00',
    observaciones: ''
  });

  const [animales, setAnimales] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar permisos de propietario
    if (!isCompanyOwner()) {
      alert('Solo el propietario de la empresa puede agendar citas veterinarias');
      navigate('/');
      return;
    }

    // Cargar animales y grupos
    const livestock = getCompanyLivestock();
    const groups = getCompanyGroups();
    setAnimales(livestock);
    setGrupos(groups);

    // Establecer fecha mínima como hoy
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, fechaCita: today }));
  }, [getCompanyLivestock, getCompanyGroups, isCompanyOwner, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Resetear objetivo si cambia el tipo
      ...(name === 'tipo' ? { objetivoId: '' } : {})
    }));
  };

  const getObjetivoNombre = () => {
    if (!formData.objetivoId) return '';
    
    if (formData.tipo === 'individual') {
      const animal = animales.find(a => a.identificacion === formData.objetivoId || a.id === formData.objetivoId);
      return animal ? `${animal.nombre} (${animal.identificacion || animal.id})` : '';
    } else {
      const grupo = grupos.find(g => g.id === formData.objetivoId);
      return grupo ? `Grupo: ${grupo.nombre || grupo.id} (${grupo.miembros?.length || 0} animales)` : '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validaciones
      if (!formData.objetivoId) {
        alert('Debes seleccionar un animal o grupo');
        return;
      }

      if (!formData.fechaCita) {
        alert('Debes seleccionar una fecha para la cita');
        return;
      }

      // Validar que la fecha no sea en el pasado
      const fechaSeleccionada = new Date(formData.fechaCita);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaSeleccionada < hoy) {
        alert('No puedes agendar citas en fechas pasadas');
        return;
      }

      const citaData = {
        ...formData,
        objetivoNombre: getObjetivoNombre()
      };

      const result = addCita(citaData);

      if (result.success) {
        alert('Cita agendada exitosamente');
        // Pequeño delay para asegurar que el estado se guarde correctamente
        setTimeout(() => {
          navigate('/');
        }, 100);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error al agendar cita:', error);
      alert('Error inesperado al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  const serviciosOptions = [
    { value: 'chequeo', label: 'Chequeo médico' },
    { value: 'vacunacion', label: 'Vacunación' },
    { value: 'desparasitacion', label: 'Desparasitación' }
  ];

  // Generar opciones de horario
  const horariosDisponibles = [];
  for (let hora = 8; hora <= 17; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 30) {
      const horaStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
      horariosDisponibles.push(horaStr);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-3 bg-gradient-to-r from-green-500 via-green-400 to-green-300 shadow-md">
        <img src="/images/Menu_finqueros/icono_FincaTec.png" alt="Logo FincaTec" width="100" height="50" className="bg-white rounded-3xl p-1 shadow-md"/>
        
        <h1 className="text-2xl font-bold text-white">Agendar Cita Veterinaria</h1>
        
        <button
          onClick={() => navigate('/')}
          className="bg-white hover:bg-gray-100 rounded-xl flex flex-col items-center shadow px-4 py-2 transition"
        >
          <span className="font-bold text-green-700">← Volver</span>
        </button>
      </header>

      {/* Formulario */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border-2 border-green-400 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Tipo de revisión */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de revisión *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="tipo"
                    value="individual"
                    checked={formData.tipo === 'individual'}
                    onChange={handleInputChange}
                    className="text-green-600"
                  />
                  <span className="font-medium">Individual</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="tipo"
                    value="grupo"
                    checked={formData.tipo === 'grupo'}
                    onChange={handleInputChange}
                    className="text-green-600"
                  />
                  <span className="font-medium">Por grupo</span>
                </label>
              </div>
            </div>

            {/* Selección de animal o grupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.tipo === 'individual' ? 'Seleccionar animal *' : 'Seleccionar grupo *'}
              </label>
              <select
                name="objetivoId"
                value={formData.objetivoId}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                required
              >
                <option value="">
                  {formData.tipo === 'individual' ? '-- Seleccionar animal --' : '-- Seleccionar grupo --'}
                </option>
                {formData.tipo === 'individual' ? (
                  animales.map((animal) => (
                    <option key={animal.identificacion || animal.id} value={animal.identificacion || animal.id}>
                      {animal.nombre} - {animal.identificacion || animal.id} ({animal.especie}, {animal.raza})
                    </option>
                  ))
                ) : (
                  grupos.map((grupo) => (
                    <option key={grupo.id} value={grupo.id}>
                      {grupo.nombre || grupo.id} - {grupo.especie} ({grupo.miembros?.length || 0} animales)
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Servicio requerido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Servicio requerido *
              </label>
              <select
                name="servicio"
                value={formData.servicio}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                required
              >
                {serviciosOptions.map((servicio) => (
                  <option key={servicio.value} value={servicio.value}>
                    {servicio.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha y hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de la cita *
                </label>
                <input
                  type="date"
                  name="fechaCita"
                  value={formData.fechaCita}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora preferida
                </label>
                <select
                  name="horaCita"
                  value={formData.horaCita}
                  onChange={handleInputChange}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                >
                  {horariosDisponibles.map((hora) => (
                    <option key={hora} value={hora}>
                      {hora}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none resize-none"
                placeholder="Describe cualquier síntoma, comportamiento anormal o información relevante..."
              />
            </div>

            {/* Resumen */}
            {formData.objetivoId && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Resumen de la cita:</h3>
                <p><strong>Paciente:</strong> {getObjetivoNombre()}</p>
                <p><strong>Servicio:</strong> {serviciosOptions.find(s => s.value === formData.servicio)?.label}</p>
                <p><strong>Fecha:</strong> {formData.fechaCita} a las {formData.horaCita}</p>
                <p><strong>Estado:</strong> <span className="text-yellow-600 font-medium">Pendiente de confirmación</span></p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg shadow transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg shadow transition"
              >
                {loading ? 'Agendando...' : 'Agendar Cita'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AgendarCita;