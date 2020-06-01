import { Meteor } from 'meteor/meteor'
import { Session } from 'meteor/session'
import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'

const explore = (template, agentId, path) => {
  Meteor.call('s-agent-explorer', agentId, {
    dir: path || null
  }, (error, result) => {
    if (error) return
    template.hostname.set(result.hostname)
    template.dir.set(result.dir)
    template.list.set(result.list)
    template.hasParent.set(result.hasParent)
    template.parentPath.set(result.parentPath)
  })
}

Template.remoteFileSelectorSidebar.created = function() {
  const instance = this

  Session.set('remoteFileSelectorAgent', false)

  instance.hostname = new ReactiveVar()
  instance.dir = new ReactiveVar()
  instance.list = new ReactiveVar()
  instance.hasParent = new ReactiveVar()
  instance.parentPath = new ReactiveVar()
  instance.exploration = new ReactiveVar()

  instance.autorun(function () {
    const agentId = Session.get('remoteFileSelectorAgent')
    instance.exploration.set(true)

    if (!agentId) return
    explore(instance, agentId, null)
  })
}


Template.remoteFileSelectorSidebar.events({
  'click .parentFolder': (event, template) => {
    const agentId = Session.get('remoteFileSelectorAgent')
    explore(template, agentId, template.parentPath.get())
  }
})

Template.remoteFileSelectorSidebarItem.events({
  'click .file': (event, template) => {
    if(template.data.isFolder) return;
    const fieldName = Session.get('remoteFileSelectorAgent-field')
    $(`[name="${fieldName}"]`).val(template.data.fullPath)
  },
  'click .folder': (event, template) => {
    const agentId = Session.get('remoteFileSelectorAgent')
    const remoteFileSelectorSidebarTemplate = template.view.parentView.parentView.parentView.parentView._templateInstance
    explore(remoteFileSelectorSidebarTemplate, agentId, template.data.fullPath)
  }
})