import chalk from 'chalk';
import minimist from 'minimist';

import { checkNodeVersion, checkPkgVersion } from './check-version';
import { pkgConfig } from './config';
import * as logger from './logger';

function requireDefault(m) {
  return m.default ? m.default : m;
}

function parseArgv() {
  const options = minimist(process.argv.slice(2), {
    alias: {
      h: 'help',
      v: 'version',
      git: 'g',
      install: 'i'
    },
    default: {
      git: true,
      install: true
    }
  });

  return options;
}

(async function bootstrap() {
  try {
    await checkNodeVersion();
    // await checkPkgVersion();
  } catch (e) {
    logger.fatal(e);
  }

  const { _, version, help, git, install, ...restOpts } = parseArgv();
  // console.log(restOpts);

  if (version) {
    console.log(chalk.yellow(`  ${pkgConfig.name}: ${pkgConfig.version}`));
    process.exit(0);
  }

  if (help) {
    const txt = `Examples:
    ${pkgConfig.binName} --help  # 查看帮助信息
    ${pkgConfig.binName} --version, -v 
    ${pkgConfig.binName} [your-project-name]    # 创建项目
    ${pkgConfig.binName} [--git, -g]    # 创建项目后，初始化为git仓库。 --no-git 不初始化为git仓库
    ${pkgConfig.binName} [--install, -i]    # 创建项目后，安装依赖。 --no-install 不安装依赖
    `;
    console.log(txt);
    process.exit(0);
  }

  const opts: any = {
    git,
    install
  };
  if (_.length) {
    opts.projectName = _[0];
  }

  console.log(opts);
  await requireDefault(require('./create'))(opts);
})();
