
console.log(calledFrom({
  "trigger" : { "outputs" : [  { "id" : 0 } ] },
  "steps" : [
    { "outputs" : [ { "id" : 1 } ] },
    { "outputs" : [ { "id" : 3 }, { "id" : 4 } ] },
    { "outputs" : [ { "id" : 1 } ] },
    { "outputs" : [ { "id" : 4 } ] }
  ]
}))