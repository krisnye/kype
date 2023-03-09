
export function memoize<A extends object, B>(fn: (a: A) => B, cacheResultAsKey = false, cache: WeakMap<A, B> = new WeakMap()): (a: A) => B {
    return function(arg) {
        if (arg == null && typeof arg === "object") {
            return fn(arg);
        }
        try {
        let result = cache.get(arg);
        if (result === undefined) {
            cache.set(arg, result = fn(arg));
            if (cacheResultAsKey) {
                cache.set(result as any as A, result);
            }
        }
        return result;
        }
        catch(e) {
            console.log("Error?", arg, typeof arg);
            throw e;
        }
    }
}
