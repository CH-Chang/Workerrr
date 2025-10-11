export const encode = (str: string): string => {
  return Buffer.from(str, 'utf-8').toString('base64');
};

export const decode = (str: string): string => {
  return Buffer.from(str, 'base64').toString('utf-8');
};
