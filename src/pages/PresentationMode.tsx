import { useMemo, useState } from 'react'
import { Battery, Box, Expand, Minimize, RotateCcw, Timer, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import CapacitorScene from '../components/simulator3d/CapacitorScene'
import { MetricCard, Slider } from '../components/common/Controls'
import { connectedState, isolatedState } from '../physics/capacitor'
import { chargingCurrent, chargingVoltage, dischargingCurrent, dischargingVoltage } from '../physics/rcCircuit'
import { formatSI, mmToM } from '../physics/units'

type Scenario = { name: string; icon: typeof Battery; distance: number; mode: 'connected' | 'isolated'; note: string; rc?: string }
const scenarios: Scenario[] = [
  { name: 'Placas cercanas', icon: Minimize, distance: 2, mode: 'connected', note: 'Menor distancia → mayor capacitancia.' },
  { name: 'Placas separadas', icon: Expand, distance: 16, mode: 'connected', note: 'Mayor distancia → menor capacitancia.' },
  { name: 'Batería conectada', icon: Battery, distance: 5, mode: 'connected', note: 'La fuente mantiene V = 12 V.' },
  { name: 'Capacitor aislado', icon: Box, distance: 10, mode: 'isolated', note: 'La carga inicial se conserva.' },
  { name: 'Carga RC', icon: Zap, distance: 5, mode: 'connected', note: 'A 1τ, Vc alcanza el 63.2%.', rc: 'Vc = Vs(1 − e⁻ᵗ/ᴿᶜ)' },
  { name: 'Descarga RC', icon: Timer, distance: 5, mode: 'isolated', note: 'A 1τ, permanece el 36.8%.', rc: 'Vc = V₀e⁻ᵗ/ᴿᶜ' },
]

export default function PresentationMode() {
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [distance, setDistance] = useState(scenarios[0].distance)
  const [time, setTime] = useState(1)
  const scenario = scenarios[scenarioIndex]
  const reference = connectedState(.01, .005, 1.0006, 12)
  const rcValues = useMemo(() => {
    if (!scenario.rc) return null
    const chargeMode = scenario.name === 'Carga RC'
    return { voltage: chargeMode ? chargingVoltage(time, 12, 10_000, 100e-6) : dischargingVoltage(time, 12, 10_000, 100e-6), current: chargeMode ? chargingCurrent(time, 12, 10_000, 100e-6) : dischargingCurrent(time, 12, 10_000, 100e-6) }
  }, [scenario, time])
  const state = useMemo(() => rcValues ? connectedState(.01, mmToM(distance), 1.0006, rcValues.voltage) : scenario.mode === 'connected' ? connectedState(.01, mmToM(distance), 1.0006, 12) : isolatedState(.01, mmToM(distance), 1.0006, reference.chargeC), [distance, scenario.mode, reference.chargeC, rcValues])
  const choose = (index: number) => { setScenarioIndex(index); setDistance(scenarios[index].distance); setTime(1) }
  const fullscreen = () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen() }
  return <div className="presentation-page"><header><Link to="/" className="presentation-brand"><Zap /> CapaciLab <span>Modo exposición</span></Link><div><button onClick={fullscreen}><Expand /> Pantalla completa</button><Link to="/simulador-3d">Salir</Link></div></header><main><aside><span className="eyebrow">Escenarios rápidos</span>{scenarios.map(({ name, icon: Icon }, index) => <button key={name} className={index === scenarioIndex ? 'active' : ''} onClick={() => choose(index)}><Icon /><span>{name}</span></button>)}<button className="quick-reset" onClick={() => choose(0)}><RotateCcw /> Restablecer</button></aside><section className="presentation-stage"><div className="presentation-title"><div><span>{scenario.rc ? 'Circuito RC · τ = 1 s' : scenario.mode === 'connected' ? 'Voltaje constante' : 'Carga constante'}</span><h1>{scenario.name}</h1><p>{scenario.note}</p></div>{scenario.rc && <code>{scenario.rc}</code>}</div><CapacitorScene distanceMm={distance} areaCm2={100} fieldStrength={state.electricFieldVm} showLabels showDistance /><div className="presentation-slider">{scenario.rc ? <Slider label="Tiempo transcurrido" value={time} min={0} max={5} step={.1} unit="s" onChange={setTime}/> : <Slider label="Distancia entre placas" value={distance} min={1} max={20} step={1} unit="mm" onChange={setDistance}/>}</div><div className="presentation-metrics"><MetricCard label={scenario.rc ? 'Tiempo' : 'Capacitancia'} value={scenario.rc ? `${time.toFixed(1)} τ` : formatSI(state.capacitanceF, 'F')} /><MetricCard label="Voltaje" value={formatSI(state.voltageV, 'V')} accent="orange"/><MetricCard label={scenario.rc ? 'Corriente' : 'Carga'} value={scenario.rc ? formatSI(rcValues?.current ?? 0, 'A') : formatSI(state.chargeC, 'C')} accent="violet"/><MetricCard label="Energía" value={formatSI(state.energyJ, 'J')} accent="green"/></div></section></main></div>
}
