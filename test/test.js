const secret = function (msg) {
    return function () {
        return msg
    }
}