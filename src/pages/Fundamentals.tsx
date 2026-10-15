import { BatteryCharging, CircleDot, Equal, Gauge, Layers3, MoveHorizontal, Sigma, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FormulaBlock, PageHeader } from '../components/common/Controls'

const concepts = [
  { name: 'Carga eléctrica', symbol: 'Q', unit: 'C', text: 'Propiedad eléctrica acumulada en las placas.', Icon: CircleDot },
  { name: 'Voltaje', symbol: 'V', unit: 'V', text: 'Diferencia de potencial entre las placas.', Icon: Zap },
  { name: 'Corriente', symbol: 'I', unit: 'A', text: 'Flujo de carga por unidad de tiempo.', Icon: BatteryCharging },
  { name: 'Resistencia', symbol: 'R', unit: 'Ω', text: 'Oposición al movimiento de carga.', Icon: MoveHorizontal },
  { name: 'Capacitancia', symbol: 'C', unit: 'F', text: 'Capacidad de almacenar carga por voltio.', Icon: Layers3 },
  { name: 'Campo eléctrico', symbol: 'E', unit: 'V/m', text: 'Fuerza eléctrica por unidad de carga.', Icon: Gauge },
]

export default function Fundamentals() {
  return <div className="page fundamentals-page">
    <PageHeader eyebrow="Módulo 01 · Fundamentos" title="¿Qué hace especial a un capacitor?" description="Un recorrido visual por los conceptos y ecuaciones que gobiernan el almacenamiento electrostático." />
    <section className="fundamentals-intro panel">
      <div><span className="eyebrow">Definición</span><h2>Un depósito temporal de energía eléctrica</h2><p>Un capacitor es un componente formado por dos conductores separados por un material aislante. Al aplicar una diferencia de potencial, aparecen cargas iguales y opuestas en sus placas y se almacena energía en el campo eléctrico.</p><p>A diferencia de una batería, no convierte energía química ni mantiene por sí mismo un voltaje fijo: responde casi instantáneamente, puede completar muchísimos ciclos y entrega energía durante intervalos cortos.</p></div>
      <div className="capacitor-diagram" aria-label="Diagrama de componentes de un capacitor"><div className="diagram-plate positive"><span>+</span><label>Placa positiva</label></div><div className="diagram-field"><i /><i /><i /><strong>Dieléctrico</strong><small>Campo E →</small></div><div className="diagram-plate negative"><span>−</span><label>Placa negativa</label></div></div>
    </section>
    <section><div className="section-heading left"><span className="eyebrow">Magnitudes</span><h2>El lenguaje del modelo</h2></div><div className="concept-grid">{concepts.map(({ name, symbol, unit, text, Icon }) => <article className="concept-card" key={name}><Icon /><div className="concept-symbol">{symbol}</div><h3>{name}</h3><span className="unit-pill">{unit}</span><p>{text}</p></article>)}</div></section>
    <section className="formula-section"><div className="section-heading left"><span className="eyebrow">Ecuaciones esenciales</span><h2>Seis relaciones, un solo sistema</h2></div><div className="formula-grid">
      <FormulaBlock formula="C = Q / V">Capacitancia como carga almacenada por voltio.</FormulaBlock>
      <FormulaBlock formula="C = ε₀ εᵣ A / d">Placas paralelas ideales, despreciando efectos de borde.</FormulaBlock>
      <FormulaBlock formula="Q = C V">Carga en función de capacitancia y voltaje.</FormulaBlock>
      <FormulaBlock formula="U = ½ C V²">Energía almacenada en el campo eléctrico.</FormulaBlock>
      <FormulaBlock formula="E ≈ V / d">Campo aproximadamente uniforme entre placas ideales.</FormulaBlock>
      <FormulaBlock formula="τ = R C">Escala temporal de un circuito RC.</FormulaBlock>
    </div></section>
    <section className="worked-example panel">
      <div className="example-icon"><Sigma /></div><div><span className="eyebrow">Ejemplo obligatorio</span><h2>¿Qué ocurre al duplicar la distancia?</h2><p>Con A = 0.01 m², εᵣ = 1 y d = 0.001 m:</p><code>C = (8.8541878128 × 10⁻¹²)(1)(0.01) / 0.001 = 88.54 pF</code><p>Si d cambia a 0.002 m, el denominador se duplica:</p><code>C = 44.27 pF</code><div className="example-result"><Equal /><strong>La capacitancia se reduce exactamente a la mitad.</strong></div></div><Link to="/simulador-3d?area=100&distance=1&voltage=12&dielectric=Vacío" className="button primary">Comprobar en simulador</Link>
    </section>
  </div>
}
