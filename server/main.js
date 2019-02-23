import SimpleSchema from 'simpl-schema'

import '/imports/startup/both'
import '/imports/startup/server'

// ***************************************************************
// Config for both client and server
// ***************************************************************

SimpleSchema.extendOptions(['autoform'])

// Extra logging for SimpleSchema. Turn off in production!
SimpleSchema.debug = true
