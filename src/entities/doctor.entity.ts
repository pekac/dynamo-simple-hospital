export class Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;

  constructor(
    id: string = '',
    firstName: string = '',
    lastName: string = '',
    specialization: string = '',
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.specialization = specialization;
  }
}
