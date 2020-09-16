export default async function handleImageUpload(image) {
  const data = new FormData()
  data.append('file', image)
  data.append('upload_preset', 'instagram-cool-caribou')
  data.append('cloud_name', 'dgrok2hsl')
  const response = await fetch('https://api.cloudinary.com/v1_1/dgrok2hsl/image/upload', {
    method: 'POST',
    accept: 'application/json',
    body: data
  })
  const jsonResponse = await response.json()
  return jsonResponse.url
}
