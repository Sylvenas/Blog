// Write Javascript code!
const appDiv = document.getElementById('app');
appDiv.innerHTML = `<h1>Linked list traversal</h1>`;

function renderToScreen(value) {
  const span = document.createElement('span');
  span.textContent = value + ', ';
  appDiv.appendChild(span);
}

// export type Hook = {
//   memoizedState: any,
//   baseState: any,
//   baseUpdate: Update<any, any> | null,
//   queue: UpdateQueue<any, any> | null,
//   next: Hook | null,  // 指向下一个Hook
// };

// const queue = (hook.queue = {
//   last: null,
//   dispatch: null,
//   lastRenderedReducer,
//   lastRenderedState,
// });

const a1 = {
  name: 'a1',
  render: () => {
    return [b1, b2, b3];
  },
  hooks: () => [18, 'mello'],
};
const b1 = {name: 'b1', render: () => null};
const b2 = {
  name: 'b2',
  render: () => [c1],
};
const b3 = {
  name: 'b3',
  render: () => [c2],
};
const c1 = {
  name: 'c1',
  render: () => [d1, d2],
};
const c2 = {name: 'c2', render: () => null};
const d1 = {name: 'd1', render: () => null};
const d2 = {name: 'd2', render: () => null};

class Node {
  constructor(instance) {
    this.instance = instance;
    this.child = null;
    this.sibling = null;
    this.return = null;
  }
}

class Hook {
  constructor(baseState, queue, next) {
    this.baseState = baseState;
    this.queue = queue;
    this.next = next;
  }
}

class Queue {
  constructor(baseState, queue, next) {
    this.last = null;
    this.next = null;
    this.dispatch = null;
  }
}

function useState(initialState) {
  const hook = new Hook(initialState, null, null);

  return [initialState, setState];
}

function mountHooks(node, vals) {
  // node.hooks = vals.reduceRight((previous, current) => {
  //   const hook = new Hook(current, null, previous);
  //   const [state, setState] = useState(current, hook);

  //   return hook;
  // }, null);

  for (let index = 0; index < vals.length; index++) {
    const val = vals[index];
    const [state, setState] = useState(val);
  }
}

function link(parent, elements) {
  if (elements === null) {
    elements = [];
  }

  parent.child = elements.reduceRight((previous, current) => {
    const node = new Node(current);
    node.return = parent;
    node.sibling = previous;
    return node;
  }, null);

  return parent.child;
}

function doWork(node) {
  const children = node.instance.render();

  const hooks = node.instance.hooks;
  let mountedHooks;
  if (hooks) {
    mountedHooks = mountHooks(node, hooks);
  }

  renderToScreen(node.instance.name, mountedHooks);
  return link(node, children);
}

function walk(o) {
  let root = o;
  let node = o;

  while (true) {
    let child = doWork(node);

    if (child) {
      node = child;
      continue;
    }

    if (node === root) {
      return root;
    }

    while (!node.sibling) {
      if (!node.return || node.return === root) {
        return root;
      }

      node = node.return;
    }

    node = node.sibling;
  }
}

const hostNode = new Node(a1);

const linkedList = walk(hostNode);

console.log(linkedList);
