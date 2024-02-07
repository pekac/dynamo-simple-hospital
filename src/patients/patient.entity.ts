export class Patient {
  id: string;
  firstName: string;
  lastName: string;
  age: number;

  constructor(
    id: string = '',
    firstName: string = '',
    lastName: string = '',
    age: number = 0,
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.age = age;
  }
}
