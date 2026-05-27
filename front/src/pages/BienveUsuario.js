import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BienveUsuario.css";

const BienveUsuario = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const usuario = useMemo(() => {
    const fromState =
      location.state?.usuario || location.state?.cliente || null;
    if (fromState) return fromState;

    try {
      const u1 = JSON.parse(localStorage.getItem("usuario") || "null");
      if (u1) return u1;
    } catch {}

    try {
      const u2 = JSON.parse(localStorage.getItem("cliente") || "null");
      if (u2) return u2;
    } catch {}

    return null;
  }, [location.state]);

  return (
    <div className="bienve-container">

      <div className="bienve-card">

        {/* HEADER PREMIUM */}
        <div className="bienve-header">

          {usuario?.fotoPerfil && (
            <img
              className="bienve-avatar"
              src={usuario.fotoPerfil}
              alt="avatar"
            />
          )}

          <h1 className="bienve-titulo">
            {usuario?.nombre || "Usuario"}
          </h1>

          <p className="bienve-subtitle">
            {usuario?.tipoUsuario || "Cliente"}
          </p>
        </div>

        {/* ESPACIO PREMIUM */}
        <div className="bienve-spacer" />

        {/* CARDS */}
        <div className="bienve-cards-zone">

          <div className="bienve-grid">

            {usuario?.correo && (
              <div className="card"><strong>Correo</strong><span>{usuario.correo}</span></div>
            )}

            {usuario?.ciudad && (
              <div className="card"><strong>Ciudad</strong><span>{usuario.ciudad}</span></div>
            )}

            {usuario?.telefono && (
              <div className="card"><strong>Teléfono</strong><span>{usuario.telefono}</span></div>
            )}

            {usuario?.direccion && (
              <div className="card"><strong>Dirección</strong><span>{usuario.direccion}</span></div>
            )}

            {usuario?.ocupacion && (
              <div className="card"><strong>Ocupación</strong><span>{usuario.ocupacion}</span></div>
            )}

          </div>

        </div>

        {/* BIO */}
        {usuario?.bio && (
          <p className="bienve-texto">{usuario.bio}</p>
        )}

        {/* ACTIONS */}
        <div className="bienve-actions">
          <button className="btn-atras" onClick={() => navigate("/")}>
            Atrás
          </button>
        </div>

      </div>
    </div>
  );
};

export default BienveUsuario;