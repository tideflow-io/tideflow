// This file creates fake data in the database.
// Make sure you don't run it on a production environment.

import { Services } from '/imports/modules/services/both/collection'
import { Flows } from '/imports/modules/flows/both/collection'
import { Executions } from '/imports/modules/executions/both/collection'
import { servicesAvailable } from '/imports/services/_root/server'

return

if (process.env.NODE_ENV !== 'development') {
  return
}

const faker = require('faker')

// Prepare context variables for the documents to be inserted
const flowsStatus = ['enabled', 'disabled']
const executionsStatus = ['started', 'finished', 'error']
const user = Meteor.users.findOne()

if (!user) {
  throw new Error('The fake data creator requires an already-created user.')
}

// Amount of data to be created
const NUMBER_OF_CHANNELS = 30 // 1 flow per service
const NUMBER_OF_EXECUTIONS = 30

// Create services
for (let i = 0; i < NUMBER_OF_CHANNELS; i++) {
  const title = `${faker.name.jobDescriptor()} ${faker.name.jobArea()} ${faker.name.jobType()}`
  const description = faker.lorem.words(10)

  Services.insert({
    details : {},
    type : faker.random.arrayElement(servicesAvailable.filter(s => !!s.ownable).map(s => s.name)),
    title,
    config : { },
    description,
    user : user._id,
    createdAt : faker.date.past()
  })
}

// Grab full list of services from the database
const servicesDocs = Services.find()

// Create flows (1 per service)
servicesDocs.map(service => {
  const title = `${faker.name.jobDescriptor()} ${faker.name.jobArea()} ${faker.name.jobType()}`
  const description = faker.lorem.words(10)

  Flows.insert({
    trigger : {
      type : service.type,
      _id : service._id
    },
    steps : [],
    title,
    description,
    status: faker.random.arrayElement(flowsStatus),
    user: user._id,
    emailOnTrigger: false,
    createdAt: faker.date.past()
  })
})

// Grab full list of flows from the database
const flowsDocs = Flows.find()

// Create executions for all flows
flowsDocs.map(flowDoc => {
  for (let i = 0; i < NUMBER_OF_EXECUTIONS; i++) {
    Executions.insert({
      user: user._id,
      service : flowDoc.trigger._id,
      fullService: Services.findOne({_id: flowDoc.trigger._id}),
      flow: flowDoc._id,
      fullFlow: flowDoc,
      status: faker.random.arrayElement(executionsStatus),
      createdAt: faker.date.past(),
    })
  }
})

