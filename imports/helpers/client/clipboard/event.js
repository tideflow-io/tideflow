import { Template } from 'meteor/templating'
import { sAlert } from 'meteor/juliancwirko:s-alert'

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    if (successful) {
      sAlert.success(`${i18n.__('clipboard.textCopied')} ${text}`)
    }
    else {
      sAlert.success(i18n.__('clipboard.unableToCopy'))
    }
  } catch (err) {
    sAlert.success(i18n.__('clipboard.unableToCopy'))
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
    sAlert.success(`${i18n.__('clipboard.textCopied')} ${text}`)
  }, function(err) {
    sAlert.success(i18n.__('clipboard.unableToCopy'))
  });
}

Template.clipboardBtnSmall.events({
  'click': (event, template) => {
    let str = template.data.text
  
    if (template.data['prefix-text']) {
      str = `${template.data['prefix-text']}${str}`
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