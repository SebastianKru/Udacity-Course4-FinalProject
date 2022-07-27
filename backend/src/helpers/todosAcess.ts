import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
//const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE
        ){ 
        }

        
 async createTodo(todoItem: TodoItem): Promise<TodoItem>  {
    logger.info(`Create todo request processing for ${todoItem} in ${this.todosTable}`)
    await this.docClient.put({
        TableName: this.todosTable,
        Item: todoItem,
      }).promise()
      return Promise.resolve(todoItem)
}

async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`Get todos request processing for ${userId} in ${this.todosTable}`);

    const result = await this.docClient.query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
      }).promise()
      
      const items = result.Items
      return items as TodoItem[]
}

async updateTodo(updatedTodo: any): Promise<TodoItem> {
    logger.info(`Update todo request processing for ${updatedTodo.todoId} in ${this.todosTable}`)
    await this.docClient.update({
        TableName: this.todosTable,
        Key: { 
            todoId: updatedTodo.todoId, 
            userId: updatedTodo.userId },
        ExpressionAttributeNames: {"#N": "name"},
        UpdateExpression: "set #N = :name, dueDate = :dueDate, done = :done",
        ExpressionAttributeValues: {
            ":name": updatedTodo.name,
            ":dueDate": updatedTodo.dueDate,
            ":done": updatedTodo.done,
        },
        ReturnValues: "UPDATED_NEW"
    }).promise()
      
    return updatedTodo
}

async getTodoForUser(userId:string, todoId:string):Promise<TodoItem[]>{
    logger.info(`Get todo request for ${todoId} from ${this.todosTable}`)
    const result = await this.docClient.query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
        ExpressionAttributeValues: {
            ':userId': userId,
            ':todoId': todoId
        }
    }).promise()
    const items = result.Items

    return items as TodoItem[]
}

async deleteTodo(userId:string, todoId:string){
    logger.info(`Delete todo request processing for ${todoId} in ${this.todosTable}`)
    
    await this.docClient.delete({
        TableName: this.todosTable,
        Key: { 
            todoId, 
            userId }
    })
}

async updateAttachmentUrl(userId:string, todoId:string, uploadUrl:string){
    logger.info(`Updating the attachment URL ${uploadUrl} for todo ${todoId} in ${this.todosTable}`)
    await this.docClient.update({
        TableName: this.todosTable,
        Key: { userId, todoId },
        UpdateExpression: "set attachmentUrl=:URL",
        ExpressionAttributeValues: {
          ":URL": uploadUrl.split("?")[0]
    },
    ReturnValues: "UPDATED_NEW"
    })
    .promise();

}

}