// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

AWS.config.accessKeyId = process.env.accessKeyId;
AWS.config.secretAccessKey = process.env.secretAccessKey;
AWS.config.region = 'us-east-1';

// Create publish parameters
var params = {
  Message: 'MESSAGE_TEXT', /* required */
  TopicArn: 'TOPIC_ARN'
};

// Create promise and SNS service object
var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

// Handle promise's fulfilled/rejected states
publishTextPromise.then(
  (data) => {
    console.log(`Message ${params.Message} send sent to the topic ${params.TopicArn}`);
    console.log(`MessageID is ${data.MessageId}`);
  })
  .catch(ex => {
    console.error(ex, ex.stack);
  });
