import type { Command } from '@/types';
import { lsCommand } from './ls';
import { cdCommand } from './cd';
import { pwdCommand } from './pwd';
import { catCommand } from './cat';
import { echoCommand } from './echo';
import { grepCommand } from './grep';
import { mkdirCommand } from './mkdir';
import { touchCommand } from './touch';
import { rmCommand } from './rm';
import { cpCommand } from './cp';
import { mvCommand } from './mv';
import { clearCommand } from './clear';
import { helpCommand } from './help';
import { execCommand } from './exec';
import { historyCommand } from './history';
import { wcCommand } from './wc';
import { envCommand } from './env';
import { findCommand } from './find';
import { aliasCommand } from './alias';
import { unaliasCommand } from './unalias';

export const builtInCommands: Command[] = [
  lsCommand,
  cdCommand,
  pwdCommand,
  catCommand,
  echoCommand,
  grepCommand,
  mkdirCommand,
  touchCommand,
  rmCommand,
  cpCommand,
  mvCommand,
  clearCommand,
  helpCommand,
  execCommand,
  historyCommand,
  wcCommand,
  envCommand,
  findCommand,
  aliasCommand,
  unaliasCommand,
];

export function registerBuiltInCommands(executor: any): void {
  for (const command of builtInCommands) {
    executor.registerCommand(command);
  }
}

