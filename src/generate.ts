import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import async from 'async';
import Metalsmith from 'metalsmith';
import multimatch from 'multimatch';
import Handlebars from 'handlebars';
import consolidate from 'consolidate';

import { getOptions } from './options';
import { ask } from './ask';
import filter from './filter';
import * as logger from './logger';

const render = consolidate.handlebars.render;

// register handlebars helper
Handlebars.registerHelper('if_eq', function (a, b, opts) {
  return a === b ? opts.fn(this) : opts.inverse(this);
});
Handlebars.registerHelper('if_not_eq', function (a, b, opts) {
  return a !== b ? opts.inverse(this) : opts.fn(this);
});
Handlebars.registerHelper('if_or', function (a, b, opts) {
  return a || b ? opts.fn(this) : opts.reverse(this);
});
Handlebars.registerHelper('if_and', function (a, b, opts) {
  return a && b ? opts.fn(this) : opts.reverse(this);
});

/**
 * Generate a template given a `src` and `dest`.
 *
 * @param {String} name
 * @param {String} src
 * @param {String} dest
 * @param {Function} done
 */
export default function generate(name, src, dest, done) {
  // TODO: 检查meta的格式
  const opts = getOptions(name, src) as any;

  let templateDir = path.join(src, 'template');
  // 兼容模板项目中没有template的情况
  if (!fs.existsSync(templateDir)) {
    templateDir = src;
  }
  const metalsmith = Metalsmith(templateDir);

  // 这个对象会在插件执行过程中被修改，比如设置上用户的配置
  const data = Object.assign(metalsmith.metadata(), {
    destDirName: name,
    inPlace: dest === process.cwd(),
    noEscape: true,
  });

  // 注册模板项目中定义的handlerbar help
  opts.helpers &&
    Object.keys(opts.helpers).map((key) => {
      Handlebars.registerHelper(key, opts.helpers[key]);
    });

  const helpers = { chalk, logger };

  // 前置
  if (opts.metalsmith && typeof opts.metalsmith.before === 'function') {
    opts.metalsmith.before(metalsmith, opts, helpers);
  }

  metalsmith
    .use(askQuestions(opts.prompts)) // 交互式命令访问，获取用户的选择，存入metalSmith.data()
    .use(filterFiles(opts.filters)) // 过滤文件
    .use(renderTemplateFiles(opts.skipInterpolation)); // 跳过字符串模板处理的glob string

  // 后置
  if (typeof opts.metalsmith === 'function') {
    opts.metalsmith(metalsmith, opts, helpers);
  } else if (opts.metalsmith && typeof opts.metalsmith.after === 'function') {
    opts.metalsmith.after(metalsmith, opts, helpers);
  }

  metalsmith
    .clean(false) // 是否需要情况dest内的文件
    .source('.') // 默认是'./src'，需要改成从更目录读取文件
    .destination(dest)
    .build((err, files) => {
      done(err);
      if (typeof opts.complete === 'function') {
        const helpers = { chalk, logger, files };
        opts.complete(data, helpers);
      } else {
        logMessage(opts.completeMessage, data);
      }
    });

  return data;
};

/**
 * Create a middleware for asking questions.
 *
 * @param {Object} prompts
 * @return {Function}
 */
function askQuestions(prompts) {
  return (files, metalsmith, done) => {
    ask(prompts, metalsmith.metadata(), done);
  };
}

/**
 * Create a middleware for filtering files.
 *
 * @param {Object} filters
 * @return {Function}
 */
function filterFiles(filters) {
  return (files, metalsmith, done) => {
    filter(files, filters, metalsmith.metadata(), done);
  };
}

/**
 * Template in place plugin.
 *
 * @param {Object} files
 * @param {Metalsmith} metalsmith
 * @param {Function} done
 */
function renderTemplateFiles(skipInterpolation) {
  skipInterpolation = typeof skipInterpolation === 'string' ? [skipInterpolation] : skipInterpolation;
  return (files, metalsmith, done) => {
    const keys = Object.keys(files);
    const metalsmithMetadata = metalsmith.metadata();
    async.each(
      keys,
      (file, next) => {
        // 跳过处理
        if (skipInterpolation && multimatch([file], skipInterpolation, { dot: true }).length) {
          return next();
        }
        const str = files[file].contents.toString();
        // 文件内部没有 {{ }} 也不处理
        if (!/\{\{[\S\s]+?\}\}/.test(str)) {
          return next();
        }
        render(str, metalsmithMetadata, (err, res) => {
          if (err) {
            err.message = `[${file}] ${err.message}`;
            return next(err);
          }
          files[file].contents = Buffer.from(res);
          next();
        });
      },
      done,
    );
  };
}

/**
 * Display template complete message.
 *
 * @param {String} message
 * @param {Object} data
 */
function logMessage(message, data) {
  if (!message) return;
  render(message, data, (err, res) => {
    if (err) {
      console.error('\n   Error when rendering template complete message: ' + err.message.trim());
    } else {
      console.log(
        '\n' +
          res
            .split(/\r?\n/g)
            .map((line) => '   ' + line)
            .join('\n'),
      );
    }
  });
}
