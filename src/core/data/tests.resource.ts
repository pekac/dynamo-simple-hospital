import { Injectable } from '@nestjs/common';

import { Resource } from 'src/dynamo';

import { TEST_PK_PREFIX, TEST_SK_PREFIX } from '../constants';

import { Test } from '../entities';

@Injectable()
export class TestsResource extends Resource<Test> {
  constructor() {
    super({
      entityTemplate: Test,
      pkPrefix: TEST_PK_PREFIX,
      skPrefix: TEST_SK_PREFIX,
    });
  }
}
