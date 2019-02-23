import { Template } from 'meteor/templating'

import { servicesAvailable } from '/imports/services/_root/client'

const debug = console.log

Template.registerHelper('flowTrigger', function() {
  try {
    let output = this.trigger.type

    let service = servicesAvailable.find(sa => sa.name === output).humanName

    if (service) {
      output = service
    }

    if (this.trigger.type === 'cron') {
      if (this.trigger.config.cron) {
        output = `${output} ${this.trigger.config.cron}`
      }
    }

    return output
  }
  catch (ex) {
    debug({ex})
    return ''
  }
})