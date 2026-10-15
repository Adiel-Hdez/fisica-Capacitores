import { useMemo, useState } from 'react'
import { Beaker, CheckCircle2, ClipboardList, FlaskConical, Plus, RotateCcw } from 'lucide-react'
import { PageHeader, Slider } from '../components/common/Controls'
import { DIELECTRICS, connectedState, isolatedState, parallelPlateCapacitance, type DielectricName } from '../physics/capacitor'
import { dischargingVoltage, chargingVoltage, timeConstant } from '../physics/rcCircuit'
import { cm2ToM2, formatSI, kiloOhmToOhm, microFaradToFarad, mmToM } from '../physics/units'

type Experiment = { title: string; objective: string; concepts: string[]; instructions: string[]; parameter: string; unit: string; min: number; max: number; step: number; initial: number; conclusion: string }
const experiments: Experiment[] = [
  { title: 'Influencia de la distancia', objective: 'Comprobar la relación inversa entre C y d.', concepts: ['Capacitancia', 'Geometría'], instructions: ['Mantén A = 100 cm² y aire.', 'Cambia la distancia.', 'Registra al menos tres puntos.'], parameter: 'Distancia', unit: 'mm', min: 1, max: 20, step: 1, initial: 5, conclusion: 'Al duplicar d, C se reduce a la mitad porque d aparece en el denominador.' },
  { title: 'Influencia del área', objective: 'Comprobar que C es proporcional al área enfrentada.', concepts: ['Área', 'Proporcionalidad'], instructions: ['Mantén d = 5 mm y aire.', 'Aumenta el área.', 'Compara C para A y 2A.'], parameter: 'Área', unit: 'cm²', min: 10, max: 200, step: 10, initial: 100, conclusion: 'Duplicar A duplica C porque una superficie mayor puede alojar más carga.' },
  { title: 'Materiales dieléctricos', objective: 'Comparar el efecto de εᵣ en la capacitancia.', concepts: ['Permitividad', 'Polarización'], instructions: ['Mantén A y d constantes.', 'Selecciona materiales.', 'Compara sus capacitancias.'], parameter: 'Permitividad relativa', unit: 'εᵣ', min: 1, max: 10, step: .5, initial: 1, conclusion: 'La capacitancia aumenta linealmente con εᵣ; los valores reales dependen de composición y frecuencia.' },
  { title: 'Carga de un circuito RC', objective: 'Observar cómo R cambia el tiempo de carga.', concepts: ['Constante de tiempo', 'Carga'], instructions: ['Mantén C = 100 µF y Vs = 12 V.', 'Cambia R.', 'Registra Vc en t = 1 s.'], parameter: 'Resistencia', unit: 'kΩ', min: 1, max: 100, step: 1, initial: 10, conclusion: 'Una R mayor incrementa τ y hace más lenta la aproximación al voltaje final.' },
  { title: 'Descarga de un capacitor', objective: 'Comparar curvas exponenciales de descarga.', concepts: ['Descarga', 'Energía'], instructions: ['Usa V₀ = 12 V y C = 100 µF.', 'Cambia R.', 'Mide Vc en t = 1 s.'], parameter: 'Resistencia', unit: 'kΩ', min: 1, max: 100, step: 1, initial: 10, conclusion: 'Una R mayor limita la corriente y conserva el voltaje durante más tiempo.' },
  { title: 'Conectado frente a aislado', objective: 'Distinguir qué magnitud se conserva al variar d.', concepts: ['Conservación de carga', 'Fuente ideal'], instructions: ['Parte de d = 5 mm y 12 V.', 'Aísla el capacitor.', 'Cambia d y compara V, Q y U.'], parameter: 'Distancia', unit: 'mm', min: 1, max: 20, step: 1, initial: 5, conclusion: 'La batería fija V; el capacitor aislado fija Q. Por eso la misma variación geométrica produce respuestas distintas.' },
]

