import { Injectable } from '@nestjs/common';

import {
  AddPatientToDoctorDto,
  CreateDoctorDto,
  ListDoctorsDto,
  UpdateDoctorDto,
} from '../dtos';

import { crossPartitionEntityList } from '../dynamo';

import { Doctor, Patient } from '../entities';

import { IDoctorsService } from '../interfaces';

import { arraySubset } from '../utils';

@Injectable()
export class DoctorsUseCases {
  constructor(private doctorsService: IDoctorsService) {}

  createDoctor(createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.create(createDoctorDto);
  }

  getDoctorById(doctorId: string) {
    return this.doctorsService.one(doctorId);
  }

  updateDoctor(doctorId: string, updateDoctorDto: UpdateDoctorDto) {
    return this.doctorsService.update(doctorId, updateDoctorDto);
  }

  deleteDoctor(doctorId: string) {
    return this.doctorsService.remove(doctorId);
  }

  createSpecialization(specialization: string) {
    return this.doctorsService.addNewSpecialization(specialization);
  }

  getSpecializations() {
    return this.doctorsService.getSpecializations();
  }

  async getDoctorList({
    filterBy = [],
    lastSeen = '$',
    collection: lastCollection = '',
    limit = 5,
  }: ListDoctorsDto): Promise<Doctor[]> {
    const specializations: string[] =
      (await this.doctorsService.getSpecializations()) || [];

    const collections = (
      filterBy.length > 0
        ? arraySubset(
            specializations,
            filterBy.map((c) => c.toUpperCase()),
          )
        : specializations
    ).sort();

    const shouldContinue = (col: string) => collections.includes(col);

    const getItems = (col: string, limit: number, lastSeen: string) =>
      this.doctorsService.list(col, limit, lastSeen);

    const updateCollection = (col: string, lastSeen: string = '$') => {
      const index = collections.indexOf(col);
      return {
        collection:
          index < collections.length - 1 ? collections[index + 1] : 'THE_END',
        lastSeen,
      };
    };

    return crossPartitionEntityList({
      collection: lastCollection?.toUpperCase() || collections[0],
      lastSeen: lastSeen,
      limit,
      getItems,
      shouldContinue,
      updateCollection,
    });
  }

  addPatientToDoctor(doctorId: string, addPatientDto: AddPatientToDoctorDto) {
    return this.doctorsService.addPatient(doctorId, addPatientDto);
  }

  removePatientFromDoctor(doctorId: string, patientId: string) {
    return this.doctorsService.removePatientFromDoctor(doctorId, patientId);
  }

  listPatients(
    doctorId: string,
    limit: number = 5,
    lastSeen: string = '$',
  ): Promise<Patient[]> {
    return this.doctorsService.listPatients(doctorId, limit, lastSeen);
  }
}
