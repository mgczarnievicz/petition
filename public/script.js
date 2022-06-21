// const canva = $("canva");

const canva = document.getElementById("signature-canva");
const ctx = canva.getContext("2d");

const resetCanvaButton = document.getElementById("button-reset-canva");
const submitButton = document.getElementById("button-submit");

const signatureInput = document.getElementById("signature");

// canva.offsetLeft
const offsetLeft = 0;

let initX = 0;
let initY = 0;

let lastX = 0;
let lastY = 0;
let mouseDown = false;

function drawing(iX, iY, fX, fY) {
    ctx.beginPath();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.moveTo(iX, iY);
    ctx.lineTo(fX, fY);

    ctx.stroke();
    ctx.closePath();
}

function clearCanva() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canva.width, canva.height);
}

canva.addEventListener("mousedown", (event) => {
    console.log("Mouse Down", event);
    initX = event.offsetX - offsetLeft;
    initY = event.offsetY;
    mouseDown = true;
    console.log(`initX ${initX}, initY ${initY}`);
});

canva.addEventListener("mousemove", (event) => {
    if (!mouseDown) {
        return;
    }

    console.log("Mouse Move");

    lastX = event.offsetX - offsetLeft;
    lastY = event.offsetY;

    console.log(`initX ${initX}, initY ${initY}`);
    console.log(`LastX ${lastX}, lastY ${lastY}`);

    drawing(initX, initY, lastX, lastY);

    // The last position is now the new init position.
    initX = lastX;
    initY = lastY;
    console.log(`initX ${initX}, initY ${initY}`);
});

canva.addEventListener("mouseup", (event) => {
    console.log("Mouse Up");

    lastX = event.offsetX - offsetLeft;
    lastY = event.offsetY;

    drawing(initX, initY, lastX, lastY);

    initX = 0;
    initY = 0;

    mouseDown = false;
});

resetCanvaButton.addEventListener("click", (e) => {
    clearCanva();
});

submitButton.addEventListener("click", (e) => {
    const dataURL = canva.toDataURL();
    signatureInput.value = dataURL;
});
