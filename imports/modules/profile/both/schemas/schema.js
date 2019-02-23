import SimpleSchema from "simpl-schema"

let Schema = {}

Schema.UserProfile = new SimpleSchema({
   firstName:{
        type: String,
        label: "First Name",
        max: 80,
        optional: true
    },
    lastName:{
        type: String,
        label: "Last Name",
        max: 80,
        optional: true
    }
})

Schema.User = new SimpleSchema({
    username: {
        type: String,
        regEx: /^[a-z0-9A-Z_]{3,15}$/,
        optional: true
    },
    emails: {
        type: Array,
        // this must be optional if you also use other login services like facebook,
        // but if you use only accounts-password, then it can be required
        optional: true
    },
    'emails.$': {
        type: Object,
        optional: true
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    createdAt: {
        type: Date,
        optional: true
    },
    profile: {
        type: Schema.UserProfile,
        optional: true
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    // Add `roles` to your schema if you use the meteor-roles package.
    // Note that when using this package, you must also specify the
    // `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
    // Roles.addUsersToRoles(userId, ["admin"], Roles.GLOBAL_GROUP);
    // You can't mix and match adding with and without a group since
    // you will fail validation in some cases.
    roles: {
        type: String,
        optional: true,
        blackbox: true,
        allowedValues: ['admin']
    }
})

Meteor.users.attachSchema(Schema.User)

export default Meteor.users