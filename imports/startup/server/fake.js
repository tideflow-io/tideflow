import { Channels } from '/imports/modules/channels/both/collection'
import { Flows } from '/imports/modules/flows/both/collection'
import { Executions } from '/imports/modules/executions/both/collection'
import { servicesAvailable } from '/imports/services/_root/server'

return;

const faker = require('faker')

const servicesNames = servicesAvailable.map(sa => sa.name)
const flowsStatus = ['enabled', 'disabled']
const executionsStatus = ['finished', 'error']
const user = Meteor.users.findOne()

for (let i = 0; i < 30; i++) {
  const title = `${faker.name.jobDescriptor()} ${faker.name.jobArea()} ${faker.name.jobType()}`
  const description = faker.lorem.words(10)

  Channels.insert({
    details : {},
    type : faker.random.arrayElement(servicesNames),
    title,
    config : { },
    description,
    user : user._id,
    createdAt : faker.date.past()
  })
}

const channelsDocs = Channels.find()

channelsDocs.map(channel => {
  const title = `${faker.name.jobDescriptor()} ${faker.name.jobArea()} ${faker.name.jobType()}`
  const description = faker.lorem.words(10)

  Flows.insert({
    trigger : {
      type : channel.type,
      _id : channel._id
    },
    steps : [
      {
        type : 'pdf'
      }
    ],
    title,
    description,
    status: faker.random.arrayElement(flowsStatus),
    user: user._id,
    emailOnTrigger: false,
    createdAt: faker.date.past()
  })
})

const flowsDocs = Flows.find()

flowsDocs.map(flowDoc => {
  for (let i = 0; i < 100; i++) {
    Executions.insert({
      user: user._id,
      channel : flowDoc.trigger._id,
      fullChannel: Channels.findOne({_id: flowDoc.trigger._id}),
      flow: flowDoc._id,
      fullFlow: flowDoc,
      status: faker.random.arrayElement(executionsStatus),
      createdAt: faker.date.past(),
    })
  }
})

