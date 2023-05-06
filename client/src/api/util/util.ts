export function download_file(content: string, mimeType: string, filename: string) {
  const a = document.createElement('a') // Create "a" element
  const blob = new Blob([content], {type: mimeType}) // Create a blob (file-like object)
  const url = URL.createObjectURL(blob) // Create an object URL from blob
  a.setAttribute('href', url) // Set "a" element link
  a.setAttribute('download', filename) // Set download filename
  a.click() // Start downloading
}

export function download_image(imageUrl: string, imageName: string) {
  const link = document.createElement('a')
  link.href = imageUrl;
  link.download = imageName;
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
