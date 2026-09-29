declare module "async_hooks" {
	export class AsyncLocalStorage<T = unknown> {
		run<R>(store: T, callback: (...args: unknown[]) => R, ...args: unknown[]): R;
		getStore(): T | undefined;
	}
}
