import chalk from "chalk";
import minimist from "minimist";

import { checkNodeVersion, checkPkgVersion } from "./check-version";
import {pkgConfig} from "./config";
import * as logger from "./logger";

function requireDefault(m) {
  return m.default ? m.default : m;
}

bootstrap();

function parseArgv() {
  const options = minimist(process.argv.slice(2), {
    alias: {
      h: "help",
      v: "version",
    },
  });

  return options;
}

async function bootstrap() {
  try {
    await checkNodeVersion();
    // await checkPkgVersion();
  } catch (e) {
    logger.fatal(e);
  }

  const opt = parseArgv();

  if (opt.version) {
    console.log(chalk.yellow(`  ${pkgConfig.name}: ${pkgConfig.version}`));
    process.exit(0);
  }

  if (opt.help) {
    console.log(chalk.yellow(`  ${pkgConfig.binName} -v / --version`));
    console.log(chalk.yellow(`  ${pkgConfig.binName}`));
    process.exit(0);
  }

  await requireDefault(require("./create"))(opt);
}
