var pingpong = (function () {
    var private = 0;

    return {
        inc(n) {
            return private += n
        },
        dec(n) {
            return private -= n
        }
    }
})();

pingpong.div = function (n) {
    return private / n
}

var log = console.log;

log(pingpong.inc(10));

log(pingpong.dec(3));


function showObject(obj) { 
    return function () { 
        return obj
    }
}

var o = { a: 1 };
var showO = showObject(o);
showO()  // {a:1}

o.a = 6;
showO()  // {a:6}