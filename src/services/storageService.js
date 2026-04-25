import { supabase } from './supabase'

export const storageService = {
  async uploadReceipt(file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { data, error } = await supabase.storage
      .from('imports')
      .upload(filePath, file)

    if (error) {
      console.error('Error uploading receipt:', error.message)
      throw error
    }

    return data.path
  },

  async getReceiptUrl(path) {
    const { data, error } = await supabase.storage
      .from('imports')
      .createSignedUrl(path, 600) // 10 minutes expiry
    
    if (error) {
      console.error('Error getting signed URL:', error.message)
      throw error
    }
    
    return data.signedUrl
  }
}
