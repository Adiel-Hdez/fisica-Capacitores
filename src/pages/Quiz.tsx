import { useState } from 'react'
import { Award, CheckCircle2, GraduationCap, RotateCcw, XCircle } from 'lucide-react'
import { PageHeader } from '../components/common/Controls'

const questions = [
  { q: '¿Qué almacena principalmente un capacitor ideal?', options: ['Energía en un campo eléctrico', 'Electrones dentro del dieléctrico', 'Energía química', 'Corriente permanente'], answer: 0, why: 'La energía se almacena en el campo eléctrico establecido entre las placas.' },
  { q: '¿Qué separa las placas conductoras?', options: ['Un resistor', 'Un dieléctrico', 'Una batería', 'Un semiconductor obligatorio'], answer: 1, why: 'El dieléctrico es el material aislante entre los conductores.' },
  { q: 'La unidad SI de capacitancia es…', options: ['Voltio', 'Culombio', 'Faradio', 'Ohmio'], answer: 2, why: 'El faradio (F) equivale a un culombio por voltio.' },
  { q: 'Si se duplica el área de placas y todo lo demás permanece igual, C…', options: ['Se reduce a la mitad', 'No cambia', 'Se cuadruplica', 'Se duplica'], answer: 3, why: 'C = εA/d: la capacitancia es directamente proporcional al área.' },
  { q: 'Si se duplica la distancia entre placas, C…', options: ['Se reduce a la mitad', 'Se duplica', 'No cambia', 'Se hace cero'], answer: 0, why: 'La capacitancia es inversamente proporcional a d.' },
  { q: '¿Qué efecto tiene un dieléctrico con mayor εᵣ?', options: ['Disminuye C', 'Aumenta C', 'Elimina el campo', 'Cambia la unidad'], answer: 1, why: 'La polarización del dieléctrico permite almacenar más carga al mismo voltaje.' },
  { q: 'En el modelo ideal, el campo entre placas vale aproximadamente…', options: ['E = Vd', 'E = QV', 'E = V/d', 'E = RC'], answer: 2, why: 'Para placas paralelas con campo uniforme, E ≈ V/d.' },
  { q: 'Con batería ideal conectada, al cambiar d permanece constante…', options: ['La carga', 'La energía', 'La capacitancia', 'El voltaje'], answer: 3, why: 'La fuente impone su diferencia de potencial.' },
  { q: 'En un capacitor aislado ideal permanece constante…', options: ['La carga', 'El voltaje', 'La capacitancia', 'La distancia'], answer: 0, why: 'Sin camino conductor no entra ni sale carga neta de las placas.' },
  { q: 'La constante de tiempo de un circuito RC es…', options: ['R/C', 'RC', 'C/R', '1/RC'], answer: 1, why: 'τ = RC y sus unidades son segundos.' },
  { q: 'Después de 1τ de carga, Vc alcanza aproximadamente…', options: ['36.8%', '50%', '63.2%', '100%'], answer: 2, why: '1 − e⁻¹ ≈ 0.632.' },
  { q: 'Después de 1τ de descarga, permanece aproximadamente…', options: ['0%', '63.2%', '50%', '36.8%'], answer: 3, why: 'e⁻¹ ≈ 0.368.' },
  { q: 'Si V se duplica con C constante, la energía…', options: ['Se cuadruplica', 'Se duplica', 'No cambia', 'Se reduce'], answer: 0, why: 'U = ½CV²; la dependencia es cuadrática.' },
  { q: '¿Qué capacitor suele ser polarizado?', options: ['De película', 'Electrolítico', 'Cerámico multicapa', 'Variable mecánico'], answer: 1, why: 'Los electrolíticos convencionales requieren respetar la polaridad.' },
  { q: 'Una pantalla táctil capacitiva detecta…', options: ['Calor exclusivamente', 'Presión mecánica pura', 'Cambios de capacitancia', 'Radiación ionizante'], answer: 2, why: 'La proximidad del dedo modifica el acoplamiento capacitivo local.' },
]

export default function Quiz() {
  const [index, setIndex] = useState(0), [selected, setSelected] = useState<number | null>(null), [answers, setAnswers] = useState<boolean[]>([]), [finished, setFinished] = useState(false)
  const question = questions[index]
  const score = answers.filter(Boolean).length
  const choose = (option: number) => { if (selected !== null) return; setSelected(option); setAnswers((current) => [...current, option === question.answer]) }
  const next = () => { if (index === questions.length - 1) setFinished(true); else { setIndex((value) => value + 1); setSelected(null) } }
  const restart = () => { setIndex(0); setSelected(null); setAnswers([]); setFinished(false) }
  return <div className="page quiz-page"><PageHeader eyebrow="Módulo 09 · Autoevaluación" title="Pon a prueba tu comprensión" description="15 preguntas con corrección inmediata y explicación física." />
    {finished ? <section className="quiz-result panel"><div className="award-ring"><Award /></div><span className="eyebrow">Resultado final</span><h2>{score} / {questions.length}</h2><strong>{score >= 13 ? 'Dominio excelente' : score >= 10 ? 'Muy buen progreso' : score >= 7 ? 'Base en construcción' : 'Conviene repasar los fundamentos'}</strong><p>Has respondido correctamente el {Math.round(score / questions.length * 100)}% de la evaluación.</p><div className="score-track"><span style={{ width: `${score / questions.length * 100}%` }} /></div><button className="button primary" onClick={restart}><RotateCcw /> Repetir evaluación</button></section> : <section className="quiz-card panel"><div className="quiz-progress"><span>Pregunta {index + 1} de {questions.length}</span><strong>{score} correctas</strong><div><i style={{ width: `${(index + 1) / questions.length * 100}%` }} /></div></div><div className="question-icon"><GraduationCap /></div><h2>{question.q}</h2><div className="quiz-options">{question.options.map((option, optionIndex) => { const answered = selected !== null; const correct = optionIndex === question.answer; const chosen = selected === optionIndex; return <button key={option} className={answered ? correct ? 'correct' : chosen ? 'wrong' : 'muted' : ''} onClick={() => choose(optionIndex)}><span>{String.fromCharCode(65 + optionIndex)}</span>{option}{answered && correct && <CheckCircle2 />}{answered && chosen && !correct && <XCircle />}</button> })}</div>{selected !== null && <div className={`answer-feedback ${selected === question.answer ? 'correct' : 'wrong'}`}><div>{selected === question.answer ? <CheckCircle2 /> : <XCircle />}<strong>{selected === question.answer ? '¡Correcto!' : 'Revisa esta idea'}</strong></div><p>{question.why}</p><button className="button primary" onClick={next}>{index === questions.length - 1 ? 'Ver resultado' : 'Siguiente pregunta'}</button></div>}</section>}
  </div>
}
