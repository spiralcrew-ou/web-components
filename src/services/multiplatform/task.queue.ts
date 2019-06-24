type Dictionary<T> = { [key: string]: T };

export interface Task {
  id?: string;
  task: () => Promise<any>;
  dependsOn?: string;
}

const logEnabled = true;

function log(...args) {
  if (logEnabled) {
    console.log(...args);
  }
}

export class TaskQueue {
  interval = null;
  retryInterval: number; // Milliseconds
  retryEnabled = false;

  queue: Dictionary<Task> = {};
  dependenciesQueue: Dictionary<Task> = {};

  constructor(retryEnabled: boolean = true, retryInterval: number = 100) {
    this.retryEnabled = retryEnabled;
    this.retryInterval = retryInterval;
  }

  public queueTask(task: Task): void {
    // Remove the task with the same id from the queue, if it existed
    if (!task.id) {
      task.id = Math.random().toString();
    }

    if (navigator.onLine) {
      this.queue[task.id] = null;
      delete this.queue[task.id];

      log(
        '[TASK QUEUE] Received task: we are online, run task',
        task,
        this.queue
      );
      this.runTask(task);
    } else {
      log(
        '[TASK QUEUE] Received task: we are offline, queue task',
        task,
        this.queue
      );
      this.queue[task.id] = task;
      this.scheduleTasksRun();
    }
  }

  private scheduleTasksRun() {
    if (this.interval == null) {
      this.interval = setInterval(() => this.runTasks(), this.retryInterval);
    }
  }

  private runTasks() {
    if (navigator.onLine) {
      log('[TASK QUEUE] Running tasks', this.queue);
      // Clear queue
      const queue = this.queue;
      this.queue = {};

      // Clear interval
      clearInterval(this.interval);
      this.interval = null;

      for (const taskId of Object.keys(queue)) {
        const task = queue[taskId];
        if (task.dependsOn && queue[task.dependsOn]) {
          this.dependenciesQueue[task.id] = task;
        } else {
          this.runTask(task);
        }
      }
    }
  }

  private async runTask(task: Task) {
    try {
      // Try to execute task
      await task.task();

      const dependantTasksIds = Object.keys(this.dependenciesQueue).filter(
        dependantTaskId =>
          this.dependenciesQueue[dependantTaskId].dependsOn === task.id
      );
      const dependantTasks: Dictionary<Task> = {};
      for (const taskId of dependantTasksIds) {
        dependantTasks[taskId] = this.dependenciesQueue[taskId];
        this.dependenciesQueue[taskId] = null;
        delete this.dependenciesQueue[taskId];
      }

      this.queue = { ...dependantTasks, ...this.queue };

      this.scheduleTasksRun();
    } catch (e) {
      if (this.retryEnabled && !navigator.onLine) {
        console.log(`Task failed, retrying when online`, task);

        if (this.queue[task.id] && this.queue[task.id] !== task) {
          return;
        }

        this.queue[task.id] = task;

        this.scheduleTasksRun();
      } else {
        console.log(`Task failed, not retrying`, task);
        // Task succeeded, delete the task from the dictionary
        this.queue[task.id] = null;
        delete this.queue[task.id];
      }
    }
  }
}
