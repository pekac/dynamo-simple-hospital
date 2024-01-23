import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { ListTablesCommand } from '@aws-sdk/client-dynamodb';

import * as migrations from './migrations';

import { client } from './client';

export const MIGRATIONS_TABLE = 'migrations';

let counter = 0;
const maxLength = 9;

export async function addMigration(
  client: DynamoDBDocumentClient,
  fn: (...args: any) => Promise<void>,
): Promise<void> {
  counter++;
  const MigrationId = counter.toString().padStart(maxLength, '0');
  try {
    const listCommand = new ListTablesCommand({});
    const { TableNames = [] } = await client.send(listCommand);

    if (TableNames.includes(MIGRATIONS_TABLE)) {
      const getMigrationCommand = new GetCommand({
        TableName: MIGRATIONS_TABLE,
        Key: {
          MigrationId,
        },
      });
      const { Item } = await client.send(getMigrationCommand);
      if (Item) return;
    }

    await fn(client);

    const createMigrationCommand = new PutCommand({
      TableName: MIGRATIONS_TABLE,
      Item: {
        MigrationId,
        Name: fn.name,
      },
    });

    await client.send(createMigrationCommand);
  } catch (e) {
    throw new Error(e.message);
  }
}

/* TODO: add up / down */

export async function applyMigrations() {
  try {
    const applied = [];
    for (const m of Object.values(migrations)) {
      await addMigration(client, m);
      applied.push(m);
    }
  } catch (e) {
    /* iterate over applied and negate */
    console.log('You fucked up: ', e.message);
  }
}
