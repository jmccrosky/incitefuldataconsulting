const canvas = document.getElementById('logCanvas');
const ctx = canvas.getContext('2d');
const methodBtns = document.querySelectorAll('.method-btn');
const methodTitle = document.getElementById('methodTitle');
const methodDescription = document.getElementById('methodDescription');
const prosList = document.getElementById('prosList');
const consList = document.getElementById('consList');

// Sliders and Values
const logDiameterSlider = document.getElementById('logDiameter');
const logDiameterVal = document.getElementById('logDiameterVal');
const boardThicknessSlider = document.getElementById('boardThickness');
const boardThicknessVal = document.getElementById('boardThicknessVal');
const bladeKerfSlider = document.getElementById('bladeKerf');
const bladeKerfVal = document.getElementById('bladeKerfVal');

// Board Details
const boardDetailsPanel = document.getElementById('boardDetails');
const detailWidth = document.getElementById('detailWidth');
const detailAngle = document.getElementById('detailAngle');
const detailClass = document.getElementById('detailClass');
const detailStability = document.getElementById('detailStability');

// Configuration & State
let centerX = canvas.width / 2;
let centerY = canvas.height / 2;
let scale = 12; // Pixels per inch
let logDiameter = parseInt(logDiameterSlider.value);
let boardThickness = parseFloat(boardThicknessSlider.value);
let bladeKerf = parseFloat(bladeKerfSlider.value);
let currentMethod = 'plain';
let boards = []; // Array to store generated board objects {path, width, angle, ...}
let hoveredBoard = null;

// Data for methods
const methods = {
    plain: {
        title: "Plain Sawn (Flat Sawn)",
        description: "The most common method. The log is squared and then sawed tangentially to the annual growth rings.",
        pros: ["Highest yield", "Fast & cheap", "Cathedral grain"],
        cons: ["Less stable", "Cupping/twisting", "Expands with moisture"]
    },
    quarter: {
        title: "Quarter Sawn",
        description: "The log is cut into quarters, then sawed perpendicular to the rings.",
        pros: ["Very stable", "Ray fleck patterns", "Moisture resistant"],
        cons: ["Expensive", "Lower yield", "Narrower boards"]
    },
    rift: {
        title: "Rift Sawn",
        description: "Milled perpendicular to growth rings for consistent straight grain.",
        pros: ["Most stable", "Linear grain", "Strongest"],
        cons: ["Most expensive", "High waste", "Rare"]
    },
    live: {
        title: "Live Sawn",
        description: "Cut straight through without turning.",
        pros: ["High yield", "Unique aesthetic", "Wide slabs"],
        cons: ["Variable stability", "Knots/sapwood", "Rustic look"]
    }
};

function init() {
    // Event Listeners for Controls
    logDiameterSlider.addEventListener('input', updateSettings);
    boardThicknessSlider.addEventListener('input', updateSettings);
    bladeKerfSlider.addEventListener('input', updateSettings);

    methodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            methodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMethod = btn.dataset.method;
            updateInfo(currentMethod);
            generateBoards();
            draw();
        });
    });

    // Canvas Interaction
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', () => {
        hoveredBoard = null;
        boardDetailsPanel.classList.add('hidden');
        draw();
    });

    updateSettings(); // Initial draw
}

function updateSettings() {
    logDiameter = parseInt(logDiameterSlider.value);
    boardThickness = parseFloat(boardThicknessSlider.value);
    bladeKerf = parseFloat(bladeKerfSlider.value);

    logDiameterVal.textContent = logDiameter;
    boardThicknessVal.textContent = boardThickness;
    bladeKerfVal.textContent = bladeKerf;

    generateBoards();
    draw();
}

function updateInfo(method) {
    const data = methods[method];
    methodTitle.textContent = data.title;
    methodDescription.textContent = data.description;
    prosList.innerHTML = data.pros.map(item => `<li>${item}</li>`).join('');
    consList.innerHTML = data.cons.map(item => `<li>${item}</li>`).join('');
}

// --- Geometry & Board Generation ---

