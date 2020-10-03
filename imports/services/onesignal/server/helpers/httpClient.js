module.exports.sendNotification = async (appConfig, currentStep) => {
  
  try {
    return new Promise((resolve, reject) => {
      var sendNotification = function(data) {
        var options = {
          host: 'onesignal.com',
          port: 443,
          path: '/api/v1/notifications',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${appConfig.restApiKey}`
          }
        }
        
        var https = require('https')
        var req = https.request(options, response => {  
          response.on('data', data => {
            resolve({ statusCode: response.statusCode, body: JSON.parse(data) })
          })
        })
        
        req.on('error', (e) => reject(e))
        req.write(JSON.stringify(data))
        req.end()
      }

      const segment = (currentStep.config.segment||'').trim() !== '' ? 
        currentStep.config.segment : 'All'

      var message = { 
        app_id: appConfig.appId,
        contents: {"en": currentStep.config.content},
        headings: {"en": currentStep.config.title},
        included_segments: [segment]
      }
      
      sendNotification(message)
    })
  }
  catch (ex) {
    reject(ex)
  }
}