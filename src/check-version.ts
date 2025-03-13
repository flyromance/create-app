import request from 'request';
import semver from 'semver';
import chalk from 'chalk';
import { stripSlash } from './utils';

import { pkgConfig } from './config';

export const checkNodeVersion = () => {
  if (!semver.satisfies(process.version, pkgConfig.nodeVersion)) {
    console.log(chalk.red('  需要nodejs版本：' + pkgConfig.nodeVersion));
    process.exit(1);
  }
};

export const checkPkgVersion = (strict = false) => {
  return new Promise((resolve, reject) => {
    request(
      {
        url: `${stripSlash(pkgConfig.registry)}/${pkgConfig.name}`,
        timeout: 2000
      },
      (err, res, body) => {
        if (!err && res.statusCode === 200) {
          const latestVersion = JSON.parse(body)['dist-tags'].latest;
          if (semver.lt(pkgConfig.version, latestVersion)) {
            console.log(chalk.yellow(` 发现 ${pkgConfig.name} 新版`));
            console.log();
            console.log('  最新版本:    ' + chalk.green(latestVersion));
            console.log('  已安装版本:   ' + chalk.red(pkgConfig.version));
            console.log();
            if (strict) {
              console.log(`  执行 npm install -g ${pkgConfig.name} 更新到最新版本`);
              reject(
                `当前版本为: ${pkgConfig.version}，最新版本为：${latestVersion}，请升级后再使用`
              );
            }
          } else {
            resolve(void 0);
          }
        } else {
          reject('未找到包');
        }
      }
    );
  });
};
