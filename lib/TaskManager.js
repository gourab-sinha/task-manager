const Batchclient = require('@aws-sdk/client-batch');
const childProcess = require('child_process');

class TaskManager {
    constructor(batchConfiguration, dbConnection) {
        this.Batch = new Batchclient.Batch(batchConfiguration);
        this.dbConnection = dbConnection;
    }

    /**
     * 
     * @param {*} params 
     * @returns 
     */
    async createComputeEnvironment(params = {}) {
        const computeEnvironment = await this.Batch.createComputeEnvironment(params);
        return computeEnvironment;
    }

    /**
     * 
     * @param {*} params 
     * @returns 
     */
    async createJobQueue(params = {}) {
        const queue = await this.Batch.createJobQueue(params);
        if (!queue) {
            return {
                message: `Couldn't create job queue`
            };
        }

        return { message: 'Successfully created the job queue'};
    }


    /**
     * 
     * @param {*} params 
     * @returns 
     */
    async deleteJobQueue(params = {}) {
        const deletedJobQueue = await this.Batch.deleteJobQueue(params);
        if (!deletedJobQueue) {
            return {
                message: `Couldn't deleted the job queue`
            };
        }

        return {message: `Successfully deleted the job queue`};
    }

    /**
     * 
     * @param {*} params 
     * @returns 
     */
    async describeJobQueue(params = {}) {
        const describeJobQueue = await this.Batch.describeJobQueues(params);
        return describeJobQueue;
    }

    /**
     * 
     * @param {*} params 
     * @returns 
     */
    async createJobDefinition(params = {}) {
        const jobDefinition = this.Batch.registerJobDefinition(params);
        if (!jobDefinition) {
            return  {
                message: `Couldn't register job definition.`
            };
        }
        return { message: 'Successfully registered job definition.'}
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
     * @param {*} params 
     * @returns 
     */
    saveTask(params = {}) {
        const task = this.dbConnection['task'].create(params);
        return {taskId: task._id};
    }

    /**
     * 
     * @param {*} params 
     */
    submitJob(params = {}) {
        this.Batch.submitJob({
            ...params,
            containerOverrides: {
                ...params.containerOverrides,
                command: ['node', 'index.js', `taskId=${params.taskId}`]
            }
        });
    }

    /**
     * 
     * @param {*} commands 
     */
    createDockerImage(commands = null) {
        
    }
}