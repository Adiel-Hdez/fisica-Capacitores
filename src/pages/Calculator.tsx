import { useMemo, useState } from 'react'
import { Calculator as CalculatorIcon, CheckCircle2, RotateCcw, Sigma } from 'lucide-react'
import { PageHeader } from '../components/common/Controls'
import { EPSILON_0, capacitanceFromCharge, charge, electricField, energy, parallelPlateCapacitance } from '../physics/capacitor'
import { timeConstant } from '../physics/rcCircuit'
import { formatSI } from '../physics/units'

type ToolId = 'c-qv' | 'c-plates' | 'q' | 'u' | 'tau' | 'field'
type Field = { key: string; label: string; unit: string; default: number }
type Tool = { id: ToolId; title: string; formula: string; fields: Field[] }

const tools: Tool[] = [
  { id: 'c-qv', title: 'Capacitancia por carga', formula: 'C = Q / V', fields: [{ key: 'q', label: 'Carga Q', unit: 'µC', default: 12 }, { key: 'v', label: 'Voltaje V', unit: 'V', default: 6 }] },
  { id: 'c-plates', title: 'Placas paralelas', formula: 'C = ε₀εᵣA / d', fields: [{ key: 'er', label: 'Permitividad relativa εᵣ', unit: '', default: 1 }, { key: 'a', label: 'Área A', unit: 'cm²', default: 100 }, { key: 'd', label: 'Distancia d', unit: 'mm', default: 1 }] },
  { id: 'q', title: 'Carga eléctrica', formula: 'Q = C V', fields: [{ key: 'c', label: 'Capacitancia C', unit: 'µF', default: 100 }, { key: 'v', label: 'Voltaje V', unit: 'V', default: 12 }] },
  { id: 'u', title: 'Energía almacenada', formula: 'U = ½ C V²', fields: [{ key: 'c', label: 'Capacitancia C', unit: 'µF', default: 100 }, { key: 'v', label: 'Voltaje V', unit: 'V', default: 12 }] },
  { id: 'tau', title: 'Constante de tiempo', formula: 'τ = R C', fields: [{ key: 'r', label: 'Resistencia R', unit: 'kΩ', default: 10 }, { key: 'c', label: 'Capacitancia C', unit: 'µF', default: 100 }] },
  { id: 'field', title: 'Campo eléctrico ideal', formula: 'E = V / d', fields: [{ key: 'v', label: 'Voltaje V', unit: 'V', default: 12 }, { key: 'd', label: 'Distancia d', unit: 'mm', default: 5 }] },
]

function defaults(tool: Tool) { return Object.fromEntries(tool.fields.map((field) => [field.key, field.default])) as Record<string, number> }

export default function Calculator() {
  const [activeId, setActiveId] = useState<ToolId>('c-plates')
  const tool = tools.find((item) => item.id === activeId)!
  const [valuesByTool, setValuesByTool] = useState<Record<ToolId, Record<string, number>>>(() => Object.fromEntries(tools.map((item) => [item.id, defaults(item)])) as Record<ToolId, Record<string, number>>)
  const [submitted, setSubmitted] = useState(true)
  const values = valuesByTool[activeId]
  const calculation = useMemo(() => {
    try {
      if (Object.values(values).some((value) => !Number.isFinite(value) || value <= 0)) throw new Error('Todos los valores deben ser números mayores que cero.')
      switch (activeId) {
        case 'c-qv': { const q = values.q * 1e-6; return { result: formatSI(capacitanceFromCharge(q, values.v), 'F'), conversion: `${values.q} µC = ${q} C`, substitution: `C = ${q} C / ${values.v} V` } }
        case 'c-plates': { const a = values.a / 1e4, d = values.d / 1000; return { result: formatSI(parallelPlateCapacitance(a, d, values.er), 'F'), conversion: `${values.a} cm² = ${a} m²; ${values.d} mm = ${d} m`, substitution: `C = (${EPSILON_0})( ${values.er} )(${a}) / ${d}` } }
        case 'q': { const c = values.c * 1e-6; return { result: formatSI(charge(c, values.v), 'C'), conversion: `${values.c} µF = ${c} F`, substitution: `Q = (${c} F)(${values.v} V)` } }
        case 'u': { const c = values.c * 1e-6; return { result: formatSI(energy(c, values.v), 'J'), conversion: `${values.c} µF = ${c} F`, substitution: `U = ½(${c} F)(${values.v} V)²` } }
        case 'tau': { const r = values.r * 1000, c = values.c * 1e-6; return { result: formatSI(timeConstant(r, c), 's'), conversion: `${values.r} kΩ = ${r} Ω; ${values.c} µF = ${c} F`, substitution: `τ = (${r} Ω)(${c} F)` } }
        case 'field': { const d = values.d / 1000; return { result: formatSI(electricField(values.v, d), 'V/m'), conversion: `${values.d} mm = ${d} m`, substitution: `E = ${values.v} V / ${d} m` } }
      }
    } catch (error) { return { error: error instanceof Error ? error.message : 'Entrada inválida' } }
  }, [activeId, values])
  const switchTool = (id: ToolId) => { setActiveId(id); setSubmitted(false) }
  const update = (key: string, value: number) => { setValuesByTool((current) => ({ ...current, [activeId]: { ...current[activeId], [key]: value } })); setSubmitted(false) }
  const reset = () => { setValuesByTool((current) => ({ ...current, [activeId]: defaults(tool) })); setSubmitted(false) }
  return <div className="page calculator-page"><PageHeader eyebrow="Módulo 06 · Herramientas matemáticas" title="Calculadora física" description="No solo obtengas el resultado: revisa conversiones, sustitución y procedimiento." />
    <div className="calculator-layout"><aside className="calculator-tabs panel"><span className="control-caption">Selecciona una herramienta</span>{tools.map((item) => <button key={item.id} className={item.id === activeId ? 'active' : ''} onClick={() => switchTool(item.id)}><CalculatorIcon /><span><strong>{item.title}</strong><small>{item.formula}</small></span></button>)}</aside>
      <section className="calculator-workspace panel"><div className="calculator-title"><div><span className="eyebrow">{tool.title}</span><h2>{tool.formula}</h2></div><button className="icon-button" onClick={reset} title="Restablecer"><RotateCcw /></button></div><div className="calculator-fields">{tool.fields.map((field) => <label key={field.key}><span>{field.label}</span><div><input type="number" min="0" step="any" value={values[field.key]} onChange={(event) => update(field.key, Number(event.target.value))}/><strong>{field.unit}</strong></div></label>)}</div><button className="button primary calculate-button" onClick={() => setSubmitted(true)}><Sigma /> Calcular paso a paso</button>
      {submitted && calculation && ('error' in calculation ? <div className="calculation-error">{calculation.error}</div> : <div className="calculation-result"><div className="result-head"><CheckCircle2 /><span>Resultado</span><strong>{calculation.result}</strong></div><ol><li><span>1</span><div><strong>Fórmula</strong><code>{tool.formula}</code></div></li><li><span>2</span><div><strong>Conversión al SI</strong><code>{calculation.conversion}</code></div></li><li><span>3</span><div><strong>Sustitución</strong><code>{calculation.substitution}</code></div></li><li><span>4</span><div><strong>Resultado final</strong><code>{calculation.result}</code></div></li></ol></div>)}</section></div>
  </div>
}
