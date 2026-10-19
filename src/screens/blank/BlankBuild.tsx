import { Navigate, useParams } from 'react-router-dom'
import Step1 from './build/Step1'
import Step2 from './build/Step2'
import Step3 from './build/Step3'
import Step4 from './build/Step4'
import Step5 from './build/Step5'
import Step6 from './build/Step6'
import Step7 from './build/Step7'

const STEPS = [Step1, Step2, Step3, Step4, Step5, Step6, Step7]

/** Path B canvas, B1–B7: /blank/build/:step */
export default function BlankBuild() {
  const { step } = useParams()
  const n = Number(step)
  const Step = STEPS[n - 1]
  if (!Step) return <Navigate to="/blank/build/1" replace />
  return <Step />
}
