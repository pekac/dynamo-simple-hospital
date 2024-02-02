import { Injectable } from '@nestjs/common';

import {
  CreatePatientDto,
  CreateTestDto,
  ListPatientsDto,
  UpdatePatientDto,
} from '../dtos/';

import { crossPartitionEntityList } from '../dynamo/';

import { Patient } from '../entities';

import { IPatientsService, ITestsService } from '../interfaces/';

import { truncateDateToWeek } from '../utils/';

@Injectable()
export class PatientsUseCases {
  constructor(
    private patientsService: IPatientsService,
    private testsService: ITestsService,
  ) {}

  async getPatientList(queryParams: ListPatientsDto): Promise<any> {
    if (queryParams.sortBy === 'lastName') {
      return this.getPatientsByLastName(queryParams);
    }

    return this.getPatientsByCreatedAt(queryParams);
  }

  async getPatientsByCreatedAt({
    lastSeen = '$',
    limit,
  }: ListPatientsDto): Promise<Patient[]> {
    const firstCollection = truncateDateToWeek(new Date()).toISOString();
    const lastCollection = truncateDateToWeek(
      new Date(2024, 0, 1),
    ).toISOString();

    const shouldContinue = (col: string) => col >= lastCollection;

    const getItems = (col: string, limit: number) =>
      this.patientsService.listByCreatedAt(col, limit, lastSeen);

    const updateCollection = (
      col: string,
    ): { collection: string; lastSeen?: string } => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(new Date(col).getDate() - 7);
      return {
        collection: truncateDateToWeek(sevenDaysAgo).toISOString(),
      };
    };

    return crossPartitionEntityList({
      collection:
        lastSeen === '$'
          ? firstCollection
          : truncateDateToWeek(new Date(lastSeen)).toISOString(),
      limit,
      getItems,
      shouldContinue,
      updateCollection,
    });
  }

  async getPatientsByLastName({
    lastSeen = '$',
    limit,
  }: ListPatientsDto): Promise<Patient[]> {
    const firstCollection = 'A';
    const lastCollection = 'Z';

    const shouldContinue = (col: string) =>
      col.charCodeAt(0) <= lastCollection.charCodeAt(0);

    const getItems = (col: string, limit: number, lastSeen = '$') =>
      this.patientsService.listByLastName(col, limit, lastSeen.toUpperCase());

    const updateCollection = (
      col: string,
    ): { collection: string; lastSeen?: string } => {
      return {
        collection: String.fromCharCode(col.charCodeAt(0) + 1),
      };
    };

    return crossPartitionEntityList({
      collection: lastSeen === '$' ? firstCollection : lastSeen.charAt(0),
      limit,
      getItems,
      shouldContinue,
      updateCollection,
    });
  }

  getPatientById(patientId: string) {
    return this.patientsService.one(patientId);
  }

  createPatient(createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  updatePatient(patientId: string, updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(patientId, updatePatientDto);
  }

  deletePatient(patientId: string) {
    return this.patientsService.remove(patientId);
  }
  /* tests */
  createTestForPatient(patientId: string, createTestDto: CreateTestDto) {
    return this.testsService.create(patientId, createTestDto);
  }

  getTestForPatient(patientId: string, testId: string) {
    return this.testsService.one(patientId, testId);
  }

  deleteTest(patientId: string, testId: string) {
    return this.testsService.remove(patientId, testId);
  }

  getTestsForPatient(
    patientId: string,
    lastSeen: string = '$',
    limit: number = 3,
  ) {
    return this.testsService.listTestsForPatient(patientId, lastSeen, limit);
  }

  listDoctors(patientId: string, limit: number = 3, lastSeen: string = '$') {
    return this.patientsService.listDoctors(patientId, limit, lastSeen);
  }
}
