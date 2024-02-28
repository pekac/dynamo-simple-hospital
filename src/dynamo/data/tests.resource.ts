import { Injectable } from '@nestjs/common';
const KSUID = require('ksuid');

import {
  CreateTestDto,
  DOCTOR_ID_PREFIX,
  ITestsResource,
  TEST_PK_PREFIX,
  TEST_SK_PREFIX,
  Test,
} from 'src/core';

import { ItemKey, Resource } from '../resource';

@Injectable()
export class TestsResource extends Resource<Test> implements ITestsResource {
  constructor() {
    super({
      entityTemplate: Test,
      pkPrefix: TEST_PK_PREFIX,
      skPrefix: TEST_SK_PREFIX,
    });
  }

  addTest(patientId: string, dto: CreateTestDto): Promise<string | undefined> {
    return this.create({
      dto,
      parentId: patientId,
      decorator: decorateTest,
    });
  }
}

function decorateTest(test: CreateTestDto & ItemKey & { createdAt: Date }) {
  const createdAt = new Date(test.createdAt).toISOString();
  const ksuid = KSUID.randomSync(createdAt).string;
  /* override SK */
  test.SK = `${TEST_SK_PREFIX}${ksuid}`;
  return {
    ...test,
    id: this.stripSkPrefix(test.SK),
    createdAt,
    /* for fetching by doctor id */
    GSI1PK: `${DOCTOR_ID_PREFIX}${test.doctorId}`,
    GSI1SK: test.SK,
  };
}
