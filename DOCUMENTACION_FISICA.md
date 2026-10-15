# Documentación física de CapaciLab

## Constantes y unidades

La permitividad del vacío utilizada es:

`ε₀ = 8.8541878128 × 10⁻¹² F/m`

Todos los cálculos internos se realizan en unidades SI. La interfaz convierte milímetros a metros, centímetros cuadrados a metros cuadrados, kiloohmios a ohmios y microfaradios a faradios antes de evaluar las ecuaciones.

## Capacitancia y geometría

La definición operacional de capacitancia es `C = Q/V`. Para un capacitor ideal de placas paralelas:

`C = ε₀ εᵣ A / d`

Aquí `A` es el área enfrentada, `d` la separación y `εᵣ` la permitividad relativa del dieléctrico. El modelo supone placas extensas comparadas con su separación, un dieléctrico homogéneo y ausencia de efectos de borde.

Consecuencias verificadas:

- Duplicar `d` reduce `C` a la mitad.
- Duplicar `A` duplica `C`.
- Duplicar `εᵣ` duplica `C`.

El ejemplo incluido usa `A = 0.01 m²`, `d = 0.001 m` y `εᵣ = 1`, con resultado `C ≈ 88.54 pF`. Al duplicar `d` a `0.002 m`, se obtiene `C ≈ 44.27 pF`.

## Carga, campo y energía

- Carga: `Q = CV`.
- Campo ideal: `E ≈ V/d`.
- Energía: `U = ½CV²`.

El campo se considera aproximadamente uniforme entre las placas. Las líneas visuales indican dirección desde la placa positiva a la negativa, pero su cantidad no mide la intensidad. El modelo no representa electrones atravesando el dieléctrico.

## Batería conectada y capacitor aislado

### Batería conectada

Una fuente ideal conserva el voltaje impuesto. Si cambia la geometría, se recalculan `C`, `Q = CV` y `U = ½CV²`; la batería permite el intercambio de carga necesario.

### Capacitor aislado

Al desconectar el capacitor, CapaciLab captura la carga existente en ese instante. Después conserva `Q`; si cambia la geometría, calcula:

- `V = Q/C`.
- `U = Q²/(2C)`.
- `E ≈ V/d`.

Al reconectar, vuelve a imponerse el voltaje configurado por la fuente y la carga se recalcula como `Q = CV`.

## Circuitos RC

La constante de tiempo es `τ = RC`.

Durante la carga desde cero:

- `Vc(t) = Vs(1 − e^(−t/RC))`.
- `I(t) = (Vs/R)e^(−t/RC)`.

Durante la descarga desde `V₀`:

- `Vc(t) = V₀e^(−t/RC)`.
- `I(t) = −(V₀/R)e^(−t/RC)`.

Después de una constante de tiempo, la carga alcanza aproximadamente `63.2%` del valor final y la descarga conserva aproximadamente `36.8%` del valor inicial. A `5τ`, el proceso supera el `99%` de aproximación al estado final.

La animación usa diferencias de tiempo entre fotogramas y descarta el intervalo de pausa, por lo que pausar y reanudar no acumula tiempo ficticio.

## Permitividad relativa

Los valores incluidos son representativos y se identifican como aproximados:

| Material | εᵣ aproximada |
|---|---:|
| Vacío | 1 |
| Aire | 1.0006 |
| Papel | 3.5 |
| Vidrio | 5.5 |
| Cerámica | 10 |

En materiales reales, εᵣ varía con la composición, la frecuencia y la temperatura.

## Validaciones automatizadas

`src/physics/physics.test.ts` comprueba:

1. `C = Q/V`.
2. Relaciones con distancia, área y permitividad.
3. Dependencia cuadrática de la energía con el voltaje.
4. Conservación de carga en modo aislado.
5. Conservación del voltaje impuesto en modo conectado.
6. Porcentajes de carga y descarga en `1τ`.
7. Conversiones de unidades.
8. Rechazo de entradas físicas inválidas.

Se usan comparaciones con tolerancia para evitar falsos errores por aritmética de punto flotante.
