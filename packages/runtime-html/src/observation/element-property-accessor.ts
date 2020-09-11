import { IIndexable } from '@aurelia/kernel';
import {
  IAccessor,
  LifecycleFlags,
  IScheduler,
  ITask,
  AccessorType,
} from '@aurelia/runtime';

/**
 * Property accessor for HTML Elements.
 * Note that Aurelia works with properties, so in all case it will try to assign to property instead of attributes.
 * Unless the property falls into a special set, then it will use attribute for it.
 *
 * @see DataAttributeAccessor
 */
export class ElementPropertyAccessor implements IAccessor {
  public currentValue: unknown = void 0;
  public oldValue: unknown = void 0;

  public readonly persistentFlags: LifecycleFlags;

  public hasChanges: boolean = false;
  public task: ITask | null = null;
  // ObserverType.Layout is not always true, it depends on the property
  // but for simplicity, always treat as such
  public type: AccessorType = AccessorType.Node | AccessorType.Accessor | AccessorType.Layout;
  public lastUpdate: number = 0;

  public constructor(
    public readonly scheduler: IScheduler,
    flags: LifecycleFlags,
    public readonly obj: Node & IIndexable,
    public readonly propertyKey: string,
  ) {
    this.persistentFlags = flags & LifecycleFlags.targetObserverFlags;
  }

  public getValue(): unknown {
    return this.currentValue;
  }

  public setValue(newValue: string | null, flags: LifecycleFlags): void {
    this.lastUpdate = Date.now();
    this.currentValue = newValue;
    this.hasChanges = newValue !== this.oldValue;
    this.flushChanges(flags);
    // if ((flags & LifecycleFlags.fromBind) > 0 || this.persistentFlags === LifecycleFlags.noTargetObserverQueue) {
    //   this.flushChanges(flags);
    // } else if (this.persistentFlags !== LifecycleFlags.persistentTargetObserverQueue && this.task === null) {
    //   this.task = this.scheduler.queueRenderTask(() => {
    //     this.flushChanges(flags);
    //     this.task = null;
    //   });
    // }
  }

  public flushChanges(flags: LifecycleFlags): void {
    if (this.hasChanges) {
      this.hasChanges = false;
      const currentValue = this.currentValue;
      this.oldValue = currentValue;
      this.obj[this.propertyKey] = currentValue;
    }
  }

  public bind(flags: LifecycleFlags): void {
    // if (this.persistentFlags === LifecycleFlags.persistentTargetObserverQueue) {
    //   if (this.task !== null) {
    //     this.task.cancel();
    //   }
    //   this.task = this.scheduler.queueRenderTask(() => this.flushChanges(flags), { persistent: true });
    // }
    this.currentValue = this.oldValue = this.obj[this.propertyKey];
    // this.flushChanges(flags);
  }

  public unbind(flags: LifecycleFlags): void {
    // if (this.task !== null) {
    //   this.task.cancel();
    //   this.task = null;
    // }
  }
}
