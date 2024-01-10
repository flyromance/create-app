import path from 'path';
import { existsSync as exists } from 'fs';
import metadata from 'read-metadata';
import validateName from 'validate-npm-package-name';

import getGitUser from './git-user';

/**
 * Read prompts metadata.
 *
 * @param {String} dir
 * @return {Object}
 */
export function getOptions(name, dir) {
  const opts = getMetadata(dir);

  if (opts.schema) {
    opts.prompts = opts.schema;
    delete opts.schema;
  }

  setDefault(opts, 'name', name);
  setValidateName(opts);

  const author = getGitUser();
  if (author) {
    setDefault(opts, 'author', author);
  }

  return opts;
}

/**
 * 从模板仓库中获取meta.json或者meta.js
 *
 * @param  {String} dir
 * @return {Object}
 */
export function getMetadata(dir) {
  const json = path.join(dir, 'meta.json');
  const js = path.join(dir, 'meta.js');
  let opts: Record<string, any> = {};

  if (exists(json)) {
    opts = metadata.sync(json);
  } else if (exists(js)) {
    const req = require(path.resolve(js));
    if (req !== Object(req)) {
      throw new Error('meta.js needs to expose an object');
    }
    opts = req;
  }

  return opts;
}

/**
 * Set the default value for a prompt question
 *
 * @param {Object} opts
 * @param {String} key
 * @param {String} val
 */
export function setDefault(opts, key, val) {
  const prompts = opts.prompts || (opts.prompts = {});
  if (!prompts[key] || typeof prompts[key] !== 'object') {
    prompts[key] = {
      type: 'string',
      default: val,
    };
  } else {
    if (!('default' in prompts[key])) {
      prompts[key]['default'] = val;
    }
  }
}

export function setValidateName(opts) {
  const name = opts.prompts.name;
  const customValidate = name.validate;
  name.validate = (name) => {
    const its = validateName(name);
    if (!its.validForNewPackages) {
      const errors = (its.errors || []).concat(its.warnings || []);
      return 'Sorry, ' + errors.join(' and ') + '.';
    }
    if (typeof customValidate === 'function') return customValidate(name);
    return true;
  };
}
