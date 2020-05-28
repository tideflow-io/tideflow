import { Meteor } from 'meteor/meteor'

import { Services } from '/imports/modules/services/both/collection'
import { Flows } from '/imports/modules/flows/both/collection'

import { cachedClients, connectClient, subscribe } from './clients'

Meteor.startup(async () => {

  await Services.update(
    { type: 'aws-mqtt-client' },
    { $set: { 'details.online': false } },
    { multi: true }
  )

  // Debug list of connected mqtt clients
  Meteor.setInterval(() => {
    console.log('')
    cachedClients.map(c => {
      console.log(`${c.thingName}: ${JSON.stringify(c.topics)}`)
    })
  }, 1000)

  const mqttFlows = Flows.find({
    'trigger.type': 'aws-mqtt-client',
    'status': 'enabled'
  }).fetch()

  let clientIds = []

  mqttFlows.map(flow => {
    if(flow.trigger._id) clientIds.push(flow.trigger._id)
  })

  console.log({expectedClients : clientIds})

  const clientsInDb = Services.find({
    _id: { $in: clientIds },
    type: 'aws-mqtt-client'
  })

  clientsInDb.forEach(async client => {
    // Find flows using client as trigger
    const clientFlows = mqttFlows.filter(mqttFlow => {
      return mqttFlow.trigger._id === client._id
    })
    
    console.log('start', clientFlows)

    if (!clientFlows.length) return

    let cachedClient = await connectClient(client)
    console.log({cachedClient})
    cachedClients.push(cachedClient)

    clientFlows.forEach(flow => {
      const { topic } = flow.trigger.config
      subscribe(cachedClient.client._id, flow._id, topic)
    })
  })
})