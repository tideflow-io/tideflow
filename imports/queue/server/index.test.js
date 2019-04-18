
console.log(calledFrom({
  "trigger" : { "outputs" : [  { "stepIndex" : 0 } ] },
  "steps" : [
    { "outputs" : [ { "stepIndex" : 1 } ] },
    { "outputs" : [ { "stepIndex" : 3 }, { "stepIndex" : 4 } ] },
    { "outputs" : [ { "stepIndex" : 1 } ] },
    { "outputs" : [ { "stepIndex" : 4 } ] }
  ]
}))