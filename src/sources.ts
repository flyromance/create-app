import request from 'request';
import path from 'path';
import chalk from 'chalk';
import rimraf from 'rimraf';
import * as logger from './logger';
import { gitClone } from './download-git-repo';
import download from './download-url';

const sourceMap = new Map();

const registerSource = (name: string, source) => {
  if (!source || typeof source !== 'object') return;
  if (!sourceMap.has(name)) {
    sourceMap.set(name, source);
  }
};

// 组 + 项目 + 版本
// 获取组下的项目，获取项目的版本，确定下载地址！


async function getLfGitlabProjects(opts) {
  return new Promise((resolve, reject) => {
    if (!opts.group) {
      logger.fatal('请指定组');
      reject('请指定组');
      return;
    }

    request(
      {
        url: `${opts.origin}/groups/${opts.group}/-/children.json`,
        headers: {}
      },
      (err, res, body) => {
        if (err) logger.fatal(err);
        console.log(body);
        const requestBody = JSON.parse(body).filter((item) => item.name?.includes('template'));
        if (Array.isArray(requestBody)) {
          resolve(requestBody);
        } else {
          console.error(requestBody.message);
          reject(requestBody.message);
        }
      }
    );
  });
}

async function downloadLfGitlabProject(opts, clone = true) {
  if (clone) {
    const gitUrl = `${opts.origin}${opts.group}/${opts.templateName}.git`;
    await gitClone(gitUrl, opts.dest, { branch: opts.branch, shallow: true });
    rimraf.sync(opts.dest + '/.git');
  } else {
    // 不同的git仓库，有不同的拼接方式
    const httpUrl = `${opts.origin}/${opts.group}/${opts.templateName}/-/archive/${opts.branch}/${opts.templateName}-${opts.branch}.zip`;

    // 压缩包解压后，去掉第一层，并将其拷贝到 dest，最后删除压缩包
    await download(httpUrl, path.join(opts.dest), { extract: true, strip: 1 });
  }
}

