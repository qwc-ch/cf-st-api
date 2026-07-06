const identity = (s) => (s != null ? String(s) : '');

const chalkProxy = new Proxy(identity, {
    get(target, prop) {
        if (prop === 'default') return target;
        if (prop === 'toString') return () => '';
        if (prop === 'level') return 0;
        if (typeof prop === 'string' && prop.startsWith('__')) return undefined;
        return chalkProxy;
    },
    apply(target, _thisArg, args) {
        return args.join(' ');
    },
});

export default chalkProxy;