function generateBoards() {
    boards = [];
    const radius = (logDiameter / 2);
    // We work in inches for calculation, then scale for drawing.

    if (currentMethod === 'live') {
        generateLiveSawn(radius);
    } else if (currentMethod === 'plain') {
        generatePlainSawn(radius);
    } else if (currentMethod === 'quarter') {
        generateQuarterSawn(radius);
    } else if (currentMethod === 'rift') {
        generateRiftSawn(radius);
    }
}

function createBoard(x, y, w, h, rotation = 0) {
    // Create a board object. x,y is center. w,h are dimensions in inches.
    // We need to store the polygon points for hit testing and drawing.

    // Calculate corners relative to center
    const hw = w / 2;
    const hh = h / 2;

    // Rotate points
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    const corners = [
        { x: -hw, y: -hh },
        { x: hw, y: -hh },
        { x: hw, y: hh },
        { x: -hw, y: hh }
    ].map(p => ({
        x: x + (p.x * cos - p.y * sin),
        y: y + (p.x * sin + p.y * cos)
    }));

    // Calculate grain angle relative to board face
    // Simplified: Angle of position vector from center of log to center of board
    // vs the board's orientation.
    // Vector to board center: (x, y) (assuming log center is 0,0)
    // Angle of vector: Math.atan2(y, x)
    // Board normal angle: rotation + Math.PI/2
    // Grain angle is roughly the difference.
    // 0 deg = Flat sawn (tangential)
    // 90 deg = Quarter/Rift (radial)

    const dist = Math.sqrt(x * x + y * y);
    const angleToCenter = Math.atan2(y, x);
    // Angle of the board's face normal (perpendicular to width)
    // If rotation is 0 (horizontal board), normal is vertical (PI/2).
    const boardNormal = rotation + Math.PI / 2;

    let grainAngle = Math.abs(angleToCenter - boardNormal);
    // Normalize to 0-90
    while (grainAngle > Math.PI) grainAngle -= Math.PI;
    while (grainAngle < 0) grainAngle += Math.PI;
    if (grainAngle > Math.PI / 2) grainAngle = Math.PI - grainAngle;

    const grainDeg = grainAngle * (180 / Math.PI);

    return {
        corners: corners,
        x: x, y: y, w: w, h: h, rotation: rotation,
        grainDeg: grainDeg,
        dist: dist
    };
}

function generateLiveSawn(radius) {
    const startY = -radius;
    const endY = radius;
    let currentY = startY;

    // Center the cuts
    const numBoards = Math.floor((radius * 2) / (boardThickness + bladeKerf));
    const totalH = numBoards * (boardThickness + bladeKerf) - bladeKerf;
    currentY = -totalH / 2 + boardThickness / 2;

    for (let i = 0; i < numBoards; i++) {
        const y = currentY;
        // Find width at this Y
        // x = sqrt(r^2 - y^2)
        if (Math.abs(y) < radius) {
            const halfWidth = Math.sqrt(radius * radius - y * y);
            const width = halfWidth * 2;
            // Trim a bit for bark/sapwood usually, but let's show full width
            if (width > 2) { // Minimum width
                boards.push(createBoard(0, y, width, boardThickness, 0));
            }
        }
        currentY += boardThickness + bladeKerf;
    }
}

function generatePlainSawn(radius) {
    // Simulate "cutting around" a cant
    // Simplified: Define a center cant, then cut boards from top, bottom, left, right

    const cantSize = radius * 1.2; // Size of the square area we process
    const cantHalf = cantSize / 2;

    // Top
    let y = -radius + 1; // Start a bit in
    while (y < -cantHalf / 2) {
        const w = Math.sqrt(radius * radius - y * y) * 1.8; // Approx width
        if (w > 4) boards.push(createBoard(0, y, w, boardThickness, 0));
        y += boardThickness + bladeKerf;
    }

    // Bottom
    y = radius - 1;
    while (y > cantHalf / 2) {
        const w = Math.sqrt(radius * radius - y * y) * 1.8;
        if (w > 4) boards.push(createBoard(0, y, w, boardThickness, 0));
        y -= (boardThickness + bladeKerf);
    }

    // Left (Vertical)
    let x = -radius + 1;
    while (x < -cantHalf / 2) {
        const h = Math.sqrt(radius * radius - x * x) * 1.8;
        if (h > 4) boards.push(createBoard(x, 0, boardThickness, h, 0)); // Vertical board is w=thickness, h=length
        x += boardThickness + bladeKerf;
    }

    // Right (Vertical)
    x = radius - 1;
    while (x > cantHalf / 2) {
        const h = Math.sqrt(radius * radius - x * x) * 1.8;
        if (h > 4) boards.push(createBoard(x, 0, boardThickness, h, 0));
        x -= (boardThickness + bladeKerf);
    }

    // Center Cant (often cut into boards too, usually flat sawn)
    y = -cantHalf / 2;
    while (y < cantHalf / 2) {
        boards.push(createBoard(0, y, cantHalf, boardThickness, 0));
        y += boardThickness + bladeKerf;
    }
}

