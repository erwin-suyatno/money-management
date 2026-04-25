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
    const { data } = supabase.storage
      .from('imports')
      .getPublicUrl(path)
    
    return data.publicUrl
  }
}
