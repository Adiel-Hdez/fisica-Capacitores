import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Atom, BookOpen, Box, Calculator, ChartNoAxesCombined, ChevronLeft, CircuitBoard, FlaskConical, GraduationCap, Home, Menu, Presentation, Timer, X, Zap } from 'lucide-react'

const nav = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/fundamentos', label: 'Fundamentos', icon: BookOpen },
  { to: '/simulador-3d', label: 'Simulador 3D', icon: Box },
  { to: '/carga-descarga', label: 'Carga y descarga', icon: Zap },
  { to: '/circuitos-rc', label: 'Circuitos RC', icon: Timer },
  { to: '/graficas', label: 'Gráficas y análisis', icon: ChartNoAxesCombined },
  { to: '/calculadora', label: 'Calculadora', icon: Calculator },
  { to: '/aplicaciones', label: 'Tipos y aplicaciones', icon: CircuitBoard },
  { to: '/experimentos', label: 'Experimentos', icon: FlaskConical },
  { to: '/evaluacion', label: 'Evaluación', icon: GraduationCap },
]

export default function AppShell() {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  return <div className={`app-shell ${collapsed ? 'nav-collapsed' : ''}`}>
    <button className="mobile-menu" onClick={() => setOpen(true)} aria-label="Abrir menú"><Menu /></button>
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand-row">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}><span className="brand-mark"><Atom /></span><span><strong>CapaciLab</strong><small>Laboratorio virtual</small></span></NavLink>
        <button className="close-mobile" onClick={() => setOpen(false)} aria-label="Cerrar menú"><X /></button>
      </div>
      <nav aria-label="Navegación principal">{nav.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} title={label}><Icon /><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-bottom">
        <NavLink to="/exposicion" className="presentation-link" onClick={() => setOpen(false)}><Presentation /><span>Modo exposición</span></NavLink>
        <div className="science-badge"><span className="status-dot" /><span>Modelo físico activo<small>ε₀ = 8.854 × 10⁻¹² F/m</small></span></div>
        <button className="collapse-button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}><ChevronLeft /><span>Contraer panel</span></button>
      </div>
    </aside>
    {open && <button className="sidebar-backdrop" onClick={() => setOpen(false)} aria-label="Cerrar menú" />}
    <main className="content"><Outlet /></main>
  </div>
}
