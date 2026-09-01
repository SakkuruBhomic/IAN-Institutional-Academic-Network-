import { GoogleGenAI } from '@google/genai'

export type RequestCategory = 'Hackathon' | 'Workshop' | 'Conference' | 'Competition' | 'Other'
export type RequestUrgency = 'Low' | 'Medium' | 'High'

export interface StudentDetails {
  name: string
  rollNumber: string
  department: string
  year: string
}

export interface ProcessedStudentRequest {
  category: RequestCategory
  urgency: RequestUrgency
  approvalChain: string[]
  generatedLetterText: string
}

const fallbackChain = ['Class Coordinator', 'Deputy HOD', 'HOD']

function createFallback(details: StudentDetails, prompt: string): ProcessedStudentRequest {
  return {
    category: 'Other',
    urgency: 'Medium',
    approvalChain: fallbackChain,
    generatedLetterText: `To\nThe Head of Department\n${details.department}\n\nSubject: Request for academic permission\n\nRespected Sir/Madam,\n\nI, ${details.name} (${details.rollNumber}), a ${details.year} student of ${details.department}, kindly request permission to attend ${prompt.trim() || 'the proposed academic activity'}. I assure you that I will follow the institution's guidelines and make up for any academic work missed during this period.\n\nI request you to consider my application favourably.\n\nYours faithfully,\n${details.name}\n${details.rollNumber}`,
  }
}

export async function processStudentRequest(prompt: string, studentDetails: StudentDetails): Promise<ProcessedStudentRequest> {
  const fallback = createFallback(studentDetails, prompt)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) return fallback

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Parse this student permission request and return only valid JSON. Student details: ${JSON.stringify(studentDetails)} Request: ${prompt}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            category: { type: 'string', enum: ['Hackathon', 'Workshop', 'Conference', 'Competition', 'Other'] },
            urgency: { type: 'string', enum: ['Low', 'Medium', 'High'] },
            approvalChain: { type: 'array', items: { type: 'string' } },
            generatedLetterText: { type: 'string' },
          },
          required: ['category', 'urgency', 'approvalChain', 'generatedLetterText'],
        },
      },
    })
    const parsed = JSON.parse(response.text ?? '') as Partial<ProcessedStudentRequest>
    if (!parsed.category || !parsed.urgency || !parsed.generatedLetterText || !parsed.approvalChain?.length) return fallback
    return { ...fallback, ...parsed, approvalChain: parsed.approvalChain }
  } catch {
    return fallback
  }
}