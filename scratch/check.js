import { HOLE_DATA, getCurrentGreenPoints } from '../src/data.js';

console.log('Hole 1 pointsA length:', HOLE_DATA[0].pointsA.length);
console.log('Current green points:', getCurrentGreenPoints(HOLE_DATA[0], 'A').length);
