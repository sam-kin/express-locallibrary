let menu = document.querySelector('.menu');
let controlBnt = document.querySelector('.btn-close');

controlBnt.addEventListener('click', function () {
    if (menu.style.display === 'none' || menu.style.display === '') {
        controlBnt.innerText = 'Close';
        menu.style.display = 'block';
    } else {
        controlBnt.innerText = 'Menu';
        menu.style.display = 'none';
    }
});
