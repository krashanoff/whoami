/* TODO:
 * Smooth out camera tracking to mouse movements
 * Slow down the camera
 * Fix drawing of canvas on landing
 */

var scene, camera, renderer, mouseX, mouseY, halfX, halfY, plot, material, sky;

init();
animate();

// Basic init operations
function init() {
    // New scene, camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, .1, 1000);

    // Mouse position default
    mouseX = 0;
    mouseY = 0;

    // halfX, halfY
    halfX = window.innerWidth / 2;
    halfY = window.innerHeight / 2;

    // Configure renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Append to landing card
    document.getElementById('plot').appendChild(renderer.domElement);

    // Set up "geometry" to hold points
    plot = new THREE.Geometry();

    // New PointsMaterial
    material = new THREE.PointsMaterial({color:0xfdfdfd, size:.5});

    // Populate geometry with vertices
    var spread = 1000;
    var count = 3500;
    for(var i=0;i<count;i++) {
        var point = new THREE.Vector3();
        point.x = THREE.Math.randFloatSpread(spread);
        point.y = THREE.Math.randFloatSpread(spread);
        point.z = THREE.Math.randFloatSpread(spread);
        plot.vertices.push(point);
    }

    // Generate the finalized "sky", add to scene
    sky = new THREE.Points(plot, material);
    scene.add(camera);
    scene.add(sky);

    // Set up event listeners for changes in window
    document.addEventListener('mousemove', onMM, false);
    document.addEventListener('touchstart', onTS, false);
    document.addEventListener('touchmove', onTM, false);
    document.addEventListener('resize', onRS, false);
}

// Listener calls for repositioning
function onMM(event) {
    mouseX = event.clientX - halfX;
    mouseY = event.clientY - halfY;
}

function onTS(event) {
    if(event.touches.length == 1) {
        event.preventDefault();
        mouseX = event.touches[0].pageX - halfX;
        mouseY = event.touches[0].pageY - halfY;
    }
}

function onTM(event) {
    if(event.touches.length == 1) {
        event.preventDefault();
        mouseX = event.touches[0].pageX - halfX;
        mouseY = event.touches[0].pageY - halfY;
    }
}

function onRS(event) {
    halfX = window.innerWidth / 2;
    halfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionnMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
    camera.position.x += (mouseX - camera.position.x) * .0001;
    camera.position.y += (mouseY - camera.position.y) * .0001;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

// Set up animate() loop
function animate() {
    requestAnimationFrame(animate);
    render();
}