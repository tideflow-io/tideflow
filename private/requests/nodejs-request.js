var request = require('request');
var options = {
  'method': 'POST',
  'url': '{{url}}',
  'headers': {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({"hello":"world"})

};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});
