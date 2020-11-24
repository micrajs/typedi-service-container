import { Container } from 'typedi';
import type { Token } from 'typedi';
import type { ServiceContainer } from '@micra/core';

/* eslint-disable-next-line @typescript-eslint/ban-types */
type Namespace = Function | string | Token<any>;

export class TypeDIServiceContainer implements ServiceContainer {
  public container: Container | any;

  constructor(container?: Container) {
    this.container = container ?? Container;
  }

  register<T>(namespace: Namespace, to: T): this {
    if (this.has(to)) {
      this.container.set({
        ...this.container.globalInstance.findService(to),
        transient: true,
        id: namespace,
        global: true,
      });
    } else {
      this.container.set({
        transient: true,
        id: namespace,
        type: to,
        global: true,
      });
    }

    return this;
  }

  singleton<T>(namespace: Namespace, to: T): this {
    if (this.has(to)) {
      this.container.set({
        ...this.container.globalInstance.findService(to),
        id: namespace,
        global: true,
      });
    } else {
      this.container.set({
        id: namespace,
        type: to,
        global: true,
      });
    }

    return this;
  }
  value<T>(namespace: Namespace, value: T): this {
    this.container.set({
      id: namespace,
      value,
    });

    return this;
  }

  factory<T>(
    namespace: Namespace,
    value: (dependencyContainer: TypeDIServiceContainer) => T,
  ): this {
    this.container.set({
      id: namespace,
      factory: () => value(this),
    });

    return this;
  }

  use<T = any>(namespace: Namespace): T {
    return this.container.get(namespace);
  }

  has(namespace: Namespace): boolean {
    return this.container.has(namespace);
  }

  clone(): ServiceContainer {
    return new TypeDIServiceContainer(Container.of(Date.now()));
  }
}
