import { useEffect, useMemo, useRef, useState } from 'react'
import { Battery, CirclePause, CirclePlay, Gauge, Layers3, MoveHorizontal, RotateCcw, Zap } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { MetricCard, PageHeader, Segmented, Slider } from '../components/common/Controls'
import RCCanvasCircuit from '../components/simulator3d/RCCanvasCircuit'
import { chargingCurrent, chargingVoltage, dischargingCurrent, dischargingVoltage, timeConstant } from '../physics/rcCircuit'
import { formatSI, kiloOhmToOhm, microFaradToFarad } from '../physics/units'

type Process = 'charge' | 'discharge'
type ViewMode = 'canvas' | 'schematic'

export default function RCCharging() {
  const [resistanceK, setResistanceK] = useState(10)
  const [distanceMm, setDistanceMm] = useState(5.0)
  const [sourceVoltage, setSourceVoltage] = useState(12)
  const [speed, setSpeed] = useState(1)
  const [process, setProcess] = useState<Process>('charge')
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [initialDischarge, setInitialDischarge] = useState(12)
  const [viewMode, setViewMode] = useState<ViewMode>('canvas')

  const lastFrame = useRef<number | null>(null)

  const capacitanceMicro = useMemo(() => Math.round(500 / distanceMm), [distanceMm])
  const resistance = kiloOhmToOhm(resistanceK)
  const capacitance = microFaradToFarad(capacitanceMicro)
  const tau = timeConstant(resistance, capacitance)

  const voltage =
    process === 'charge'
      ? chargingVoltage(elapsed, sourceVoltage, resistance, capacitance)
      : dischargingVoltage(elapsed, initialDischarge, resistance, capacitance)

  const current =
    process === 'charge'
      ? chargingCurrent(elapsed, sourceVoltage, resistance, capacitance)
      : dischargingCurrent(elapsed, initialDischarge, resistance, capacitance)

  const chargeC = capacitance * voltage

  // Actualización temporal continua
  useEffect(() => {
    if (!running) {
      lastFrame.current = null
      return
    }

    let frame = 0
    const tick = (now: number) => {
      if (lastFrame.current === null) lastFrame.current = now
      const delta = Math.min((now - lastFrame.current) / 1000, 0.1)
      lastFrame.current = now

      setElapsed((value) => {
        const next = value + delta * speed
        const maxTime = tau * 5
        if (next >= maxTime) {
          setRunning(false)
          return maxTime
        }
        return next
      })

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [running, speed, tau])

  // Curvas teóricas completas
  const chartData = useMemo(() => {
    const chartResistance = kiloOhmToOhm(resistanceK)
    const chartCapacitance = microFaradToFarad(capacitanceMicro)
    const chartTau = timeConstant(chartResistance, chartCapacitance)
    const maxT = chartTau * 5

    return Array.from({ length: 101 }, (_, index) => {
      const t = (index / 100) * maxT
      return {
        t: Number(t.toFixed(3)),
        carga: chargingVoltage(t, sourceVoltage, chartResistance, chartCapacitance),
        descarga: dischargingVoltage(t, initialDischarge, chartResistance, chartCapacitance),
      }
    })
  }, [resistanceK, capacitanceMicro, sourceVoltage, initialDischarge])

  // Datos combinados: curva teórica + avance en tiempo real garantizado
  const combinedChartData = useMemo(() => {
    return chartData.map((d) => {
      const isReached = d.t <= elapsed + 0.001
      const currentActiveValue = process === 'charge' ? d.carga : d.descarga
      return {
        ...d,
        progresoVc: isReached ? currentActiveValue : null,
      }
    })
  }, [chartData, elapsed, process])

  const chooseProcess = (next: Process) => {
    if (next === 'discharge') setInitialDischarge(voltage > 0.01 ? voltage : sourceVoltage)
    setProcess(next)
    setElapsed(0)
    setRunning(false)
  }

  const reset = () => {
    setElapsed(0)
    setRunning(false)
  }

  const handleDistanceChange = (newDist: number) => {
    setDistanceMm(newDist)
    setElapsed(0)
    setRunning(false)
  }

  const handleCapacitanceDirectChange = (newCapMicro: number) => {
    // Actualizar distancia en base a capacitancia inversa: d = 500 / C
    const newDist = Math.max(2, Math.min(15, Number((500 / newCapMicro).toFixed(1))))
    setDistanceMm(newDist)
    setElapsed(0)
    setRunning(false)
  }

  return (
    <div className="page rc-page">
      <PageHeader
        eyebrow="Módulo 03 · Dinámica temporal"
        title="Carga y descarga RC con placas móviles"
        description="Observa cómo la separación geométrica entre placas altera la capacitancia C, la constante temporal τ y la velocidad de carga/descarga con trazado en tiempo real."
      >
        <button className="button secondary" onClick={reset}>
          <RotateCcw /> Reiniciar
        </button>
      </PageHeader>

      <div className="rc-layout">
        <section className="circuit-panel panel">
          <div className="rc-topbar">
            <Segmented
              value={process}
              onChange={chooseProcess}
              label="Proceso RC"
              options={[
                { value: 'charge', label: '1 · Cargar' },
                { value: 'discharge', label: '2 · Descargar' },
              ]}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Segmented<ViewMode>
                value={viewMode}
                onChange={(mode) => setViewMode(mode)}
                label="Vista de circuito"
                options={[
                  { value: 'canvas', label: 'Circuito Canvas' },
                  { value: 'schematic', label: 'Esquema' },
                ]}
              />
              <span className={running ? 'simulation-status running' : 'simulation-status'}>
                <i />
                {running ? 'En ejecución' : elapsed > 0 ? 'En pausa' : 'Preparado'}
              </span>
            </div>
          </div>

          {viewMode === 'canvas' ? (
            <div style={{ padding: '16px 20px 8px' }}>
              <RCCanvasCircuit
                sourceVoltage={sourceVoltage}
                resistanceK={resistanceK}
                distanceMm={distanceMm}
                process={process}
                onProcessChange={chooseProcess}
                running={running}
                currentVoltage={voltage}
                currentCharge={chargeC}
                capacitanceMicro={capacitanceMicro}
                tau={tau}
                onDistanceChange={handleDistanceChange}
              />
            </div>
          ) : (
            <div className={`circuit-visual ${running ? 'active' : ''} ${process}`}>
              <div className="circuit-wire wire-top">
                <span className="moving-charge" />
                <span className="moving-charge delay" />
              </div>
              <div className="battery-symbol">
                <span>+</span>
                <Battery />
                <small>{sourceVoltage} V</small>
              </div>
              <div className="resistor-symbol">
                <div>////</div>
                <small>{resistanceK} kΩ</small>
              </div>
              <div className="capacitor-symbol">
                <div>
                  <i />
                  <i />
                </div>
                <small>{formatSI(capacitance, 'F')}</small>
              </div>
              <div className="switch-symbol">
                <i />
                <b />
                <small>{running ? 'cerrado' : 'abierto'}</small>
              </div>
              <div className="circuit-wire wire-bottom">
                <span className="moving-charge" />
              </div>
              <div className="voltage-readout">
                <span>V<sub>c</sub></span>
                <strong>{voltage.toFixed(3)} V</strong>
              </div>
            </div>
          )}

          <div className="transport-controls">
            <button className="play-button" onClick={() => setRunning((value) => !value)}>
              {running ? <CirclePause /> : <CirclePlay />}
              {running ? 'Pausar' : elapsed > 0 ? 'Reanudar' : process === 'charge' ? 'Iniciar carga' : 'Iniciar descarga'}
            </button>
            <div className="timeline">
              <span style={{ width: `${Math.min(100, (elapsed / (tau * 5)) * 100)}%` }} />
            </div>
            <time>
              {elapsed.toFixed(2)} s / {(tau * 5).toFixed(2)} s
            </time>
          </div>
        </section>

        <aside className="control-panel panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">Parámetros del Circuito</span>
              <h2>Ajusta el sistema</h2>
            </div>
            <Zap />
          </div>

          {/* Control dinámico de distancia entre placas del usuario */}
          <Slider
            label="Separación de placas (d)"
            value={distanceMm}
            min={2}
            max={15}
            step={0.5}
            unit="mm"
            onChange={handleDistanceChange}
          />
          <p className="input-note" style={{ marginTop: '-12px', marginBottom: '16px' }}>
            {distanceMm < 4 ? 'Placas muy juntas: Gran capacitancia, carga lenta.' : distanceMm > 10 ? 'Placas lejanas: Poca capacitancia, carga rápida.' : 'Ajusta para ver el movimiento físico de las placas en el canvas.'}
          </p>

          <Slider
            label="Capacitancia resultante (C)"
            value={capacitanceMicro}
            min={33}
            max={250}
            step={1}
            unit="µF"
            onChange={handleCapacitanceDirectChange}
          />

          <Slider
            label="Resistencia (R)"
            value={resistanceK}
            min={1}
            max={100}
            step={1}
            unit="kΩ"
            onChange={(value) => {
              setResistanceK(value)
              reset()
            }}
          />

          <Slider
            label="Voltaje de alimentación"
            value={sourceVoltage}
            min={1}
            max={24}
            step={1}
            unit="V"
            onChange={(value) => {
              setSourceVoltage(value)
              setInitialDischarge(value)
              reset()
            }}
          />

          <label className="select-control">
            <span>Velocidad de reproducción</span>
            <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
              <option value={0.25}>0.25×</option>
              <option value={0.5}>0.5×</option>
              <option value={1}>1×</option>
              <option value={2}>2×</option>
              <option value={4}>4×</option>
            </select>
          </label>

          <div className="tau-highlight">
            <span>Constante de tiempo</span>
            <strong>τ = {formatSI(tau, 's')}</strong>
            <small>Carga al 63.2% en 1τ · Estable en 5τ ({(tau * 5).toFixed(2)} s)</small>
          </div>
        </aside>
      </div>

      <section className="metrics-grid five" style={{ marginTop: '16px' }}>
        <MetricCard
          label="Voltaje del capacitor"
          value={`${voltage.toFixed(3)} V`}
          icon={<Battery />}
          accent="cyan"
          detail={process === 'charge' ? 'Vc = Vs(1 − e⁻ᵗ/ᴿᶜ)' : 'Vc = V₀e⁻ᵗ/ᴿᶜ'}
        />
        <MetricCard
          label="Carga almacenada"
          value={formatSI(chargeC, 'C')}
          icon={<Zap />}
          accent="orange"
          detail="Q = C · Vc"
        />
        <MetricCard
          label="Capacitancia (C)"
          value={`${capacitanceMicro} µF`}
          icon={<Layers3 />}
          accent="cyan"
          detail={`C ∝ 1/d (${distanceMm.toFixed(1)} mm)`}
        />
        <MetricCard
          label="Corriente"
          value={formatSI(current, 'A')}
          icon={<Zap />}
          accent={current < 0 ? 'orange' : 'green'}
          detail={current < 0 ? 'Sentido de descarga' : 'Sentido de carga'}
        />
        <MetricCard
          label="Progreso temporal"
          value={`${(elapsed / tau).toFixed(2)} τ`}
          icon={<Gauge />}
          accent="violet"
          detail={`t = ${elapsed.toFixed(2)} s`}
        />
      </section>

      {/* SECCIÓN DE GRÁFICA EN TIEMPO REAL */}
      <section className="panel chart-panel" style={{ marginTop: '16px' }}>
        <div className="chart-heading">
          <div>
            <span className="eyebrow">Respuesta temporal dinámica</span>
            <h2>Gráfica de Voltaje en Tiempo Real Vc(t)</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '12px',
                background: running ? 'rgba(66,232,163,0.1)' : 'rgba(55,221,234,0.06)',
                border: '1px solid var(--line)',
                fontSize: '11px',
                color: running ? 'var(--green)' : 'var(--cyan-soft)',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: running ? 'var(--green)' : 'var(--cyan)',
                  boxShadow: running ? '0 0 8px var(--green)' : 'none',
                }}
              />
              t = {elapsed.toFixed(2)}s | Vc = {voltage.toFixed(2)}V
            </span>
            <span className="simulated-pill">Seguimiento en vivo</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={combinedChartData}>
            <defs>
              <linearGradient id="chargeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#27d7e7" stopOpacity={0.45} />
                <stop offset="1" stopColor="#27d7e7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="liveFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#42e8a3" stopOpacity={0.35} />
                <stop offset="1" stopColor="#42e8a3" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#17334d" />
            <XAxis
              dataKey="t"
              stroke="#7890a5"
              label={{ value: 'Tiempo t (s)', position: 'insideBottom', offset: -4, fill: '#7890a5' }}
            />
            <YAxis stroke="#7890a5" unit=" V" domain={[0, Math.ceil(sourceVoltage * 1.1)]} />
            <Tooltip
              contentStyle={{ background: '#0a1929', border: '1px solid #23415c', borderRadius: 10 }}
              formatter={(val) => [typeof val === 'number' ? `${val.toFixed(3)} V` : String(val ?? ''), 'Voltaje']}
              labelFormatter={(label) => `t = ${label} s`}
            />
            <Legend verticalAlign="top" height={36} />

            {/* Curva teórica de Carga */}
            <Area
              type="monotone"
              dataKey="carga"
              stroke="#27d7e7"
              fill="url(#chargeFill)"
              strokeWidth={process === 'charge' ? 2.8 : 1.2}
              strokeDasharray={process === 'charge' ? undefined : '4 4'}
              opacity={process === 'charge' ? 1 : 0.4}
              name="Curva Carga Vc"
            />

            {/* Curva teórica de Descarga */}
            <Area
              type="monotone"
              dataKey="descarga"
              stroke="#ff9b52"
              fill="transparent"
              strokeWidth={process === 'discharge' ? 2.8 : 1.2}
              strokeDasharray={process === 'discharge' ? undefined : '4 4'}
              opacity={process === 'discharge' ? 1 : 0.4}
              name="Curva Descarga Vc"
            />

            {/* Trazo medido en vivo que avanza con la simulación */}
            <Area
              type="monotone"
              dataKey="progresoVc"
              stroke="#42e8a3"
              strokeWidth={3}
              fill="url(#liveFill)"
              name="Progreso en vivo Vc(t)"
              isAnimationActive={false}
            />

            {/* Línea vertical de tiempo actual t */}
            <ReferenceLine
              x={Number(elapsed.toFixed(3))}
              stroke="#37ddea"
              strokeDasharray="4 4"
              strokeWidth={2}
            />

            {/* Punto indicador en tiempo real móvil sobre la curva */}
            <ReferenceDot
              x={Number(elapsed.toFixed(3))}
              y={Number(voltage.toFixed(3))}
              r={7}
              fill={process === 'charge' ? '#37ddea' : '#ff9b52'}
              stroke="#ffffff"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      <section className="model-note panel" style={{ marginTop: '16px' }}>
        <MoveHorizontal />
        <div>
          <strong>Relación Geometría ⇄ Dinámica RC</strong>
          <p>
            Al variar la distancia <em>d</em> entre las placas paralelas, la capacitancia se recalcula instantáneamente como{' '}
            <code>C ∝ 1/d</code>. Una menor distancia aumenta la capacitancia y la constante de tiempo <code>τ = RC</code>,
            prolongando el tiempo de carga y almacenamiento de energía.
          </p>
        </div>
        <span>d = {distanceMm.toFixed(1)} mm</span>
      </section>
    </div>
  )
}
