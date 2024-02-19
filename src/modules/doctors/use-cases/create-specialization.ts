import {
  Body,
  Controller,
  Module,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  CqrsModule,
  ICommandHandler,
} from '@nestjs/cqrs';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

import { SPECIALIZATION_KEY } from 'src/core';

import { DATA_TABLE, client } from 'src/dynamo';

import { CreateSpecializationDto } from '../common';

class CreateSpecializationCommand {
  constructor(public readonly specialization: string) {}
}

@Controller()
class CreateSpecializationController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('specializations')
  @UsePipes(new ValidationPipe())
  createSpecialization(@Body() { specialization }: CreateSpecializationDto) {
    return this.commandBus.execute(
      new CreateSpecializationCommand(specialization),
    );
  }
}

@CommandHandler(CreateSpecializationCommand)
class CreateSpecializationHandler
  implements ICommandHandler<CreateSpecializationCommand>
{
  async execute({ specialization }: CreateSpecializationCommand) {
    const command = new UpdateCommand({
      TableName: DATA_TABLE,
      Key: SPECIALIZATION_KEY,
      UpdateExpression: 'ADD #specialization :specialization',
      ExpressionAttributeNames: {
        '#specialization': 'Specializations',
      },
      ExpressionAttributeValues: {
        ':specialization': new Set([specialization.toUpperCase()]),
      },
      ReturnValues: 'ALL_NEW',
    });

    await client.send(command);
    return specialization;
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [CreateSpecializationController],
  providers: [CreateSpecializationHandler],
})
export class CreateSpecializationModule {}
