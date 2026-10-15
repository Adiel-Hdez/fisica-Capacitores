import { Camera, Car, Cpu, Gauge, Layers, MonitorSmartphone, Radio, Smartphone, Sparkles, Variable } from 'lucide-react'
import { PageHeader } from '../components/common/Controls'

const types = [
  { icon: Cpu, name: 'Cerámicos', tag: 'Compactos', text: 'Pequeños, económicos y no polarizados. Ideales para desacoplo de alta frecuencia y filtrado local.', color: 'cyan' },
  { icon: Gauge, name: 'Electrolíticos', tag: 'Alta capacidad', text: 'Polarizados y con gran capacitancia por volumen. Comunes en fuentes de alimentación.', color: 'orange' },
  { icon: Layers, name: 'De película', tag: 'Estables', text: 'Usan una película plástica como dieléctrico. Destacan por baja pérdida y buena precisión.', color: 'violet' },
  { icon: Variable, name: 'Variables', tag: 'Ajustables', text: 'Permiten modificar mecánica o electrónicamente la capacitancia para sintonización.', color: 'green' },
  { icon: Sparkles, name: 'Supercapacitores', tag: 'Mucha energía', text: 'Almacenan mucha más carga que los convencionales y soportan ciclos rápidos.', color: 'yellow' },
]
const applications = [
  { icon: Smartphone, title: 'Teléfonos inteligentes', text: 'Filtran ruido, estabilizan alimentación y apoyan convertidores de energía.' },
  { icon: Cpu, title: 'Computadoras', text: 'Desacoplan circuitos integrados para mantener tensiones estables ante cambios rápidos.' },
  { icon: Radio, title: 'Fuentes de alimentación', text: 'Suavizan el rizado después de la rectificación y entregan energía entre ciclos.' },
  { icon: Camera, title: 'Flash fotográfico', text: 'Acumulan energía lentamente y la liberan en un pulso luminoso de gran potencia.' },
  { icon: MonitorSmartphone, title: 'Pantallas táctiles', text: 'Detectan el cambio de capacitancia causado por la proximidad de un dedo.' },
  { icon: Car, title: 'Electrónica automotriz', text: 'Filtran perturbaciones, estabilizan módulos y respaldan actuadores durante transitorios.' },
]

export default function Applications() {
  return <div className="page applications-page"><PageHeader eyebrow="Módulo 07 · Tecnología" title="Tipos y aplicaciones" description="La misma física adopta distintas formas según el material, la construcción y el trabajo que debe realizar." />
    <section><div className="section-heading left"><span className="eyebrow">Familias principales</span><h2>Cinco diseños, distintas fortalezas</h2></div><div className="capacitor-types">{types.map(({ icon: Icon, name, tag, text, color }) => <article className={`type-card accent-${color}`} key={name}><div className="component-illustration"><Icon /><span /><span /></div><div className="type-title"><h3>{name}</h3><span>{tag}</span></div><p>{text}</p></article>)}</div></section>
    <section className="applications-section"><div className="section-heading left"><span className="eyebrow">En el mundo real</span><h2>¿Dónde trabajan los capacitores?</h2><p>En cada caso, la función surge de almacenar y liberar carga o de responder a cambios eléctricos.</p></div><div className="application-grid">{applications.map(({ icon: Icon, title, text }, index) => <article key={title}><span className="app-number">0{index + 1}</span><div className="application-icon"><Icon /></div><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="selection-guide panel"><div><span className="eyebrow">Criterio de ingeniería</span><h2>No existe un capacitor universal</h2></div><p>La selección real considera capacitancia, tensión nominal, tolerancia, temperatura, resistencia serie equivalente, frecuencia y polaridad. Esta aplicación explica los modelos fundamentales; no reemplaza una hoja de datos.</p></section>
  </div>
}
