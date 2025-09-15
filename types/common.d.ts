import { RpcException } from '@nestjs/microservices';
import { HttpException } from '@nestjs/common';

export type UnifiedException = (RpcException | HttpException) & {
  type: 'rpc' | 'http';
  status: number;
  message: string;
};
