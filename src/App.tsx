import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import './App.css'

const Home = lazy(() => import('./pages/Home'))
const Fundamentals = lazy(() => import('./pages/Fundamentals'))
const CapacitorSimulator = lazy(() => import('./pages/CapacitorSimulator'))
const RCCharging = lazy(() => import('./pages/RCCharging'))
const RCCircuits = lazy(() => import('./pages/RCCircuits'))
const Graphs = lazy(() => import('./pages/Graphs'))
const Calculator = lazy(() => import('./pages/Calculator'))
const Applications = lazy(() => import('./pages/Applications'))
const Experiments = lazy(() => import('./pages/Experiments'))
const Quiz = lazy(() => import('./pages/Quiz'))
const PresentationMode = lazy(() => import('./pages/PresentationMode'))

export default function App() {
  return <BrowserRouter><Suspense fallback={<div className="route-loader"><span /><strong>Cargando laboratorio…</strong></div>}><Routes>
    <Route element={<AppShell />}>
      <Route index element={<Home />} />
      <Route path="fundamentos" element={<Fundamentals />} />
      <Route path="simulador-3d" element={<CapacitorSimulator />} />
      <Route path="carga-descarga" element={<RCCharging />} />
      <Route path="circuitos-rc" element={<RCCircuits />} />
      <Route path="graficas" element={<Graphs />} />
      <Route path="calculadora" element={<Calculator />} />
      <Route path="aplicaciones" element={<Applications />} />
      <Route path="experimentos" element={<Experiments />} />
      <Route path="evaluacion" element={<Quiz />} />
    </Route>
    <Route path="exposicion" element={<PresentationMode />} />
  </Routes></Suspense></BrowserRouter>
}