async function getGithubProjects(opts) {
  return new Promise((resolve, reject) => {
    if (!opts.group) {
      logger.fatal('请指定组');
      reject('请指定组');
      return;
    }
    request(
      {
        url: `https://api.github.com/users/${opts.group}/repos`,
        headers: {
          // 必须要加，不加会报错
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      },
      (err, res, body) => {
        if (err) logger.fatal(err);
        const requestBody = JSON.parse(body).filter((item) =>
          item.name?.includes('app-react16-mobile')
        );
        if (Array.isArray(requestBody)) {
          resolve(requestBody);
        } else {
          console.error(requestBody.message);
          reject(requestBody.message);
        }
      }
    );
  });
}

async function downloadGithubProject(opts, clone = true) {
  if (clone) {
    // TODO: 待定
    const gitUrl = `${opts.origin}${opts.group}/${opts.templateName}.git`;
    await gitClone(gitUrl, opts.dest, { branch: opts.branch, shallow: true });
    rimraf.sync(opts.dest + '/.git');
  } else {
    const httpUrl = `${opts.origin}${opts.group}/${opts.templateName}/archive/${opts.branch}.zip`;
    // 压缩包解压后，去掉第一层，并将其拷贝到 dest，最后删除压缩包
    await download(httpUrl, path.join(opts.dest), { extract: true, strip: 1 });
  }
}

async function getGitlabProjects(opts) {
  return new Promise((resolve, reject) => {
    if (!opts.group) {
      logger.fatal('请指定组');
      reject('请指定组');
      return;
    }
    request(
      {
        url: `${opts.origin}/groups/${opts.group}/-/children.json`,
        headers: {
          // 必须要加，不加会报错
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      },
      (err, res, body) => {
        if (err) logger.fatal(err);
        const requestBody = JSON.parse(body).filter((item) =>
          item.name?.includes('app-react16-mobile')
        );
        if (Array.isArray(requestBody)) {
          resolve(requestBody);
        } else {
          console.error(requestBody.message);
          reject(requestBody.message);
        }
      }
    );
  });
}

async function downloadGitlabProject(opts, clone = true) {
  if (clone) {
    const gitUrl = `${opts.origin}${opts.group}/${opts.templateName}.git`;
    await gitClone(gitUrl, opts.dest, { branch: opts.branch, shallow: true });
    rimraf.sync(opts.dest + '/.git');
  } else {
    const httpUrl = `${opts.origin}/${opts.group}/${opts.templateName}/-/archive/${opts.branch}/${opts.templateName}-${opts.branch}.zip`;
    // 压缩包解压后，去掉第一层，并将其拷贝到 dest，最后删除压缩包
    await download(httpUrl, path.join(opts.dest), { extract: true, strip: 1 });
  }
}

async function getGiteeProjects(opts) {
  return new Promise((resolve, reject) => {
    if (!opts.group) {
      logger.fatal('请指定组');
      reject('请指定组');
      return;
    }
    console.log(`${opts.origin}/api/v5/users/${opts.group}/repos`);

    request(
      {
        url: `${opts.origin}/api/v5/users/${opts.group}/repos`,
        headers: {
          // 必须要加，不加会报错
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      },
      (err, res, body) => {
        if (err) logger.fatal(err);
        const requestBody = JSON.parse(body);
        if (Array.isArray(requestBody)) {
          resolve(requestBody);
        } else {
          console.error(requestBody.message);
          reject(requestBody.message);
        }
      }
    );
  });
}

async function downloadGiteeProject(opts, clone = true) {
  if (clone) {
    const gitUrl = `${opts.origin}${opts.group}/${opts.templateName}.git`;
    await gitClone(gitUrl, opts.dest, { branch: opts.branch, shallow: true });
    rimraf.sync(opts.dest + '/.git');
  } else {
    const httpUrl = `${opts.origin}${opts.group}/${opts.templateName}/repository/archive/${opts.branch}.zip`;
    await download(httpUrl, path.join(opts.dest), { extract: true, strip: 1 });
  }
}

async function getEcsProjects(opts) {
  return new Promise((resolve, reject) => {
    if (!opts.group) {
      logger.fatal('请指定组');
      reject('请指定组');
      return;
    }

    request(
      {
        url: `${opts.origin}/${opts.group}`,
        headers: {}
      },
      (err, res, body) => {
        if (err) logger.fatal(err);
        const requestBody = JSON.parse(body);
        if (Array.isArray(requestBody)) {
          resolve(requestBody);
        } else {
          console.error(requestBody.message);
          reject(requestBody.message);
        }
      }
    );
  });
}

async function downloadEcsProject(opts) {}

// 获取类型
export const sources: any[] = [
  {
    name: '龙湖',
    key: 'lf-gitlab',
    repoType: 'git',
    sourceType: 'lf-gitlab',
    getProjects: getLfGitlabProjects,
    downloadProject: downloadLfGitlabProject,
    children: [
      {
        name: '龙湖麦芽',
        origin: 'https://git.longhu.net/',
        group: 'maia-public'
      }
    ]
  },
  {
    name: 'gitlab-xxx',
    key: 'official-gitlab-xxx',
    sourceType: 'git',
    origin: 'https://gitlab.net/',
    group: 'aiot',
    getProjects: () => [],
    downloadProject: () => {},
    disabled: true
  },
  {
    name: 'gitee-xxx',
    key: 'official-gitee-xxx',
    sourceType: 'git',
    origin: 'https://gitee.com/',
    group: 'flyromance',
    getProjects: getGiteeProjects,
    downloadProject: downloadGiteeProject
    // disabled: true
  },
  {
    name: 'github-flyromance',
    key: 'official-github-flyromance',
    sourceType: 'git',
    origin: 'https://github.com/',
    group: 'flyromance',
    getProjects: getGithubProjects,
    downloadProject: downloadGithubProject,
    disabled: true
  },

  // ecs
  {
    name: 'ecs1',
    key: 'lf-ecs-xxx',
    repoType: 'git',
    sourceType: 'ali-oss',
    origin: 'http://39.106.80.196/app-templates/',
    group: 'maia',
    getProjects: () => [],
    downloadProject: () => {},
    disabled: true
  },

  // ecs
  {
    name: 'ecs1',
    key: 'lf-ecs-xxx',
    repoType: 'git',
    sourceType: 'ali-ecs',
    origin: 'http://39.106.80.196/app-templates/',
    group: 'maia',
    getProjects: () => [],
    downloadProject: () => {},
    disabled: true
  }
];
