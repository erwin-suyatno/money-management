import { ref } from 'vue'
import { createWorker } from 'tesseract.js'

export function useOCR() {
  const isProcessing = ref(false)
  const progress = ref(0)
  const error = ref(null)

  const scanImage = async (imageSource) => {
    isProcessing.value = true
    progress.value = 0
    error.value = null

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

      return parseText(text)
    } catch (err) {
      error.value = err.message
      console.error('OCR Error:', err)
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  const parseText = (text) => {
    // Basic parsing logic for receipts
    // Look for currency patterns (Rp, IDR, etc.)
    const lines = text.split('\n')
    let merchant = 'Unknown Merchant'
    let amount = 0

    // Try to find merchant (usually first non-empty line)
    for (const line of lines) {
      if (line.trim().length > 3) {
        merchant = line.trim()
        break
      }
    }

    // Try to find total amount
    // Patterns: Total, Rp, atau angka besar di akhir
    const amountRegex = /(?:total|jumlah|rp|idr)?\s*[:=]?\s*([\d.,]{3,})/i
    
    for (let i = lines.length - 1; i >= 0; i--) {
      const match = lines[i].match(amountRegex)
      if (match) {
        // Clean up the match: remove dots/commas and parse
        const cleanAmount = match[1].replace(/[.,]/g, '')
        if (cleanAmount.length >= 3) {
          amount = parseInt(cleanAmount)
          break
        }
      }
    }

    return {
      merchant,
      amount,
      rawText: text
    }
  }

  return {
    isProcessing,
    progress,
    error,
    scanImage
  }
}
