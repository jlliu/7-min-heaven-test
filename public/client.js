// uncomment the line below and put your socket events in here
let socket = io();
console.log(socket);

//example event listener
// socket.on('newMsgFromServer', function(data){
// 	  do something with data
// })

let doorButton = document.querySelector("#doorButton");
let door = document.querySelector(".door");
let heavenDiv = document.querySelector(".heaven");
let entered = false;
let othercursor = document.querySelector(".othercursor");

let body = document.querySelector("body");

let heavenMessage = document.querySelector(".message");
let timer = document.querySelector("#timer");

doorButton.addEventListener("click", function () {
  //decide to enter
  socket.emit("attemptEnter");
});

socket.on("connected", (count) => {
  body.style.display = "block";

  body.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 4000,
    iterations: 1,
    fill: "forwards",
  });
  window.setTimeout(function () {
    body.style.pointerEvents = "all";
  }, 3000);
});

socket.on("enterAccepted", (count) => {
  heavenDiv.style.opacity = 1;
  heavenDiv.style.pointerEvents = "all";
  heavenDiv.style.visibility = "visible";
  entered = true;
});

let timerStarted = false;
let interval;

// let maxTime = 420000;
let maxTime = 10000;

function msToTime(duration) {
  var seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60);

  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return minutes + ":" + seconds;
}

// update UI based on current count
socket.on("count", (count) => {
  console.log("receiving count: " + count);
  //update UI of heaven
  if (entered) {
    if (count >= 2) {
      othercursor.style.display = "block";
      heavenMessage.innerHTML = "someone is here with you";
      if (!timerStarted) {
        timerStarted = true;
        let startTime = new Date().getTime();
        interval = setInterval(function () {
          let newTime = new Date().getTime();
          // calculate 7 minutes minus difference
          let time = maxTime - (newTime - startTime);
          if (time <= 0) {
            //Kick everyone out!
            socket.emit("timeOver");
            timerStarted = false;
            clearInterval(interval);
            entered = false;
            console.log("entered is false");
          }
          timer.innerHTML = msToTime(time);
        }, 50);
      }
    } else {
      othercursor.style.display = "none";
      heavenMessage.innerHTML = "no one else is here yet";
      timer.innerHTML = "7:00";
      timerStarted = false;
      clearInterval(interval);
    }
  } else {
    othercursor.style.display = "none";
    heavenDiv.style.opacity = 0;
    heavenDiv.style.pointerEvents = "none";
    heavenDiv.style.visibility = "hidden";
    // update UI of waiting room
    if (count >= 2) {
      door.src =
        "https://cdn.glitch.global/b817d0f1-eb72-49b6-a5d0-8455c5e5bf21/door-close.png?v=1710370277153";
      doorButton.innerHTML = "heaven is occupied";
      doorButton.setAttribute("disabled", true);
    } else {
      door.src =
        "https://cdn.glitch.global/b817d0f1-eb72-49b6-a5d0-8455c5e5bf21/door-open.png?v=1710370277313";
      doorButton.innerHTML = "enter heaven";
      doorButton.removeAttribute("disabled");
    }
  }
});

socket.on("othermove", (data) => {
  othercursor.style.left = `${data.x}px`;
  othercursor.style.top = `${data.y}px`;
});

document.addEventListener("mousemove", function (e) {
  if (entered) {
    let x = e.clientX;
    let y = e.clientY;
    socket.emit("mousemove", { x: x, y: y });
  }
});

// setup clouds
for (var i = 0; i < 8; i++) {
  let cloud = document.createElement("img");
  cloud.src =
    "https://cdn.glitch.global/b817d0f1-eb72-49b6-a5d0-8455c5e5bf21/cloud.png?v=1712885202739";
  cloud.classList.add("cloud");
  cloud.style.left = "0px";
  if (i == 7) {
    // cloud.style.background = "blue";
    cloud.style.top = `${window.innerHeight / 2 - 40}px`;
  } else {
    cloud.style.top = `${-50 + Math.random() * (window.innerHeight + 100)}px`;
  }
  // cloud.style.animationDelay = `${-Math.random()*6}s`;
  // cloud.style.animationDuration = `${7+Math.random()*5}s`;
  cloud.animate(
    [
      // keyframes
      { transform: `translateX(-300px)` },
      { transform: `translateX(calc(100vw + 150px))` },
      // { transform: `translateX(${window.innerWidth+300}px)` },
    ],
    {
      // timing options
      duration: 40000 + Math.random() * 40000,
      // duration: `${7000+Math.random()*5000}`,
      delay: -Math.random() * 60000,
      iterations: Infinity,
    }
  );
  heavenDiv.appendChild(cloud);
}
