export interface ImproveRequestResult {
  category: string
  title: string
  summary: string
  polishedRequest: string
  suggestedType: string
  extractedData: Record<string, string>
  missingInformation: string[]
  suggestedWorkflow: string[]
  confidence: number
}

const categoryPatterns: Array<{ key: string; label: string; keywords: string[] }> = [
  { key: 'hackathon', label: 'Hackathon', keywords: ['hackathon', 'codeathon', 'ai hackathon', 'hack'] },
  { key: 'workshop', label: 'Workshop', keywords: ['workshop', 'seminar', 'training', 'bootcamp'] },
  { key: 'industrial-visit', label: 'Industrial Visit', keywords: ['industrial visit', 'industrial tour', 'visit to', 'factory visit'] },
  { key: 'competition', label: 'Competition', keywords: ['competition', 'contest', 'coding contest', 'quiz competition'] },
  { key: 'club-activity', label: 'Club Activity', keywords: ['club activity', 'club event', 'student club', 'cultural club'] },
  { key: 'leave', label: 'Leave / Permission', keywords: ['leave', 'permission', 'absence', 'absence for', 'family function'] },
  { key: 'certificate', label: 'Certificate', keywords: ['certificate', 'bonafide', 'document', 'transcript'] },
]

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function detectCategory(text: string) {
  const lower = text.toLowerCase()
  const match = categoryPatterns.find((item) => item.keywords.some((keyword) => lower.includes(keyword)))
  return match ? match.label : 'Other'
}

function extractParticipants(text: string) {
  const match = /(\d{1,4})\s+(?:students|participants|people|members|attendees)/i.exec(text)
  if (match) return `${match[1]} students`
  const general = /(\d{1,4})/i.exec(text)
  return general ? `${general[1]} participants` : 'Not specified'
}

function extractDate(text: string) {
  const match = /(\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*)/i.exec(text)
    || /(\d{1,2}(?:\s+|\/)\d{1,2}(?:\s+|\/|-)\d{2,4})/i.exec(text)
    || /(\d{1,2}\s+(?:to|-)\s*\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*)/i.exec(text)

  if (match) return normalizeWhitespace(match[1])

  const monthMatch = /(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\b)/i.exec(text)
  return monthMatch ? `On ${monthMatch[1]}` : 'Not specified'
}

function extractVenue(text: string) {
  const match = /(seminar hall|auditorium|block [a-z0-9]+|lab [a-z0-9]+|conference hall|room [a-z0-9]+|innovation lab)/i.exec(text)
  return match ? match[0] : 'Not specified'
}

function extractFaculty(text: string) {
  const match = /(faculty|mentor|coordinator|guide)/i.exec(text)
  return match ? 'Faculty coordinator mentioned' : 'Faculty coordinator'
}

function buildPolishedRequest(text: string, category: string, date: string, participants: string, venue: string) {
  const cleaned = normalizeWhitespace(text)

  if (category === 'Hackathon') {
    return `I would like to request permission to organize an AI Hackathon on ${date} for approximately ${participants}. The event is intended to provide students with an opportunity to collaborate, solve practical problems, and develop technical skills. We request support for ${venue === 'Not specified' ? 'the venue' : venue}, coordination, and smooth conduct of the activity.`
  }

  if (category === 'Industrial Visit') {
    return `I would like to request permission to arrange an industrial visit on ${date} for ${participants}. The visit will provide students with practical exposure to industry practices and help them connect academic learning with real-world applications. We kindly request approval for the visit and related arrangements at ${venue === 'Not specified' ? 'the designated location' : venue}.`
  }

  if (category === 'Workshop') {
    return `I would like to request permission to conduct a workshop on ${date} for ${participants}. The workshop is intended to enhance student learning and provide hands-on experience in a focused area of study. We request approval for the session and required arrangements at ${venue === 'Not specified' ? 'the scheduled venue' : venue}.`
  }

  if (category === 'Competition') {
    return `I would like to request permission to conduct a competitive event on ${date} for ${participants}. The activity aims to encourage student participation, creativity, and technical engagement in a structured and inclusive format. We request support for ${venue === 'Not specified' ? 'the event venue' : venue}.`
  }

  if (category === 'Leave / Permission') {
    return `I would like to request leave/permission for ${cleaned} on ${date}. I kindly request approval for this matter and will ensure all necessary arrangements are communicated in advance.`
  }

  if (category === 'Club Activity') {
    return `I would like to request permission to organize a club activity on ${date} for ${participants}. The event is designed to support student engagement, creativity, and participation in extracurricular learning opportunities at ${venue === 'Not specified' ? 'the planned venue' : venue}.`
  }

  return `I would like to request permission to proceed with this activity on ${date} for ${participants}. The request is intended to support student engagement, academic development, and smooth coordination with the relevant department. Please review the details and approve the necessary arrangements at ${venue === 'Not specified' ? 'the designated venue' : venue}.`
}

export function improveRequest(text: string): ImproveRequestResult {
  const trimmed = text.trim()

  const category = detectCategory(trimmed)
  const participants = extractParticipants(trimmed)
  const date = extractDate(trimmed)
  const venue = extractVenue(trimmed)
  const suggestedType = category

  const missingInformation: string[] = []
  if (!/faculty|coordinator|mentor|guide/i.test(trimmed)) {
    missingInformation.push('Faculty coordinator')
  }
  if (!/date|sep|sept|jan|feb|mar|apr|may|jun|jul|aug|oct|nov|dec/i.test(trimmed)) {
    missingInformation.push('Date')
  }
  if (!/venue|hall|auditorium|block|lab|room/i.test(trimmed)) {
    missingInformation.push('Venue')
  }
  if (!/student|participants|attendees|people|\d+\s+students/i.test(trimmed)) {
    missingInformation.push('Participants')
  }

  const workflow = ['Student', 'Class Coordinator', 'Deputy HOD', 'HOD']
  const baseConfidence = 70 + (/(date|sep|sept)/i.test(trimmed) ? 8 : 0) + (/(students|participants|\d+)/i.test(trimmed) ? 10 : 0) + (/(venue|hall|auditorium|room)/i.test(trimmed) ? 7 : 0) + (/(faculty|coordinator)/i.test(trimmed) ? 5 : 0)
  const confidence = Math.max(68, Math.min(96, baseConfidence))

  const title = category === 'Other' ? 'Permission Request' : `${category} Request`
  const polishedRequest = buildPolishedRequest(trimmed, category, date, participants, venue)
  const summary = `${polishedRequest.substring(0, 180)}${polishedRequest.length > 180 ? '...' : ''}`

  return {
    category,
    title,
    summary,
    polishedRequest,
    suggestedType,
    extractedData: {
      Category: category,
      Date: date,
      Participants: participants,
      Venue: venue,
      'Faculty coordinator': extractFaculty(trimmed),
    },
    missingInformation: missingInformation.length ? missingInformation : ['No critical details missing'],
    suggestedWorkflow: workflow,
    confidence: Math.round(confidence),
  }
}
