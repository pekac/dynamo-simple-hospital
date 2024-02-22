export abstract class ISpecializationResource {
  abstract create(specialization: string): Promise<string | undefined>;
}
