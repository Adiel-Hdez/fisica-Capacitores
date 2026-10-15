# CapaciLab — Laboratorio Virtual de Capacitores

Aplicación educativa universitaria para explorar capacitancia, campo eléctrico, energía y dinámica de circuitos RC mediante simulaciones interactivas, una escena 3D y cálculos basados en ecuaciones físicas.

## Tecnologías

- React 19, TypeScript y Vite 8.
- Three.js, React Three Fiber y Drei para la escena 3D.
- Recharts para gráficas científicas.
- Motion para transiciones de interfaz.
- Lucide React para iconografía.
- React Router para navegación.
- Vitest para validación matemática automatizada.
- CSS responsive propio, sin recursos visuales externos.

## Requisitos e instalación

- Node.js 20.19+ o 22.12+.
- npm 10+.

```bash
npm install
npm run dev
```

Vite mostrará la URL local, normalmente `http://localhost:5173`.

## Comandos

```bash
npm run dev      # desarrollo con recarga en caliente
npm test         # pruebas físicas con Vitest
npm run build    # compilación de producción
npm run preview  # vista previa de dist/
```

## Módulos

1. Inicio y ruta de aprendizaje.
2. Fundamentos, magnitudes, fórmulas y ejemplo guiado.
3. Simulador 3D de placas paralelas con modos conectado y aislado.
4. Simulador de carga y descarga RC con pausa, reanudación y velocidad.
5. Constante de tiempo y tabla de 1τ a 5τ.
6. Siete gráficas calculadas y exportación CSV/PNG.
7. Seis calculadoras con conversión, sustitución y procedimiento.
8. Tipos de capacitores y aplicaciones tecnológicas.
9. Seis experimentos guiados con tabla de resultados.
10. Evaluación de 15 preguntas con retroalimentación.
11. Modo exposición con escenarios y pantalla completa.

## Estructura principal

```text
src/
  components/
    common/          controles y tarjetas reutilizables
    layout/          navegación general
    simulator3d/     escena Three.js y alternativa 2D
  pages/             módulos educativos y simuladores
  physics/           ecuaciones, unidades y pruebas
```

## Fórmulas implementadas

- `C = Q / V`
- `C = ε₀ εᵣ A / d`
- `Q = C V`
- `U = ½ C V²`
- `E ≈ V / d`
- `τ = R C`
- `Vc,carga(t) = Vs(1 − e^(−t/RC))`
- `Vc,descarga(t) = V₀ e^(−t/RC)`
- Corrientes exponenciales de carga y descarga.

## Suposiciones y limitaciones

- El capacitor 3D usa el modelo ideal de placas paralelas; desprecia efectos de borde.
- La densidad de líneas de campo es ilustrativa y no constituye una medición.
- Las permitividades relativas son valores representativos; dependen de composición, temperatura y frecuencia.
- La fuente y los componentes RC son ideales.
- Los datos de las gráficas son simulados matemáticamente, no mediciones experimentales.
- Si WebGL no está disponible, aparece una representación 2D funcional.
- El estado se mantiene en memoria del navegador; no se utiliza base de datos.

Para el detalle científico y las validaciones, consulta [DOCUMENTACION_FISICA.md](./DOCUMENTACION_FISICA.md).
