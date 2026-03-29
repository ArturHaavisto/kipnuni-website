import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const AUTH0_ISSUER = process.env.AUTH0_ISSUER_BASE_URL!;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE!;

const client = jwksClient({
  jwksUri: `${AUTH0_ISSUER}.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback): void {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export interface AuthPayload {
  sub: string;
  [key: string]: unknown;
}

function verifyToken(token: string): Promise<AuthPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: AUTH0_AUDIENCE,
        issuer: AUTH0_ISSUER,
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded as AuthPayload);
        }
      },
    );
  });
}

export async function authenticate(
  request: HttpRequest,
  _context: InvocationContext,
): Promise<AuthPayload | HttpResponseInit> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return { status: 401, jsonBody: { error: 'Missing or invalid authorization header' } };
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token);
    return payload;
  } catch {
    return { status: 401, jsonBody: { error: 'Invalid token' } };
  }
}

export function isHttpResponse(
  result: AuthPayload | HttpResponseInit,
): result is HttpResponseInit {
  return 'status' in result;
}
