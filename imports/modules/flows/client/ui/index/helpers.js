import { Template } from 'meteor/templating'
import { Flows } from '/imports/modules/flows/both/collection'

Template['flows.index'].helpers({
  'flows': () => {
    let result = []
    const list = Flows.find({})
    list.map(item => {
      let type = item.trigger.type
      let found = result.find(ri => ri.type === type)
      if (found) found.flows.push(item)
      else result.push({type, flows: [item]})
    })
    return result
  }
})