const pkg = require('../package.json');

export const pkgConfig = {
  name: pkg.name,
  version: pkg.version,
  binName: Object.keys(pkg.bin || {})[0],
  registry: pkg.publishConfig?.registry || 'https://registry.npmjs.org/', // 可以改成自己的
  nodeVersion: pkg.engines?.node || process.version
};

// 源配置
export const repoConfigs = {
  github: {
    type: 'git',
    getProjects: (opts) => {
      return {
        url: `https://api.github.com/users/${opts.group}/repos`,
        headers: {
          // 必须要加，不加会报错
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        filter(item) {
          return true; // github 无法创建子组，所以不需要过滤组
        },
        transform(item) {
          return {
            id: item.id,
            name: item.name,
            description: item.description
          };
        }
      };
    },
    getDownloadOption(opts) {
      return {
        downloadType: 'clone', //
        cloneUrl: `https://github.com/${opts.group}/${opts.templateName}.git`, //
        url: `https://github.com/${opts.group}/${opts.templateName}/archive/${opts.branch}.zip`
      };
    }
  },

  gitlab: {
    type: 'git',
    getProjects: (opts) => {
      return {
        url: `https://gitlab.com/groups/${opts.group}/-/children.json`,
        headers: {},
        filter(item) {
          return item.type === 'project';
        },
        transform(item) {
          return {
            id: item.id,
            name: item.name,
            description: item.description
          };
        }
      };
    },
    getDownloadOption(opts) {
      return {
        downloadType: 'clone', //
        cloneUrl: `https://gitlab.com/${opts.group}/${opts.templateName}.git`, //
        url: `https://gitlab.com/${opts.group}/${opts.templateName}/-/archive/${opts.branch}/${opts.templateName}-${opts.branch}.zip`
      };
    }
  },
  ['lf-gitlab']: {
    type: 'git',
    getProjects: (opts) => {
      return {
        url: `https://git.longhu.net/groups/${opts.group}/-/children.json`,
        headers: {},
        filter(item) {
          return item.type === 'project'; // group表示组，需要过滤掉
        },
        transform(item) {
          return {
            id: item.id,
            name: item.name
          };
        }
      };
    },
    getDownloadOption(opts) {
      return {
        downloadType: 'clone', // no-clone
        cloneUrl: `https://git.longhu.net/${opts.group}/${opts.templateName}.git`, //
        url: `https://git.longhu.net/${opts.group}/${opts.templateName}/-/archive/${opts.branch}/${opts.templateName}-${opts.branch}.zip`
      };
    }
  },
  gitee: {
    type: 'git',
    getProjects: (opts) => {
      return {
        // https://gitee.com/api/v5/swagger#/getV5UsersUsernameRepos
        url:
          opts.groupType === 'org'
            ? `https://gitee.com/api/v5/orgs/${opts.group}/repos?per_page=100&type=all`
            : `https://gitee.com/api/v5/users/${opts.group}/repos?per_page=100&type=all`,
        headers: {},
        filter(item) {
          return true; // gitee 无法创建子组，所以不需要过滤组
        },
        transform(item) {
          return {
            id: item.id,
            name: item.name,
            description: item.description
          };
        }
      };
    },
    getDownloadOption(opts) {
      return {
        downloadType: 'clone', //
        cloneUrl: `https://gitee.com/${opts.group}/${opts.templateName}.git`, //
        url: `https://gitee.com/${opts.group}/${opts.templateName}/repository/archive/${opts.branch}.zip`
      };
    }
  }
};

export const sourceConfigs: any[] = [
  // {
  //   name: 'lf-gitlab',
  //   key: '1',
  //   group: 'maia-public/templates',
  //   repoType: 'lf-gitlab',
  //   filterProjects: (item) => item.includes('template'),
  //   disabled: false
  // },
  {
    name: 'github',
    key: '3',
    repoType: 'github',
    group: 'flyromance',
    filterProjects: (item) => /app-|lib-/.test(item.name)
  },
  {
    name: 'gitlab',
    key: '2',
    repoType: 'gitlab',
    group: 'awe-templates',
    filterProjects: () => true
  },
  {
    name: 'gitee-app-templates',
    key: '4',
    repoType: 'gitee',
    group: 'app-templates',
    groupType: 'org'
  },
  {
    name: 'gitee-lib-templates',
    key: '5',
    repoType: 'gitee',
    group: 'lib-templates',
    groupType: 'org'
  }
];
