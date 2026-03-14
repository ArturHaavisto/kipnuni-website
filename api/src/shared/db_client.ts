import https from 'https';

const agent = new https.Agent({ keepAlive: true });

const DATA_API_URL = process.env.ATLAS_DATA_API_URL!;
const DATA_API_KEY = process.env.ATLAS_DATA_API_KEY!;

interface DataApiRequest {
  collection: string;
  database?: string;
  dataSource?: string;
  filter?: Record<string, unknown>;
  projection?: Record<string, unknown>;
  document?: Record<string, unknown>;
  update?: Record<string, unknown>;
  upsert?: boolean;
}

interface DataApiResponse<T = unknown> {
  document?: T;
  documents?: T[];
  insertedId?: string;
  matchedCount?: number;
  modifiedCount?: number;
  deletedCount?: number;
}

export async function dataApiRequest<T = unknown>(
  action: string,
  body: DataApiRequest,
): Promise<DataApiResponse<T>> {
  const url = `${DATA_API_URL}/action/${action}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': DATA_API_KEY,
    },
    body: JSON.stringify({
      dataSource: body.dataSource ?? 'Cluster0',
      database: body.database ?? 'kipnuni',
      ...body,
    }),
    // @ts-expect-error Node.js fetch supports agent via dispatcher
    dispatcher: agent,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Atlas Data API error (${response.status}): ${text}`);
  }

  return response.json() as Promise<DataApiResponse<T>>;
}

export async function findOne<T = unknown>(
  collection: string,
  filter: Record<string, unknown>,
): Promise<T | null> {
  const result = await dataApiRequest<T>('findOne', { collection, filter });
  return result.document ?? null;
}

export async function find<T = unknown>(
  collection: string,
  filter: Record<string, unknown> = {},
): Promise<T[]> {
  const result = await dataApiRequest<T>('find', { collection, filter });
  return result.documents ?? [];
}

export async function insertOne(
  collection: string,
  document: Record<string, unknown>,
): Promise<string> {
  const result = await dataApiRequest('insertOne', { collection, document });
  return result.insertedId!;
}

export async function updateOne(
  collection: string,
  filter: Record<string, unknown>,
  update: Record<string, unknown>,
  upsert = false,
): Promise<{ matchedCount: number; modifiedCount: number }> {
  const result = await dataApiRequest('updateOne', {
    collection,
    filter,
    update,
    upsert,
  });
  return {
    matchedCount: result.matchedCount ?? 0,
    modifiedCount: result.modifiedCount ?? 0,
  };
}

export async function deleteOne(
  collection: string,
  filter: Record<string, unknown>,
): Promise<number> {
  const result = await dataApiRequest('deleteOne', { collection, filter });
  return result.deletedCount ?? 0;
}
