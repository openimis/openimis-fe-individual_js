// Inert stand-in for a build external that is not installed (see
// test/harness.cjs). Any property read yields a callable stub, and calling or
// constructing it yields the stub again.
const NAME = "ExternalStub";
const toPrimitive = () => NAME;

const stub = new Proxy(function stub() {}, {
  get(target, property) {
    if (property === "__esModule") return true;
    if (property === Symbol.toPrimitive) return toPrimitive;
    if (typeof property === "symbol") return undefined;
    if (property === "displayName" || property === "name") return NAME;
    if (property === "toString" || property === "valueOf") return toPrimitive;
    return stub;
  },
  apply() {
    return stub;
  },
  construct() {
    return stub;
  },
});

module.exports = stub;
