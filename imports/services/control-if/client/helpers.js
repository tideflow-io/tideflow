Template['servicesIfSimpleCommonConfig'].onRendered(function() {
})

Template['servicesIfSimpleCommonConfig'].helpers({
    stepControls: function() {
        return this.steps[this.index].controls || []
    }
})