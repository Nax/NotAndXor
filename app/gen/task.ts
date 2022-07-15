export type TaskCallback<TInput, TOutput> = (s: Partial<TInput>) => TOutput | null | Promise<TOutput | null>;
type TaskSubscription<TOutput> = (v: TOutput) => void;

export class TaskEntry<TOutput> {
  private _subscribers: TaskSubscription<TOutput>[] = [];

  subscribe(subscription: TaskSubscription<TOutput>) {
    this._subscribers.push(subscription);
  }

  publish(v: TOutput) {
    this._subscribers.forEach(subscriber => subscriber(v));
  }
};

export class Task<TInput, TOutput> {
  private _callback: TaskCallback<TInput, TOutput>;
  private _subscribers: TaskSubscription<TOutput>[] = [];
  private _done: boolean = false;
  private _doneCallback = () => {};
  private _promise: Promise<void> | null = null;

  constructor(subscription: {[K in keyof TInput]: (Task<any, TInput[K]> | TaskEntry<TInput[K]>)}, callback: TaskCallback<TInput, TOutput>) {
    this._callback = callback;
    for (const k in subscription) {
      const t = subscription[k];
      t.subscribe(v => this.run({ [k]: v } as any));
    }
  }

  subscribe(subscriber: TaskSubscription<TOutput>): void {
    this._subscribers.push(subscriber);
  }

  async run(diff: Partial<TInput>) {
    const output = await this._callback(diff);
    if (!output)
      return null;
    this._subscribers.forEach(subscriber => subscriber(output));
    if (!this._done) {
      this._done = true;
      this._doneCallback();
    }
  }

  promise() {
    if (!this._promise) {
      this._promise = new Promise(resolve => {
        if (this._done) {
          resolve();
        } else {
          this._doneCallback = () => { resolve(); };
        }
      });
    }
    return this._promise;
  }
}