function generateQuarterSawn(radius) {
    // Radial cuts in quadrants? Or alternating?
    // Let's do the "Alternating" pattern which is common.
    // Cut log in 4.
    // For each quarter, cut boards from alternating faces.

    // We'll just generate for one quarter and rotate it 4 times.
    for (let q = 0; q < 4; q++) {
        const rotation = q * (Math.PI / 2);

        // Simulate one quarter (Top Right)
        // Cut parallel to vertical axis, then horizontal?
        // Common method: Cut a board from vertical face, then horizontal face, repeat.

        let vOffset = 0; // From center X
        let hOffset = 0; // From center Y

        let safe = 100;
        while (safe-- > 0) {
            // Vertical cut
            // x = vOffset + thickness/2
            // y start = hOffset
            // y end = circle edge

            const vx = vOffset + boardThickness / 2;
            const vyStart = hOffset;
            // Find intersection with circle for x=vx
            if (vx > radius) break;
            const vyEnd = Math.sqrt(radius * radius - vx * vx);
            const vHeight = vyEnd - vyStart;

            if (vHeight > 2) {
                // Add vertical board
                // Center: x = vx, y = vyStart + vHeight/2
                // But we need to rotate this into the quadrant
                const b = createBoard(vx, -(vyStart + vHeight / 2), boardThickness, vHeight, 0);
                // Rotate board center and corners
                rotateBoard(b, rotation);
                boards.push(b);
            }
            vOffset += boardThickness + bladeKerf;

            // Horizontal cut
            const hy = hOffset + boardThickness / 2;
            const hxStart = vOffset;
            if (hy > radius) break;
            const hxEnd = Math.sqrt(radius * radius - hy * hy);
            const hWidth = hxEnd - hxStart;

            if (hWidth > 2) {
                // Add horizontal board
                const b = createBoard(hxStart + hWidth / 2, -hy, hWidth, boardThickness, 0);
                rotateBoard(b, rotation);
                boards.push(b);
            }
            hOffset += boardThickness + bladeKerf;

            if (vOffset > radius && hOffset > radius) break;
        }
    }
}

function generateRiftSawn(radius) {
    // Radial cuts.
    // Boards are wedges? No, boards are rectangular, but cut radially.
    // Usually involves cutting a cant and then cutting radially, or moving the log.
    // Let's visualize the "perfect" rift: boards radiating.
    // In reality, this produces trapezoids or lots of waste.
    // We will simulate rectangular boards cut along radial lines.

    const circumference = 2 * Math.PI * (radius * 0.7); // Avg circumference
    const numBoards = Math.floor(circumference / (boardThickness + bladeKerf));

    for (let i = 0; i < numBoards; i++) {
        const angle = (i / numBoards) * Math.PI * 2;
        // Board center is at some radius
        const dist = radius * 0.6;
        const cx = Math.cos(angle) * dist;
        const cy = Math.sin(angle) * dist;

        // Board is oriented along the radius
        const rot = angle;

        // Length of board?
        const len = radius * 0.8;

        boards.push(createBoard(cx, cy, len, boardThickness, rot));
    }
}

