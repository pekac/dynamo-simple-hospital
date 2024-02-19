import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { curry } from 'lodash/fp';

import { DATA_TABLE, client as documentClient, objToUpdateExpression } from '.';

import { compose, decapitalize } from '../utils';

type Key = 'PK' | 'SK';
type ItemKey = {
  [key in Key]: string;
};

interface IResource<T> {
  create(createDto: T, parentId?: string): Promise<T | undefined>;
  one(pk: string, sk: string): Promise<T | undefined>;
  update(pk: string, sk: string, updateDto: Partial<T>): Promise<T>;
  remove(pk: string, sk: string): Promise<string>;
}

interface IItemActionGenerator<T> {
  entityTemplate: { new (): T };
  actions: ITEM_BASED_ACTIONS[];
  decorate?: (entity: T) => T;
  pkPrefix: string;
  skPrefix?: string;
}

export enum ITEM_BASED_ACTIONS {
  CREATE,
  GET,
  UPDATE,
  DELETE,
}

type ID = { id: string };

export function IDENTITY<T>(value: T): T {
  return value;
}

export function itemActionGenerator<T extends Record<keyof T, any>>({
  actions,
  entityTemplate,
  decorate = IDENTITY,
  pkPrefix,
  skPrefix = pkPrefix,
}: IItemActionGenerator<T>): Partial<IResource<T>> {
  const client: DynamoDBDocumentClient = documentClient;
  const tableName: string = DATA_TABLE;

  function generateItemKey(pk: string, sk: string = pk): ItemKey {
    return {
      PK: `${pkPrefix}${pk}`,
      SK: `${skPrefix}${sk}`,
    };
  }

  function decorateWithPrimaryKey<T>(dto: Partial<T> & ID): Partial<T> {
    const primaryKey = generateItemKey(dto.id);
    return {
      ...primaryKey,
      ...dto,
    };
  }

  function mapToEntity(
    record: Record<string, number | string> | undefined,
  ): T | undefined {
    if (!record) {
      return undefined;
    }

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

  async function create(createDto: Partial<T> & ID): Promise<string> {
    const command = new PutCommand({
      TableName: tableName,
      Item: createDto,
    });
    await client.send(command);
    return createDto.id;
  }

  async function one(
    key: ItemKey,
  ): Promise<Record<string, number | string> | undefined> {
    const command = new GetCommand({
      TableName: tableName,
      Key: key,
    });
    const { Item } = await client.send(command);
    return Item;
  }

  function transformUpdateArgs(
    ...args: [string, Partial<T>] | [string, string, Partial<T>]
  ): [string, string, Partial<T>] {
    /* not nice, mini hack for 2nd optional param */
    return [
      args[0],
      args.length > 2 ? args[1] : args[0],
      args[args.length - 1],
    ] as [string, string, Partial<T>];
  }

  // const updateExpressionAndValues = objToUpdateExpression(updateDto);

  async function update(key: ItemKey, updateDto: Partial<T>): Promise<string> {
    const command = new UpdateCommand({
      TableName: tableName,
      Key: key,
      // ...updateExpressionAndValues,
      ReturnValues: 'ALL_NEW',
    });
    const result = await client.send(command);
    return result.Attributes?.Id;
  }

  async function remove(key: ItemKey): Promise<string> {
    const command = new DeleteCommand({
      TableName: tableName,
      Key: key,
    });
    const result = await client.send(command);
    return result.Attributes?.Id;
  }

  const itemActions: Partial<IResource<T>> = {};
  if (actions.includes(ITEM_BASED_ACTIONS.CREATE)) {
    itemActions.create = compose(create, decorate, decorateWithPrimaryKey);
  }
  if (actions.includes(ITEM_BASED_ACTIONS.GET)) {
    itemActions.one = compose(mapToEntity, one, curry(generateItemKey));
  }
  if (actions.includes(ITEM_BASED_ACTIONS.UPDATE)) {
    itemActions.update = compose(mapToEntity, update, curry(generateItemKey));
  }
  if (actions.includes(ITEM_BASED_ACTIONS.DELETE)) {
    itemActions.remove = compose(remove, curry(generateItemKey));
  }

  return itemActions;
}
