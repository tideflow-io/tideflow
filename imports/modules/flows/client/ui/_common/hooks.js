AutoForm.hooks({ 
  updateFlowForm: { 
    onError: function(formType, error) {
      if (error.error === 'trigger-already-used') {
        return sAlert.error(i18n.__('flows.errors.identicalTrigger'))
      }

      if (error.validationErrors) {
        return sAlert.error(i18n.__('flows.update.error.validation'))
      }

      sAlert.error(i18n.__('flows.update.error.generic'))
    }
  }
});