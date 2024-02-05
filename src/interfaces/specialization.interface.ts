export abstract class ISpecializationService {
  abstract getSpecializations(): Promise<string[]>;
  abstract addNewSpecialization(specialization: string): Promise<string>;
}
