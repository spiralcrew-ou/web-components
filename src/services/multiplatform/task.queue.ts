export type Task = () => any;

export class TaskQueue {
  retryInterval = null; 
  intervalTime = 3000; // Milliseconds

  queue: Task[] = [];

  public queueTask(task: Task): void {
    this.runTask(task);
  }

  private runTasks() {
    // Clear queue
    const queue = this.queue;
    this.queue = [];
    
    this.retryInterval = null; 

    for (const task of queue) {
      this.runTask(task);
    }
  }

  private runTask(task: Task) {
    try {
      task();
    } catch (e) {
      this.queue.push(task);

      if (this.retryInterval == null) {
        this.retryInterval = setInterval(this.runTasks, this.intervalTime);
      }
    }
  }
}
