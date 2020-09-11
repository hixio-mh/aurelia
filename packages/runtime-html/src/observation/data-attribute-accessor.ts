import {
  IAccessor,
  LifecycleFlags,
  IScheduler,
  ITask,
  INode,
  AccessorType,
} from '@aurelia/runtime';

/**
 * Attribute accessor for HTML elements.
 * Note that Aurelia works with properties, so in all case it will try to assign to property instead of attributes.
 * Unless the property falls into a special set, then it will use attribute for it.
 *
 * @see ElementPropertyAccessor
 */
export class DataAttributeAccessor implements IAccessor<string | null> {
  public readonly obj: HTMLElement;
  public currentValue: string | null = null;
  public oldValue: string | null = null;

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
    obj: INode,
    public readonly propertyKey: string,
  ) {
    this.obj = obj as HTMLElement;
    this.persistentFlags = flags & LifecycleFlags.targetObserverFlags;
  }

  public getValue(): string | null {
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
      const { currentValue } = this;
      this.oldValue = currentValue;
      if (currentValue == void 0) {
        this.obj.removeAttribute(this.propertyKey);
      } else {
        this.obj.setAttribute(this.propertyKey, currentValue);
      }
    }
  }

  public bind(flags: LifecycleFlags): void {
    // if (this.persistentFlags === LifecycleFlags.persistentTargetObserverQueue) {
    //   if (this.task !== null) {
    //     this.task.cancel();
    //   }
    //   this.task = this.scheduler.queueRenderTask(() => this.flushChanges(flags), { persistent: true });
    // }
    this.currentValue = this.oldValue = this.obj.getAttribute(this.propertyKey);
    // this.flushChanges(flags);
  }

  public unbind(flags: LifecycleFlags): void {
    // if (this.task !== null) {
    //   this.task.cancel();
    //   this.task = null;
    // }
  }
}
