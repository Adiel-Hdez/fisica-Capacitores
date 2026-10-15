import { useMemo, useRef, useState } from 'react'
import { Download, ImageDown, SlidersHorizontal } from 'lucide-react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageHeader, Slider } from '../components/common/Controls'
import { DIELECTRICS, energy, parallelPlateCapacitance } from '../physics/capacitor'
import { chargingCurrent, chargingVoltage, dischargingCurrent, dischargingVoltage, timeConstant } from '../physics/rcCircuit'
import { cm2ToM2, kiloOhmToOhm, microFaradToFarad, mmToM } from '../physics/units'

type Graph = { title: string; x: string; y: string; data: Record<string, number>[]; lines: { key: string; label: string; color: string }[] }

function ScientificChart({ graph, index }: { graph: Graph; index: number }) {
  return <article className="scientific-chart panel" data-chart-index={index}><div className="chart-heading"><div><span className="chart-index">0{index + 1}</span><h3>{graph.title}</h3></div><span className="simulated-pill">Modelo matemático</span></div><ResponsiveContainer width="100%" height={250}><LineChart data={graph.data} margin={{ left: 5, right: 12, top: 10, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" stroke="#17334d"/><XAxis dataKey="x" stroke="#7890a5" tick={{ fontSize: 11 }} label={{ value: graph.x, position: 'insideBottom', offset: -5, fill: '#7890a5' }} /><YAxis stroke="#7890a5" tick={{ fontSize: 11 }} label={{ value: graph.y, angle: -90, position: 'insideLeft', fill: '#7890a5' }} /><Tooltip contentStyle={{ background: '#0a1929', border: '1px solid #23415c', borderRadius: 10 }} /><Legend verticalAlign="top" height={30}/>{graph.lines.map((line) => <Line key={line.key} type="monotone" dataKey={line.key} name={line.label} stroke={line.color} dot={false} strokeWidth={2.5}/>)}</LineChart></ResponsiveContainer></article>
}

export default function Graphs() {
  const [area, setArea] = useState(100)
  const [distance, setDistance] = useState(5)
  const [voltage, setVoltage] = useState(12)
  const [resistanceK, setResistanceK] = useState(10)
  const [capacitanceMicro, setCapacitanceMicro] = useState(100)
  const gridRef = useRef<HTMLDivElement>(null)
  const graphs = useMemo<Graph[]>(() => {
    const R = kiloOhmToOhm(resistanceK), C = microFaradToFarad(capacitanceMicro), tau = timeConstant(R, C)
    const timePoints = Array.from({ length: 61 }, (_, i) => i * tau / 12)
    return [
      { title: 'Capacitancia frente a distancia', x: 'Distancia (mm)', y: 'Capacitancia (pF)', data: Array.from({ length: 40 }, (_, i) => { const x = .5 + i * .5; return { x, aire: parallelPlateCapacitance(cm2ToM2(area), mmToM(x), DIELECTRICS.Aire) * 1e12, vidrio: parallelPlateCapacitance(cm2ToM2(area), mmToM(x), DIELECTRICS.Vidrio) * 1e12 } }), lines: [{ key: 'aire', label: 'Aire', color: '#27d7e7' }, { key: 'vidrio', label: 'Vidrio', color: '#b292ff' }] },
      { title: 'Capacitancia frente al área', x: 'Área (cm²)', y: 'Capacitancia (pF)', data: Array.from({ length: 39 }, (_, i) => { const x = 10 + i * 5; return { x, aire: parallelPlateCapacitance(cm2ToM2(x), mmToM(distance), DIELECTRICS.Aire) * 1e12, ceramica: parallelPlateCapacitance(cm2ToM2(x), mmToM(distance), DIELECTRICS.Cerámica) * 1e12 } }), lines: [{ key: 'aire', label: 'Aire', color: '#27d7e7' }, { key: 'ceramica', label: 'Cerámica', color: '#ff9b52' }] },
      { title: 'Voltaje durante la carga', x: 'Tiempo (s)', y: 'Vc (V)', data: timePoints.map((x) => ({ x, vc: chargingVoltage(x, voltage, R, C), fuente: voltage })), lines: [{ key: 'vc', label: 'Vc carga', color: '#42e8a3' }, { key: 'fuente', label: 'Vs', color: '#5e7690' }] },
      { title: 'Voltaje durante la descarga', x: 'Tiempo (s)', y: 'Vc (V)', data: timePoints.map((x) => ({ x, vc: dischargingVoltage(x, voltage, R, C) })), lines: [{ key: 'vc', label: 'Vc descarga', color: '#ff9b52' }] },
      { title: 'Corriente frente al tiempo', x: 'Tiempo (s)', y: 'I (mA)', data: timePoints.map((x) => ({ x, carga: chargingCurrent(x, voltage, R, C) * 1000, descarga: dischargingCurrent(x, voltage, R, C) * 1000 })), lines: [{ key: 'carga', label: 'Carga', color: '#27d7e7' }, { key: 'descarga', label: 'Descarga', color: '#ff6b7a' }] },
      { title: 'Energía almacenada frente al voltaje', x: 'Voltaje (V)', y: 'Energía (mJ)', data: Array.from({ length: 25 }, (_, x) => ({ x, energia: energy(C, x) * 1000, dobleC: energy(C * 2, x) * 1000 })), lines: [{ key: 'energia', label: `${capacitanceMicro} µF`, color: '#b292ff' }, { key: 'dobleC', label: `${capacitanceMicro * 2} µF`, color: '#27d7e7' }] },
      { title: 'Campo eléctrico frente a distancia', x: 'Distancia (mm)', y: 'E (kV/m)', data: Array.from({ length: 40 }, (_, i) => { const x = .5 + i * .5; return { x, campo: voltage / mmToM(x) / 1000, dobleV: voltage * 2 / mmToM(x) / 1000 } }), lines: [{ key: 'campo', label: `${voltage} V`, color: '#ffcf5b' }, { key: 'dobleV', label: `${voltage * 2} V`, color: '#ff7c52' }] },
    ]
  }, [area, distance, voltage, resistanceK, capacitanceMicro])

  const downloadCsv = () => {
    const rows = ['grafica,x,serie,valor']
    graphs.forEach((graph) => graph.data.forEach((row) => graph.lines.forEach((line) => rows.push(`"${graph.title}",${row.x},"${line.label}",${row[line.key]}`))))
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' })); link.download = 'capaciLab-datos-simulados.csv'; link.click(); URL.revokeObjectURL(link.href)
  }
  const exportPng = () => {
    const svg = gridRef.current?.querySelector('svg'); if (!svg) return
    const source = new XMLSerializer().serializeToString(svg); const image = new Image(); const blobUrl = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml' }))
    image.onload = () => { const canvas = document.createElement('canvas'); canvas.width = 900; canvas.height = 420; const context = canvas.getContext('2d')!; context.fillStyle = '#081421'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height); const link = document.createElement('a'); link.download = 'capaciLab-grafica.png'; link.href = canvas.toDataURL('image/png'); link.click(); URL.revokeObjectURL(blobUrl) }; image.src = blobUrl
  }
  return <div className="page graphs-page"><PageHeader eyebrow="Módulo 05 · Visualización científica" title="Gráficas y análisis" description="Todos los puntos proceden de las ecuaciones del modelo; no son mediciones experimentales."><div className="header-actions"><button className="button secondary" onClick={downloadCsv}><Download /> CSV</button><button className="button secondary" onClick={exportPng}><ImageDown /> PNG</button></div></PageHeader>
    <section className="graph-controls panel"><SlidersHorizontal /><Slider label="Área" value={area} min={10} max={200} step={5} unit="cm²" onChange={setArea}/><Slider label="Distancia" value={distance} min={1} max={20} step={1} unit="mm" onChange={setDistance}/><Slider label="Voltaje" value={voltage} min={1} max={24} step={1} unit="V" onChange={setVoltage}/><Slider label="Resistencia" value={resistanceK} min={1} max={100} step={1} unit="kΩ" onChange={setResistanceK}/><Slider label="Capacitancia RC" value={capacitanceMicro} min={10} max={500} step={10} unit="µF" onChange={setCapacitanceMicro}/></section>
    <div className="scientific-grid" ref={gridRef}>{graphs.map((graph, index) => <ScientificChart key={graph.title} graph={graph} index={index}/>)}</div>
    <p className="model-disclaimer">El campo E = V/d supone placas paralelas extensas, separación pequeña respecto de sus dimensiones y desprecia efectos de borde.</p>
  </div>
}
