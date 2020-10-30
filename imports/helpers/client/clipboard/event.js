import { Template } from 'meteor/templating'

import { copyTextToClipboard } from './helper'

Template.clipboardBtnSmall.events({
  'click': (event, template) => {
    let str = template.data.text || ''
  
    if (template.data['prefix-text']) {
      str = `${template.data['prefix-text']}${str}`
    }

    if (template.data['selector-text']) {
      str += $(template.data['selector-text']).text()
    }

    if (template.data['subfix-val']) {
      str += $(template.data['subfix-val']).val()
    }
  
    if (template.data['subfix-text']) {
      str += template.data['subfix-text']
    }

    copyTextToClipboard(str)
  }
})