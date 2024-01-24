import { Injectable } from '@nestjs/common';
/* interfaces */
import { IPatientsService } from '../interfaces/patient.interface';
/* dtos */
import {
  CreatePatientDto,
  GetPatientDto,
  ListPatientsDto,
  UpdatePatientDto,
} from '../dtos/patient.dto';
/* dynamo */
import { crossPartitionEntityList } from 'src/dynamo/helpers';
/* utils */
import { truncateDateToWeek } from '../utils/dates';

@Injectable()
export class PatientsUseCases {
  constructor(private patientsService: IPatientsService) {}

  async getPatientList(queryParams: ListPatientsDto): Promise<any> {
    if (queryParams.sortBy === 'lastName') {
      return this.getPatientsByLastName(queryParams);
    }

    return this.getPatientsByCreatedAt(queryParams);
  }

  async getPatientsByCreatedAt({
    lastSeen = '$',
    limit,
  }: ListPatientsDto): Promise<GetPatientDto[]> {
    const firstCollection = truncateDateToWeek(new Date()).toISOString();
    const lastCollection = truncateDateToWeek(
      new Date(2024, 0, 1),
    ).toISOString();

    const shouldContinue = (col: string) => col >= lastCollection;

    const getItems = (col: string) =>
      this.patientsService.listByCreatedAt(col, lastSeen, limit);

    const updateCollection = (col: string): string => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(new Date(col).getDate() - 7);
      return truncateDateToWeek(sevenDaysAgo).toISOString();
    };

    return crossPartitionEntityList<GetPatientDto>({
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
  }: ListPatientsDto): Promise<GetPatientDto[]> {
    const firstCollection = 'A';
    const lastCollection = 'Z';

    const shouldContinue = (col: string) =>
      col.charCodeAt(0) <= lastCollection.charCodeAt(0);

    const getItems = (col: string) =>
      this.patientsService.listByLastName(col, lastSeen.toUpperCase(), limit);

    const updateCollection = (col: string) =>
      String.fromCharCode(col.charCodeAt(0) + 1);

    return crossPartitionEntityList<GetPatientDto>({
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
}
