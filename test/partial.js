var hook = {
    memoizedState: null,
    next: null
};
/**
 * Hook数据结构
 *
 * hook = {
 *  memoizedState: any, // 保存当前 hook 的 state
 *  next: hook,         // next 指向下一个 hook
 * };
 */
function useState(initialState) {
    return [];
}
function TeamsInfo() {
    var _a = useState(18), age = _a[0], setAge = _a[1];
    var _b = useState('income'), name = _b[0], setName = _b[1];
    console.log("Age: " + age + "; Name: " + name);
}
