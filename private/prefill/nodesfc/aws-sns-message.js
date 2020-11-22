// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

AWS.config.accessKeyId = process.env.accessKeyId;
AWS.config.secretAccessKey = process.env.secretAccessKey;
AWS.config.region = 'us-east-1';

module.exports.handler = async () => {
  // Create publish parameters
  var params = {
    Message: 'MESSAGE_TEXT', /* required */
    TopicArn: 'TOPIC_ARN'
  };

  // Create promise and SNS service object
  return await new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();
}