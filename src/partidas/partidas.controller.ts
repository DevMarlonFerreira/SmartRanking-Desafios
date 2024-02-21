import { Controller, Logger } from '@nestjs/common';
import { PartidasService } from './partidas.service';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { Partida } from './interfaces/partida.interface';

const ackErrors: string[] = ['E11000'];

@Controller()
export class PartidasController {
  constructor(private readonly partidasService: PartidasService) {}

  private readonly logger = new Logger(PartidasController.name);

  @EventPattern('criar-partida')
  async criarPartida(@Payload() partida: Partida, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      this.logger.log(`partida: ${JSON.stringify(partida)}`);
      await this.partidasService.criarPartida(partida);
      await channel.ack(originalMsg);
    } catch (error) {
      const err = error as Error;
      if (err) {
        this.logger.log(`error: ${JSON.stringify(err.message)}`);
        const filterAckError = ackErrors.filter((ackError) =>
          err.message.includes(ackError),
        );
        if (filterAckError.length > 0) {
          await channel.ack(originalMsg);
        }
      } else {
        this.logger.error(`unknown error: ${JSON.stringify(error)}`);
      }
    }
  }
}
