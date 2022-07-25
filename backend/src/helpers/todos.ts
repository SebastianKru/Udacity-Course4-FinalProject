import { TodosAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'


import { createUploadPresignedUrl } from '../helpers/attachmentUtils';


// TODO: Implement businessLogic
const log = createLogger('deleteTodo');
const todosAccess = new TodosAccess()
 export async function createTodo(createToDoReq:CreateTodoRequest, userIdVal:string): Promise<TodoItem>{
 const timestamp = new Date().toISOString()
   var done = false
    const itemId = uuid.v4()
  if(new Date().getTime()>new Date(createToDoReq.dueDate).getTime()){
    done = true;
  }
    
    return await todosAccess.createTodo({
        todoId: itemId,
        userId: userIdVal,
        done: done,
        attachmentUrl: "",
        createdAt: timestamp,
        name: createToDoReq.name,
        dueDate: createToDoReq.dueDate
      })
    }

    export async function getTodosForUser(userId:string): Promise<any>{
        log.info(`Get todo for user: ${userId}  `)
    return await todosAccess.getAllTodos(userId)
    }

    export async function updateTodo(updateTodoRequest: UpdateTodoRequest, userId: string, todoId: string): Promise<TodoItem>{
        log.info(`Update todo: ${todoId} for user: ${userId}`)
        return await todosAccess.updateTodo({
            userId,
            todoId,
            name: updateTodoRequest.name,
            dueDate: updateTodoRequest.dueDate,
            done: updateTodoRequest.done
        })
    }

export async function getTodo(userId:string, todoId:string):Promise<TodoItem[]>{
    log.info(`get todo for the ID: ${todoId}`)
    return await todosAccess.getTodoForUser(userId,todoId)
}




export async function createAttachmentPresignedUrl(userId:string, todoId:string):Promise<string>{
    log.info(`createAttachmentUrl ${todoId} for user: ${userId}`)
    const uploadUrl = await createUploadPresignedUrl(todoId)
    await todosAccess.updateAttachmentUrl(userId, todoId, uploadUrl)
    return uploadUrl;
}

export async function deleteTodo(userId:string, todoId:string){
    log.info(`Deleting todo: ${todoId} from user: ${userId}`)
    await todosAccess.deleteTodo(userId,todoId)
}