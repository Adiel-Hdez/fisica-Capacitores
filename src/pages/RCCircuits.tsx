import { useMemo, useState } from 'react'
import { Clock3, TrendingDown, TrendingUp } from 'lucide-react'
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { MetricCard, PageHeader, Slider } from '../components/common/Controls'
import { chargingVoltage, dischargingVoltage, timeConstant } from '../physics/rcCircuit'
import { formatSI, kiloOhmToOhm, microFaradToFarad } from '../physics/units'

const multiples = [1, 2, 3, 4, 5]

export default function RCCircuits() {
  const [resistanceK, setResistanceK] = useState(10)
  const [capacitanceMicro, setCapacitanceMicro] = useState(100)
  const resistance = kiloOhmToOhm(resistanceK), capacitance = microFaradToFarad(capacitanceMicro)
  const tau = timeConstant(resistance, capacitance)
  const data = useMemo(() => Array.from({ length: 101 }, (_, i) => { const multiple = i / 20; const t = multiple * tau; return { multiple, carga: chargingVoltage(t, 100, resistance, capacitance), descarga: dischargingVoltage(t, 100, resistance, capacitance) } }), [tau, resistance, capacitance])
  return <div className="page tau-page"><PageHeader eyebrow="Módulo 04 · Constante de tiempo" title="El reloj interno de un circuito RC" description="τ = RC determina la rapidez del proceso; no es el tiempo total, sino su escala característica." />
    <section className="tau-hero panel"><div className="tau-copy"><span className="eyebrow">Idea clave</span><h2>Después de 1τ</h2><div className="tau-percents"><div><TrendingUp /><strong>63.2%</strong><span>cargado</span></div><div><TrendingDown /><strong>36.8%</strong><span>permanece</span></div></div><p>Tras aproximadamente 5τ, el capacitor se considera prácticamente cargado o descargado (&gt;99%).</p></div><div className="tau-controls"><Slider label="Resistencia" value={resistanceK} min={1} max={100} step={1} unit="kΩ" onChange={setResistanceK} /><Slider label="Capacitancia" value={capacitanceMicro} min={10} max={500} step={10} unit="µF" onChange={setCapacitanceMicro} /><MetricCard label="Constante de tiempo" value={formatSI(tau, 's')} icon={<Clock3 />} detail={`${resistanceK} kΩ × ${capacitanceMicro} µF`} /></div></section>
    <section className="tau-analysis"><div className="panel chart-panel"><div className="chart-heading"><h2>Respuesta normalizada</h2><span className="simulated-pill">0—5τ</span></div><ResponsiveContainer width="100%" height={330}><LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#17334d"/><XAxis dataKey="multiple" stroke="#7890a5" unit="τ"/><YAxis stroke="#7890a5" unit="%" domain={[0,100]}/><Tooltip contentStyle={{ background: '#0a1929', border: '1px solid #23415c', borderRadius: 10 }}/><Line type="monotone" dataKey="carga" stroke="#27d7e7" dot={false} strokeWidth={3}/><Line type="monotone" dataKey="descarga" stroke="#ff9b52" dot={false} strokeWidth={3}/></LineChart></ResponsiveContainer></div>
      <div className="panel tau-table"><h2>Tabla de referencia</h2><table><thead><tr><th>Tiempo</th><th>Carga</th><th>Descarga</th><th>t real</th></tr></thead><tbody>{multiples.map((n) => <tr key={n}><td>{n}τ</td><td>{(100 * (1 - Math.exp(-n))).toFixed(1)}%</td><td>{(100 * Math.exp(-n)).toFixed(1)}%</td><td>{formatSI(n * tau, 's')}</td></tr>)}</tbody></table></div></section>
  </div>
}
