const forceDownload = (fileName, content) => {
  const url = window.URL.createObjectURL(new Blob([content]))
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  // the filename you want
  a.download = fileName || 'file'
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
}
module.exports.forceDownload = forceDownload