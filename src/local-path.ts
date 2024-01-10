import path from 'path';

export const isLocalPath = (templatePath) => {
  return /^[./]|(^[a-zA-Z]:)/.test(templatePath);
};

export const getTemplatePath = (templatePath) => {
  return path.isAbsolute(templatePath) ? templatePath : path.normalize(path.join(process.cwd(), templatePath));
};
