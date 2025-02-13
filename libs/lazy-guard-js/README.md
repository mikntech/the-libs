# **LazyGuardJS** 🛡️⚡  
_A lightweight, high-performance lazy validation library for JavaScript & TypeScript._

## **Why LazyGuardJS?**  
Performant applications shouldn't waste CPU cycles on unnecessary validation. **LazyGuardJS** lets you attempt execution first and only fallback to validation when needed. This minimizes overhead while maintaining robustness.

### **How It Works**  
Instead of validating inputs up front, **LazyGuardJS** executes your function as-is. If it throws an error, it gracefully falls back to a validated version.

## **Installation**  
```sh
npm install lazyguardjs
```

## **Usage**  

```javascript
import { lazyGuard } from "lazyguardjs";

function fastFn(arr) {
  return arr.length; // Fails if `arr` is not an array
}

function safeFn(arr) {
  return Array.isArray(arr) ? arr.length : 0;
}

const robustFn = lazyGuard(fastFn, safeFn);

console.log(robustFn([1, 2, 3])); // ✅ Returns 3
console.log(robustFn(null));      // ✅ Returns 0 (fallback)
```

## **Advanced Usage: Multiple Fallbacks**
```javascript
const robustFn = lazyGuard(
  fastFn,
  alternativeFn,  // Runs if fastFn fails
  safeFn          // Runs if both fail
);
```

## **Benchmarks**
Coming soon... 🚀

## **Why Not Just Validate Upfront?**
- **Performance:** No need to waste time checking valid inputs.
- **Flexibility:** You decide how defensive you want to be.
- **Less Boilerplate:** No more redundant type checks everywhere.
