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

  addTest(dto: CreateTestDto, patientId: string): Promise<string | undefined> {
    return this.create({
      dto,
      parentId: patientId,
      decorator: decorateTest,
    });
  }
}

function decorateTest(test: CreateTestDto & ItemKey & { createdAt: Date }) {
  const ksuid = KSUID.randomSync(test.createdAt).string;
  /* override SK */
  test.SK = `${TEST_SK_PREFIX}${ksuid}`;
  return {
    ...test,
    /* for fetching by doctor id */
    GSI1PK: `${DOCTOR_ID_PREFIX}${test.doctorId}`,
    GSI1SK: test.SK,
  };
}
