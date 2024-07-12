'use strict';

import { resolveOptions, delay, to } from './utils';

const tq = options => {
  const { max, timeout } = resolveOptions(options);

  const toBeExecuted = [];
  let curConcurrency = 0;

  const toBeResumed = [];
  let isPaused = false;

  const wrapTask = (task, resolve, reject) => {
    return async () => {
      // Handle timeout with `Promise.race` if `timeout` is provided
      const taskWithTimeout = () => {
        if (!timeout) {
          return task();
        } else {
          return Promise.race([task(), delay(timeout, resolve)]);
        }
      };

      curConcurrency++;

      const [err, res] = await to(taskWithTimeout());

      const next = () => {
        // Resolve or reject current task
        if (err) reject(err);
        resolve(res);

        curConcurrency--;

        // Execute next task in the queue
        if (toBeExecuted.length) {
          toBeExecuted.shift()();
        }
      };

      // Task will never resolve before calling `resolve` or `reject`
      //
      // So we can cache the follow-up processing into `toBeResumed`
      // and execute them when `resume` is called
      if (isPaused) {
        toBeResumed.push(next);
      }

      // Otherwise, execute the follow-up processing immediately
      else {
        next();
      }
    };
  };

  const caller = task => {
    return new Promise((resolve, reject) => {
      // Wrap tasks for accessing some control logic
      //   1. Concurrency control
      //   2. Timeout discard
      //   3. Pause and resume
      const wrappedTask = wrapTask(task, resolve, reject);

      // Enqueue the task if concurrency limit is reached
      if (curConcurrency >= max) {
        toBeExecuted.push(wrappedTask);
      }

      // Otherwise, execute the task immediately
      else {
        wrappedTask();
      }
    });
  };

  const pause = () => {
    isPaused = true;
  };

  const resume = () => {
    isPaused = false;
    while (toBeResumed.length) toBeResumed.shift()();
  };

  caller.pause = pause;
  caller.resume = resume;

  return caller;
};

export default tq;
