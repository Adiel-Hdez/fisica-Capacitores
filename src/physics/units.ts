export const mmToM = (value: number) => value / 1000
export const cm2ToM2 = (value: number) => value / 10_000
export const microFaradToFarad = (value: number) => value * 1e-6
export const kiloOhmToOhm = (value: number) => value * 1000

export function formatSI(value: number, unit: string, digits = 3) {
  const abs = Math.abs(value)
  const scales = [
    { threshold: 1e9, factor: 1e9, prefix: 'G' },
    { threshold: 1e6, factor: 1e6, prefix: 'M' },
    { threshold: 1e3, factor: 1e3, prefix: 'k' },
    { threshold: 1, factor: 1, prefix: '' },
    { threshold: 1e-3, factor: 1e-3, prefix: 'm' },
    { threshold: 1e-6, factor: 1e-6, prefix: 'µ' },
    { threshold: 1e-9, factor: 1e-9, prefix: 'n' },
    { threshold: 1e-12, factor: 1e-12, prefix: 'p' },
  ]
  const match = scales.find((scale) => abs >= scale.threshold) ?? scales.at(-1)!
  const scaled = value / match.factor
  return `${Number(scaled.toPrecision(digits))} ${match.prefix}${unit}`
}
