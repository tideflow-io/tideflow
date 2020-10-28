Meteor.methods({
  's-endpoint.getTemplate': name => {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    return Assets.getText(`requests/${name}.html`)
  }
})