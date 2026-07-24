export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Cloudinary error (${res.status}): ${errorText}`)
  }

  const data = await res.json()
  return data.secure_url
}