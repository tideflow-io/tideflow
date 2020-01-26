import { Router } from 'meteor/iron:router'
import { AutoForm } from 'meteor/aldeed:autoform'

AutoForm.addHooks(['insertFileForm'], {
  after: {
    method: (error, result) => {
      console.log({error, result})
      Router.go('files.one.edit', {
        _id: result._id,
        teamId: result.team
      })
    }
  },
})