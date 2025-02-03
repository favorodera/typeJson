import { GoogleGenerativeAI, GoogleGenerativeAIError } from '@google/generative-ai'

// Predefined AI error responses mapped to status codes
const ERROR_MAP = {
  'Invalid JSON provided': { code: 400, message: 'Invalid JSON provided' },
  'Invalid typescript type declaration provided': { code: 400, message: 'Invalid typescript type declaration provided' },
  'Invalid format conversion attempted': { code: 400, message: 'Invalid format conversion attempted' },
  'Invalid instruction provided': { code: 400, message: 'Invalid instruction provided' },
  'Failed to parse or generate data': { code: 500, message: 'Failed to parse or generate data' },
  'Failed to understand instruction': { code: 500, message: 'Failed to understand instruction' },
} as const // Preserves literal types for type safety

// Core system prompt defining conversion rules and constraints
const SYSTEM_INSTRUCTION = `
You are a strict JSON/TypeScript converter with smart mock data generation. Follow these rules:

1. Your PRIMARY functions:
   - Convert TS types <-> JSON with semantic accuracy
   - Generate context-aware mock data using field name patterns
   - Refactor existing data/types while preserving semantics
   - Maintain strict format conversion discipline

2. Enhanced mock data requirements:
   * Field name pattern matching:
     - 'name' fields: Random real names (e.g. "Emma Johnson")
     - 'email' fields: Valid email formats (e.g. "user123@domain.com")
     - 'color' fields: CSS color names/hex codes (e.g. "cornflowerblue", #4B0082)
     - 'date' fields: ISO 8601 dates (e.g. "2024-03-15T08:30:00Z")
     - 'id'/'uuid' fields: RFC4122-compliant UUIDs (e.g. "d9428888-122b-11ee-8ac3-53fb5d3a4cd0")
     - 'phone' fields: E.164 format (e.g. "+14155552671")
     - 'url' fields: Valid URL structures (e.g. "https://www.example.com/path")
     - 'price'/'amount' fields: Decimal currency (e.g. 29.99)
     - 'age' fields: Realistic numbers 0-120
     - 'description' fields: 2-3 sentence lorem ipsum
     - Coordinates: Latitude (-90 to 90)/Longitude (-180 to 180)
     - country/state/city: Real geographic names
   * Fallback rules:
     - Unknown patterns: Generate valid random data matching type
     - Arrays: the number specified or 2-5 realistic items
     - Objects: Minimum 2 properties

3. Core constraints:
   - STRICT structural equivalence between formats
   - NEVER echo input format (TS <-> JSON conversion only)
   - PRESERVE all type annotations/JSON schema
   - REJECT invalid syntax with exact error messages

4. Response format (MUST OBEY):
   - Output ONLY converted format code
   - NO explanations/markdown/commentary
   - Real data in examples above formats
   - Valid syntax for target format

   5. Error messages (use exact phrasing):
   - For Invalid JSON return: "Invalid JSON provided"
   - For Invalid TypeScript return: "Invalid typescript type declaration provided"
   - For Same-format echo return: "Invalid format conversion attempted"
   - For Bad instruction return: "Invalid instruction provided"
   - For Parse failure return: "Failed to parse or generate data"
   - For Unclear request return: "Failed to understand instruction"

Prioritize validity > realistic data > random data. Never sacrifice structural accuracy for realism.`

