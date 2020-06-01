import { Template } from 'meteor/templating'

Template.remoteFileSelectorSidebar.helpers({
  exploration: () => {
    return Template.instance().exploration && Template.instance().exploration.get()
  },
  dir: () => {
    return Template.instance().dir && Template.instance().dir.get()
  },
  hasParent: () => Template.instance().hasParent.get(),
  hostname: () => Template.instance().hostname.get(),
  list: () => Template.instance().list.get()
})