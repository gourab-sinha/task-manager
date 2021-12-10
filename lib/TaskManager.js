const Batchclient = require('@aws-sdk/client-batch');
const { exec } = require('child_process');
const { stdout, stderr } = require('process');
const ECR = require('@aws-sdk/client-ecr');
var AWS = require("aws-sdk");
AWS.config.region = 'us-east-2';
var sns = new AWS.SNS();
var cloudwatchevents = new AWS.CloudWatchEvents();

class TaskManager {
    constructor(batchConfig, dbConnection, ecrClientConfig) {
        
        if (Object.getPrototypeOf(this).isInstantiated) {
            throw new Error(`Cannot create more than one instance of ${this.constructor.name}`);
        }

        Object.defineProperty(Object.getPrototypeOf(this), 'isInstantiated', {
            value: true,
            writable: false,
            enumerable: false,
            configurable: false
        });

        this.Batch = new Batchclient.Batch(batchConfig);
        this.dbConnection = dbConnection;
        this.exec = exec;
        this.ECR = ECR;
        this.client = new this.ECR.ECRClient(ecrClientConfig);
        this.sns = new AWS.SNS();
        this.cloudwatchevents = new AWS.CloudWatchEvents();
    }

    /**
     * 
     * @param {*} params 
     * @returns 
     */
     createECRRepositoryCommand(params) {
        const command = new this.ECR.CreateRepositoryCommand(params);
        return command;
    }

    /**
     * 
     * @param {*} params 
     * @returns 
     */
    async describeComputeEnvironments(params = {}) {
        const computeEnvDetails = await this.Batch.describeComputeEnvironments(params, (error, data) => {
            if (error) {
                console.log(error);
                return;
            }
            console.log(data);
        });
        return computeEnvDetails;
    }

    

    /**
     * 
     * @param {*} command 
     * @returns 
     */
    async runECRCommand(command) {
        return await this.client.send(params);
    }

    /**
     * 
     * @param {*} params 
     * @returns 
     */
    async createComputeEnvironment(params = {}) {
        const computeEnvironment = await this.Batch.createComputeEnvironment(params, (error, data) => {
            if (error) {
                console.log(error);
                return;
            }
            console.log(data);
        });
        return computeEnvironment;
    }

    /**
     * This Fn should be used for only unmanged compute envirionment. For managed compute environment aws will automatically handle. 
     * @param {*} params 
     * @returns 
     */
    async updateComptueEnvironment(params = {}) {
        const updatedComputeEnvironment = await this.Batch.updateComputeEnvironment(params, (error, data) => {
            if (error) {
                console.log(error);
                return;
            }
            console.log(data);
        });

        return updatedComputeEnvironment;
    }

    /**
     * 
     * @param {*} deleteCommandInput 
     * @returns 
     * Before you can delete a compute environment, you must set its state to <code>DISABLED</code> with the <a>UpdateComputeEnvironment</a> API operation and disassociate it from any job queues with the <a>UpdateJobQueue</a> API operation. Compute environments that use Fargate resources must terminate all
     */
    async deleteComputeEnvironment(deleteCommandInput = {}) {
        return await this.Batch.deleteComputeEnvironment(deleteCommandInput, (error, data) => {
            if (error) {
                console.log(error);
                return;
            }
            console.log(data);
        });
    }

    /**
     * 
     * @param {*} params 
     * @returns 
     */
    async createJobQueue(params = {}) {
        const queue = await this.Batch.createJobQueue(params, (error, data)=> {
            if (error) {
                console.log(error);
                return;
            }
            console.log(data);
        });
        if (!queue) {
            return {
                message: `Couldn't create job queue`
            };
        }

        return { message: 'Successfully created the job queue' };
    }


    /**
     * 
     * @param {*} params 
     * @returns 
     */
    async deleteJobQueue(params = {}) {
        const deletedJobQueue = await this.Batch.deleteJobQueue(params, (error, data) => {
            if (error) {
                console.log(error);
                return;
            }
            console.log(data);
        });
        if (!deletedJobQueue) {
            return {
                message: `Couldn't deleted the job queue`
            };
        }

        return { message: `Successfully deleted the job queue` };
    }

    /**
     * 
     * @param {*} params 
     * @returns 
     */
    async describeJobQueue(params = {}) {
        const describeJobQueue = await this.Batch.describeJobQueues(params, (error, data) => {
            if (error) {
                console.log(error);
                return;
            }
            console.log(data);
        });
        return describeJobQueue;
    }

    /**
     * 
     * @param {*} params 
     * @returns 
     */
    async createJobDefinition(params = {}) {
        const jobDefinition = await this.Batch.registerJobDefinition(params);
        if (!jobDefinition) {
            return {
                message: `Couldn't register job definition.`
            };
        }
        return { message: 'Successfully registered job definition.' }
    }

    async deregisterJobDefinition(params = {}) {
        const job = await this.Batch.deregisterJobDefinition(params, (error, data) => {
            if (error) {
                console.log(error);
                return;
            }
            console.log(data);
        });
    }

    /**
     * 
     * @param {*} params 
     * @returns 
     */
    async getJobDefinitionDetails(params = {}) {
        const jobDefinitionDetails = this.Batch.describeJobDefinitions(params);
        if (!jobDefinitionDetails) {
            return {
                message: `Couldn't find Job Definition`
            };
        }

        return jobDefinitionDetails;
    }

    /**
     * 
     * @param {*} collectionName 
     * @param {*} params 
     * @returns 
     */
    saveTask(collectionName, params = {}) {
        const task = this.dbConnection[collectionName].create(params);
        return { taskId: task._id };
    }

    /**
     * 
     * @param {*} params 
     * Params will contain taskId which will be generated by saveTask Fn
     */
    async submitJob(params = {}) {
        return await this.Batch.submitJob(params);
    }


    async terminateJob(params = {}) {
        const jobDetails = await this.Batch.terminateJob(params, (error, data) => {
            if (error) {
                console.log(error);
                return;
            }
            console.log(data);
        });

        return jobDetails;
    }


    /**
     * 
     * @param {*} params 
     * Note: after cancellation of job, termination of job required. 
     */
    async cancelJob(params = {}) {
        await this.Batch.cancelJob(params, (error, data) => {
            if (error) {
                console.log(error);
                return;
            }
            console.log(data);
        });
    }

    async getJob(collectionName, taskId) {
        const job = await this.dbConnection[collectionName].findById(taskId);
        if (!job) {
            console.log(`Couldn't find job with id ${taskId}`);
            return null;
        }
        return job;
    }

    /**
     * 
     * @param {*} commands 
     */
    async createOrUpdateDockerImage(commands = []) {
        if (!commands) {
            return { message: 'Cannot create/update docker image as no commands found' };
        }
        
        commands.forEach(command => {
            this.exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                }
                console.log(`Stdout: ${stdout}`)
            });    
        });
    }

    /**
     * 
     * @param {*} params 
     */
    async alert(params = {}) {
        let tparams = {
          Name: 'alert'
        };
        let data = await sns.createTopic(tparams).promise();
        console.log('topic', data);
      
        // let params = {
        //   Protocol: 'email', /* required */
        //   TopicArn: data.TopicArn, 
        //   Endpoint: 'jatin.o@zetwerk.com',
        //   ReturnSubscriptionArn: true
        // };
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
}

module.exports = {
    TaskManager
};