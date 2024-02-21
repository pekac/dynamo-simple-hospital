import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

import { decapitalize } from 'src/utils';

import { DATA_TABLE, client } from './client';

import { objToUpdateExpression } from './helpers';

type ID = { id: string };
export type Key = 'PK' | 'SK';
export type ItemKey = {
  [key in Key]: string;
};
export type PrimaryKey = string | { pk: string; sk: string };

export function IDENTITY<T>(value: T): T {
  return value;
}

interface CreateItem<T> {
  dto: any & ID;
  parentId?: string;
  decorator?: (obj: any) => any;
}

export interface IResource<T> {
  create(createItem: CreateItem<T>): Promise<string | undefined>;
  one(pk: string, sk: string): Promise<T | undefined>;
  update(pk: string, sk: string, updateDto: Partial<T>): Promise<T>;
  remove(pk: string, sk: string): Promise<string>;
}

interface CreateResource<T> {
  entityTemplate: { new (): T };
  pkPrefix: string;
  skPrefix?: string;
}

export abstract class Resource<T extends Record<keyof T, any>>
  implements IResource<T>
{
  protected readonly client: DynamoDBDocumentClient = client;
  protected readonly tableName: string = DATA_TABLE;
  private entityTemplate: { new (): T };
  private pkPrefix: string;
  skPrefix: string;

  constructor({
    entityTemplate,
    pkPrefix,
    skPrefix = pkPrefix,
  }: CreateResource<T>) {
    this.entityTemplate = entityTemplate;
    this.pkPrefix = pkPrefix;
    this.skPrefix = skPrefix;
  }

  private generateItemKey(pk: string, sk: string = pk): ItemKey {
    return {
      PK: `${this.pkPrefix}${pk}`,
      SK: `${this.skPrefix}${sk}`,
    };
  }

  protected mapToEntity(
    record: Record<string, number | string> | undefined = {},
  ): T {
    const keys: string[] = Object.keys(record);
    const entity: T = new this.entityTemplate();
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

  async create({
    dto,
    parentId,
    decorator = IDENTITY,
  }: CreateItem<T>): Promise<string | undefined> {
    const createdAt = new Date();
    const pk = parentId || dto.id;
    const sk = dto.id;
    const primaryKey = this.generateItemKey(pk, sk);
    const item = decorator({ ...primaryKey, ...dto, createdAt });

    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    });
    await this.client.send(command);
    return dto.id;
  }

  async one(...args: [string, string?]): Promise<T | undefined> {
    const key = this.generateItemKey(...args);
    const command = new GetCommand({
      TableName: this.tableName,
      Key: key,
    });
    const { Item } = await this.client.send(command);

    if (!Item) {
      return undefined;
    }

    return this.mapToEntity(Item);
  }

  async update(
    ...args: [string, Partial<T>] | [string, string, Partial<T>]
  ): Promise<T> {
    /* not nice, mini hack for 2nd optional param */
    const [pk, sk, updateDto] = [
      args[0],
      args.length > 2 ? args[1] : args[0],
      args[args.length - 1],
    ] as [string, string, Partial<T>];
    const key = this.generateItemKey(pk, sk);
    const updateExpressionAndValues = objToUpdateExpression(updateDto);
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: key,
      ...updateExpressionAndValues,
      ReturnValues: 'ALL_NEW',
    });
    const result = await this.client.send(command);
    return this.mapToEntity(result.Attributes) as T;
  }

  async remove(...args: [string, string?]): Promise<any> {
    const key = this.generateItemKey(...args);
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: key,
    });
    const result = await this.client.send(command);
    return result;
  }
}
