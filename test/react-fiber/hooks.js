let firstWorkInProgressHook = null;
let workInProgressHook = null;

// 是否添加完成flag
let mounted = false;
let currentUpdateHook = null;

function useState(initialState) {
  // 已经添加
  if (mounted) {
    return updateState();
  }

  const hook = mountWorkInProgressHook();
  if (typeof initialState === 'function') {
    initialState = initialState();
  }
  hook.memoizedState = hook.baseState = initialState;

  const queue = (hook.queue = {
    last: null,
    dispatch: null,
  });

  // 利用函数偏应用，在dispatch中闭包quene，
  // 在调用setState的时候，本质上只是在quene中添加一项
  // 实际调用发生在再次useState阶段，会循环quene存储的环形链表
  const dispatch = (queue.dispatch = dispatchAction.bind(null, hook, queue));

  return [hook.memoizedState, dispatch];
}

function updateState() {
  if (currentUpdateHook === null) {
    currentUpdateHook = firstWorkInProgressHook;
  }
  const queue = currentUpdateHook.queue;
  const last = queue.last;
  let first = last !== null ? last.next : null;

  let newState = currentUpdateHook.baseState;

  if (first !== null) {
    let update = first;
    do {
      // 执行每一次更新，去更新状态
      const action = update.action;
      // 函数则调用
      if (typeof action === 'function') {
        newState = action(newState);
      } else {
        newState = action;
      }
      update = update.next;
    } while (update !== null && update !== first);

    currentUpdateHook.memoizedState = newState;
    currentUpdateHook.baseState = newState;
  }

  // 关键代码，执行一轮调用之后要把更新队列清空，在下一轮的调用中重新添加队列
  queue.last = null;
  currentUpdateHook = currentUpdateHook.next;

  const dispatch = queue.dispatch;

  // 返回最新的状态和修改状态的方法
  return [newState, dispatch];
}

function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null,
    baseState: null,
    queue: null,
    baseUpdate: null,
    next: null,
  };

  if (workInProgressHook === null) {
    // 当前workInProgressHook链表为空的话，
    // 将当前Hook作为第一个Hook
    firstWorkInProgressHook = workInProgressHook = hook;
  } else {
    // 否则将当前Hook添加到Hook链表的末尾
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}

// 只把一次render本轮的更新插入，而不是保留之前所有的dispatcher
function dispatchAction(hook, queue, action) {
  const update = {action, next: null};
  // 将update对象添加到循环链表中
  const last = queue.last;
  if (last === null) {
    // 链表为空，将当前更新作为第一个，并保持循环
    update.next = update;
  } else {
    const first = last.next;
    if (first !== null) {
      // 在最新的update对象后面插入新的update对象
      update.next = first;
    }
    last.next = update;
  }
  // 将表头保持在最新的update对象上
  queue.last = update;
}

function IncomeInfo() {
  const [age, setAge] = useState(18);
  const [teamName, setName] = useState('income');

  mounted = true;
  renderToScreen(age, teamName);
  return [setAge, setName];
}

var [setAge, setName] = IncomeInfo();

setName(x => x + '-girls');
setAge(x => x + 1);
IncomeInfo();

setName(x => x + '-boys');
setAge(x => x + 11);
setName(x => x + ',hi everone');
setAge(x => x + 30);
setAge(30);
IncomeInfo();

// console.log(firstWorkInProgressHook);

function renderToScreen(age, teamName) {
  document.body.innerHTML = '';
  const pAge = document.createElement('p');
  pAge.textContent = age;
  const pTeamName = document.createElement('p');
  pTeamName.textContent = teamName;
  document.body.appendChild(pAge);
  document.body.appendChild(pTeamName);
}
