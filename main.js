const mp = document.getElementById('spotlight');
const opac = 1;
const rootEl = document.documentElement;

var x, y, dim;

// on resize of the window, update the size of our spotlight *and* the size of our vh unit.
function updateDim() {
	dim = parseInt(window.getComputedStyle(mp).getPropertyValue('width')) / 2;
	rootEl.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
}

// updates the spotlight to follow the mouse pointer.
function updateMP(x, y) {
	mp.style.opacity = opac;
	mp.style.left = x + 'px';
	mp.style.top = y + 'px';
}

function mm(event) {
	updateDim();
	updateMP(event.clientX - dim, event.clientY - dim);
}

function ts(event) {
	if (event.touches.length == 1) {
		event.preventDefault();
		updateDim();
		updateMP(event.touches[0].clientX - dim, event.touches[0].clientY - dim);
	}
}

document.addEventListener('mousemove', mm, false);
document.addEventListener('touchstart', ts, false);
document.addEventListener('touchmove', ts, false);
document.addEventListener('resize', updateDim, false);

updateDim();