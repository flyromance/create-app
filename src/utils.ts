import path from 'path';

import request from 'request';
import rimraf from 'rimraf';
import * as logger from './logger';
import { gitClone } from './download-git-repo';
import download from './download-url';

export const stripSlash = (str: string) => {
  return str.replace(/^\/|\/$/g, '');
};

export async function getProjects(opts): Promise<any[]> {
  return new Promise((resolve, reject) => {
    request(
      {
        url: opts.url,
        headers: opts.headers || {}
      },
      (err, res, body) => {
        if (err) logger.fatal(err);
        try {
          const arr = JSON.parse(body);
          if (!Array.isArray(arr)) {
            reject(new Error('返回的项目列表不是数组！'));
          } else {
            resolve(arr.map(opts.transform));
          }
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}

export async function downloadProject(opts) {
  if (opts.downloadType === 'clone') {
    await gitClone(opts.cloneUrl, opts.dest, { branch: opts.branch, shallow: true });
    rimraf.sync(opts.dest + '/.git');
  } else {
    // 压缩包解压后，去掉第一层，并将其拷贝到 dest，最后删除压缩包
    await download(opts.url, path.join(opts.dest), { extract: true, strip: 1 });
  }
}
