import { Injectable } from '@nestjs/common';
/* interfaces */
import { IPatientsService } from '../interfaces/patient-service.interface';
import {
  CreatePatientDto,
  ListPatientsDto,
  UpdatePatientDto,
} from '../dtos/patient.dto';

@Injectable()
export class PatientsUseCases {
  constructor(private patientsService: IPatientsService) {}

  async getPatientList({
    sortBy,
    limit = 5,
    lastSeen = '$',
  }: ListPatientsDto): Promise<any> {
    const patients: any = [];
    const lastCollection = 'Z';
    if (sortBy === 'lastName') {
      let collection: string = lastSeen === '$' ? 'A' : lastSeen.charAt(0);
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
