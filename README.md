### Create TaskManager Object
```
const taskManager = new TaskManager(batchConfig, dbConnection, ecrClientConfig);
```

### Create/Update Docker Image
```
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
```

### ECR Registry Command 
```
    /**
    * 
    * @param {*} params 
    * @returns 
    */
    createECRRepositoryCommand(params) {
    const command = new this.ECR.CreateRepositoryCommand(params);
    return command;
}
```

### ECR Registry
```
    /**
     * 
     * @param {*} command 
     * @returns 
     */
    async runECRCommand(command) {
        return await this.client.send(params);
    }
```

### Create Compute Environment
```
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
```

### Delete Environment 
```
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
```

### Create Job Queue
```
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
```
### Alert 
```
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
```
### Create Job Definition
```
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
```
### Deregister Job Definition
```
    /**
     * 
     * @param {*} params 
     */
    async deregisterJobDefinition(params = {}) {
        const job = await this.Batch.deregisterJobDefinition(params, (error, data) => {
            if (error) {
                console.log(error);
                return;
            }
            console.log(data);
        });
    }
```
### Save Task
```
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
```

### Submit Job
```
    /**
     * 
     * @param {*} params 
     * Params will contain taskId which will be generated by saveTask Fn
     */
    async submitJob(params = {}) {
        return await this.Batch.submitJob(params);
    }
```

### Terminate Job
```
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
```

### Cancel Job
```
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
```

### Get Job
```
    /**
     * 
     * @param {*} collectionName 
     * @param {*} taskId 
     * @returns 
     */
    async getJob(collectionName, taskId) {
        const job = await this.dbConnection[collectionName].findById(taskId);
        if (!job) {
            console.log(`Couldn't find job with id ${taskId}`);
            return null;
        }
        return job;
    }
```