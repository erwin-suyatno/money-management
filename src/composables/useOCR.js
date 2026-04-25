import { ref } from 'vue'
import { createWorker } from 'tesseract.js'

export function useOCR() {
  const scanning = ref(false)
  const progress = ref(0)
  const error = ref(null)
  const ocrResult = ref(null)

  const scanReceipt = async (imageSource) => {
    scanning.value = true
    progress.value = 0
    error.value = null
    ocrResult.value = null

    try {
      const worker = await createWorker('ind+eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            progress.value = Math.round(m.progress * 100)
          }
        }
      })

      const { data: { text } } = await worker.recognize(imageSource)
      await worker.terminate()

      const result = parseText(text)
      ocrResult.value = result
      return result
    } catch (err) {
      error.value = err.message
      console.error('OCR Error:', err)
      throw err
    } finally {
      scanning.value = false
    }
  }

  const parseText = (text) => {
    const lines = text.split('\n')
    let merchant = 'Unknown Merchant'
    let total = 0

    // Try to find merchant (usually first non-empty line)
    for (const line of lines) {
      if (line.trim().length > 3) {
        merchant = line.trim()
        break
      }
    }

    // Try to find total amount
    const amountRegex = /(?:total|jumlah|rp|idr)?\s*[:=]?\s*([\d.,]{3,})/i
    
    for (let i = lines.length - 1; i >= 0; i--) {
      const match = lines[i].match(amountRegex)
      if (match) {
        const cleanAmount = match[1].replace(/[.,]/g, '')
        if (cleanAmount.length >= 3) {
          total = parseInt(cleanAmount)
          break
        }
      }
    }

    return {
      merchant,
      total,
      rawText: text
    }
  }

  return {
    scanning,
    progress,
    error,
    ocrResult,
    scanReceipt
  }
}
