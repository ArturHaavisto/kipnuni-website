import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate, isHttpResponse } from '../shared/auth';
import { find, findOne, updateOne, deleteOne } from '../shared/db_client';

const COLLECTION = 'users';

// POST /api/users/sync - Sync Auth0 user to MongoDB (called after login)
async function syncUser(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const authResult = await authenticate(request, context);
  if (isHttpResponse(authResult)) return authResult;

  const body = (await request.json()) as Record<string, unknown>;
  const auth0Sub = authResult.sub;

  await updateOne(
    COLLECTION,
    { auth0Id: auth0Sub },
    {
      $set: {
        auth0Id: auth0Sub,
        email: body.email,
        name: body.name,
        picture: body.picture,
        updatedAt: new Date().toISOString(),
      },
      $setOnInsert: {
        createdAt: new Date().toISOString(),
      },
    },
    true,
  );

  return { status: 200, jsonBody: { message: 'User synced' } };
}

// GET /api/users - Get all users (Protected)
async function getUsers(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const authResult = await authenticate(request, context);
  if (isHttpResponse(authResult)) return authResult;

  const users = await find(COLLECTION);
  return { status: 200, jsonBody: users };
}

// GET /api/users/:id - Get user by ID (Protected)
async function getUserById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const authResult = await authenticate(request, context);
  if (isHttpResponse(authResult)) return authResult;

  const id = request.params.id;
  const user = await findOne(COLLECTION, { _id: { $oid: id } });

  if (!user) {
    return { status: 404, jsonBody: { error: 'User not found' } };
  }

  return { status: 200, jsonBody: user };
}

// PUT /api/users/:id - Update user (Protected)
async function updateUser(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const authResult = await authenticate(request, context);
  if (isHttpResponse(authResult)) return authResult;

  const id = request.params.id;
  const body = (await request.json()) as Record<string, unknown>;

  // Remove fields that shouldn't be updated directly
  delete body._id;
  delete body.auth0Id;
  delete body.createdAt;

  const result = await updateOne(
    COLLECTION,
    { _id: { $oid: id } },
    { $set: { ...body, updatedAt: new Date().toISOString() } },
  );

  if (result.matchedCount === 0) {
    return { status: 404, jsonBody: { error: 'User not found' } };
  }

  return { status: 200, jsonBody: { message: 'User updated' } };
}

// DELETE /api/users/:id - Delete user (Protected)
async function deleteUser(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const authResult = await authenticate(request, context);
  if (isHttpResponse(authResult)) return authResult;

  const id = request.params.id;
  const deletedCount = await deleteOne(COLLECTION, { _id: { $oid: id } });

  if (deletedCount === 0) {
    return { status: 404, jsonBody: { error: 'User not found' } };
  }

  return { status: 200, jsonBody: { message: 'User deleted' } };
}

// Register routes
app.http('users-sync', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'users/sync',
  handler: syncUser,
});

app.http('users-list', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'users',
  handler: getUsers,
});

app.http('users-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'users/{id}',
  handler: getUserById,
});

app.http('users-update', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'users/{id}',
  handler: updateUser,
});

app.http('users-delete', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'users/{id}',
  handler: deleteUser,
});