export default defineEventHandler(async (event) => {
  try {
    // Extract request parameters
    const { instruction, isJson, rawData } = await readBody(event) as {
      instruction?: string
      isJson?: boolean
      rawData?: string
    }

    // Validate required parameters
    if (!rawData && !instruction) {
      return createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters',
      })
    }

    let detectedType: 'json' | 'ts' | 'unknown' = 'unknown'
    let cleanData = rawData || '' || undefined
    
    // Extract and validate code blocks from rawData
    const codeBlockMatch = rawData?.match(/^```(json|typescript|ts)\n([\s\S]*?)```$/m)
    if (codeBlockMatch) {
      detectedType = codeBlockMatch[1] === 'json' ? 'json' : 'ts'
      cleanData = codeBlockMatch[2].trim()
      
      // Handle empty code blocks or undefined content
      if (cleanData === 'undefined' || cleanData === '') {
        cleanData = undefined
      }
    }

    // Validate that code block type matches conversion direction
    if (detectedType !== 'unknown') {
      if (isJson && detectedType !== 'json') {
        return createError({
          statusCode: 400,
          statusMessage: 'Code block type conflicts with JSON conversion',
        })
      }
      if (!isJson && detectedType !== 'ts') {
        return createError({
          statusCode: 400,
          statusMessage: 'Code block type conflicts with TypeScript conversion',
        })
      }
    }

    // Validate that instruction doesn't request same-format conversion
    if (instruction) {
      const forbiddenPattern = isJson
        ? /(generate|create|convert|output|make|need|run)\s+(json|mock|mocks|data|dummy)/i
        : /(generate|create|convert|output|make|need|run)\s+(typescript|type|interface|ts|dummy|mock)/i

      if (forbiddenPattern.test(instruction)) {
        return createError({
          statusCode: 400,
          statusMessage: 'Invalid instruction provided',
        })
      }
    }

    // Initialize Gemini AI model with system instructions
    const geminiKey = useRuntimeConfig().geminiKey
    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: SYSTEM_INSTRUCTION,
    })

    // Create new chat session with empty history
    const chatSession = model.startChat({ history: [] })

    // Build appropriate prompt based on conversion direction
    const messageContent = buildMessageContent({
      isJson: Boolean(isJson),
      instruction,
      rawData: cleanData,
    })

    // Execute AI conversion request
    const response = await chatSession.sendMessage(messageContent)
    
    // Clean response from markdown code blocks
    const cleanedResponse = response.response.text()
      .replace(/```(json|typescript|ts)?\n?/g, '')
      .trim()
  
    // Check for predefined error responses
    const matchedError = ERROR_MAP[cleanedResponse as keyof typeof ERROR_MAP]
    if (matchedError) {
      return createError({
        statusCode: matchedError.code,
        statusMessage: matchedError.message,
      })
    }
  
    // Return successful conversion result
    return cleanedResponse
  }
  catch (error) {
    // Handle specific Gemini API errors
    if (error instanceof GoogleGenerativeAIError) {
      return sendError(event, createError({
        statusCode: 500,
        statusMessage: 'AI Service Error',
      }))
    }
    // Generic error handler
    return sendError(event, handleError(error))
  }
})

// Helper function types
interface MessageParams {
  isJson: boolean
  instruction?: string
  rawData?: string
}

/**
 * Routes conversion requests to appropriate handler
 * based on conversion direction (JSON <-> TypeScript)
 */
function buildMessageContent(params: MessageParams): string {
  const { isJson, instruction, rawData } = params
  
  return isJson
    ? handleJsonCases({ rawData, instruction })
    : handleTsCases({ rawData, instruction })
}

/**
 * Handles JSON-to-TypeScript conversion logic:
 * - Generates types from JSON data
 * - Refactors existing types with instructions
 */
function handleJsonCases({ rawData, instruction }: Pick<MessageParams, 'rawData' | 'instruction'>): string {
  const hasValidData = rawData && !['', 'undefined'].includes(rawData.trim())
  
  if (hasValidData && instruction) {
    return `Generate typescript type declarations based on: ${rawData} with instruction: ${instruction}`
  }
  if (instruction) {
    return `Refactor previous typescript types with instruction: ${instruction}`
  }
  if (hasValidData) {
    return `Generate typescript type declarations based on: ${rawData}`
  }
  throw createError({
    statusCode: 400,
    statusMessage: 'Missing JSON data or instruction',
  })
}

/**
 * Handles TypeScript-to-JSON conversion logic:
 * - Generates mock data from types
 * - Refactors existing JSON with instructions
 */
function handleTsCases({ rawData, instruction }: Omit<MessageParams, 'isJson'>): string {
  const hasValidData = rawData && !['', 'undefined'].includes(rawData.trim())
  
  if (hasValidData && instruction) {
    return `Generate type-safe JSON mocks from: ${rawData} with instruction: ${instruction}`
  }
  if (hasValidData) {
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

/**
 * Universal error handler for unexpected exceptions
 * Ensures consistent error format across the API
 */
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
