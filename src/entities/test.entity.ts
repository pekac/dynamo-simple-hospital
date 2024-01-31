export class Test {
  id: string;
  code: string;
  type: string;
  doctorId: string;

  constructor(
    id: string = '',
    code: string = '',
    type: string = '',
    doctorId: string = '',
  ) {
    this.id = id;
    this.code = code;
    this.type = type;
    this.doctorId = doctorId;
  }
}
