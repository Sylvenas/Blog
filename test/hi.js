function foo() {
    console.log(1);
}

function bar() {
    console.log(2);
}

foo();

setTimeout(function cb() {
    console.log(3);
});

bar();