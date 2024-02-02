import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import {
  AddPatientToDoctorDto,
  CreateDoctorDto,
  CreateSpecializationDto,
  ListDoctorsDto,
  ListPatientsForDoctorDto,
  UpdateDoctorDto,
} from '../dtos';

import { DoctorsUseCases } from '../use-cases';

@Controller('doctors')
export class DoctorsController {
  constructor(private doctorsUseCases: DoctorsUseCases) {}
  /* specializations */
  @Post('specializations')
  @UsePipes(new ValidationPipe())
  createSpecialization(@Body() { specialization }: CreateSpecializationDto) {
    return this.doctorsUseCases.createSpecialization(specialization);
  }

  @Get('specializations')
  getSpecializations() {
    return this.doctorsUseCases.getSpecializations();
  }

  @Get('?')
  getDoctorList(@Query() queryParams: ListDoctorsDto) {
    return this.doctorsUseCases.getDoctorList(queryParams);
  }

  @Get(':id')
  getDoctorById(@Param('id') id: string) {
    return this.doctorsUseCases.getDoctorById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  createDoctor(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsUseCases.createDoctor(createDoctorDto);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  updateDoctor(
    @Param('id') doctorId: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.doctorsUseCases.updateDoctor(doctorId, updateDoctorDto);
  }

  @Delete(':id')
  deleteDoctor(@Param('id') doctorId: string) {
    return this.doctorsUseCases.deleteDoctor(doctorId);
  }

  @Post(':id/patients')
  @UsePipes(new ValidationPipe())
  addPatientToDoctor(
    @Param('id') doctorId: string,
    @Body() addPatientDto: AddPatientToDoctorDto,
  ) {
    return this.doctorsUseCases.addPatientToDoctor(doctorId, addPatientDto);
  }

  @Get(':id/patients')
  listPatients(
    @Param('id') doctorId: string,
    @Query() queryParams: ListPatientsForDoctorDto,
  ) {
    return this.doctorsUseCases.listPatients(
      doctorId,
      queryParams.limit,
      queryParams.lastSeen,
    );
  }

  @Delete(':doctorId/patients/:patientId')
  removePatientFromDoctor(
    @Param('doctorId') doctorId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.doctorsUseCases.removePatientFromDoctor(doctorId, patientId);
  }
}
