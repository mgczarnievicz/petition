// const canva = $("canva");

const canva = document.getElementById("signature-canva");
const ctx = canva.getContext("2d");

let initX = 0;
let initY = 0;

let lastX = 0;
let lastY = 0;
let mouseDown = false;

ctx.strokeStyle = "#000000";
ctx.lineWidth = 2;

canva.addEventListener("mousedown", (event) => {
    console.log("Mouse Down", event);
    initX = event.pageX;
    initY = event.pageY;
    mouseDown = true;
    console.log(`initX ${initX}, initY ${initY}`);
});

canva.addEventListener("mousemove", (event) => {
    if (!mouseDown) {
        return;
    }

    console.log("Mouse Move");

    lastX = event.pageX;
    lastY = event.pageX;

    console.log(`LastX ${lastX}, lastY ${lastY}`);
    ctx.beginPath();
    ctx.moveTo(initX, initY);
    ctx.lineTo(initX, lastX);
    ctx.lineTo(initY, lastY);

    ctx.stroke();
    ctx.closePath();
    // The last position is now the new init position.
    initX = lastX;
    initY = lastY;
    console.log(`initX ${initX}, initY ${initY}`);
});

canva.addEventListener("mouseup", (event) => {
    console.log("Mouse Up");
    mouseDown = false;
});
