class ArrayList extends Array {
    constructor() {
        super();
    }

    size() {
        return this.length;
    }

    add(x) {
        this.push(x);
    }

    get(i) {
        return this[i];
    }

    remove(i) {
        this.splice(i, 1);
    }
}

console.log("got here");

let f;
let baseColor;
let nemoci = new ArrayList();
let antigeny = new ArrayList();
let buttons = new ArrayList();
let frameLock = 0;
let attract = false;
let drawLines = false;
let clicker = false;
let draggable = false;
let randomSize = 0.5;
let dragTargetFound = false;

function setup() {
    createCanvas(1880, 980);
    let antigensData = [
        { x: 100, y: 100, size: 80, color: color(120, 120, 120), highlight: color(160, 255, 0), name: "AChR" },
        { x: 100, y: 200, size: 80, color: color(120, 120, 120), highlight: color(160, 255, 0), name: "MuSK" },
        { x: 100, y: 300, size: 80, color: color(120, 120, 120), highlight: color(160, 255, 0), name: "Titin" },
        { x: 100, y: 400, size: 80, color: color(120, 120, 120), highlight: color(160, 255, 0), name: "GAD65" },
        { x: 100, y: 500, size: 80, color: color(120, 120, 120), highlight: color(160, 255, 0), name: "CV2" },
        { x: 200, y: 100, size: 80, color: color(120, 120, 120), highlight: color(160, 255, 0), name: "Hu" },
        { x: 200, y: 200, size: 80, color: color(120, 120, 120), highlight: color(160, 255, 0), name: "Yo" },
        { x: 200, y: 300, size: 80, color: color(120, 120, 120), highlight: color(160, 255, 0), name: "Ri" },
        { x: 200, y: 400, size: 80, color: color(120, 120, 120), highlight: color(160, 255, 0), name: "Tr" },
        { x: 200, y: 500, size: 80, color: color(120, 120, 120), highlight: color(160, 255, 0), name: "ZlC4" },
        { x: 300, y: 100, size: 80, color: color(180, 180, 180), highlight: color(160, 255, 0), name: "LPL4" },
        { x: 300, y: 200, size: 80, color: color(120, 120, 120), highlight: color(160, 255, 0), name: "MA2" },
        { x: 300, y: 300, size: 80, color: color(120, 120, 120), highlight: color(160, 255, 0), name: "AQP4" },
        { x: 300, y: 400, size: 80, color: color(120, 120, 120), highlight: color(160, 255, 0), name: "NMDAR" },
        { x: 300, y: 500, size: 80, color: color(120, 120, 120), highlight: color(160, 255, 0), name: "LGl1" },
        { x: 400, y: 100, size: 80, color: color(120, 120, 120), highlight: color(160, 255, 0), name: "Caspr2" },
        { x: 400, y: 200, size: 80, color: color(120, 120, 120), highlight: color(160, 255, 0), name: "Recoverin" },
        { x: 1000, y: 100, size: 80, color: color(120, 120, 120), highlight: color(160, 255, 0), name: "SOX1" },
        { x: 1000, y: 200, size: 80, color: color(120, 120, 120), highlight: color(160, 255, 0), name: "Amphiphysin" },
        { x: 1000, y: 300, size: 80, color: color(120, 120, 120), highlight: color(160, 255, 0), name: "MA1" },
        { x: 1000, y: 400, size: 80, color: color(180, 180, 180), highlight: color(160, 255, 0), name: "MOG" },
        { x: 1000, y: 500, size: 80, color: color(180, 180, 180), highlight: color(160, 255, 0), name: "MAG" }
    ];

    for (let data of antigensData) {
        antigeny.add(new Antigen(data.x, data.y, data.size, data.color, data.highlight, data.name));
    }

    let buttonData = [
        { x: 1700, y: 100, size: 100, color: color(0, 255, 0), highlight: color(255, 0, 0), label: "Draw Lines", type: DrawLinesButton },
        { x: 1700, y: 250, size: 100, color: color(0, 255, 0), highlight: color(255, 0, 0), label: "Small Circle", type: SmallCircleButton },
        { x: 1700, y: 400, size: 100, color: color(0, 255, 0), highlight: color(255, 0, 0), label: "Random +", type: RandomPlusButton },
        { x: 1700, y: 550, size: 100, color: color(0, 255, 0), highlight: color(255, 0, 0), label: "Random -", type: RandomMinusButton },
        { x: 1700, y: 700, size: 100, color: color(0, 255, 0), highlight: color(255, 0, 0), label: "Drag", type: DraggableButton }
    ];

    for (let data of buttonData) {
        buttons.add(new data.type(data.x, data.y, data.size, data.color, data.highlight, data.label));
    }

    f = loadFont('https://fonts.gstatic.com/s/robotomono/v13/L0x5DF4xlVMF-BfR8bXMIjE6kLo.woff2');
    baseColor = color(255, 0, 0);
    loadNemoci();
}

