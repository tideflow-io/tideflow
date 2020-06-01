import { AutoForm } from 'meteor/aldeed:autoform'
import { sAlert } from 'meteor/juliancwirko:s-alert'

import i18n from 'meteor/universe:i18n'

AutoForm.hooks({ 
  updateFlowForm: { 
    onError: function(formType, error) {
      if (error.validationErrors) {
        return sAlert.error(i18n.__('flows.update.error.validation'))
      }
      sAlert.error(i18n.__('flows.update.error.generic'))
    }
  }
});
