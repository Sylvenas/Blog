let a = 1;
const function1 = function () {
  console.log(11, a);
  a = 2
  console.log(22, a)
}

a = 3;
const function2 = function () {
  console.log(33, a);
}
function1();
function2();