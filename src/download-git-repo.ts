/**
 * git仓库有两种下载方式
 * 1、git clone
 * 2、请求接口下载zip包，然后解压。 用download
 */
import download from 'download';
import { spawn, spawnSync } from 'child_process';
import rimraf from 'rimraf';
import * as logger from './logger';

// ssh url schema => [protocol][hostname][port]/<user_name>/<template_name>[.git]
// http url schema => [type:]user/name[/subdir][#branch_or_tag_or_commithash]

// longfor
// ssh => ssh://git@git.longhu.net:8010/lzz-fe-factory/vue2-pc-template.git
// http => http://git.longhu.net/lzz-fe-factory/vue2-pc-template.git
// url => https://git.longhu.net/lzz-fe-factory/vue2-pc-template

// github
// ssh => git@github.com:vuejs-templates/simple.git
// http => https://github.com/vuejs-templates/simple.git
// url => https://github.com/vuejs-templates/simple

// fastgit github的镜像
// ssh => none
// httpsp => https://hub.fastgit.org/vuejs-templates/simple.git
// url => https://hub.fastgit.org/vuejs-templates/simple

function getGitUrl(option) {
  const { source = 'longfor', username, project } = option || {};
  switch (source) {
    case 'github': {
      return `https://github.com/${username}/${project}.git`;
    }
    case 'longfor': {
      return `http://git.longhu.net/${username}/${project}.git`;
    }
  }
}

function getHttpUrl(option) {
  const { source = 'longfor', username, project } = option || {};
  switch (source) {
    case 'github': {
      return `https://github.com/${username}/${project}`;
    }
    case 'longfor': {
      logger.fatal('longfor git源不支持用普通方式下载工程。');
      return '';
    }
  }
}

interface GitCloneOptions {
  git?: string;
  shallow?: boolean;
  branch?: string;
}

export function gitClone(
  repoUrl: string,
  targetPath: string,
  opts?: GitCloneOptions,
  cb?: (err) => void
) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  opts = opts || {};

  var git = opts.git || 'git';
  let args: string[] = [];

  // clone http://git dirname
  args.push('clone', repoUrl, targetPath);

  // clone http://git dirname --depth 1
  if (opts.shallow) {
    args.push('--depth', '1');
  }

  // clone http://git dirname --depth 1 --branch master
  if (opts.branch) {
    args.push('--branch', opts.branch);
  }

  return new Promise((resolve, reject) => {
    var process = spawn(git, args);

    process.on('error', function (err) {
      reject(err);
      cb && cb(err);
    });

    process.on('close', function (status) {
      if (status == 0) {
        cb && cb(null);
        resolve(void 0);
      } else {
        cb && cb(new Error("'git clone' 失败 " + status));
      }
    });
  });
}

/**
 * 把npm
 *
 * @param {String} repo
 * @param {String} dest
 * @param {Object} opts
 * @param {Function} fn
 */
export default function (dest, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts;
    opts = null;
  }
  let options = Object.assign({ clone: true }, opts || {});
  const { clone, source, username, project, git, install } = options;
  // delete options.clone;
  // delete options.source;

  // // project  user/project  user/project#feature  user/project#feature/xxx
  // const match = /^(?:([^/#]+)\/)?([^#]+)?(?:#(.+))?$/.exec(repo) || [];
  // const username = match[1];
  // const project = match[2];
  // const branch = match[3];

  // TODO: 目前只支持git clone方式
  if (clone) {
    var cloneOptions = {
      branch: 'branch',
      shallow: true
    };
    const gitUrl = getGitUrl({ source, username, project });
    if (!gitUrl) {
      logger.fatal('为找到git clone url。');
    }
    gitClone(gitUrl as string, dest, cloneOptions, function (err) {
      if (!err) {
        if (!git) {
          rimraf.sync(dest + '/.git');
        }
        fn();
      } else {
        fn(err);
      }
    });
  } else {
    const httpUrl = getHttpUrl({ source, username, project }) || '';
    var downloadOptions = {
      extract: true,
      strip: 1,
      mode: '666',
      ...options,
      headers: {
        accept: 'application/zip',
        ...(options.headers || {})
      }
    };
    download(httpUrl, dest, downloadOptions)
      .then(function (data) {
        if (git) {
          spawnSync('git', ['init'], { cwd: dest });
        }
        if (install) {
          spawnSync('npm', ['install'], { cwd: dest });
        }
        fn();
      })
      .catch(function (err) {
        fn(err);
      });
  }
}

/**
 * Normalize a repo string.
 *
 * @param {String} repo
 * @return {Object}
 */
function normalize(repo) {
  // direct:url_string#branch_name  direct:url_string
  var regex = /^(?:(direct):([^#]+)(?:#(.+))?)$/;
  var match = regex.exec(repo);

  if (match) {
    var url = match[2];
    var directCheckout = match[3] || 'master';

    return {
      type: 'direct',
      url: url,
      checkout: directCheckout
    };
  } else {
    regex = /^(?:(github|gitlab|bitbucket):)?(?:(.+):)?([^/]+)\/([^#]+)(?:#(.+))?$/;
    match = regex.exec(repo);
    if (!match) throw new Error();
    var type = match[1] || 'github';
    var origin = match[2] || null;
    var owner = match[3];
    var name = match[4];
    var checkout = match[5] || 'master';

    if (origin == null) {
      if (type === 'github') {
        origin = 'github.com';
      } else if (type === 'gitlab') {
        origin = 'gitlab.com';
      } else if (type === 'bitbucket') {
        origin = 'bitbucket.org';
      }
    }

    return {
      type: type,
      origin: origin,
      owner: owner,
      name: name,
      checkout: checkout
    };
  }
}

/**
 * Adds protocol to url in none specified
 *
 * @param {String} url
 * @return {String}
 */
function addProtocol(origin, clone) {
  if (!/^(f|ht)tps?:\/\//i.test(origin)) {
    if (clone) {
      origin = 'git@' + origin;
    } else {
      origin = 'https://' + origin;
    }
  }

  return origin;
}

/**
 * Return a zip or git url for a given `repo`.
 *
 * @param {Object} repo
 * @return {String}
 */
function getUrl(repo, clone) {
  var url;

  // Get origin with protocol and add trailing slash or colon (for ssh)
  var origin = addProtocol(repo.origin, clone);
  if (/^git@/i.test(origin)) {
    origin = origin + ':';
  } else {
    origin = origin + '/';
  }

  // Build url
  if (clone) {
    url = origin + repo.owner + '/' + repo.name + '.git';
  } else {
    if (repo.type === 'github') {
      url = origin + repo.owner + '/' + repo.name + '/archive/' + repo.checkout + '.zip';
    } else if (repo.type === 'gitlab') {
      url = origin + repo.owner + '/' + repo.name + '/repository/archive.zip?ref=' + repo.checkout;
    } else if (repo.type === 'bitbucket') {
      url = origin + repo.owner + '/' + repo.name + '/get/' + repo.checkout + '.zip';
    }
  }

  return url;
}
