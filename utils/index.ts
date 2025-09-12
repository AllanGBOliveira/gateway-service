import type { Request } from 'express';

export function extractTokenFromHeader(request: Request): string | undefined {
  const authHeader = request.headers?.authorization;
  if (!authHeader || typeof authHeader !== 'string') {
    return undefined;
  }

  const [type, token] = authHeader.split(' ');
  return type === 'Bearer' && token ? token : undefined;
}
