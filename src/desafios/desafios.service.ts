import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Desafio } from './interfaces/desafio.interface';
import { Model } from 'mongoose';
import { DesafioStatus } from './desafio-status.enum';
import { RpcException } from '@nestjs/microservices';
import * as momentTimezone from 'moment-timezone';

@Injectable()
export class DesafiosService {
  constructor(
    @InjectModel('Desafio') private readonly desafioModel: Model<Desafio>,
  ) {}

  private readonly logger = new Logger(DesafiosService.name);

  async criarDesafio(desafio: Desafio): Promise<Desafio> {
    try {
      const desafioCriado = new this.desafioModel(desafio);
      desafioCriado.dataHoraSolicitacao = new Date();

      desafioCriado.status = DesafioStatus.PENDENTE;
      this.logger.log(`desafioCriado: ${JSON.stringify(desafioCriado)}`);
      return await desafioCriado.save();
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`error: ${JSON.stringify(error.message)}`);
        throw new RpcException(error.message);
      } else {
        this.logger.error(`unknown error: ${JSON.stringify(error)}`);
        throw new RpcException(`unknown error`);
      }
    }
  }

  async consultarTodosDesafios(): Promise<Desafio[]> {
    try {
      return await this.desafioModel.find().lean().exec();
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`error: ${JSON.stringify(error.message)}`);
        throw new RpcException(error.message);
      } else {
        this.logger.error(`unknown error: ${JSON.stringify(error)}`);
        throw new RpcException(`unknown error`);
      }
    }
  }

  async consultarDesafiosDeUmJogador(_id: any): Promise<Desafio[] | Desafio> {
    try {
      return await this.desafioModel
        .find()
        .where('jogadores')
        .in(_id)
        .lean()
        .exec();
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`error: ${JSON.stringify(error.message)}`);
        throw new RpcException(error.message);
      } else {
        this.logger.error(`unknown error: ${JSON.stringify(error)}`);
        throw new RpcException(`unknown error`);
      }
    }
  }

  async consultarDesafioPeloId(_id: any): Promise<Desafio> {
    try {
      return await this.desafioModel.findOne({ _id }).lean().exec();
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`error: ${JSON.stringify(error.message)}`);
        throw new RpcException(error.message);
      } else {
        this.logger.error(`unknown error: ${JSON.stringify(error)}`);
        throw new RpcException(`unknown error`);
      }
    }
  }

  async consultarDesafiosRealizados(idCategoria: string): Promise<Desafio[]> {
    try {
      return await this.desafioModel
        .find()
        .where('categoria')
        .equals(idCategoria)
        .where('status')
        .equals(DesafioStatus.REALIZADO)
        .lean()
        .exec();
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`error: ${JSON.stringify(error.message)}`);
        throw new RpcException(error.message);
      } else {
        this.logger.error(`unknown error: ${JSON.stringify(error)}`);
        throw new RpcException(`unknown error`);
      }
    }
  }

  async consultarDesafiosRealizadosPelaData(
    idCategoria: string,
    dataRef: string,
  ): Promise<Desafio[]> {
    try {
      const dataRefNew = `${dataRef} 23:59:59.999`;

      return await this.desafioModel
        .find()
        .where('categoria')
        .equals(idCategoria)
        .where('status')
        .equals(DesafioStatus.REALIZADO)
        .where('dataHoraDesafio')
        .lte(
          momentTimezone(dataRefNew)
            .tz('UTC')
            .format('YYYY-MM-DD HH:mm:ss.SSS+00:00') as unknown as number,
        )
        .lean()
        .exec();
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`error: ${JSON.stringify(error.message)}`);
        throw new RpcException(error.message);
      } else {
        this.logger.error(`unknown error: ${JSON.stringify(error)}`);
        throw new RpcException(`unknown error`);
      }
    }
  }

  async atualizarDesafio(_id: string, desafio: Desafio): Promise<void> {
    try {
      desafio.dataHoraResposta = new Date();
      await this.desafioModel
        .findOneAndUpdate({ _id }, { $set: desafio })
        .exec();
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`error: ${JSON.stringify(error.message)}`);
        throw new RpcException(error.message);
      } else {
        this.logger.error(`unknown error: ${JSON.stringify(error)}`);
        throw new RpcException(`unknown error`);
      }
    }
  }

  async atualizarDesafioPartida(
    idPartida: string,
    desafio: Desafio,
  ): Promise<void> {
    try {
      desafio.status = DesafioStatus.REALIZADO;
      desafio.partida = idPartida;
      await this.desafioModel
        .findOneAndUpdate({ _id: desafio._id }, { $set: desafio })
        .exec();
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`error: ${JSON.stringify(error.message)}`);
        throw new RpcException(error.message);
      } else {
        this.logger.error(`unknown error: ${JSON.stringify(error)}`);
        throw new RpcException(`unknown error`);
      }
    }
  }

  async deletarDesafio(desafio: Desafio): Promise<void> {
    try {
      const { _id } = desafio;

      desafio.status = DesafioStatus.CANCELADO;
      this.logger.log(`desafio: ${JSON.stringify(desafio)}`);
      await this.desafioModel
        .findOneAndUpdate({ _id }, { $set: desafio })
        .exec();
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`error: ${JSON.stringify(error.message)}`);
        throw new RpcException(error.message);
      } else {
        this.logger.error(`unknown error: ${JSON.stringify(error)}`);
        throw new RpcException(`unknown error`);
      }
    }
  }
}
