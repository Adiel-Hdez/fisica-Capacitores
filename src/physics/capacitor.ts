export const EPSILON_0 = 8.8541878128e-12

export const DIELECTRICS = {
  'Vacío': 1,
  'Aire': 1.0006,
  'Papel': 3.5,
  'Vidrio': 5.5,
  'Cerámica': 10,
} as const

export type DielectricName = keyof typeof DIELECTRICS

function positive(value: number, name: string) {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} debe ser mayor que cero.`)
  return value
}

export function capacitanceFromCharge(chargeC: number, voltageV: number) {
  positive(voltageV, 'El voltaje')
  return chargeC / voltageV
}

export function parallelPlateCapacitance(areaM2: number, distanceM: number, epsilonR = 1) {
  positive(areaM2, 'El área')
  positive(distanceM, 'La distancia')
  positive(epsilonR, 'La permitividad relativa')
  return (EPSILON_0 * epsilonR * areaM2) / distanceM
}

export const charge = (capacitanceF: number, voltageV: number) => capacitanceF * voltageV
export const energy = (capacitanceF: number, voltageV: number) => 0.5 * capacitanceF * voltageV ** 2

export function electricField(voltageV: number, distanceM: number) {
  positive(distanceM, 'La distancia')
  return voltageV / distanceM
}

export interface CapacitorState {
  capacitanceF: number
  chargeC: number
  voltageV: number
  energyJ: number
  electricFieldVm: number
}

export function connectedState(areaM2: number, distanceM: number, epsilonR: number, voltageV: number): CapacitorState {
  const capacitanceF = parallelPlateCapacitance(areaM2, distanceM, epsilonR)
  return {
    capacitanceF,
    chargeC: charge(capacitanceF, voltageV),
    voltageV,
    energyJ: energy(capacitanceF, voltageV),
    electricFieldVm: electricField(voltageV, distanceM),
  }
}

export function isolatedState(areaM2: number, distanceM: number, epsilonR: number, fixedChargeC: number): CapacitorState {
  const capacitanceF = parallelPlateCapacitance(areaM2, distanceM, epsilonR)
  const voltageV = fixedChargeC / capacitanceF
  return {
    capacitanceF,
    chargeC: fixedChargeC,
    voltageV,
    energyJ: fixedChargeC ** 2 / (2 * capacitanceF),
    electricFieldVm: electricField(voltageV, distanceM),
  }
}
