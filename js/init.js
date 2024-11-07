const to = localStorage.getItem('to')

if (!to || to === 'chinese_simplified') {
    document.body.style.opacity = 1;
    document.body.style.visibility = 'visible';
}