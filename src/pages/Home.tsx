import { ArrowRight, Atom, Box, ChartNoAxesCombined, CircuitBoard, FlaskConical, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import CapacitorScene from '../components/simulator3d/CapacitorScene'

const modules = [
  { icon: Box, title: 'Simulador 3D', text: 'Modifica placas, dieléctrico y voltaje en tiempo real.', to: '/simulador-3d', accent: 'cyan' },
  { icon: CircuitBoard, title: 'Circuitos RC', text: 'Observa carga, descarga y constante de tiempo.', to: '/carga-descarga', accent: 'orange' },
  { icon: ChartNoAxesCombined, title: 'Análisis científico', text: 'Explora siete relaciones físicas calculadas.', to: '/graficas', accent: 'violet' },
  { icon: FlaskConical, title: 'Experimentos', text: 'Completa prácticas guiadas y registra resultados.', to: '/experimentos', accent: 'green' },
]

export default function Home() {
  return <div className="home-page">
    <section className="hero-section">
      <motion.div className="hero-copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
        <span className="hero-kicker"><Sparkles size={15} /> Laboratorio universitario interactivo</span>
        <h1>La física de los<br/><em>capacitores</em>, visible.</h1>
        <p>Experimenta con campos eléctricos, almacenamiento de energía y circuitos RC mediante modelos físicos reales y visualizaciones en tiempo real.</p>
        <div className="hero-actions"><Link to="/simulador-3d" className="button primary">Comenzar simulación <ArrowRight /></Link><Link to="/fundamentos" className="button secondary">Explorar fundamentos</Link></div>
        <div className="hero-facts"><span><strong>10</strong> módulos</span><span><strong>3D</strong> interactivo</span><span><strong>100%</strong> ecuaciones reales</span></div>
      </motion.div>
      <motion.div className="hero-visual" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .15, duration: .7 }}>
        <div className="visual-badge top"><span className="status-dot" /> Campo uniforme ideal</div>
        <CapacitorScene distanceMm={6} areaCm2={100} fieldStrength={2000} compact showLabels={false} />
        <div className="floating-equation"><span>Capacitancia</span><strong>C = ε₀εᵣA/d</strong></div>
      </motion.div>
    </section>
    <section className="module-overview">
      <div className="section-heading"><span className="eyebrow">Ruta de aprendizaje</span><h2>Comprende, experimenta y comprueba</h2><p>Una experiencia construida desde los principios hasta la práctica.</p></div>
      <div className="module-grid">{modules.map(({ icon: Icon, title, text, to, accent }, index) => <motion.div key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .07 }}><Link to={to} className={`module-card accent-${accent}`}><span className="module-number">0{index + 1}</span><Icon /><h3>{title}</h3><p>{text}</p><span className="card-link">Abrir módulo <ArrowRight /></span></Link></motion.div>)}</div>
    </section>
    <section className="learning-goal"><div className="goal-icon"><Atom /></div><div><span className="eyebrow">Objetivo educativo</span><h2>Convertir ecuaciones en intuición física</h2><p>Cada control modifica una variable real del modelo. Observa cómo las relaciones matemáticas se transforman en comportamiento visual, sin mediciones inventadas ni atajos.</p></div><Link to="/evaluacion" className="button secondary">Evaluar conocimientos <ArrowRight /></Link></section>
  </div>
}
