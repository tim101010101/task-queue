# task-queue

**A simple task queue, mainly used for concurrency control**

## Feature

1. Concurrency limit
2. Timeout
3. Pause & Resume

## Quick Start

install

```sh
npm i tq
```

usage

```js
import tq from 'tq';

const apiList = ['api1', 'api2', 'api3'];

const caller = tq({ max: 2, timeout: 5000 });
const tasks = apiList.map(api => () => caller(api));

const start = async () => {
  await Promise.all(tasks.map(task => task()));
};

const pause = () => caller.pause();
const resume = () => caller.resume();
```
