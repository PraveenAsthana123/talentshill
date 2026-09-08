import type { JobHandler } from './types';

const handlerRegistry = new Map<string, JobHandler>();

export function registerHandler(type: string, handler: JobHandler) {
  handlerRegistry.set(type, handler);
}

export function getHandler(type: string): JobHandler | undefined {
  return handlerRegistry.get(type);
}

export function getRegisteredTypes(): string[] {
  return Array.from(handlerRegistry.keys());
}
