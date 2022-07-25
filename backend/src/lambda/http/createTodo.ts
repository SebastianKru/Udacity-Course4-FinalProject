import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item
    const newToDoItem = await createTodo(newTodo, getUserId(event));
  
return {
  statusCode: 201,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({
    item: newToDoItem
  })
}
  }
)

handler.use(
  cors({
    credentials: true
  })
)
