import { describe, expect, it } from 'vitest'
import { capacitanceFromCharge, charge, connectedState, energy, isolatedState, parallelPlateCapacitance } from './capacitor'
import { chargingVoltage, dischargingVoltage, timeConstant } from './rcCircuit'
import { cm2ToM2, microFaradToFarad, mmToM } from './units'

describe('física de capacitores', () => {
  it('calcula C = Q/V', () => expect(capacitanceFromCharge(6e-6, 3)).toBeCloseTo(2e-6, 12))
  it('calcula Q = CV', () => expect(charge(2e-6, 3)).toBeCloseTo(6e-6, 12))
  it('calcula tau = RC', () => expect(timeConstant(10_000, 100e-6)).toBeCloseTo(1, 12))
  it('duplicar distancia reduce C a la mitad', () => {
    const c = parallelPlateCapacitance(0.01, 0.001, 1)
    expect(parallelPlateCapacitance(0.01, 0.002, 1)).toBeCloseTo(c / 2, 15)
  })
  it('duplicar área duplica C', () => expect(parallelPlateCapacitance(0.02, 0.001)).toBeCloseTo(2 * parallelPlateCapacitance(0.01, 0.001), 15))
  it('duplicar permitividad duplica C', () => expect(parallelPlateCapacitance(0.01, 0.001, 2)).toBeCloseTo(2 * parallelPlateCapacitance(0.01, 0.001, 1), 15))
  it('duplicar voltaje cuadruplica energía', () => expect(energy(1e-6, 10)).toBeCloseTo(4 * energy(1e-6, 5), 15))
  it('modo aislado conserva la carga', () => expect(isolatedState(0.01, 0.004, 1, 1e-9).chargeC).toBe(1e-9))
  it('modo conectado conserva el voltaje', () => expect(connectedState(0.01, 0.004, 1, 12).voltageV).toBe(12))
  it('alcanza 63.2% tras 1 tau', () => expect(chargingVoltage(timeConstant(1000, 1e-3), 10, 1000, 1e-3) / 10).toBeCloseTo(0.6321, 3))
  it('conserva 36.8% tras 1 tau', () => expect(dischargingVoltage(1, 10, 1000, 1e-3) / 10).toBeCloseTo(0.3679, 3))
  it('convierte unidades', () => {
    expect(mmToM(1)).toBe(0.001)
    expect(cm2ToM2(100)).toBe(0.01)
    expect(microFaradToFarad(1)).toBe(1e-6)
  })
  it('rechaza entradas inválidas', () => expect(() => parallelPlateCapacitance(1, 0)).toThrow())
})
