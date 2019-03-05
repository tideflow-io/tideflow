import { Template } from 'meteor/templating'
import { AutoForm } from "meteor/aldeed:autoform"
import { Router } from 'meteor/iron:router'

AutoForm.addHooks(['insertChannelForm'], {
  before: {
    method: function (doc) {
      (Object.keys(window.editorViewDetailsHooks)||[]).map(k => {
        let p = {}
        p[k] = window.editorViewDetailsHooks[k]()
        doc = Object.assign({}, {details:p}, doc)
      })
      this.result(doc)
    }
  },
  after: {
    method: (error, result) => {
      Router.go('channels.one.edit', result)
    }
  }
})