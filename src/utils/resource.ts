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

export interface IResource<T> {
  create(createDto: T): Promise<T | undefined>;
  one(pk: string, sk: string): Promise<T | undefined>;
  update(pk: string, sk: string, updateDto: Partial<T>): Promise<T>;
  remove(pk: string, sk: string): Promise<string>;
  generateItemKey(pk: string, sk: string): ItemKey;
  mapToEntity(
    entity: Record<string, number | string> | undefined,
  ): T | undefined;
}

export abstract class Resource<T extends Record<keyof T, any>>
  implements IResource<T>
{
  private readonly client: DynamoDBDocumentClient = client;
  private readonly tableName: string = DATA_TABLE;
  private c: { new (): T };
  pkPrefix: string;
  skPrefix: string;

  constructor(c: { new (): T }, pkPrefix: string, skPrefix: string = pkPrefix) {
    this.c = c;
    this.pkPrefix = pkPrefix;
    this.skPrefix = skPrefix;
  }

  abstract create(createDto: T): Promise<T | undefined>;

  generateItemKey(pk: string, sk: string = pk): ItemKey {
    return {
      PK: `${this.pkPrefix}${pk}`,
      SK: `${this.skPrefix}${sk}`,
    };
  }

  mapToEntity(
    entity: Record<string, number | string> | undefined = {},
  ): T | undefined {
    const keys: string[] = Object.keys(entity);

    if (keys.length === 0) {
      return undefined;
    }

    type Key = keyof T;
    const transformed: Record<Key, number | string> = new this.c();

    const keyNames = Object.keys(transformed) as Key[];

    for (const key of keys) {
      const transformedKey = decapitalize(key) as Key;
      if (keyNames.includes(transformedKey)) {
        transformed[transformedKey] = entity[key];
      }
    }

    return transformed as T;
  }

  async one(pk: string, sk: string = pk): Promise<T | undefined> {
    const key = this.generateItemKey(pk, sk);
    const command = new GetCommand({
      TableName: this.tableName,
      Key: key,
    });
    const { Item } = await this.client.send(command);
    return this.mapToEntity(Item);
  }

  async update(pk: string, sk: string, updateDto: Partial<T>): Promise<T> {
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

  async remove(pk: string, sk: string = pk): Promise<any> {
    const key = this.generateItemKey(pk, sk);
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: key,
    });
    const result = await this.client.send(command);
    return result;
  }
}
