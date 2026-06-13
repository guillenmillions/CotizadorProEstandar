import { useState, useEffect, useCallback } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── CONFIGURACIÓN SUPABASE ───────────────────────────────────────────────────
const SUPABASE_URL = "https://hanvrxmzgyimgsxobjey.supabase.co";
const SUPABASE_KEY = "sb_publishable_AMnOqs0pzAkqTR-gMDofAg_0BpOKVig";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── FÓRMULA DEL MOTOR (no modificar) ────────────────────────────────────────
function calcular(labor, material, extras, pctGD, pctSGV, pctMargen) {
  const costoDirecto = labor + material + extras;
  const gastosDirectos = costoDirecto * (pctGD / 100);
  const subtotalGD = costoDirecto + gastosDirectos;
  const gastosSGV = subtotalGD * (pctSGV / 100);
  const costoEmpresa = subtotalGD + gastosSGV;
  const precioVenta = costoEmpresa / (1 - pctMargen / 100);
  const utilidad = precioVenta - costoEmpresa;
  const margenReal = (utilidad / precioVenta) * 100;
  return { costoDirecto, gastosDirectos, subtotalGD, gastosSGV, costoEmpresa, precioVenta, utilidad, margenReal };
}

function fmt(n) {
  return "$" + Number(n || 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── DATOS INICIALES ──────────────────────────────────────────────────────────
const DATOS_INICIALES = {
  taller: { nombre: "", telefono: "", email: "", logo: "" },
  config: { pctGD: 35, pctSGV: 15, pctMargen: 25 },
  tema: "oscuro",
  fuente: "IBM Plex Sans",
  tamTexto: "normal",
  plantillaPDF: "formal",
  materiales: [
    { id: 1, nombre: "Acero 1018", precio: 45 },
    { id: 2, nombre: "Acero inoxidable 304", precio: 120 },
    { id: 3, nombre: "Aluminio 6061", precio: 85 },
  ],
  procesos: [
    { id: 1, nombre: "Torno CNC", tarifa: 350 },
    { id: 2, nombre: "Fresadora CNC", tarifa: 400 },
    { id: 3, nombre: "Rectificado", tarifa: 280 },
  ],
  cotizaciones: [],
};

// ─── TEMAS ────────────────────────────────────────────────────────────────────
const TEMAS = {
  oscuro: {
    bg: "#0f1117", card: "#1a1d27", border: "#2a2d3e",
    text: "#e8eaf0", textSub: "#8b8fa8", accent: "#4f6ef7",
    accentHover: "#3d5ce0", success: "#22c55e", danger: "#ef4444",
    input: "#12151f", header: "#13161f",
  },
  claro: {
    bg: "#f4f5f9", card: "#ffffff", border: "#e2e4ed",
    text: "#1a1d27", textSub: "#6b7080", accent: "#4f6ef7",
    accentHover: "#3d5ce0", success: "#16a34a", danger: "#dc2626",
    input: "#f8f9fc", header: "#ffffff",
  },
  marino: {
    bg: "#0a1628", card: "#0f2040", border: "#1a3a6b",
    text: "#cdd8f0", textSub: "#7a96c4", accent: "#38bdf8",
    accentHover: "#0ea5e9", success: "#34d399", danger: "#f87171",
    input: "#0d1c36", header: "#0d1c36",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PANTALLA DE LOGIN
// ═══════════════════════════════════════════════════════════════════════════════
function PantallaLogin({ onLogin }) {
  const [modo, setModo] = useState("login"); // login | registro | reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const t = TEMAS.oscuro;

  async function handleLogin(e) {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMensaje({ tipo: "error", texto: "Correo o contraseña incorrectos." });
    setCargando(false);
  }

  async function handleRegistro(e) {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMensaje({ tipo: "error", texto: error.message });
    else setMensaje({ tipo: "ok", texto: "¡Cuenta creada! Revisa tu correo para confirmar." });
    setCargando(false);
  }

  async function handleReset(e) {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setMensaje({ tipo: "error", texto: error.message });
    else setMensaje({ tipo: "ok", texto: "Te enviamos un enlace para restablecer tu contraseña." });
    setCargando(false);
  }

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 8,
    border: `1px solid ${t.border}`, background: t.input,
    color: t.text, fontSize: 15, outline: "none", boxSizing: "border-box",
  };
  const btnStyle = {
    width: "100%", padding: "13px", borderRadius: 8, border: "none",
    background: t.accent, color: "#fff", fontSize: 16, fontWeight: 700,
    cursor: cargando ? "not-allowed" : "pointer", opacity: cargando ? 0.7 : 1,
  };

  return (
    <div style={{
      minHeight: "100vh", background: t.bg, display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'IBM Plex Sans', sans-serif",
    }}>
      <div style={{
        width: 400, background: t.card, borderRadius: 16,
        border: `1px solid ${t.border}`, padding: 40,
      }}>
        {/* Logo / título */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 56, height: 56, borderRadius: 14, background: t.accent,
            marginBottom: 16, fontSize: 26,
          }}>⚙️</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: t.text }}>CotizadorPRO</div>
          <div style={{ fontSize: 13, color: t.textSub, marginTop: 4 }}>Estándar — Sistema de Cotización Industrial</div>
        </div>

        {/* Tabs */}
        {modo !== "reset" && (
          <div style={{ display: "flex", marginBottom: 28, background: t.input, borderRadius: 8, padding: 4 }}>
            {["login", "registro"].map(m => (
              <button key={m} onClick={() => { setModo(m); setMensaje(null); }} style={{
                flex: 1, padding: "9px 0", border: "none", borderRadius: 6, cursor: "pointer",
                background: modo === m ? t.accent : "transparent",
                color: modo === m ? "#fff" : t.textSub,
                fontWeight: 600, fontSize: 14, transition: "all 0.2s",
              }}>
                {m === "login" ? "Iniciar sesión" : "Registrarse"}
              </button>
            ))}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={modo === "login" ? handleLogin : modo === "registro" ? handleRegistro : handleReset}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {modo === "reset" && (
              <div style={{ color: t.textSub, fontSize: 14, marginBottom: 4 }}>
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </div>
            )}
            <input
              style={inputStyle} type="email" placeholder="Correo electrónico"
              value={email} onChange={e => setEmail(e.target.value)} required
            />
            {modo !== "reset" && (
              <input
                style={inputStyle} type="password" placeholder="Contraseña (mínimo 6 caracteres)"
                value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              />
            )}
            <button type="submit" style={btnStyle} disabled={cargando}>
              {cargando ? "Procesando..." : modo === "login" ? "Entrar" : modo === "registro" ? "Crear cuenta" : "Enviar enlace"}
            </button>
          </div>
        </form>

        {/* Mensaje */}
        {mensaje && (
          <div style={{
            marginTop: 16, padding: "10px 14px", borderRadius: 8, fontSize: 14,
            background: mensaje.tipo === "ok" ? "#14532d33" : "#7f1d1d33",
            color: mensaje.tipo === "ok" ? t.success : t.danger,
            border: `1px solid ${mensaje.tipo === "ok" ? t.success : t.danger}`,
          }}>
            {mensaje.texto}
          </div>
        )}

        {/* Links */}
        <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: t.textSub }}>
          {modo === "login" && (
            <span onClick={() => { setModo("reset"); setMensaje(null); }}
              style={{ cursor: "pointer", color: t.accent }}>¿Olvidaste tu contraseña?</span>
          )}
          {modo === "reset" && (
            <span onClick={() => { setModo("login"); setMensaje(null); }}
              style={{ cursor: "pointer", color: t.accent }}>← Volver al login</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function CotizadorProEstandar() {
  const [sesion, setSesion] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [datos, setDatos] = useState(DATOS_INICIALES);
  const [guardando, setGuardando] = useState(false);
  const [pestana, setPestana] = useState("cotizar");

  // ── Auth listener ───────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      setCargandoSesion(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Cargar datos del taller desde Supabase ──────────────────────────────────
  useEffect(() => {
    if (!sesion) return;
    async function cargarDatos() {
      const { data, error } = await supabase
        .from("cotizaciones")
        .select("datos")
        .eq("user_id", sesion.user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();
      if (data && !error) {
        setDatos({ ...DATOS_INICIALES, ...data.datos });
      }
    }
    cargarDatos();
  }, [sesion]);

  // ── Guardar datos en Supabase ───────────────────────────────────────────────
  const guardarDatos = useCallback(async (nuevosDatos) => {
    if (!sesion) return;
    setGuardando(true);
    const payload = { user_id: sesion.user.id, datos: nuevosDatos, updated_at: new Date().toISOString() };
    // Upsert basado en user_id
    const { error } = await supabase.from("cotizaciones").upsert(payload, { onConflict: "user_id" });
    if (error) console.error("Error guardando:", error);
    setGuardando(false);
  }, [sesion]);

  const actualizarDatos = useCallback((cambios) => {
    setDatos(prev => {
      const nuevo = { ...prev, ...cambios };
      guardarDatos(nuevo);
      return nuevo;
    });
  }, [guardarDatos]);

  async function cerrarSesion() {
    await supabase.auth.signOut();
  }

  // ── Estados de carga ────────────────────────────────────────────────────────
  if (cargandoSesion) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#4f6ef7", fontSize: 18, fontFamily: "IBM Plex Sans, sans-serif" }}>Cargando CotizadorPRO…</div>
      </div>
    );
  }

  if (!sesion) return <PantallaLogin />;

  const t = TEMAS[datos.tema] || TEMAS.oscuro;

  const estiloGlobal = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${t.bg}; color: ${t.text}; font-family: '${datos.fuente}', sans-serif; }
    ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${t.bg}; }
    ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 3px; }
    input, select, textarea { font-family: '${datos.fuente}', sans-serif; }
  `;

  const tamFuente = datos.tamTexto === "chico" ? 13 : datos.tamTexto === "grande" ? 16 : 14;

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontSize: tamFuente, fontFamily: `'${datos.fuente}', sans-serif` }}>
      <style>{estiloGlobal}</style>

      {/* ── HEADER ── */}
      <header style={{
        background: t.header, borderBottom: `1px solid ${t.border}`,
        padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {datos.taller.logo
            ? <img src={datos.taller.logo} alt="logo" style={{ height: 36, borderRadius: 6, objectFit: "contain" }} />
            : <div style={{ width: 36, height: 36, borderRadius: 8, background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚙️</div>
          }
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: t.text }}>{datos.taller.nombre || "CotizadorPRO"}</div>
            <div style={{ fontSize: 11, color: t.textSub }}>Estándar · {sesion.user.email}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {guardando && <span style={{ fontSize: 12, color: t.textSub }}>Guardando…</span>}
          <button onClick={cerrarSesion} style={{
            padding: "6px 14px", borderRadius: 7, border: `1px solid ${t.border}`,
            background: "transparent", color: t.textSub, cursor: "pointer", fontSize: 13,
          }}>Cerrar sesión</button>
        </div>
      </header>

      {/* ── NAV ── */}
      <nav style={{ background: t.card, borderBottom: `1px solid ${t.border}`, padding: "0 24px", display: "flex", gap: 4 }}>
        {[
          { id: "cotizar", label: "📋 Nueva Cotización" },
          { id: "lista", label: "📁 Mis Cotizaciones" },
          { id: "materiales", label: "🔩 Materiales" },
          { id: "procesos", label: "⚙️ Procesos" },
          { id: "config", label: "🎛️ Configuración" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setPestana(tab.id)} style={{
            padding: "14px 16px", border: "none", background: "transparent", cursor: "pointer",
            color: pestana === tab.id ? t.accent : t.textSub,
            borderBottom: `2px solid ${pestana === tab.id ? t.accent : "transparent"}`,
            fontWeight: pestana === tab.id ? 700 : 400, fontSize: tamFuente,
            fontFamily: `'${datos.fuente}', sans-serif`,
          }}>{tab.label}</button>
        ))}
      </nav>

      {/* ── CONTENIDO ── */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {pestana === "cotizar" && <PestanaCotizar datos={datos} actualizarDatos={actualizarDatos} t={t} tamFuente={tamFuente} />}
        {pestana === "lista" && <PestanaLista datos={datos} actualizarDatos={actualizarDatos} t={t} tamFuente={tamFuente} />}
        {pestana === "materiales" && <PestanaMateriales datos={datos} actualizarDatos={actualizarDatos} t={t} tamFuente={tamFuente} />}
        {pestana === "procesos" && <PestanaProcesos datos={datos} actualizarDatos={actualizarDatos} t={t} tamFuente={tamFuente} />}
        {pestana === "config" && <PestanaConfig datos={datos} actualizarDatos={actualizarDatos} t={t} tamFuente={tamFuente} />}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PESTAÑA: NUEVA COTIZACIÓN
// ═══════════════════════════════════════════════════════════════════════════════
function PestanaCotizar({ datos, actualizarDatos, t, tamFuente }) {
  const [cliente, setCliente] = useState("");
  const [folio, setFolio] = useState("COT-" + String(Date.now()).slice(-5));
  const [descripcion, setDescripcion] = useState("");
  const [lineas, setLineas] = useState([nuevaLinea()]);
  const [extras, setExtras] = useState(0);
  const [nota, setNota] = useState("");

  function nuevaLinea() {
    return { id: Date.now() + Math.random(), proceso: "", material: "", kg: 0, horas: 0 };
  }

  const { pctGD, pctSGV, pctMargen } = datos.config;

  // Calcular totales
  let totalLabor = 0, totalMaterial = 0;
  const lineasCalc = lineas.map(l => {
    const proc = datos.procesos.find(p => p.nombre === l.proceso);
    const mat = datos.materiales.find(m => m.nombre === l.material);
    const labor = (proc?.tarifa || 0) * (l.horas || 0);
    const material = (mat?.precio || 0) * (l.kg || 0);
    totalLabor += labor;
    totalMaterial += material;
    return { ...l, labor, material, subtotal: labor + material };
  });

  const res = calcular(totalLabor, totalMaterial, Number(extras) || 0, pctGD, pctSGV, pctMargen);

  function agregarLinea() { setLineas(p => [...p, nuevaLinea()]); }
  function eliminarLinea(id) { setLineas(p => p.filter(l => l.id !== id)); }
  function cambiarLinea(id, campo, valor) { setLineas(p => p.map(l => l.id === id ? { ...l, [campo]: valor } : l)); }

  function guardarCotizacion() {
    const nueva = {
      id: Date.now(),
      folio, cliente, descripcion, fecha: new Date().toLocaleDateString("es-MX"),
      lineas: lineasCalc, extras: Number(extras) || 0, nota,
      precioVenta: res.precioVenta, utilidad: res.utilidad, margenReal: res.margenReal,
      config: { pctGD, pctSGV, pctMargen },
    };
    const nuevasCots = [nueva, ...(datos.cotizaciones || [])];
    actualizarDatos({ cotizaciones: nuevasCots });
    setFolio("COT-" + String(Date.now()).slice(-5));
    setCliente(""); setDescripcion(""); setLineas([nuevaLinea()]); setExtras(0); setNota("");
    alert("✅ Cotización guardada correctamente.");
  }

  const card = { background: t.card, borderRadius: 12, border: `1px solid ${t.border}`, padding: 20, marginBottom: 20 };
  const inp = { background: t.input, border: `1px solid ${t.border}`, borderRadius: 8, padding: "9px 12px", color: t.text, fontSize: tamFuente, width: "100%", outline: "none" };
  const sel = { ...inp };
  const label = { fontSize: tamFuente - 1, color: t.textSub, marginBottom: 5, display: "block" };

  return (
    <div>
      {/* Info cliente */}
      <div style={card}>
        <div style={{ fontWeight: 700, marginBottom: 16, fontSize: tamFuente + 1 }}>📋 Datos de la Cotización</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div><label style={label}>Folio</label><input style={inp} value={folio} onChange={e => setFolio(e.target.value)} /></div>
          <div><label style={label}>Cliente</label><input style={inp} value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Nombre del cliente o empresa" /></div>
          <div style={{ gridColumn: "1/-1" }}><label style={label}>Descripción del trabajo</label><input style={inp} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ej: Fabricación de eje de transmisión AISI 1018" /></div>
        </div>
      </div>

      {/* Líneas */}
      <div style={card}>
        <div style={{ fontWeight: 700, marginBottom: 16, fontSize: tamFuente + 1 }}>🔩 Partidas del trabajo</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: tamFuente }}>
            <thead>
              <tr style={{ color: t.textSub }}>
                {["Proceso", "Material", "Horas", "Kg / Pzas", "Labor", "Material", "Subtotal", ""].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: h === "" ? "center" : "left", fontWeight: 600, borderBottom: `1px solid ${t.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineasCalc.map(l => (
                <tr key={l.id}>
                  <td style={{ padding: "8px 6px" }}>
                    <select style={{ ...sel, minWidth: 140 }} value={l.proceso} onChange={e => cambiarLinea(l.id, "proceso", e.target.value)}>
                      <option value="">Seleccionar…</option>
                      {datos.procesos.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "8px 6px" }}>
                    <select style={{ ...sel, minWidth: 160 }} value={l.material} onChange={e => cambiarLinea(l.id, "material", e.target.value)}>
                      <option value="">Seleccionar…</option>
                      {datos.materiales.map(m => <option key={m.id} value={m.nombre}>{m.nombre}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "8px 6px" }}><input type="number" style={{ ...inp, width: 70 }} value={l.horas} min={0} onChange={e => cambiarLinea(l.id, "horas", parseFloat(e.target.value) || 0)} /></td>
                  <td style={{ padding: "8px 6px" }}><input type="number" style={{ ...inp, width: 70 }} value={l.kg} min={0} onChange={e => cambiarLinea(l.id, "kg", parseFloat(e.target.value) || 0)} /></td>
                  <td style={{ padding: "8px 10px", color: t.textSub }}>{fmt(l.labor)}</td>
                  <td style={{ padding: "8px 10px", color: t.textSub }}>{fmt(l.material)}</td>
                  <td style={{ padding: "8px 10px", fontWeight: 700 }}>{fmt(l.subtotal)}</td>
                  <td style={{ padding: "8px 6px", textAlign: "center" }}>
                    <button onClick={() => eliminarLinea(l.id)} style={{ background: "none", border: "none", color: t.danger, cursor: "pointer", fontSize: 18 }}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center" }}>
          <button onClick={agregarLinea} style={{ padding: "8px 16px", borderRadius: 8, border: `1px dashed ${t.border}`, background: "transparent", color: t.accent, cursor: "pointer", fontSize: tamFuente }}>
            + Agregar partida
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            <label style={{ ...label, margin: 0 }}>Extras / Fletes:</label>
            <input type="number" style={{ ...inp, width: 120 }} value={extras} min={0} onChange={e => setExtras(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={card}>
          <div style={{ fontWeight: 700, marginBottom: 14, fontSize: tamFuente + 1 }}>📊 Desglose de costos</div>
          {[
            ["Labor total", res.costoDirecto - totalMaterial],
            ["Material total", totalMaterial],
            ["Extras / Fletes", Number(extras) || 0],
            ["Costo Directo", res.costoDirecto],
            [`Gastos Directos (${pctGD}%)`, res.gastosDirectos],
            [`Gastos SGV (${pctSGV}%)`, res.gastosSGV],
            ["Costo Empresa", res.costoEmpresa],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${t.border}`, fontSize: tamFuente }}>
              <span style={{ color: t.textSub }}>{k}</span>
              <span>{fmt(v)}</span>
            </div>
          ))}
        </div>

        <div style={card}>
          <div style={{ fontWeight: 700, marginBottom: 14, fontSize: tamFuente + 1 }}>💰 Resultado</div>
          <div style={{ background: t.input, borderRadius: 10, padding: 20, marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: t.textSub, marginBottom: 4 }}>PRECIO DE VENTA</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: t.accent }}>{fmt(res.precioVenta)}</div>
            <div style={{ fontSize: 12, color: t.textSub, marginTop: 4 }}>MXN</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${t.border}` }}>
            <span style={{ color: t.textSub }}>Utilidad</span><span style={{ color: t.success, fontWeight: 700 }}>{fmt(res.utilidad)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${t.border}` }}>
            <span style={{ color: t.textSub }}>Margen real</span><span style={{ color: t.success, fontWeight: 700 }}>{res.margenReal.toFixed(1)}%</span>
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={label}>Nota para el cliente (opcional)</label>
            <textarea style={{ ...inp, height: 70, resize: "vertical" }} value={nota} onChange={e => setNota(e.target.value)} placeholder="Ej: Tiempo de entrega 5 días hábiles" />
          </div>
          <button onClick={guardarCotizacion} style={{
            width: "100%", marginTop: 16, padding: "13px 0", borderRadius: 8,
            border: "none", background: t.accent, color: "#fff", fontWeight: 700,
            fontSize: tamFuente + 1, cursor: "pointer",
          }}>
            💾 Guardar Cotización
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PESTAÑA: MIS COTIZACIONES
// ═══════════════════════════════════════════════════════════════════════════════
function PestanaLista({ datos, actualizarDatos, t, tamFuente }) {
  const cots = datos.cotizaciones || [];

  function eliminar(id) {
    if (!confirm("¿Eliminar esta cotización?")) return;
    actualizarDatos({ cotizaciones: cots.filter(c => c.id !== id) });
  }

  if (cots.length === 0) return (
    <div style={{ textAlign: "center", padding: 60, color: t.textSub }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
      <div style={{ fontSize: 18, fontWeight: 600 }}>Sin cotizaciones aún</div>
      <div style={{ marginTop: 8, fontSize: 14 }}>Ve a "Nueva Cotización" para empezar</div>
    </div>
  );

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: tamFuente + 2, marginBottom: 20 }}>📁 Mis Cotizaciones ({cots.length})</div>
      {cots.map(c => (
        <div key={c.id} style={{ background: t.card, borderRadius: 12, border: `1px solid ${t.border}`, padding: 20, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: tamFuente + 1 }}>{c.folio} — {c.cliente || "Sin cliente"}</div>
              <div style={{ color: t.textSub, fontSize: tamFuente - 1, marginTop: 4 }}>{c.descripcion}</div>
              <div style={{ color: t.textSub, fontSize: tamFuente - 1, marginTop: 2 }}>📅 {c.fecha}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: t.accent }}>{fmt(c.precioVenta)}</div>
              <div style={{ fontSize: 12, color: t.success }}>Utilidad: {fmt(c.utilidad)} · {c.margenReal?.toFixed(1)}%</div>
              <button onClick={() => eliminar(c.id)} style={{
                marginTop: 10, padding: "5px 12px", borderRadius: 6,
                border: `1px solid ${t.danger}`, background: "transparent",
                color: t.danger, cursor: "pointer", fontSize: 12,
              }}>Eliminar</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PESTAÑA: MATERIALES
// ═══════════════════════════════════════════════════════════════════════════════
function PestanaMateriales({ datos, actualizarDatos, t, tamFuente }) {
  const [nuevo, setNuevo] = useState({ nombre: "", precio: "" });
  const inp = { background: t.input, border: `1px solid ${t.border}`, borderRadius: 8, padding: "9px 12px", color: t.text, fontSize: tamFuente, width: "100%", outline: "none" };

  function agregar() {
    if (!nuevo.nombre || !nuevo.precio) return;
    const lista = [...datos.materiales, { id: Date.now(), nombre: nuevo.nombre, precio: parseFloat(nuevo.precio) }];
    actualizarDatos({ materiales: lista });
    setNuevo({ nombre: "", precio: "" });
  }

  function eliminar(id) {
    actualizarDatos({ materiales: datos.materiales.filter(m => m.id !== id) });
  }

  return (
    <div style={{ background: t.card, borderRadius: 12, border: `1px solid ${t.border}`, padding: 24 }}>
      <div style={{ fontWeight: 700, fontSize: tamFuente + 2, marginBottom: 20 }}>🔩 Catálogo de Materiales</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, marginBottom: 24 }}>
        <input style={inp} placeholder="Nombre del material" value={nuevo.nombre} onChange={e => setNuevo(p => ({ ...p, nombre: e.target.value }))} />
        <input style={inp} type="number" placeholder="Precio por kg (MXN)" value={nuevo.precio} onChange={e => setNuevo(p => ({ ...p, precio: e.target.value }))} />
        <button onClick={agregar} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: t.accent, color: "#fff", fontWeight: 700, cursor: "pointer" }}>+ Agregar</button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: tamFuente }}>
        <thead><tr style={{ color: t.textSub }}>
          {["Material", "Precio/kg", ""].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", borderBottom: `1px solid ${t.border}`, fontWeight: 600 }}>{h}</th>)}
        </tr></thead>
        <tbody>{datos.materiales.map(m => (
          <tr key={m.id}>
            <td style={{ padding: "10px 12px" }}>{m.nombre}</td>
            <td style={{ padding: "10px 12px" }}>{fmt(m.precio)}</td>
            <td style={{ padding: "10px 12px" }}><button onClick={() => eliminar(m.id)} style={{ background: "none", border: "none", color: t.danger, cursor: "pointer" }}>Eliminar</button></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PESTAÑA: PROCESOS
// ═══════════════════════════════════════════════════════════════════════════════
function PestanaProcesos({ datos, actualizarDatos, t, tamFuente }) {
  const [nuevo, setNuevo] = useState({ nombre: "", tarifa: "" });
  const inp = { background: t.input, border: `1px solid ${t.border}`, borderRadius: 8, padding: "9px 12px", color: t.text, fontSize: tamFuente, width: "100%", outline: "none" };

  function agregar() {
    if (!nuevo.nombre || !nuevo.tarifa) return;
    const lista = [...datos.procesos, { id: Date.now(), nombre: nuevo.nombre, tarifa: parseFloat(nuevo.tarifa) }];
    actualizarDatos({ procesos: lista });
    setNuevo({ nombre: "", tarifa: "" });
  }

  function eliminar(id) {
    actualizarDatos({ procesos: datos.procesos.filter(p => p.id !== id) });
  }

  return (
    <div style={{ background: t.card, borderRadius: 12, border: `1px solid ${t.border}`, padding: 24 }}>
      <div style={{ fontWeight: 700, fontSize: tamFuente + 2, marginBottom: 20 }}>⚙️ Catálogo de Procesos</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, marginBottom: 24 }}>
        <input style={inp} placeholder="Nombre del proceso" value={nuevo.nombre} onChange={e => setNuevo(p => ({ ...p, nombre: e.target.value }))} />
        <input style={inp} type="number" placeholder="Tarifa por hora (MXN)" value={nuevo.tarifa} onChange={e => setNuevo(p => ({ ...p, tarifa: e.target.value }))} />
        <button onClick={agregar} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: t.accent, color: "#fff", fontWeight: 700, cursor: "pointer" }}>+ Agregar</button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: tamFuente }}>
        <thead><tr style={{ color: t.textSub }}>
          {["Proceso / Máquina", "Tarifa/hr", ""].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", borderBottom: `1px solid ${t.border}`, fontWeight: 600 }}>{h}</th>)}
        </tr></thead>
        <tbody>{datos.procesos.map(p => (
          <tr key={p.id}>
            <td style={{ padding: "10px 12px" }}>{p.nombre}</td>
            <td style={{ padding: "10px 12px" }}>{fmt(p.tarifa)}/hr</td>
            <td style={{ padding: "10px 12px" }}><button onClick={() => eliminar(p.id)} style={{ background: "none", border: "none", color: t.danger, cursor: "pointer" }}>Eliminar</button></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PESTAÑA: CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════════
function PestanaConfig({ datos, actualizarDatos, t, tamFuente }) {
  const inp = { background: t.input, border: `1px solid ${t.border}`, borderRadius: 8, padding: "9px 12px", color: t.text, fontSize: tamFuente, width: "100%", outline: "none" };
  const label = { fontSize: tamFuente - 1, color: t.textSub, marginBottom: 6, display: "block" };
  const card = { background: t.card, borderRadius: 12, border: `1px solid ${t.border}`, padding: 24, marginBottom: 20 };

  function subirLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => actualizarDatos({ taller: { ...datos.taller, logo: ev.target.result } });
    reader.readAsDataURL(file);
  }

  return (
    <div>
      {/* Datos del taller */}
      <div style={card}>
        <div style={{ fontWeight: 700, fontSize: tamFuente + 2, marginBottom: 20 }}>🏭 Datos del Taller</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div><label style={label}>Nombre del taller</label><input style={inp} value={datos.taller.nombre} onChange={e => actualizarDatos({ taller: { ...datos.taller, nombre: e.target.value } })} /></div>
          <div><label style={label}>Teléfono</label><input style={inp} value={datos.taller.telefono} onChange={e => actualizarDatos({ taller: { ...datos.taller, telefono: e.target.value } })} /></div>
          <div><label style={label}>Email</label><input style={inp} value={datos.taller.email} onChange={e => actualizarDatos({ taller: { ...datos.taller, email: e.target.value } })} /></div>
          <div>
            <label style={label}>Logo del taller</label>
            <input type="file" accept="image/*" onChange={subirLogo} style={{ ...inp, padding: "6px 12px" }} />
            {datos.taller.logo && <img src={datos.taller.logo} alt="logo" style={{ marginTop: 10, height: 50, borderRadius: 6 }} />}
          </div>
        </div>
      </div>

      {/* Porcentajes */}
      <div style={card}>
        <div style={{ fontWeight: 700, fontSize: tamFuente + 2, marginBottom: 20 }}>📊 Porcentajes de la Fórmula</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            { key: "pctGD", label: "Gastos Directos %", default: 35 },
            { key: "pctSGV", label: "Gastos SGV %", default: 15 },
            { key: "pctMargen", label: "Margen de Utilidad %", default: 25 },
          ].map(({ key, label: lbl }) => (
            <div key={key}>
              <label style={label}>{lbl}</label>
              <input type="number" style={inp} min={0} max={100}
                value={datos.config[key]}
                onChange={e => actualizarDatos({ config: { ...datos.config, [key]: parseFloat(e.target.value) || 0 } })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Visual */}
      <div style={card}>
        <div style={{ fontWeight: 700, fontSize: tamFuente + 2, marginBottom: 20 }}>🎨 Apariencia</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          <div>
            <label style={label}>Tema de color</label>
            <select style={inp} value={datos.tema} onChange={e => actualizarDatos({ tema: e.target.value })}>
              <option value="oscuro">🌑 Oscuro Industrial</option>
              <option value="claro">☀️ Claro Profesional</option>
              <option value="marino">🌊 Azul Marino</option>
            </select>
          </div>
          <div>
            <label style={label}>Fuente</label>
            <select style={inp} value={datos.fuente} onChange={e => actualizarDatos({ fuente: e.target.value })}>
              <option>IBM Plex Sans</option>
              <option>Inter</option>
              <option>Roboto</option>
            </select>
          </div>
          <div>
            <label style={label}>Tamaño de texto</label>
            <select style={inp} value={datos.tamTexto} onChange={e => actualizarDatos({ tamTexto: e.target.value })}>
              <option value="chico">Chico</option>
              <option value="normal">Normal</option>
              <option value="grande">Grande</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}