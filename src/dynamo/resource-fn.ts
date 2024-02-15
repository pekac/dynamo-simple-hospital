import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
const curry = require('lodash/curry');
const flowRight = require('lodash/flowRight');

import { DATA_TABLE, client as documentClient, objToUpdateExpression } from '.';

import { decapitalize } from '../utils/text';

export type Key = 'PK' | 'SK';
export type ItemKey = {
  [key in Key]: string;
};
export type PrimaryKey = string | { pk: string; sk: string };

export interface IResource<T> {
  create(createDto: T, parentId?: string): Promise<T | undefined>;
  one(pk: string, sk: string): Promise<T | undefined>;
  update(pk: string, sk: string, updateDto: Partial<T>): Promise<T>;
  remove(pk: string, sk: string): Promise<string>;
}

export enum ITEM_BASED_ACTIONS {
  CREATE,
  GET,
  UPDATE,
  DELETE,
}

export function itemBasedActionGenerator<T extends Record<keyof T, any>>(
  entityTemplate: { new (): T },
  pkPrefix: string,
  skPrefix: string,
  action: ITEM_BASED_ACTIONS,
) {
  const client: DynamoDBDocumentClient = documentClient;
  const tableName: string = DATA_TABLE;

  function generateItemKey(pk: string, sk: string = pk): ItemKey {
    return {
      PK: `${pkPrefix}${pk}`,
      SK: `${skPrefix}${sk}`,
    };
  }

  function mapToEntity(
    record: Record<string, number | string> | undefined = {},
  ): T {
    const keys: string[] = Object.keys(record);
    const entity: T = new entityTemplate();
    const keyNames: string[] = Object.keys(entity);

    return keys.reduce((entity, key) => {
      const transformedKey = decapitalize(key);
      if (keyNames.includes(transformedKey)) {
        entity = {
          ...entity,
          [transformedKey]: record[key],
        };
      }
      return entity;
    }, entity);
  }

  async function one(
    key: ItemKey,
  ): Promise<Record<string, number | string> | undefined> {
    const command = new GetCommand({
      TableName: tableName,
      Key: key,
    });
    const { Item } = await client.send(command);

    if (!Item) {
      return undefined;
    }

    return Item;
  }

  function temp(...args: [string, Partial<T>] | [string, string, Partial<T>]) {
    /* not nice, mini hack for 2nd optional param */
    const [pk, sk, updateDto] = [
      args[0],
      args.length > 2 ? args[1] : args[0],
      args[args.length - 1],
    ] as [string, string, Partial<T>];
  }

  // const updateExpressionAndValues = objToUpdateExpression(updateDto);

  async function update(
    key: ItemKey,
    updateDto: Partial<T>,
  ): Promise<Record<string, number | string> | undefined> {
    const command = new UpdateCommand({
      TableName: tableName,
      Key: key,
      // ...updateExpressionAndValues,
      ReturnValues: 'ALL_NEW',
    });
    const result = await client.send(command);
    return result.Attributes;
  }

  async function remove(key: ItemKey): Promise<any> {
    const command = new DeleteCommand({
      TableName: tableName,
      Key: key,
    });
    const result = await client.send(command);
    return result;
  }

  switch (action) {
    // case ITEM_BASED_ACTIONS.CREATE: {
    //   return one; // apply: generate key, db query, map to entity
    // }

    case ITEM_BASED_ACTIONS.GET: {
      return flowRight(mapToEntity, one, curry(generateItemKey));
    }

    case ITEM_BASED_ACTIONS.UPDATE: {
      return flowRight(mapToEntity, update, curry(generateItemKey));
    }

    case ITEM_BASED_ACTIONS.DELETE: {
      return flowRight(remove, curry(generateItemKey));
    }

    default: {
      return (...args: any) => {
        throw new Error('dont mess around');
      };
    }
  }
}
