import { Container, Inject, Service } from 'typedi';
import { TypeDIServiceContainer } from '../TypeDIServiceContainer';

describe('TypeDIServiceContainer tests', () => {
  afterEach(() => {
    Container.reset();
  });

  it('should return a value based on a register', () => {
    const container = new TypeDIServiceContainer();
    class MyClass {
      public rand: number = Math.floor(Math.random() * 600000000000) + 1;
    }

    container.register('MyClass', MyClass);

    expect(container.use('MyClass')).not.toBe(container.use('MyClass'));
  });

  it('should return a value based on a register defined with a decorator', () => {
    const container = new TypeDIServiceContainer();
    @Service({ transient: true })
    class MyClass {
      public rand: number = Math.floor(Math.random() * 600000000000) + 1;
    }

    expect(container.use(MyClass)).not.toBe(container.use(MyClass));
  });

  it('should create an alias based on a register defined with a decorator', () => {
    const container = new TypeDIServiceContainer();
    @Service({ transient: true })
    class MyClass {
      @Inject('token')
      public token!: string;
    }

    container.value('token', 'my-token');
    container.register('MyAlias', MyClass);

    expect(container.use(MyClass).token).toBe('my-token');
    expect(container.use('MyAlias').token).toBe('my-token');
    expect(container.use(MyClass)).not.toBe(container.use('MyAlias'));
  });

  it('should return a value based on a singleton', () => {
    const container = new TypeDIServiceContainer();
    class MyClass {
      public rand: number = Math.floor(Math.random() * 600000000000) + 1;
    }

    container.singleton('MyClass', MyClass);

    expect(container.use('MyClass')).toBe(container.use('MyClass'));
  });

  it('should return a value based on a singleton registered through a decorator', () => {
    const container = new TypeDIServiceContainer();
    @Service('MyClass')
    class _MyClass {
      public rand: number = Math.floor(Math.random() * 600000000000) + 1;
    }

    expect(container.use('MyClass')).toBe(container.use('MyClass'));
  });

  it('should return a value based on a singleton with an injected dependencies', () => {
    const container = new TypeDIServiceContainer();

    @Service()
    class MyClass {
      @Inject('token')
      public token!: string;
    }

    container.value('token', 'my-token');
    container.singleton('MyClass', MyClass);

    expect(container.use('MyClass').token).toBe('my-token');
  });

  it('should return a value based on a constant', () => {
    const container = new TypeDIServiceContainer();

    container.value('test', 'my secret token');

    expect(container.use('test')).toBe('my secret token');
  });

  it('should return a value based on a factory', () => {
    const container = new TypeDIServiceContainer();
    class MyClass {
      constructor(public token: string) {}
    }

    container.value('token', 'my secret token');
    container.factory('MyClass', (c) => {
      return new MyClass(c.use('token'));
    });

    expect(container.use('MyClass').token).toBe('my secret token');
  });

  it('should not leak data from a child container to the parent', () => {
    @Service()
    class MyClass {
      @Inject('token')
      public token!: number;
    }

    const parent = new TypeDIServiceContainer();
    parent.singleton('singleton-class', MyClass);
    const child = parent.clone();
    child.value('token', 123);

    expect(child.use('singleton-class').token).toBe(child.use('token'));
    expect(() => parent.use('singleton-class')).toThrow();
  });

  it('should not leak data from a child container to the parent using a decorator', () => {
    @Service('singleton-class')
    class _MyClass {
      @Inject('token')
      public token!: number;
    }

    const parent = new TypeDIServiceContainer();
    const child = parent.clone();
    child.value('token', 123);

    expect(child.use('singleton-class').token).toBe(child.use('token'));
    expect(() => parent.use('singleton-class')).toThrow();
  });
});
