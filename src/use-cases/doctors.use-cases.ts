import { Injectable } from '@nestjs/common';

import {
  CreateDoctorDto,
  GetDoctorDto,
  ListDoctorsDto,
  UpdateDoctorDto,
} from '../dtos';

import { IDoctorsService } from '../interfaces';

import { crossPartitionEntityList } from '../dynamo';

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

  async getDoctorList({
    filterBy = [],
    lastSeen = {
      id: '',
      collection: '',
    },
    limit = 5,
  }: ListDoctorsDto): Promise<GetDoctorDto[]> {
    const specializations: string[] =
      (await this.doctorsService.getSpecializations()) || [];

    const collections =
      filterBy.length > 0
        ? arraySubset(specializations, filterBy)
        : specializations;

    const shouldContinue = (col: string) => collections.includes(col);

    const getItems = (col: string, lastSeen: string) =>
      this.doctorsService.list(col, lastSeen, limit);

    const updateCollection = (col: string, lastSeen: string = '@') => {
      const index = collections.indexOf(col);
      return {
        collection: index < collections.length ? collections[index] : 'THE_END',
        lastSeen,
      };
    };

    return crossPartitionEntityList({
      collection: lastSeen.collection || collections[0],
      limit,
      getItems,
      shouldContinue,
      updateCollection,
    });
  }
}
