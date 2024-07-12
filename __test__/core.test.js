import { describe, expect, test, it, vi } from 'vitest';
import tq from '../index';

const testConcurrent = async (max, resolvedValue) => {
  const call = tq(max);

  let maxConcurrency = 0;
  let cur = 0;

  const promiseFns = Array.from({ length: 100 }, () => {
    return vi.fn(async () => {
      cur++;
      await new Promise(res =>
        setTimeout(() => {
          expect(cur).toBeLessThanOrEqual(max);
          expect(cur).toBeGreaterThanOrEqual(0);

          maxConcurrency = Math.max(maxConcurrency, cur);
          res(resolvedValue);
        })
      );
      cur--;
    });
  });

  const tasks = promiseFns.map(promiseFn => call(promiseFn));
  await Promise.all(tasks);

  expect(maxConcurrency).toBe(Math.min(100, max));

  promiseFns.forEach(promiseFn =>
    expect(promiseFn).toHaveResolvedWith(resolvedValue)
  );
};

describe('Core Function', () => {
  test('concurrency === 1', async () => {
    await testConcurrent(1);
  });

  test('concurrency === 4', async () => {
    await testConcurrent(4);
  });

  test('concurrency === 114514', async () => {
    await testConcurrent(114514);
  });

  test('concurrency === 1 && timeout === 1', async () => {
    const caller = tq({ max: 1, timeout: 1 });

    const tasks = [
      () => new Promise(res => setTimeout(() => res(1), 2)),
      () => new Promise(res => setTimeout(() => res(2), 2)),
      () => new Promise(res => setTimeout(() => res(3), 2)),
    ];
    const promises = tasks.map(task => caller(task));
    const res = await Promise.all(promises);
    expect(res).toStrictEqual([undefined, undefined, undefined]);
  });

  test('concurrency === 4 && timeout === 114514', async () => {
    const MAX_CONCURRENCY = 4;

    const caller = tq({
      max: MAX_CONCURRENCY,
      timeout: 114514,
    });
    let cur = 0;

    const tasks = Array.from({ length: 100 }, (_, i) => async () => {
      cur++;
      await new Promise(res =>
        setTimeout(() => {
          expect(cur).toBeLessThanOrEqual(MAX_CONCURRENCY);
          res(i);
        }, 10)
      );
      cur--;
    });

    const promises = tasks.map(task => caller(task));
    const res = await Promise.all(promises);
    res.forEach(r => expect(r).toBeUndefined());
  });

  describe('Pause & Resume', () => {
    it('should pause the active tasks while calling', async () => {
      // Only god knows how to test this in unit test
      // But I can test it in e2e test....
    });
  });
});