export default function Experiments() {
  const [selected, setSelected] = useState(0)
  const experiment = experiments[selected]
  const [value, setValue] = useState(experiment.initial)
  const [rows, setRows] = useState<{ input: string; result: string; detail: string }[]>([])
  const [material, setMaterial] = useState<DielectricName>('Vacío')
  const result = useMemo(() => {
    if (selected === 0) { const c = parallelPlateCapacitance(.01, mmToM(value), DIELECTRICS.Aire); return { result: formatSI(c, 'F'), detail: 'A = 100 cm² · aire' } }
    if (selected === 1) { const c = parallelPlateCapacitance(cm2ToM2(value), .005, DIELECTRICS.Aire); return { result: formatSI(c, 'F'), detail: 'd = 5 mm · aire' } }
    if (selected === 2) { const er = DIELECTRICS[material]; const c = parallelPlateCapacitance(.01, .005, er); return { result: formatSI(c, 'F'), detail: `${material} · εᵣ ≈ ${er}` } }
    if (selected === 3) { const R = kiloOhmToOhm(value), C = microFaradToFarad(100); return { result: `${chargingVoltage(1, 12, R, C).toFixed(3)} V`, detail: `τ = ${formatSI(timeConstant(R, C), 's')} · t = 1 s` } }
    if (selected === 4) { const R = kiloOhmToOhm(value), C = microFaradToFarad(100); return { result: `${dischargingVoltage(1, 12, R, C).toFixed(3)} V`, detail: `τ = ${formatSI(timeConstant(R, C), 's')} · t = 1 s` } }
    const reference = connectedState(.01, .005, DIELECTRICS.Aire, 12); const connected = connectedState(.01, mmToM(value), DIELECTRICS.Aire, 12); const isolated = isolatedState(.01, mmToM(value), DIELECTRICS.Aire, reference.chargeC)
    return { result: `Vcon = ${connected.voltageV.toFixed(1)} V · Vais = ${isolated.voltageV.toFixed(1)} V`, detail: `Qcon = ${formatSI(connected.chargeC, 'C')} · Qais = ${formatSI(isolated.chargeC, 'C')}` }
  }, [selected, value, material])
  const choose = (index: number) => { setSelected(index); setValue(experiments[index].initial); setRows([]); setMaterial('Vacío') }
  const record = () => { const input = selected === 2 ? `${material} (εᵣ ${DIELECTRICS[material]})` : `${value} ${experiment.unit}`; setRows((current) => [...current, { input, ...result }]) }
  const reset = () => { setValue(experiment.initial); setRows([]); setMaterial('Vacío') }
  return <div className="page experiments-page"><PageHeader eyebrow="Módulo 08 · Práctica guiada" title="Laboratorio de experimentos" description="Formula una comparación, modifica una variable y construye tu propia tabla de resultados." />
    <div className="experiment-selector">{experiments.map((item, index) => <button key={item.title} className={selected === index ? 'active' : ''} onClick={() => choose(index)}><span>0{index + 1}</span>{item.title}</button>)}</div>
    <div className="experiment-layout"><section className="experiment-guide panel"><div className="experiment-heading"><div className="experiment-icon"><FlaskConical /></div><div><span>Experimento {selected + 1}</span><h2>{experiment.title}</h2></div></div><div className="guide-block"><h3><Beaker /> Objetivo</h3><p>{experiment.objective}</p></div><div className="concept-tags">{experiment.concepts.map((concept) => <span key={concept}>{concept}</span>)}</div><div className="guide-block"><h3><ClipboardList /> Procedimiento</h3><ol>{experiment.instructions.map((item) => <li key={item}>{item}</li>)}</ol></div><div className="initial-params"><strong>Parámetros iniciales</strong><span>{experiment.parameter}: {experiment.initial} {experiment.unit}</span></div></section>
      <section className="experiment-sim panel"><div className="calculator-title"><div><span className="eyebrow">Simulación</span><h2>Modifica y registra</h2></div><button className="icon-button" onClick={reset} title="Reiniciar"><RotateCcw /></button></div>{selected === 2 ? <label className="select-control"><span>Material dieléctrico</span><select value={material} onChange={(event) => setMaterial(event.target.value as DielectricName)}>{Object.entries(DIELECTRICS).map(([name, er]) => <option key={name} value={name}>{name} · εᵣ ≈ {er}</option>)}</select></label> : <Slider label={experiment.parameter} value={value} min={experiment.min} max={experiment.max} step={experiment.step} unit={experiment.unit} onChange={setValue}/>}<div className="experiment-output"><span>Resultado calculado</span><strong>{result.result}</strong><small>{result.detail}</small></div><button className="button primary" onClick={record}><Plus /> Agregar a la tabla</button><div className="results-table"><table><thead><tr><th>Entrada</th><th>Resultado</th><th>Condición</th></tr></thead><tbody>{rows.length ? rows.map((row, index) => <tr key={index}><td>{row.input}</td><td>{row.result}</td><td>{row.detail}</td></tr>) : <tr><td colSpan={3} className="empty-row">Registra tu primera observación.</td></tr>}</tbody></table></div></section></div>
    <section className="experiment-conclusion panel"><CheckCircle2 /><div><span className="eyebrow">Explicación y conclusión</span><h2>Interpretación física</h2><p>{experiment.conclusion}</p></div></section>
  </div>
}
