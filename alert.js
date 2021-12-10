var AWS = require("aws-sdk");
AWS.config.region = 'us-east-2';
var sns = new AWS.SNS();
var cloudwatchevents = new AWS.CloudWatchEvents();

async function alert(){
  let tparams = {
    Name: 'alert'
  };
  let data = await sns.createTopic(tparams).promise();
  console.log('topic', data);

  let params = {
    Protocol: 'email', /* required */
    TopicArn: data.TopicArn, 
    Endpoint: 'jatin.o@zetwerk.com',
    ReturnSubscriptionArn: true
  };
  let data1 = await sns.subscribe(params).promise();
  console.log('subs', data1);  

  var rrrparams = {
    Name: 'alerttt', 
    EventPattern: JSON.stringify({
        "detail-type": [
          "Batch Job State Change"
        ],
        "source": [
          "aws.batch"
        ],
        "detail": {
          "status": [
            "FAILED"
          ]
        }
      }),
  };
  let d = await cloudwatchevents.putRule(rrrparams).promise();
  console.log('rule  :', d)
  let targetparams = {
    Rule: rrrparams.Name,
    Targets : [{
        Id: 'alerttting',
        Arn: data.TopicArn
    }]
  }
  let f = await cloudwatchevents.putTargets(targetparams).promise();
  console.log('target  :', f);
}

alert().then();