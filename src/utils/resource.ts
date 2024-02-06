import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

import { DATA_TABLE, client, objToUpdateExpression } from '../dynamo';

import { decapitalize } from './text';

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

export abstract class Resource<T extends Record<keyof T, any>>
  implements IResource<T>
{
  protected readonly client: DynamoDBDocumentClient = client;
  protected readonly tableName: string = DATA_TABLE;
  private c: { new (): T };
  pkPrefix: string;
  skPrefix: string;

  constructor(c: { new (): T }, pkPrefix: string, skPrefix: string = pkPrefix) {
    this.c = c;
    this.pkPrefix = pkPrefix;
    this.skPrefix = skPrefix;
  }

  abstract create(createDto: T, parentId?: string): Promise<T | undefined>;

  protected generateItemKey(pk: string, sk: string = pk): ItemKey {
    return {
      PK: `${this.pkPrefix}${pk}`,
      SK: `${this.skPrefix}${sk}`,
    };
  }

  protected mapToEntity(
    record: Record<string, number | string> | undefined = {},
  ): T {
    const keys: string[] = Object.keys(record);
    const entity: T = new this.c();
    const keyNames = Object.keys(entity);

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

  async one(...args: [string, string?]): Promise<T | undefined> {
    const key = this.generateItemKey(...args);
    const command = new GetCommand({
      TableName: this.tableName,
      Key: key,
    });
    const { Item } = await this.client.send(command);
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
