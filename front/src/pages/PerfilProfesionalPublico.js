import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PerfilProfesionalPublico.css";

const TARIFA_FIJA = 80000;
const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
});

function PerfilProfesionalPublico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profesional, setProfesional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarModalReserva, setMostrarModalReserva] = useState(false);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);

  useEffect(() => {
    cargarPerfil();
  }, [id]);

  const cargarPerfil = async () => {
    try {
      const response = await fetch(`https://backend-a9gw.onrender.com/api/profesionales/publico/${id}`);
      const data = await response.json();
      
      if (data.profesional) {
        console.log("Profesional cargado:", data.profesional);
        console.log("Disponibilidad:", data.profesional.disponibilidad);
        console.log("Foto de perfil:", data.profesional.fotoPerfil);
        setProfesional(data.profesional);
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalReserva = (horario) => {
    setHorarioSeleccionado(horario);
    setMostrarModalReserva(true);
  };

  const cerrarModalReserva = () => {
    setMostrarModalReserva(false);
    setHorarioSeleccionado(null);
  };

  const confirmarReserva = () => {
    setMostrarModalReserva(false);
    setMostrarModalPago(true);
  };

  const cerrarModalPago = () => {
    setMostrarModalPago(false);
    setHorarioSeleccionado(null);
  };

  const procesarPago = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const metodoPago = formData.get('metodoPago');

    // Obtener ID del cliente desde localStorage
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) {
      alert('Debes iniciar sesión para reservar');
      navigate('/login');
      return;
    }

    const usuario = JSON.parse(usuarioGuardado);
    const idCliente = usuario.idUsuario;

    try {
      const response = await fetch('https://backend-a9gw.onrender.com/api/reservas/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idCliente,
          idProfesional: profesional.idProfesional,
          idDisponibilidad: horarioSeleccionado.idDisponibilidad,
          metodoPago,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`¡Reserva exitosa! Tu sesión está programada para el ${formatearFecha(data.fecha)} de ${formatearHora(data.horaInicio)} a ${formatearHora(data.horaFin)} por ${formatoCOP.format(TARIFA_FIJA)}`);
        cerrarModalPago();
        cargarPerfil(); // Recargar disponibilidad
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      alert('Error al procesar la reserva. Por favor intenta nuevamente.');
    }
  };

  const formatearFecha = (fecha) => {
    try {
      // Si la fecha viene en formato YYYY-MM-DD de la BD
      if (!fecha) return "Fecha no disponible";
      
      // Extraer año, mes y día
      const partes = fecha.split('T')[0].split('-'); // Por si viene con hora
      const [year, month, day] = partes;
      
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      if (isNaN(date.getTime())) {
        console.error("Fecha inválida:", fecha);
        return "Fecha inválida";
      }
      
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formateando fecha:", fecha, error);
      return "Fecha inválida";
    }
  };

  const formatearHora = (hora) => {
    return hora.substring(0, 5); // HH:MM
  };

  const agruparPorFecha = (disponibilidad) => {
    const agrupado = {};
    disponibilidad.forEach((horario) => {
      if (!agrupado[horario.fecha]) {
        agrupado[horario.fecha] = [];
      }
      agrupado[horario.fecha].push(horario);
    });
    return agrupado;
  };

  if (loading) {
    return (
      <main className="perfil-publico-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </main>
    );
  }

  if (!profesional) {
    return (
      <main className="perfil-publico-page">
        <div className="error-container">
          <h2>Profesional no encontrado</h2>
          <button onClick={() => navigate(-1)} className="btn-volver">
            Volver
          </button>
        </div>
      </main>
    );
  }

  const disponibilidadAgrupada = agruparPorFecha(profesional.disponibilidad || []);

  return (
    <main className="perfil-publico-page">
      <button onClick={() => navigate(-1)} className="btn-back-floating">
        ← Volver
      </button>
      
      <div className="perfil-container">
        {/* Sección de información del profesional */}
        <section className="info-section">
          <article className="info-card">
            <div className="perfil-header-info">
              <div className="avatar-container">
                <img
                  src={
                    profesional.fotoPerfil
                      ? profesional.fotoPerfil.startsWith('http') || profesional.fotoPerfil.startsWith('/static')
                        ? profesional.fotoPerfil
                        : `https://backend-a9gw.onrender.com${profesional.fotoPerfil}`
                      : "https://via.placeholder.com/200"
                  }
                  alt={profesional.nombreCompleto}
                  className="perfil-avatar"
                />
              </div>
              <div className="perfil-datos">
                <h2>{profesional.nombreCompleto}</h2>
                <p className="profesion">{profesional.profesion}</p>
                <p className="experiencia">
                  {profesional.experiencia} años de experiencia
                </p>
                <p className="ciudad">📍 {profesional.ciudad}</p>
              </div>
            </div>

            <div className="bio-section">
              <h3>Sobre mí</h3>
              <p>{profesional.bio}</p>
            </div>

            {profesional.habilidadesBlandas && profesional.habilidadesBlandas.length > 0 && (
              <div className="habilidades-section">
                <h3>Habilidades</h3>
                <div className="tags-container">
                  {profesional.habilidadesBlandas.map((habilidad, index) => (
                    <span key={index} className="tag">
                      {habilidad}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profesional.idiomas && profesional.idiomas.length > 0 && (
              <div className="idiomas-section">
                <h3>Idiomas</h3>
                <div className="tags-container">
                  {profesional.idiomas.map((idioma, index) => (
                    <span key={index} className="tag idioma-tag">
                      🌐 {idioma}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="contacto-section">
              <h3>Información de contacto</h3>
              <p>📧 {profesional.correo}</p>
              <p>📞 {profesional.telefono}</p>
            </div>
          </article>
        </section>

        {/* Sección de disponibilidad */}
        <section className="disponibilidad-section">
          <h2 className="section-title">Disponibilidad</h2>
          {Object.keys(disponibilidadAgrupada).length > 0 ? (
            <div className="calendario-container">
              {Object.entries(disponibilidadAgrupada).map(([fecha, horarios]) => (
                <article key={fecha} className="fecha-card">
                  <h3 className="fecha-titulo">{formatearFecha(fecha)}</h3>
                  <div className="horarios-grid">
                    {horarios.map((horario) => (
                      <button
                        key={horario.idDisponibilidad}
                        className="horario-btn"
                        onClick={() => abrirModalReserva(horario)}
                      >
                        <div className="horario-rango">
                          <span className="hora-inicio">
                            {formatearHora(horario.horaInicio)}
                          </span>
                          <span className="separador">-</span>
                          <span className="hora-fin">
                            {formatearHora(horario.horaFin)}
                          </span>
                        </div>
                        <span className="tarifa-fija">{formatoCOP.format(TARIFA_FIJA)}</span>
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="sin-disponibilidad">
              <p>⏰ Este profesional no tiene horarios disponibles en este momento.</p>
              <p>Por favor, intenta más tarde o contacta directamente.</p>
            </div>
          )}
        </section>
      </div>

      {/* Modal de reserva */}
      {mostrarModalReserva && horarioSeleccionado && (
        <div className="reserva-modal-overlay" onClick={cerrarModalReserva}>
          <div className="reserva-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Confirmar Reserva</h2>
            <div className="reserva-modal-info">
              <p>¿Está seguro que desea reservar la sesión con <strong>{profesional.nombreCompleto}</strong>?</p>
              <p>
                <strong>Fecha:</strong> {formatearFecha(horarioSeleccionado.fecha)}
              </p>
              <p>
                <strong>Horario:</strong> {formatearHora(horarioSeleccionado.horaInicio)} -{" "}
                {formatearHora(horarioSeleccionado.horaFin)}
              </p>
              <p>
                <strong>Tarifa:</strong> {formatoCOP.format(TARIFA_FIJA)}
              </p>
            </div>
            <div className="reserva-modal-actions">
              <button className="btn-cancelar" onClick={cerrarModalReserva}>
                Cancelar
              </button>
              <button className="btn-confirmar" onClick={confirmarReserva}>Confirmar Reserva</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de pago */}
      {mostrarModalPago && horarioSeleccionado && (
        <div className="reserva-modal-overlay" onClick={cerrarModalPago}>
          <div className="reserva-modal-content pago-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Información de Pago</h2>
            <div className="reserva-modal-info">
              <p>
                <strong>Profesional:</strong> {profesional.nombreCompleto}
              </p>
              <p>
                <strong>Fecha:</strong> {formatearFecha(horarioSeleccionado.fecha)}
              </p>
              <p>
                <strong>Horario:</strong> {formatearHora(horarioSeleccionado.horaInicio)} -{" "}
                {formatearHora(horarioSeleccionado.horaFin)}
              </p>
              <p>
                <strong>Total a pagar:</strong> {formatoCOP.format(TARIFA_FIJA)}
              </p>
            </div>

            <form className="pago-form" onSubmit={procesarPago}>
              <div className="form-group">
                <label htmlFor="metodoPago">Método de pago</label>
                <select id="metodoPago" name="metodoPago" required>
                  <option value="">Seleccione un método</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="PSE">PSE</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="fechaPago">Fecha de pago</label>
                <input
                  type="date"
                  id="fechaPago"
                  name="fechaPago"
                  value={new Date().toISOString().split('T')[0]}
                  readOnly
                />
              </div>

              <div className="reserva-modal-actions">
                <button type="button" className="btn-cancelar" onClick={cerrarModalPago}>
                  Cancelar
                </button>
                <button type="submit" className="btn-confirmar">
                  Procesar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default PerfilProfesionalPublico;
