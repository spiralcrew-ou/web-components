export interface Task {
  id?: string;
  task: () => Promise<any>;
}

export class TaskQueue {
  interval = null;
  retryInterval: number; // Milliseconds
  retryEnabled = true;

  tasksIds: { [key: string]: Task } = {};
  queue: Task[] = [];

  constructor(retryEnabled: boolean = true, retryInterval: number = 100) {
    this.retryEnabled = retryEnabled;
    this.retryInterval = retryInterval;
  }

  public queueTask(task: Task): void {
    // Remove the task with the same id from the queue, if it existed
    if (task.id) {
      this.tasksIds[task.id] = task;
      const index = this.queue.findIndex(
        queuedTask => queuedTask.id === task.id
      );
      if (index !== -1) {
        this.queue = this.queue.splice(index, 1);
      }
    }

    if (navigator.onLine) {
      this.runTask(task);
    } else {
      this.queue.push(task);
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
      // Clear queue
      const queue = this.queue;
      this.queue = [];

      // Clear interval
      clearInterval(this.interval);
      this.interval = null;

      for (const task of queue) {
        this.runTask(task);
      }
    }
  }

  private async runTask(task: Task) {
    try {
      // Try to execute task
      await task.task();
      // Task succeeded, delete the task from the dictionary
      this.tasksIds[task.id] = null;
      delete this.tasksIds[task.id];
    } catch (e) {
      if (this.retryEnabled) {
        console.log(
          `Task failed, retrying when online ${this.retryInterval / 1000}s`,
          task
        );

        if (this.tasksIds[task.id] && this.tasksIds[task.id] !== task) {
          return;
        }

        this.queue.push(task);

        this.scheduleTasksRun();
      } else {
        console.log(`Task failed, not retrying`, task);
      }
    }
  }
}
