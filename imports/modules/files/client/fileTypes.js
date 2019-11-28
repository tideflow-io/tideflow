const aceSupportedMethods = [
  { method: 'html', extensions: ['html'], mimes: ['text/html'] },
  { method: 'javascript', extensions: ['javascript', 'js'], mimes: ['application/javascript'] },
  { method: 'json', extensions: ['json'], mimes: ['application/json'] },
  { method: 'text', extensions: ['txt'], mimes: ['text/plain'] },
  { method: 'markdown', extensions: ['markdown', 'md'], mimes: ['text/markdown'] }
]

module.exports.aceSupportedMethods = aceSupportedMethods