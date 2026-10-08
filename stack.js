import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.178.0/build/three.module.js';

const host = document.querySelector('#stack-canvas');
const button = document.querySelector('#drop-button');
const status = document.querySelector('#stack-status');
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-7, 7, 5, -5, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const blocks = [];
const colors = [0xf0a35b, 0x8db9cc, 0xece1ce];
let moving;
let score = 0;
let direction = 1;
let running = true;
let lastTime = 0;

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
host.appendChild(renderer.domElement);
camera.position.set(8, 8, 12);
camera.lookAt(0, 2.5, 0);
scene.add(new THREE.HemisphereLight(0xf8f2e9, 0x17130f, 2.5));
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(4, 8, 6);
scene.add(sun);

function resize() {
  const width = host.clientWidth;
  const height = host.clientHeight;
  const aspect = width / height;
  camera.left = -7 * aspect;
  camera.right = 7 * aspect;
  camera.top = 5;
  camera.bottom = -5;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function makeBlock(width, x, y, color, isMoving = false) {
  const geometry = new THREE.BoxGeometry(width, .72, 2.8);
  const material = new THREE.MeshStandardMaterial({ color, roughness: .7, metalness: .05 });
  const block = new THREE.Mesh(geometry, material);
  block.position.set(x, y, 0);
  block.userData.width = width;
  block.userData.moving = isMoving;
  scene.add(block);
  return block;
}

function setStatus(message = `stack: ${score}`) { status.textContent = message; }

function startBlock() {
  moving = makeBlock(blocks.length ? blocks[blocks.length - 1].userData.width : 4.4, -5.5, .36 + blocks.length * .72, colors[score % colors.length], true);
  direction = 1;
}

function reset() {
  blocks.splice(0).forEach((block) => scene.remove(block));
  if (moving) scene.remove(moving);
  score = 0;
  running = true;
  button.textContent = 'drop block';
  setStatus();
  blocks.push(makeBlock(4.4, 0, -.36, colors[2]));
  startBlock();
}

function drop() {
  if (!running) { reset(); return; }
  const previous = blocks[blocks.length - 1];
  const left = Math.max(moving.position.x - moving.userData.width / 2, previous.position.x - previous.userData.width / 2);
  const right = Math.min(moving.position.x + moving.userData.width / 2, previous.position.x + previous.userData.width / 2);
  const overlap = right - left;
  if (overlap <= .08) {
    running = false;
    moving.userData.moving = false;
    button.textContent = 'restart';
    setStatus(`stack: ${score} · oops`);
    return;
  }
  scene.remove(moving);
  moving = makeBlock(overlap, (left + right) / 2, .36 + blocks.length * .72, colors[score % colors.length]);
  blocks.push(moving);
  score += 1;
  setStatus();
  startBlock();
}

function animate(time = 0) {
  requestAnimationFrame(animate);
  const delta = Math.min((time - lastTime) / 1000, .04);
  lastTime = time;
  if (running && moving) {
    moving.position.x += direction * delta * 5;
    if (moving.position.x > 5.5) direction = -1;
    if (moving.position.x < -5.5) direction = 1;
  }
  camera.position.y += ((4 + Math.max(0, blocks.length - 5) * .72) - camera.position.y) * .04;
  camera.lookAt(0, camera.position.y - 3, 0);
  renderer.render(scene, camera);
}

host.addEventListener('click', drop);
button.addEventListener('click', drop);
window.addEventListener('keydown', (event) => { if (event.code === 'Space') { event.preventDefault(); drop(); } });
window.addEventListener('resize', resize);
resize();
reset();
animate();
