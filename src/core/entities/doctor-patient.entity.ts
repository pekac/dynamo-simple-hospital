export class DoctorPatient {
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  specialization: string;

  constructor(
    doctorId: string = '',
    doctorName: string = '',
    patientId: string = '',
    patientName: string = '',
    specialization: string = '',
  ) {
    this.doctorId = doctorId;
    this.doctorName = doctorName;
    this.patientId = patientId;
    this.patientName = patientName;
    this.specialization = specialization;
  }
}
