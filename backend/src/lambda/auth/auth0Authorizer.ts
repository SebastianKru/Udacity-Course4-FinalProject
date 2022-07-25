import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const cert = '-----BEGIN CERTIFICATE-----MIIDDTCCAfWgAwIBAgIJbBbtho50TWjiMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNVBAMTGWRldi1tdjdya2JzNC51cy5hdXRoMC5jb20wHhcNMjIwNzIxMDczNzA3WhcNMzYwMzI5MDczNzA3WjAkMSIwIAYDVQQDExlkZXYtbXY3cmticzQudXMuYXV0aDAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkz1mAYCftuppZpTRwcvb3D40x0TMBY0jnbaDRKBdTAZIY5vDfiq+rvPfgf304z9S9SAMiRIhrU99Uh/U1IXkCTqqbSSPsbDO0Zigo60LVGiKYrxDrEdmZKc1LgWaPQBI5vmq717yk+H07g72lKWXISj+KvXK5VYWi0gsw5OsH4ULk/fvYwFSOVyGoM1TTNJeQA9rYZWDjtTLwtrM6ARNf5dlHORvggbLxm3REiP2QTp7UtKy5U8br3SF2E/CTwlJlFfG+glIshnVzdly5H3zo7vgnXRyWISdpECt0izHO5F7oHJYxNoqErqnOmcc4MXgusur1lXAyiDaoZpAW9+gfQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQXdqCAliZa134VZKivBn0EkUpw1zAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAE4X0WPNVe93DZmjsydqSO4CffV0xyUzLv8wzjmQuyUFBqad9fotUv4V0+3fTGqB7CkaNFZPyzG6bNOVOEjy4W/W26EP7IFnrh54+/YDVnydV1606y257P2JiYHuWCqnvT9H5x1tY2l4+IXNM2Q74Cvykk5HPppj3pQf/hlZ+hVhpLGLvWR1yskrFn+1lcQnklQ/8u0GMvSrbYp+s8y6+j8mqTtzfJp/I+/2NSLCM4YZHjKjDDjyC7e+YETzsjnuu3GX9RUh9VXnpRNQ5nL80iOgtuoF+slXb768PwmJJsNRpGdgFYSIaHanoh9w1SKIidJqwSNvqC4t8svMT1nxC2g=-----END CERTIFICATE-----'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  
  if (!authHeader)
    throw new Error('No authentication header')
    
  return verify(token, cert, {algorithms: ['RS256']}) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
