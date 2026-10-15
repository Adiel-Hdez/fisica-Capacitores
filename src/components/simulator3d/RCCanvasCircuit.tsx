import { useCallback, useEffect, useRef } from 'react'

interface RCCanvasCircuitProps {
  sourceVoltage: number
  resistanceK: number
  distanceMm: number
  process: 'charge' | 'discharge'
  onProcessChange: (p: 'charge' | 'discharge') => void
  running: boolean
  currentVoltage: number
  currentCharge: number
  capacitanceMicro: number
  tau: number
  onDistanceChange?: (d: number) => void
}

export default function RCCanvasCircuit({
  sourceVoltage,
  resistanceK,
  distanceMm,
  process,
  onProcessChange,
  running,
  currentVoltage,
  currentCharge,
  capacitanceMicro,
}: RCCanvasCircuitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)
  const chargeOffsetRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  // Keep latest props in ref for animation loop
  const stateRef = useRef({
    sourceVoltage,
    resistanceK,
    distanceMm,
    process,
    running,
    currentVoltage,
    currentCharge,
    capacitanceMicro,
  })

  useEffect(() => {
    stateRef.current = {
      sourceVoltage,
      resistanceK,
      distanceMm,
      process,
      running,
      currentVoltage,
      currentCharge,
      capacitanceMicro,
    }
  }, [sourceVoltage, resistanceK, distanceMm, process, running, currentVoltage, currentCharge, capacitanceMicro])

  // Click on the switch inside the canvas to toggle charge/discharge
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const circuitHeight = Math.min(rect.height * 0.58, 280)
    const topY = centerY - circuitHeight / 2

    // Switch area around centerX, topY
    if (Math.abs(x - centerX) < 70 && Math.abs(y - topY) < 60) {
      onProcessChange(process === 'charge' ? 'discharge' : 'charge')
    }
  }

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const {
      sourceVoltage: Vs,
      resistanceK: Rk,
      distanceMm: dist,
      process: targetState,
      running: isRunning,
      currentVoltage: Vc,
      currentCharge: Qc,
    } = stateRef.current

    const width = canvas.clientWidth
    const height = canvas.clientHeight

    // HiDPI support
    const dpr = window.devicePixelRatio || 1
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr
      canvas.height = height * dpr
    }

    ctx.save()
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    const centerX = width / 2
    const centerY = height / 2 + 5
    const circuitWidth = Math.min(width * 0.76, 560)
    const circuitHeight = Math.min(height * 0.56, 260)

    const leftX = centerX - circuitWidth / 2
    const rightX = centerX + circuitWidth / 2
    const topY = centerY - circuitHeight / 2
    const bottomY = centerY + circuitHeight / 2

    // --- 1. DIBUJAR CABLES CONDUCTORES ---
    ctx.strokeStyle = '#2b4d6b'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()

    // Cable inferior completo
    ctx.moveTo(leftX, bottomY)
    ctx.lineTo(rightX, bottomY)

    // Lateral izquierdo (hacia batería)
    ctx.moveTo(leftX, bottomY)
    ctx.lineTo(leftX, topY)

    // Superior izquierdo (batería a switch pos 1)
    const t1X = centerX - 45
    const tComX = centerX + 45
    const t2X = centerX
    const switchDropY = topY + 45

    ctx.moveTo(leftX, topY)
    ctx.lineTo(t1X, topY)

    // Superior derecho (switch common a capacitor)
    ctx.moveTo(tComX, topY)
    ctx.lineTo(rightX, topY)

    // Rama central de descarga (conecta cable inferior con posición 2 del switch)
    ctx.moveTo(t2X, bottomY)
    ctx.lineTo(t2X, switchDropY)

    // Conexiones laterales hacia el capacitor
    const plateHeight = Math.min(circuitHeight * 0.65, 130)
    ctx.moveTo(rightX, topY)
    ctx.lineTo(rightX, centerY - plateHeight / 2)
    ctx.moveTo(rightX, bottomY)
    ctx.lineTo(rightX, centerY + plateHeight / 2)

    ctx.stroke()

    // --- 2. BATERÍA (LATERAL IZQUIERDO) ---
    ctx.fillStyle = '#071524'
    ctx.fillRect(leftX - 8, centerY - 32, 16, 64)
    ctx.strokeStyle = '#1b3b5c'
    ctx.lineWidth = 1
    ctx.strokeRect(leftX - 8, centerY - 32, 16, 64)

    // Placa positiva de batería (+)
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(leftX - 22, centerY - 12)
    ctx.lineTo(leftX + 22, centerY - 12)
    ctx.stroke()

    // Placa negativa de batería (-)
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.moveTo(leftX - 12, centerY + 12)
    ctx.lineTo(leftX + 12, centerY + 12)
    ctx.stroke()

    // Etiquetas batería
    ctx.font = 'bold 15px Inter, sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ef4444'
    ctx.fillText('+', leftX - 28, centerY - 12)

    ctx.fillStyle = '#3b82f6'
    ctx.fillText('−', leftX - 20, centerY + 12)

    ctx.textAlign = 'center'
    ctx.font = '600 12px ui-monospace, monospace'
    ctx.fillStyle = '#a8c7e0'
    ctx.fillText(`${Vs.toFixed(0)} V`, leftX, centerY + 46)

    // --- 3. RESISTENCIA R (RAMA SUPERIOR DERECHA) ---
    const rStartX = rightX - circuitWidth * 0.28
    const rEndX = rightX - circuitWidth * 0.1
    const rLen = rEndX - rStartX

    // Fondo protector para la resistencia
    ctx.fillStyle = '#06121f'
    ctx.fillRect(rStartX - 4, topY - 14, rLen + 8, 28)

    // Zigzag
    ctx.strokeStyle = '#ffd568'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(rStartX, topY)
    const zigSteps = 6
    for (let i = 1; i <= zigSteps; i++) {
      const zx = rStartX + (i * rLen) / zigSteps
      const zy = topY + (i === zigSteps ? 0 : i % 2 === 0 ? -9 : 9)
      ctx.lineTo(zx, zy)
    }
    ctx.stroke()

    ctx.font = '600 11px ui-monospace, monospace'
    ctx.fillStyle = '#ffd568'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`R = ${Rk} kΩ`, rStartX + rLen / 2, topY - 12)

    // --- 4. INTERRUPTOR (SWITCH SELECTOR) ---
    // Terminales del switch (círculos)
    ctx.fillStyle = '#8ea7bd'
    ;[
      { x: t1X, y: topY },
      { x: tComX, y: topY },
      { x: t2X, y: switchDropY },
    ].forEach((pt) => {
      ctx.beginPath()
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#10273f'
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // Brazo del interruptor
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(tComX, topY)
    if (targetState === 'charge') {
      ctx.lineTo(t1X + 4, topY - 6)
      ctx.strokeStyle = '#37ddea'
    } else {
      ctx.lineTo(t2X + 2, switchDropY - 3)
      ctx.strokeStyle = '#ff9b52'
    }
    ctx.stroke()

    // Etiquetas de modo del switch
    ctx.font = '700 9px ui-monospace, monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillStyle = targetState === 'charge' ? '#37ddea' : '#577288'
    ctx.fillText('1 · CARGA', t1X, topY - 10)

    ctx.textBaseline = 'top'
    ctx.fillStyle = targetState === 'discharge' ? '#ff9b52' : '#577288'
    ctx.fillText('2 · DESCARGA', t2X, switchDropY + 7)

    // --- 5. CAPACITOR CON SEPARACIÓN VARIABLE DE PLACAS ---
    // El gap visual escala directamente con distanceMm (2 mm a 15 mm -> ~22px a ~90px)
    const gapScale = Math.min(width * 0.12, 6)
    const gap = Math.max(18, dist * gapScale)
    const plateWidth = 14
    const leftPlateX = rightX - gap / 2 - plateWidth
    const rightPlateX = rightX + gap / 2

    // Conectores que van desde los cables hacia las placas
    ctx.strokeStyle = '#2b4d6b'
    ctx.lineWidth = 4
    ctx.beginPath()
    // A placa izquierda superior
    ctx.moveTo(rightX, centerY - plateHeight / 2)
    ctx.lineTo(leftPlateX + plateWidth / 2, centerY - plateHeight / 2)
    // A placa derecha inferior
    ctx.moveTo(rightX, centerY + plateHeight / 2)
    ctx.lineTo(rightPlateX + plateWidth / 2, centerY + plateHeight / 2)
    ctx.stroke()

    // CAMPO ELÉCTRICO ENTRE PLACAS (Brillo y líneas de campo)
    if (Vc > 0.05) {
      const fieldRatio = Math.min(Math.max(Vc / Math.max(Vs, 1), 0), 1)
      const alpha = 0.08 + fieldRatio * 0.42

      // Fondo coloreado del campo
      const grad = ctx.createLinearGradient(leftPlateX + plateWidth, 0, rightPlateX, 0)
      grad.addColorStop(0, `rgba(239, 68, 68, ${alpha * 0.5})`)
      grad.addColorStop(0.5, `rgba(178, 146, 255, ${alpha})`)
      grad.addColorStop(1, `rgba(59, 130, 246, ${alpha * 0.5})`)
      ctx.fillStyle = grad
      ctx.fillRect(leftPlateX + plateWidth, centerY - plateHeight / 2 + 4, gap, plateHeight - 8)

      // Líneas de campo eléctrico con flechas (de + a -)
      const numLines = Math.min(7, Math.max(3, Math.floor(fieldRatio * 7)))
      ctx.strokeStyle = `rgba(178, 146, 255, ${Math.min(alpha + 0.3, 0.85)})`
      ctx.lineWidth = 1.5
      for (let i = 1; i <= numLines; i++) {
        const ly = centerY - plateHeight / 2 + (i * plateHeight) / (numLines + 1)
        ctx.beginPath()
        ctx.moveTo(leftPlateX + plateWidth + 4, ly)
        ctx.lineTo(rightPlateX - 4, ly)
        ctx.stroke()

        // Pequeña flecha hacia la derecha
        const arrowX = leftPlateX + plateWidth + gap / 2
        ctx.beginPath()
        ctx.moveTo(arrowX - 4, ly - 3)
        ctx.lineTo(arrowX + 2, ly)
        ctx.lineTo(arrowX - 4, ly + 3)
        ctx.stroke()
      }
    }

    // PLACAS METÁLICAS
    // Placa Izquierda (Positiva durante carga)
    ctx.fillStyle = '#1c344d'
    ctx.fillRect(leftPlateX, centerY - plateHeight / 2, plateWidth, plateHeight)
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.strokeRect(leftPlateX, centerY - plateHeight / 2, plateWidth, plateHeight)

    // Placa Derecha (Negativa durante carga)
    ctx.fillStyle = '#1c344d'
    ctx.fillRect(rightPlateX, centerY - plateHeight / 2, plateWidth, plateHeight)
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.strokeRect(rightPlateX, centerY - plateHeight / 2, plateWidth, plateHeight)

    // Indicador de distancia entre placas (Cota con flechas)
    const dimensionY = centerY + plateHeight / 2 + 18
    ctx.strokeStyle = '#37ddea'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(leftPlateX + plateWidth, dimensionY)
    ctx.lineTo(rightPlateX, dimensionY)
    // Topes de la cota
    ctx.moveTo(leftPlateX + plateWidth, dimensionY - 4)
    ctx.lineTo(leftPlateX + plateWidth, dimensionY + 4)
    ctx.moveTo(rightPlateX, dimensionY - 4)
    ctx.lineTo(rightPlateX, dimensionY + 4)
    ctx.stroke()

    ctx.font = '600 10px ui-monospace, monospace'
    ctx.fillStyle = '#37ddea'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(`d = ${dist.toFixed(1)} mm`, (leftPlateX + plateWidth + rightPlateX) / 2, dimensionY + 5)

    // CARGAS (+ y -) EN LAS PLACAS
    const maxVisualCharges = 24
    const chargeRatio = Math.min(Math.max(Vc / Math.max(Vs, 1), 0), 1)
    const numCharges = Math.floor(chargeRatio * maxVisualCharges)

    if (numCharges > 0) {
      ctx.font = 'bold 12px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (let i = 0; i < numCharges; i++) {
        // Distribución pseudo-aleatoria uniforme sobre la altura de la placa
        const frac = (i + 0.5) / numCharges
        const py = centerY - plateHeight / 2 + 10 + frac * (plateHeight - 20)

        // Cargas + en placa izquierda
        ctx.fillStyle = '#ef4444'
        ctx.fillText('+', leftPlateX + plateWidth / 2, py)

        // Cargas - en placa derecha
        ctx.fillStyle = '#3b82f6'
        ctx.fillText('−', rightPlateX + plateWidth / 2, py)
      }
    }

    // --- 6. ANIMACIÓN DE CARGAS EN MOVIMIENTO POR LOS CABLES (CORRIENTE I) ---
    if (isRunning && Vc > 0.02) {
      ctx.fillStyle = targetState === 'charge' ? '#37ddea' : '#ff9b52'

      const offset = chargeOffsetRef.current
      const spacing = 36

      // Cargas en cable superior
      for (let x = leftX + (offset % spacing); x < rightX; x += spacing) {
        if (targetState === 'discharge' && x < t2X) continue
        ctx.beginPath()
        ctx.arc(x, topY, 3, 0, Math.PI * 2)
        ctx.fill()
      }

      // Cargas en cable inferior
      for (let x = rightX - (offset % spacing); x > leftX; x -= spacing) {
        if (targetState === 'discharge' && x < t2X) continue
        ctx.beginPath()
        ctx.arc(x, bottomY, 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Placa superior e inferior - Lectura Vc y Q
    ctx.font = '600 11px ui-monospace, monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(`Vc = ${Vc.toFixed(2)} V · Q = ${(Qc * 1e6).toFixed(1)} µC`, rightX, centerY - plateHeight / 2 - 14)

    ctx.restore()
  }, [])

  // Bucle de animación continuo para render fluido a 60 fps
  useEffect(() => {
    let animId = 0
    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000
      lastTimeRef.current = now

      if (stateRef.current.running) {
        // Velocidad de las bolitas de corriente proporcional al gradiente de voltaje
        const speed = Math.max(0.5, stateRef.current.currentVoltage / stateRef.current.sourceVoltage) * 55
        chargeOffsetRef.current = (chargeOffsetRef.current + dt * speed) % 1000
      }

      render()
      animId = requestAnimationFrame(loop)
    }

    lastTimeRef.current = performance.now()
    animId = requestAnimationFrame(loop)
    animFrameRef.current = animId

    return () => cancelAnimationFrame(animId)
  }, [render])

  return (
    <div ref={containerRef} className="rc-canvas-container" style={{ position: 'relative', width: '100%', height: '370px' }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: 'pointer',
          borderRadius: '16px',
          background: 'radial-gradient(circle at 50% 50%, rgba(19, 66, 96, 0.18), transparent 70%), #07111c',
          border: '1px solid rgba(139, 193, 228, 0.12)',
        }}
        title="Haz clic sobre el interruptor para alternar entre Carga y Descarga"
      />
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '16px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          background: 'rgba(5, 14, 24, 0.78)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 193, 228, 0.16)',
          fontSize: '10px',
          color: '#8ea7bd',
          pointerEvents: 'none',
        }}
      >
        <span style={{ color: '#37ddea', fontWeight: 600 }}>Tip:</span>
        <span>Haz clic en el switch para alternar o usa el control de distancia</span>
      </div>
    </div>
  )
}
