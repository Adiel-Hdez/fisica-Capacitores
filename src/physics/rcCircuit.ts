function nonNegative(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${name} no puede ser negativo.`)
  return value
}

export function timeConstant(resistanceOhm: number, capacitanceF: number) {
  if (resistanceOhm <= 0 || capacitanceF <= 0) throw new Error('R y C deben ser mayores que cero.')
  return resistanceOhm * capacitanceF
}

export function chargingVoltage(timeS: number, sourceVoltage: number, resistanceOhm: number, capacitanceF: number) {
  nonNegative(timeS, 'El tiempo')
  return sourceVoltage * (1 - Math.exp(-timeS / timeConstant(resistanceOhm, capacitanceF)))
}

export function dischargingVoltage(timeS: number, initialVoltage: number, resistanceOhm: number, capacitanceF: number) {
  nonNegative(timeS, 'El tiempo')
  return initialVoltage * Math.exp(-timeS / timeConstant(resistanceOhm, capacitanceF))
}

export function chargingCurrent(timeS: number, sourceVoltage: number, resistanceOhm: number, capacitanceF: number) {
  return (sourceVoltage / resistanceOhm) * Math.exp(-timeS / timeConstant(resistanceOhm, capacitanceF))
}

export function dischargingCurrent(timeS: number, initialVoltage: number, resistanceOhm: number, capacitanceF: number) {
  return -(initialVoltage / resistanceOhm) * Math.exp(-timeS / timeConstant(resistanceOhm, capacitanceF))
}
