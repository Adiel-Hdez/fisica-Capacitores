import { useMemo, useState } from 'react'
import { Battery, Box, Eye, EyeOff, Gauge, Layers3, Maximize2, MoveHorizontal, RotateCcw, ScanLine, Zap } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import CapacitorScene, { type CameraView } from '../components/simulator3d/CapacitorScene'
import { MetricCard, PageHeader, Segmented, Slider } from '../components/common/Controls'
import { connectedState, DIELECTRICS, isolatedState, type DielectricName } from '../physics/capacitor'
import { cm2ToM2, formatSI, mmToM } from '../physics/units'

type Mode = 'connected' | 'isolated'

export default function CapacitorSimulator() {
  const [params] = useSearchParams()
  const [distance, setDistance] = useState(Number(params.get('distance')) || 5)
  const [area, setArea] = useState(Number(params.get('area')) || 100)
  const [sourceVoltage, setSourceVoltage] = useState(Number(params.get('voltage')) || 12)
  const initialDielectric = params.get('dielectric') as DielectricName
  const [dielectric, setDielectric] = useState<DielectricName>(initialDielectric in DIELECTRICS ? initialDielectric : 'Aire')
  const [mode, setMode] = useState<Mode>('connected')
  const [fixedCharge, setFixedCharge] = useState<number | null>(null)
  const [cameraView, setCameraView] = useState<CameraView>('perspective')
  const [visibility, setVisibility] = useState({ field: true, labels: true, charges: true, dielectric: true, distance: true })

  const areaM2 = cm2ToM2(area)
  const distanceM = mmToM(distance)
  const epsilonR = DIELECTRICS[dielectric]
  const connected = useMemo(() => connectedState(areaM2, distanceM, epsilonR, sourceVoltage), [areaM2, distanceM, epsilonR, sourceVoltage])
  const state = useMemo(() => mode === 'connected' ? connected : isolatedState(areaM2, distanceM, epsilonR, fixedCharge ?? connected.chargeC), [mode, connected, areaM2, distanceM, epsilonR, fixedCharge])

  const changeMode = (next: Mode) => {
    if (next === mode) return
    if (next === 'isolated') setFixedCharge(connected.chargeC)
    setMode(next)
  }
  const reset = () => { setDistance(5); setArea(100); setSourceVoltage(12); setDielectric('Aire'); setMode('connected'); setFixedCharge(null); setCameraView('perspective') }

  return <div className="page simulator-page">
    <PageHeader eyebrow="Módulo principal · Modelo de placas paralelas" title="Simulador 3D de capacitor" description="Manipula la geometría y observa cómo responde el sistema sin romper las leyes de conservación.">
      <button className="button secondary" onClick={reset}><RotateCcw /> Restablecer</button>
    </PageHeader>
    <section className="mode-panel panel">
      <div><span className="control-caption">Condición física</span><Segmented label="Modo físico" value={mode} onChange={changeMode} options={[{ value: 'connected', label: 'Batería conectada' }, { value: 'isolated', label: 'Capacitor aislado' }]} /></div>
      <div className={`mode-explanation ${mode}`}><div className="mode-icon">{mode === 'connected' ? <Battery /> : <Box />}</div><div><strong>{mode === 'connected' ? 'Voltaje constante' : 'Carga constante'}</strong><p>{mode === 'connected' ? 'La fuente mantiene V; al cambiar la geometría, Q y U se reajustan.' : 'El capacitor está desconectado; Q se conserva y cambian V y U.'}</p></div></div>
    </section>
    <div className="simulator-layout">
      <section className="scene-panel panel">
        <div className="scene-toolbar"><span><span className="live-dot" /> Visualización en tiempo real</span><div className="camera-buttons"><button className={cameraView === 'perspective' ? 'active' : ''} onClick={() => setCameraView('perspective')} title="Perspectiva"><Maximize2 /></button><button className={cameraView === 'front' ? 'active' : ''} onClick={() => setCameraView('front')}>Frontal</button><button className={cameraView === 'side' ? 'active' : ''} onClick={() => setCameraView('side')}>Lateral</button><button className={cameraView === 'top' ? 'active' : ''} onClick={() => setCameraView('top')}>Superior</button></div></div>
        <CapacitorScene distanceMm={distance} areaCm2={area} fieldStrength={state.electricFieldVm} cameraView={cameraView} showField={visibility.field} showCharges={visibility.charges} showLabels={visibility.labels} showDielectric={visibility.dielectric} showDistance={visibility.distance} />
        <div className="scene-legend"><span><i className="legend-positive" /> Placa positiva</span><span><i className="legend-negative" /> Placa negativa</span><span><i className="legend-field" /> Campo E (+ → −)</span></div>
      </section>
      <aside className="control-panel panel">
        <div className="panel-title"><div><span className="eyebrow">Parámetros</span><h2>Configura el sistema</h2></div><ScanLine /></div>
        <Slider label="Distancia entre placas" value={distance} min={1} max={20} step={1} unit="mm" onChange={setDistance} />
        <Slider label="Área de las placas" value={area} min={10} max={200} step={5} unit="cm²" onChange={setArea} />
        <Slider label="Voltaje de la fuente" value={sourceVoltage} min={1} max={24} step={1} unit="V" onChange={setSourceVoltage} />
        {mode === 'isolated' && <p className="input-note">La fuente queda configurada en {sourceVoltage} V, pero no actúa hasta reconectar.</p>}
        <label className="select-control"><span>Material dieléctrico</span><select value={dielectric} onChange={(event) => setDielectric(event.target.value as DielectricName)}>{Object.entries(DIELECTRICS).map(([name, value]) => <option key={name} value={name}>{name} · εᵣ ≈ {value}</option>)}</select></label>
        <div className="visibility-controls"><span className="control-caption">Elementos visibles</span>{Object.entries({ field: 'Líneas de campo', labels: 'Etiquetas', charges: 'Cargas', dielectric: 'Dieléctrico', distance: 'Distancia' }).map(([key, label]) => <button key={key} className={visibility[key as keyof typeof visibility] ? 'active' : ''} onClick={() => setVisibility((current) => ({ ...current, [key]: !current[key as keyof typeof current] }))}>{visibility[key as keyof typeof visibility] ? <Eye /> : <EyeOff />}{label}</button>)}</div>
      </aside>
    </div>
    <section className="metrics-grid five">
      <MetricCard label="Capacitancia" value={formatSI(state.capacitanceF, 'F')} icon={<Layers3 />} accent="cyan" detail="C = ε₀εᵣA/d" />
      <MetricCard label="Carga almacenada" value={formatSI(state.chargeC, 'C')} icon={<Zap />} accent="orange" detail={mode === 'isolated' ? 'Q constante' : 'Q = CV'} />
      <MetricCard label="Voltaje entre placas" value={formatSI(state.voltageV, 'V')} icon={<Battery />} accent="cyan" detail={mode === 'connected' ? 'V impuesto por la fuente' : 'V = Q/C'} />
      <MetricCard label="Campo eléctrico" value={formatSI(state.electricFieldVm, 'V/m')} icon={<Gauge />} accent="violet" detail="E ≈ V/d" />
      <MetricCard label="Energía" value={formatSI(state.energyJ, 'J')} icon={<Battery />} accent="green" detail="U = ½CV²" />
    </section>
    <section className="model-note panel"><MoveHorizontal /><div><strong>Modelo ideal de placas paralelas</strong><p>Las líneas muestran dirección y uniformidad aproximadas; su densidad es ilustrativa, no una medición. Se desprecian efectos de borde y no se representan electrones atravesando el dieléctrico.</p></div><span>εᵣ {epsilonR}</span></section>
  </div>
}
