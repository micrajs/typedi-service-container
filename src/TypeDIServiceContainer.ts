import { Container } from 'typedi';
import type { ServiceContainer } from '@micra/core';

export class TypeDIServiceContainer implements ServiceContainer {
  public container: Container;

  constructor(container?: Container) {
    this.container = container ?? Container;
  }

  register(namespace: any, to: any): this {
    if (this.has(to)) {
      (this.container as any).set({
        ...(this.container as any).globalInstance.findService(to),
        transient: true,
        id: namespace,
        global: true,
      });
    } else {
      (this.container as any).set({
        transient: true,
        id: namespace,
        type: to,
        global: true,
      });
    }

    return this;
  }

  singleton(namespace: any, to: any): this {
    if (this.has(to)) {
      (this.container as any).set({
        ...(this.container as any).globalInstance.findService(to),
        id: namespace,
        global: true,
      });
    } else {
      (this.container as any).set({
        id: namespace,
        type: to,
        global: true,
      });
    }

    return this;
  }
  value<T = any>(namespace: any, value: T): this {
    (this.container as any).set({
      id: namespace,
      value,
    });

    return this;
  }

  factory<T = any>(
    namespace: string,
    value: (dependencyContainer: TypeDIServiceContainer) => T,
  ): this {
    const $container = this;
    (this.container as any).set({
      id: namespace,
      factory: () => value($container),
    });

    return this;
  }

  use<T = any>(namespace: any): T {
    return (this.container as any).get(namespace);
  }

  has(namespace: any): boolean {
    return (this.container as any).has(namespace);
  }

  clone(): ServiceContainer {
    return new TypeDIServiceContainer(Container.of(Date.now()));
  }
}