function draw() {
    background(baseColor);
    for (let antigen of antigeny) {
        antigen.display();
    }
    for (let button of buttons) {
        button.display();
    }
    dragAndDrop();
}

class Antigen {
    constructor(
        iniCircleX,
        iniCircleY,
        iniCircleSize,
        iniCircleColor,
        iniCircleHighlight,
        iniCircleName
    ) {
        this.circleX = iniCircleX;
        this.circleY = iniCircleY;
        this.circleSize = iniCircleSize;
        this.circleColor = iniCircleColor;
        this.circleBasic = iniCircleColor;
        this.circleHighlight = iniCircleHighlight;
        this.circleName = iniCircleName;
        this.foundPartners = [];
        this.partnerX = 0;
        this.partnerY = 0;
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.xFactor = 0;
        this.xVector = 0;
        this.yVector = 0;
        this.textOffset = 0;
        this.setForDrag = false;
    }

    display() {
        fill(this.circleColor);
        stroke(0);
        ellipse(this.circleX, this.circleY, this.circleSize, this.circleSize);
        textFont(f);
        fill(255, 80);
        textAlign(CENTER);
        text(
            this.circleName,
            this.circleX + 1 + this.textOffset,
            this.circleY + 1 - this.textOffset / 2
        );
        fill(0, 255);
        text(
            this.circleName,
            this.circleX + this.textOffset,
            this.circleY - this.textOffset / 2
        );
    }

    overCircle(x, y, diameter) {
        let disX = x - mouseX;
        let disY = y - mouseY;
        return sqrt(sq(disX) + sq(disY)) < diameter / 2;
    }
}

class Button {
    constructor(x, y, size, color, highlight, label) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.highlight = highlight;
        this.label = label;
    }

    display() {
        fill(this.color);
        if (this.isMouseOver()) {
            fill(this.highlight);
        }
        stroke(0);
        ellipse(this.x, this.y, this.size, this.size);
        fill(255);
        textAlign(CENTER, CENTER);
        text(this.label, this.x, this.y);
    }

    isMouseOver() {
        let d = dist(mouseX, mouseY, this.x, this.y);
        return d < this.size / 2;
    }

    handleClick() {
        // To be implemented in subclasses
    }
}

class DrawLinesButton extends Button {
    handleClick() {
        drawLines = !drawLines;
    }
}

class SmallCircleButton extends Button {
    handleClick() {
        randomSize = 0.3;
    }
}

class RandomPlusButton extends Button {
    handleClick() {
        randomSize += 0.1;
    }
}

class RandomMinusButton extends Button {
    handleClick() {
        randomSize = max(0.1, randomSize - 0.1);
    }
}

class DraggableButton extends Button {
    handleClick() {
        draggable = !draggable;
    }
}

function loadNemoci() {
    loadStrings('nemoci.txt', processNemoci);
}

function processNemoci(lines) {
    for (let line of lines) {
        let parts = line.split(';');
        if (parts.length >= 6) {
            let [n, x, y, size, color, highlight, name] = parts;
            antigeny.add(new Antigen(
                parseFloat(x),
                parseFloat(y),
                parseFloat(size),
                colorFromString(color),
                colorFromString(highlight),
                name.trim()
            ));
        }
    }
}

function colorFromString(str) {
    let parts = str.split(',');
  console.log(parts)
    return color(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
}

function dragAndDrop() {
    if (mouseIsPressed && !dragTargetFound) {
        for (let an of antigeny) {
            if (an.overCircle(an.circleX, an.circleY, an.circleSize)) {
                an.setForDrag = true;
                dragTargetFound = true;
                break;
            }
        }
    }

    if (mouseIsPressed && dragTargetFound) {
        for (let an of antigeny) {
            if (an.setForDrag) {
                an.circleX = mouseX;
                an.circleY = mouseY;
            }
        }
    }

    if (!mouseIsPressed) {
        for (let an of antigeny) {
            an.setForDrag = false;
        }
        dragTargetFound = false;
    }
}
