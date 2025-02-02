import { GoogleGenerativeAI, GoogleGenerativeAIError } from '@google/generative-ai'

const SYSTEM_INSTRUCTION = `
You are a strict JSON/TypeScript converter. Follow these rules:

1. Your ONLY functions:
   - Convert TypeScript type declarations to mock JSON data
   - Refactor existing JSON data/TypeScript types using instructions
   - Convert JSON data to TypeScript type declarations
   - Refactor TypeScript type declarations using instructions

2. Constraints:
   - Maintain structural equivalence between input and output formats
   - Never echo back the input format type (TS->JSON or JSON->TS must flip formats)
   - Preserve all TypeScript/JSON syntax and type semantics
   - Reject invalid syntax with exact error messages

3. Response format:
   - Output ONLY the converted format (no input format remnants)
   - NO explanations, comments, or non-code text
   - NO markdown formatting

4. Conversion rules:
   - TS types input -> output mock JSON
   - JSON input -> output TS type declaration
   - Refactoring preserves original format unless instructed otherwise

5. Error messages (use exact phrasing):
   - Invalid JSON: "Invalid JSON provided"
   - Invalid TypeScript: "Invalid typescript type declaration provided"
   - Same-format echo: "Invalid format conversion attempted"
   - Bad instruction: "Invalid instruction provided"
   - Parse failure: "Failed to parse or generate data"
   - Unclear request: "Failed to understand instruction"

Never deviate from format conversion rules. Prioritize structural validity over content.`

export default defineEventHandler(async (event) => {
  try {
    const { instruction, isJson, rawData } = await readBody(event) as {
      instruction?: string
      isJson?: boolean
      rawData?: string
    }

    if (!rawData && !instruction) {
      return createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters',
      })
    }

    const geminiKey = useRuntimeConfig().geminiKey
    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: SYSTEM_INSTRUCTION,
    })

    const chatSession = model.startChat({ history: [] })

    const messageContent = buildMessageContent({
      isJson: Boolean(isJson),
      instruction,
      rawData,
    })

    const response = await chatSession.sendMessage(messageContent)
    const cleanedResponse = response.response.text()
      .replace(/```(json|typescript|ts)?\n?/g, '')
      .trim()

    return cleanedResponse
  }
  catch (error) {
    if (error instanceof GoogleGenerativeAIError) {
      return sendError(event, createError({
        statusCode: 500,
        statusMessage: 'AI Service Error',
      }))
    }
    return sendError(event, handleError(error))
  }
})

// Helper functions
interface MessageParams {
  isJson: boolean
  instruction?: string
  rawData?: string
}

function buildMessageContent(params: MessageParams): string {
  const { isJson, instruction, rawData } = params
  
  if (isJson) {
    return handleJsonCases({ rawData, instruction })
  }
  return handleTsCases({ rawData, instruction })
}

function handleJsonCases({ rawData, instruction }: Pick<MessageParams, 'rawData' | 'instruction'>): string {
  if (rawData && instruction) {
    return `Generate typescript type declarations based on: ${rawData} with instruction: ${instruction}`
  }
  if (instruction) {
    return `Refactor previous typescript types with instruction: ${instruction}`
  }
  if (rawData) {
    return `Generate typescript type declarations based on: ${rawData}`
  }
  throw createError({
    statusCode: 400,
    statusMessage: 'Missing JSON data or instruction',
  })
}

function handleTsCases({ rawData, instruction }: Omit<MessageParams, 'isJson'>): string {
  if (rawData && instruction) {
    return `Generate type-safe JSON mocks from: ${rawData} with instruction: ${instruction}`
  }
  if (rawData) {
    return `Generate type-safe JSON mocks from: ${rawData}`
  }
  if (instruction) {
    return `Refactor previous JSON with instruction: ${instruction}`
  }
  throw createError({
    statusCode: 400,
    statusMessage: 'Missing required TS parameters',
  })
}

function handleError(error: unknown): Error {
  if (error instanceof Error) {
    return createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
  return createError({
    statusCode: 500,
    statusMessage: 'Unknown Server Error',
  })
}
