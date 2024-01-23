import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PatientsUseCases } from '../use-cases/patients.use-cases';
import { CreatePatientDto, UpdatePatientDto } from '../dtos/patient.dto';

@Controller('patients')
export class PatientsController {
  constructor(private patientsUseCase: PatientsUseCases) {}

  @Get(':id')
  getPatientById(@Param('id') id: string) {
    return this.patientsUseCase.getPatientById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  createPatient(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsUseCase.createPatient(createPatientDto);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  updatePatient(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientsUseCase.updatePatient(id, updatePatientDto);
  }

  @Delete(':id')
  deletePatient(@Param('id') id: string) {
    return this.patientsUseCase.deletePatient(id);
  }
}
