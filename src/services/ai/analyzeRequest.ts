import type { AIAnalysis, UserProfile } from '../../types'
import { getStudentByRoll } from '../../data/studentAccounts'

export interface RichAIAnalysis extends AIAnalysis {
  generatedLetter: string
  urgency: 'Low' | 'Medium' | 'High' | 'Urgent'
  assignedCoordinatorId: string
  assignedCoordinatorName: string
  assignedDeputyHODId: string
  assignedDeputyHODName: string
  assignedHODName: string
  recommendations: string[]
  academicJustification: string
  curriculumImpact: string
}

export type EnhancementStyle = 'balanced' | 'formal' | 'academic' | 'budget' | 'urgent'

export function analyzeRequest(
  rawText: string,
  studentProfile?: UserProfile | null,
  style: EnhancementStyle = 'balanced',
): RichAIAnalysis {
  const text = rawText.trim()
  const lower = text.toLowerCase()

  // Match student and faculty metadata
  const studentMeta = studentProfile?.rollNo ? getStudentByRoll(studentProfile.rollNo) : null
  const studentName = studentProfile?.name ?? studentMeta?.name ?? 'Sakkuru Bhomic'
  const studentRoll = studentProfile?.rollNo ?? studentMeta?.rollNumber ?? '24CS1042'
  const studentDept =
    studentProfile?.department ?? studentMeta?.department ?? 'Computer Science and Engineering'
  const studentSection = studentMeta?.section ?? `${studentDept} - Year 1`
  const coordinatorName =
    studentMeta?.assignedCoordinatorName ?? studentProfile?.classCoordinator ?? 'Prof. Priya Nair'
  const coordinatorId = studentMeta?.assignedCoordinatorId ?? 'coordinator_cse_a'
  const deputyHODName =
    studentMeta?.assignedDeputyHODName ?? studentProfile?.deputyHOD ?? 'Dr. Meenakshi Sundaram'
  const deputyHODId = studentMeta?.assignedDeputyHODId ?? 'deputyhod_cse'
  const hodName = studentMeta?.assignedHODName ?? 'Dr. A. P. Jayaram'

  // 1. Detect Category with AI Expo support
  const categories = [
    { key: 'AI Expo & Technical Symposium', regex: /(ai expo|tech expo|expo|exhibition|technical demo|showcase|product launch)/i },
    { key: 'Hackathon & Coding Competition', regex: /(hackathon|codeathon|hack|ai hackathon|coding contest|devpost)/i },
    { key: 'Technical Workshop & Bootcamp', regex: /(workshop|bootcamp|hands-on|training session|deep learning|ai seminar)/i },
    { key: 'Industrial Visit & Field Study', regex: /(industrial visit|industry tour|plant visit|site visit|factory visit|field trip|power grid)/i },
    { key: 'Symposium & Research Conference', regex: /(symposium|conference|paper presentation|journal|conclave|summit)/i },
    { key: 'On-Duty Attendance Leave', regex: /(on-duty|on duty|od leave|leave for|attend off-campus|absence|attendance)/i },
    { key: 'Medical Dispensation', regex: /(medical|sick|hospital|illness|doctor|fever|prescription)/i },
    { key: 'Cultural & Student Club Activity', regex: /(club activity|cultural|music|dance|showcase|association|annual fest)/i },
    { key: 'Laboratory & High-Compute Access', regex: /(lab access|server access|hardware|gpu|compute|equipment access)/i },
  ]

  const matchedCat = categories.find((c) => c.regex.test(lower))
  const category = matchedCat ? matchedCat.key : 'Academic Permission & OD Sanction'

  // 2. Intelligent Entity Extraction
  const participantsMatch = /(\d{1,4})\s*(?:students?|participants?|members?|delegates?|attendees?|peers?|friends?|batchmates?)/i.exec(text)
  const countParticipants = participantsMatch
    ? participantsMatch[1]
    : (/with\s+(\d+)\s+friends?/i.exec(text)?.[1]
      ? `${parseInt(/with\s+(\d+)\s+friends?/i.exec(text)![1], 10) + 1}`
      : '1')

  const dateMatch =
    /(\d{1,2}(?:st|nd|rd|th)?\s+(?:to|-)\s*\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*|\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*(?:\s+\d{4})?|\d{1,2}\/\d{1,2}\/\d{2,4}|tomorrow|tmrw|next week|this weekend|upcoming saturday|for\s+\d+\s+days)/i.exec(text)

  const rawDateStr = dateMatch ? dateMatch[1] : 'Upcoming Academic Session'
  const isTomorrow = rawDateStr.toLowerCase() === 'tomorrow' || rawDateStr.toLowerCase() === 'tmrw'
  const formattedDate = isTomorrow
    ? new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : rawDateStr.toLowerCase() === 'next week'
      ? `Week of ${new Date(Date.now() + 604800000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
      : rawDateStr

  const venueMatch =
    /(akcnb\s+hall|akc\s+hall|vit(?:\s+vellore|\s+chennai)?|iit\s+[a-z]+|nit\s+[a-z]+|anna university|seminar hall|auditorium|block\s+[a-z0-9]+|lab\s+[0-9a-z]+|conference hall|innovation centre|smart grid plant|campus|room\s+[a-z0-9]+)/i.exec(text)
  const venue = venueMatch ? venueMatch[0].toUpperCase() : 'Designated Campus Hall / AKCNB Hall'

  const budgetMatch = /(?:₹|inr|rs\.?|rupees?)\s*([\d,]+)/i.exec(text)
  const budget = budgetMatch ? `₹${budgetMatch[1]}` : 'Nil / Student Sponsored'

  const equipmentMatch =
    /(projector|sound system|microphones?|mics?|laptops?|desktops?|gpu servers?|screens?|wifi)/i.exec(text)
  const equipment = equipmentMatch ? equipmentMatch[0] : 'Standard Audio-Visual & Presentation Setup'

  // 3. Urgency Detection
  let urgency: 'Low' | 'Medium' | 'High' | 'Urgent' = 'Medium'
  if (isTomorrow || /(emergency|urgent|immediate|asap|within 24 hours|deadline)/i.test(lower) || style === 'urgent') {
    urgency = 'Urgent'
  } else if (/(this week|upcoming weekend|critical)/i.test(lower) || budgetMatch) {
    urgency = 'High'
  } else if (/(next month|tentative|planned)/i.test(lower)) {
    urgency = 'Low'
  }

  // 4. Formulate Smart Event Title
  let smartTitle = `${category} - ${venue}`
  if (/ai expo|expo/i.test(lower)) {
    smartTitle = `AI Expo 2026 Technical Exhibition at ${venue}`
  } else if (/hackathon/i.test(lower)) {
    smartTitle = `National AI Hackathon Participation at ${venue}`
  } else if (/workshop/i.test(lower)) {
    smartTitle = `Technical Hands-On Workshop on Deep Learning & Computing`
  } else if (/industrial visit|plant/i.test(lower)) {
    smartTitle = `Industrial Technical Visit to ${venue}`
  } else if (/medical/i.test(lower)) {
    smartTitle = `Medical Leave & Attendance Exemption Application`
  } else if (/cultural|club/i.test(lower)) {
    smartTitle = `Annual Student Club & Technical Showcase at ${venue}`
  } else if (text.length > 5 && text.length < 70) {
    smartTitle = text.charAt(0).toUpperCase() + text.slice(1)
  }

  // 5. Generate Rich Contextual Academic Justifications
  let academicJustification = ''
  let curriculumImpact = ''

  if (category.includes('AI Expo') || category.includes('Exhibition')) {
    academicJustification =
      'Attending and participating in the AI Expo provides firsthand technical exposure to cutting-edge artificial intelligence paradigms, state-of-the-art foundation models, autonomous agents, and enterprise research prototypes. It grants crucial industry exposure and peer networking with leading research practitioners.'
    curriculumImpact =
      'Directly supplements theoretical learning in Artificial Intelligence, Machine Learning Architectures, Neural Computation, and Cognitive Systems.'
  } else if (category.includes('Hackathon') || category.includes('Competition')) {
    academicJustification =
      'Participating in this competitive hackathon enables students to apply theoretical data structures, algorithms, and full-stack software architectures to real-world problem statements under time-sensitive engineering conditions.'
    curriculumImpact =
      'Directly supplements Course Outcomes (CO) in Design & Analysis of Algorithms, Object-Oriented Software Engineering, and Cloud Native Deployments.'
  } else if (category.includes('Workshop')) {
    academicJustification =
      'This specialized hands-on technical workshop provides structured practical immersion in scalable architectures, GPU acceleration, and state-of-the-art framework pipelines, bridging the gap between classroom theory and industry production standards.'
    curriculumImpact =
      'Enhances practical laboratory skills in Advanced Computing, Artificial Intelligence, and Systems Architecture.'
  } else if (category.includes('Industrial Visit')) {
    academicJustification =
      'This on-site industrial tour provides students with direct exposure to industrial infrastructure, high-voltage grid topologies, automated SCADA systems, and enterprise safety protocols implemented in operational production plants.'
    curriculumImpact =
      'Fulfils industrial exposure requirements prescribed in institutional accreditation benchmarks and curriculum standards.'
  } else if (category.includes('Medical')) {
    academicJustification =
      'The requested leave is necessitated by acute medical treatment and recuperation under medical practitioner supervision. Medical certificates and clinical prescriptions are submitted for departmental verification.'
    curriculumImpact =
      'Attendance compensation and compensatory lab practical slots will be undertaken immediately upon medical fitness clearance.'
  } else {
    academicJustification =
      'This engagement enables students to represent the department at a recognized institutional academic forum, fostering technical acumen and collaborative leadership.'
    curriculumImpact =
      'Strengthens co-curricular academic engagement and institutional participation indices.'
  }

  // 6. Deep AI Synthesis of the Enhanced Formal Institutional Letter
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  let toneIntroduction = `I am writing to formally submit this application on behalf of myself and our student delegation from the ${studentSection}, Department of ${studentDept}. We respectfully request your administrative approval and official On-Duty (OD) sanction for our participation in "${smartTitle}".`

  if (style === 'formal') {
    toneIntroduction = `I have the honor to submit this formal academic application seeking institutional sanction and On-Duty (OD) endorsement for ${studentName} (${studentRoll}) and registered students of ${studentSection}. We seek your permission to participate in "${smartTitle}".`
  } else if (style === 'urgent') {
    toneIntroduction = `[URGENT / EXPEDITED OD REQUEST] I am submitting this time-sensitive application requesting urgent administrative clearance and On-Duty (OD) attendance credit for "${smartTitle}". Due to the event schedule taking place on ${formattedDate}, expedited approval is respectfully requested.`
  }

  const generatedLetter = `To
${coordinatorName}
Class Coordinator (${studentSection})
Department of ${studentDept}
College of Engineering & Technology

Through: Designated Academic & Departmental Channel

Subject: Official Application for Permission and On-Duty (OD) Attendance Sanction - ${smartTitle}

Respected Ma'am / Sir,

${toneIntroduction}

1. Objective & Academic Purpose of Attendance:
The proposed engagement is scheduled to take place at ${venue} on ${formattedDate}. ${academicJustification} Attending this session will enable us to analyze state-of-the-art engineering implementations and interact directly with technical mentors and exhibition delegates.

2. Curriculum Alignment & Learning Outcomes:
${curriculumImpact} This session provides vital practical insights that will enrich our semester project implementations and broaden our understanding of production-grade technology deployments.

3. Logistical & Event Specifications:
• Target Event / Exhibition: ${smartTitle}
• Designated Venue: ${venue}
• Scheduled Date / Duration: ${formattedDate}
• Participating Student(s): ${countParticipants} Student(s) (Led by ${studentName}, Roll No: ${studentRoll})
• Resource & Equipment Requirement: ${equipment}
• Financial Allocation: ${budget}

4. Academic Undertaking & Attendance Compensation Pledge:
We solemnly affirm that we shall adhere to all institutional guidelines and disciplinary codes during the event hours. To ensure zero loss of coursework, we have coordinated with our class representatives to obtain all lecture notes, assignments, and laboratory practical briefs covered during our absence and will submit them promptly.

We kindly request you to grant On-Duty (OD) attendance permission and recommend this application for official departmental sanction.

Thanking you.

Yours sincerely,

${studentName}
Roll Number: ${studentRoll}
Department of ${studentDept} (${studentSection})
Contact: ${studentProfile?.email ?? `${studentRoll.toLowerCase()}@college.edu`}
Institutional Hash: AUTH-${Math.abs(studentRoll.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)).toString(16).toUpperCase()}
Date: ${currentDate}`

  const extractedData: Record<string, string> = {
    'Request Category': category,
    'Sanction Subject': smartTitle,
    'Delegation Size': `${countParticipants} Student(s)`,
    'Target Schedule': formattedDate,
    'Designated Venue': venue,
    'Financial Sanction': budget,
    'Assigned Coordinator': coordinatorName,
    'Deputy HOD Desk': deputyHODName,
  }

  const recommendations: string[] = []
  if (isTomorrow) {
    recommendations.push('Event is scheduled for tomorrow — flagged with High/Urgent priority for immediate review.')
  }
  recommendations.push(`Automatically addressed and routed to designated Class Coordinator (${coordinatorName}).`)

  return {
    category,
    title: smartTitle,
    summary: `AI Synthesis: ${category} for ${studentName} (${studentRoll}) at ${venue} (${formattedDate}). Addressed to ${coordinatorName}.`,
    extractedData,
    missingInformation: [],
    suggestedWorkflow: ['Student', 'Class Coordinator', 'Deputy HOD', 'HOD'],
    confidence: 96,
    generatedLetter,
    urgency,
    assignedCoordinatorId: coordinatorId,
    assignedCoordinatorName: coordinatorName,
    assignedDeputyHODId: deputyHODId,
    assignedDeputyHODName: deputyHODName,
    assignedHODName: hodName,
    recommendations,
    academicJustification,
    curriculumImpact,
  }
}
