export type Task = () => Promise<any>;

export class TaskQueue {
  retryInterval = null;
  intervalTime = 3000; // Milliseconds
  retryEnabled = false;

  queue: Task[] = [];

  public queueTask(task: Task): void {
    this.runTask(task);
  }

  private runTasks() {
    // Clear queue
    const queue = this.queue;
    this.queue = [];

    // Clear interval
    clearInterval(this.retryInterval);
    this.retryInterval = null;

    for (const task of queue) {
      this.runTask(task);
    }
  }

  private async runTask(task: Task) {
    try {
      // Try to execute task
      await task();
    } catch (e) {
      if (this.retryEnabled) {
        console.log(
          `Task failed, retrying in ${this.intervalTime / 1000}s`,
          task
        );
        this.queue.push(task);
  
        if (this.retryInterval == null) {
          this.retryInterval = setInterval(
            () => this.runTasks(),
            this.intervalTime
          );
        }
      } else {
        console.log(`Task failed, not retrying`,
          task
        );
      }
    }
  }
}
