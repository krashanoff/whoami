const mp = document.getElementById('spotlight');

var x, y, dim;

function updateDim() {
	dim = parseInt(window.getComputedStyle(mp).getPropertyValue('width')) / 2;	
}

function mm(event) {
	updateDim();
	x = event.clientX - dim;
	y = event.clientY - dim;
	mp.style.opacity = 1;
	mp.style.left = x + 'px';
	mp.style.top = y + 'px';
}

function ts(event) {
	if (event.touches.length == 1) {
		event.preventDefault();
		updateDim();
		x = event.touches[0].pageX - dim;
		y = event.touches[0].pageY - dim;
		mp.style.opacity = 1;
	}
}

document.addEventListener('mousemove', mm, false);
document.addEventListener('touchstart', ts, false);
document.addEventListener('touchmove', ts, false);