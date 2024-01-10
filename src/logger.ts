import { format } from 'util';
import chalk from 'chalk';

import { pkgConfig } from './config';

const prefix = `  ${pkgConfig.binName}`;
const sep = chalk.gray('·');

/**
 * Log a `message` to the console.
 *
 * @param {String} message
 */
export const log = (...args) => {
  const msg = format.apply(format, args);
  console.log(chalk.white(prefix), sep, msg);
};

/**
 * Log a success `message` to the console and exit.
 *
 * @param {String} message
 */
export function success(...args) {
  const msg = format.apply(format, args);
  console.log(chalk.green(prefix), sep, msg);
};

/**
 * Log an error `message` to the console and exit.
 *
 * @param {String} message
 */
export function fatal(...args) {
  if (args[0] instanceof Error) args[0] = args[0].message.trim();
  const msg = format.apply(format, args);
  console.error(chalk.red(prefix), sep, msg);
  process.exit(1);
};
