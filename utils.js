'use strict';

export const to = p => {
  return p.then(data => [null, data]).catch(err => [err, null]);
};

export const delay = (timeout, onTimeout) => {
  return new Promise(res => {
    onTimeout ??= res;
    setTimeout(onTimeout, timeout);
  });
};

export const resolveOptions = options => {
  if (!options) {
    throw new Error('options is required');
  }

  if (typeof options === 'number') {
    return {
      max: options,
      timeout: undefined,
    };
  }

  if (typeof options !== 'object') {
    throw new Error('options should be an object or a number');
  }

  const max = options.max;
  if (!max || (typeof max && max <= 0)) {
    throw new Error('options.max is required and should greater than 0');
  }

  const timeout = options.timeout;
  if (timeout && (typeof timeout !== 'number' || timeout <= 0)) {
    throw new Error('options.timeout should be a number and greater than 0');
  }

  return {
    max,
    timeout,
  };
};
