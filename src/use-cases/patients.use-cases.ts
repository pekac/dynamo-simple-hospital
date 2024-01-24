import { Injectable } from '@nestjs/common';
/* interfaces */
import { IPatientsService } from '../interfaces/patient-service.interface';
import {
  CreatePatientDto,
  ListPatientsDto,
  UpdatePatientDto,
} from '../dtos/patient.dto';
import { truncateDateToWeek } from 'src/utils/dates';

@Injectable()
export class PatientsUseCases {
  constructor(private patientsService: IPatientsService) {}
  /* TODO: clean this up */
  async getPatientList({
    sortBy,
    limit = 5,
    lastSeen = '$',
  }: ListPatientsDto): Promise<any> {
    const patients: any = [];
    console.log('limit: ', limit);
    if (sortBy === 'lastName') {
      const firstCollection = 'A';
      const lastCollection = 'Z';
      let collection: string =
        lastSeen === '$' ? firstCollection : lastSeen.charAt(0);
      while (
        patients.length < limit &&
        collection.charCodeAt(0) <= lastCollection.charCodeAt(0)
      ) {
        const items = await this.patientsService.listByLastName(
          collection,
          lastSeen.toUpperCase(),
          limit,
        );

        for (const item of items) {
          patients.push(item);
        }

        if (items.length < limit) {
          collection = String.fromCharCode(collection.charCodeAt(0) + 1);
        }
      }

      return patients;
    }

    /* NEXT: add list patients by createdAt */
    const firstCollection = truncateDateToWeek(new Date()).toISOString();
    const lastCollection = truncateDateToWeek(
      new Date(2024, 0, 1),
    ).toISOString();

    let collection: string =
      lastSeen === '$'
        ? firstCollection
        : truncateDateToWeek(new Date(lastSeen)).toISOString();
    while (patients.length < limit && collection >= lastCollection) {
      const items = await this.patientsService.listByCreatedAt(
        collection,
        lastSeen,
        limit,
      );

      for (const item of items) {
        patients.push(item);
      }

      if (items.length < limit) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(new Date(collection).getDate() - 7);
        collection = truncateDateToWeek(sevenDaysAgo).toISOString();
      }
    }

    return patients;
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
