type Task<T extends any = any> = () => Promise<T>;

/**
 * Caller function to add a task to the queue.
 */
type TaskCaller = <T extends any = any>(task: Task<T>) => ReturnType<Task<T>>;

/**
 * Create a task queue with a maximum number of concurrent tasks.
 */
type TaskQueueFactory = (max: number) => TaskCaller;

export default TaskQueueFactory;
