import { listenerCount } from 'cluster';

/* eslint-disable */

// const p1 = Promise.resolve(1);

// // const p2 = Promise.resolve(p1);

// // const Log = function(x) {
// //   console.log(x);
// // };

// // Log(p1 === p2);

// function sleep(time) {
//   return new Promise(resolve => {
//     setTimeout(resolve, time);
//   });
// }

// (async function() {
//   console.log(1);
//   await sleep(2000);
//   console.log(2);
// }());


// function foo(cb) {
//   setTimeout(function() {
//     try {
//       var x = bar();
//       cb(null, x);
//     } catch (e) {
//       cb(e);
//     }
//   });
// }

// foo(function(err, val) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(val);
//   }
// });

// const p1 = Promise.reject(1);

// p1
//   .then(x => {
//     return x * 2;
//   }, x => {
//     console.log('x', x);
//     return x * 3;
//   })
//   .then(x => x + 1, x => {
//     console.log('xx', x);
//     return x;
//   })
//   .catch(console.log);


function foo(x, y) {
  ajax({
    url: "http://baidu.com",
    function(err, data) {
      if (err) {
        it.throw(err);
      } else {
        it.next(data)
      }
    }
  })
}

function* main() {
  try {
    var text = yield foo(11, 12);
    console.log(text);
  } catch (err) {
    console.error(err)
  }
}

var it = main();
it.next()


listen('click', function () {
  setTimeout(function () {
    ajax('http://some.url.com', function (response) {
      if (response === '1') {
        doSomething();
      } else {
        doOtherthing();
      }
    })
  }, 500)
})