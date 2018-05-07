document.querySelector('button').onclick = function open() {
    const newPage = window.open('', '_blank')
    axios.get('https://unpkg.com/axios/dist/axios.min.js').then(res => {
        newPage.location.href = 'https://www.baidu.com'
    })
}