const hook = {
  memoizedState: null,
  next: null,
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
  const [age, setAge] = useState(18);
  const [name, setName] = useState('income');

  console.log(`Age: ${age}; Name: ${name}`);
}
