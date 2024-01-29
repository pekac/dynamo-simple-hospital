import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

import { DATA_TABLE, client, objToUpdateExpression } from '../dynamo';

export type Id = {
  id: string;
};

export type Key = 'PK' | 'SK';
export type ItemKey = {
  [key in Key]: string;
};

export interface IResource<T> {
  create(createDto: T): Promise<string>;
  one(pk: string, sk: string): Promise<T | undefined>;
  update(pk: string, sk: string, updateDto: Partial<T>): Promise<T>;
  remove(pk: string, sk: string): Promise<string>;
}

export abstract class Resource<T extends Id> implements IResource<T> {
  pkPrefix: string;
  skPrefix: string;
  private readonly client: DynamoDBDocumentClient = client;
  private readonly tableName: string = DATA_TABLE;

  constructor(pkPrefix: string, skPrefix: string = pkPrefix) {
    this.pkPrefix = pkPrefix;
    this.skPrefix = skPrefix;
  }

  private generateItemKey(pk: string, sk: string): ItemKey {
    return {
      PK: `${this.pkPrefix}${pk}`,
      SK: `${this.skPrefix}${sk}`,
    };
  }

  abstract create(createDto: T): Promise<string>;
  abstract mapToEntity(entity: Record<string, any> | undefined): T | undefined;

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