function rotateBoard(board, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Rotate center
    const nx = board.x * cos - board.y * sin;
    const ny = board.x * sin + board.y * cos;
    board.x = nx;
    board.y = ny;

    // Rotate corners
    board.corners = board.corners.map(p => ({
        x: p.x * cos - p.y * sin,
        y: p.x * sin + p.y * cos
    }));

    board.rotation += angle;

    // Re-calc grain angle? No, relative geometry is same, but position changed.
    // Recalculate grain based on new pos
    const dist = Math.sqrt(board.x * board.x + board.y * board.y);
    const angleToCenter = Math.atan2(board.y, board.x);
    const boardNormal = board.rotation + Math.PI / 2;
    let grainAngle = Math.abs(angleToCenter - boardNormal);
    while (grainAngle > Math.PI) grainAngle -= Math.PI;
    while (grainAngle < 0) grainAngle += Math.PI;
    if (grainAngle > Math.PI / 2) grainAngle = Math.PI - grainAngle;
    board.grainDeg = grainAngle * (180 / Math.PI);
}


// --- Drawing ---

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update scale based on log size to fit in canvas
    // Max diameter is 40", canvas is 600px. 600/40 = 15.
    // Let's keep some padding.
    scale = (canvas.width * 0.9) / logDiameter;

    drawLog();
    drawBoards();
}

function drawLog() {
    const rPx = (logDiameter / 2) * scale;

    // Bark
    ctx.beginPath();
    ctx.arc(centerX, centerY, rPx, 0, Math.PI * 2);
    ctx.fillStyle = '#8d6e63';
    ctx.fill();
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Wood
    const barkPx = 0.5 * scale; // 0.5 inch bark
    ctx.beginPath();
    ctx.arc(centerX, centerY, rPx - barkPx, 0, Math.PI * 2);
    ctx.fillStyle = '#d7ccc8';
    ctx.fill();

    // Rings
    ctx.strokeStyle = '#a1887f';
    ctx.lineWidth = 1;
    const ringCount = logDiameter / 2; // 1 ring per inch approx
    for (let i = 1; i <= ringCount; i++) {
        const r = (rPx - barkPx) * (i / ringCount);
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawBoards() {
    boards.forEach(board => {
        ctx.beginPath();
        const p0 = board.corners[0];
        ctx.moveTo(centerX + p0.x * scale, centerY + p0.y * scale);
        for (let i = 1; i < 4; i++) {
            const p = board.corners[i];
            ctx.lineTo(centerX + p.x * scale, centerY + p.y * scale);
        }
        ctx.closePath();

        if (board === hoveredBoard) {
            ctx.fillStyle = 'rgba(230, 126, 34, 0.8)'; // Highlight
            ctx.strokeStyle = '#d35400';
            ctx.lineWidth = 2;
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 1;
        }

        ctx.fill();
        ctx.stroke();
    });
}

// --- Interaction ---

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Convert to logic coordinates (inches from center)
    const lx = (mx - centerX) / scale;
    const ly = (my - centerY) / scale;

    // Hit test
    let found = null;
    for (let b of boards) {
        if (pointInPolygon({ x: lx, y: ly }, b.corners)) {
            found = b;
            break;
        }
    }

    if (found !== hoveredBoard) {
        hoveredBoard = found;
        draw();
        updateBoardDetails(found);
    }
}

function updateBoardDetails(board) {
    if (!board) {
        boardDetailsPanel.classList.add('hidden');
        return;
    }

    boardDetailsPanel.classList.remove('hidden');

    // Width (longest side)
    const width = Math.max(board.w, board.h);
    detailWidth.textContent = width.toFixed(1) + '"';

    // Grain Angle
    detailAngle.textContent = board.grainDeg.toFixed(0) + '°';

    // Classification
    let cls = "Flat Sawn";
    if (board.grainDeg >= 30 && board.grainDeg <= 60) cls = "Rift Sawn";
    if (board.grainDeg > 60) cls = "Quarter Sawn";
    detailClass.textContent = cls;

    // Stability
    let stab = "Low";
    if (cls === "Rift Sawn") stab = "High";
    if (cls === "Quarter Sawn") stab = "Very High";
    detailStability.textContent = stab;
}

function pointInPolygon(p, corners) {
    // Ray casting algorithm
    let inside = false;
    for (let i = 0, j = corners.length - 1; i < corners.length; j = i++) {
        const xi = corners[i].x, yi = corners[i].y;
        const xj = corners[j].x, yj = corners[j].y;

        const intersect = ((yi > p.y) !== (yj > p.y)) &&
            (p.x < (xj - xi) * (p.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

init();
