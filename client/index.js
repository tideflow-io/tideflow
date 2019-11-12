import i18n from 'meteor/universe:i18n'

// somewhere in the page layout (or possibly in the router?)
function getLang () {
  return (
    navigator.languages && navigator.languages[0] ||
    navigator.language ||
    navigator.browserLanguage ||
    navigator.userLanguage ||
    'en-US'
  )
}

i18n.setLocale(getLang())

import '/imports/startup/both'
import '/imports/startup/client'
