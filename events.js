 


import {
  cameraParaPlaneta,
  carregarDadosPlaneta,
  arredondado,
  getOrbitNode,
  calcularOrbita
} from './functions.js';

import {
  infoMundo,
  infoCamera,
  posicoesMercury,
  posicoesVenus,
  posicoesEarth,
  posicoesMars,
  posicoesJupiter,
  posicoesSaturn,
  posicoesMoon
} from './script.js';


let movendoParaFrente = false;
let movendoParaEsquerda = false;
let movendoParaDireita = false;
let movendoParaTras = false;
let movendoParaCima = false;
let movendoParaBaixo = false;


// de princípio estava atualizando os booleanos do 
// keydown repetidas vezes. Por questão de desempenho,
// adicionei o objeto teclasAtivas para controlar se
// a tecla já está ativa ou não.

let teclasAtivas = {};

window.addEventListener("keydown", function(event) {
  if (!teclasAtivas[event.key]) {
    switch (event.key) {
      case "w":
        movendoParaFrente = true;
        break;
      case "a":
        movendoParaEsquerda = true;
        break;
      case "s":
        movendoParaTras = true;
        break;
      case "d":
        movendoParaDireita = true;
        break;
      case " ":
        movendoParaCima = true;
        break;
      case "Shift":
        movendoParaBaixo = true;
        break;

      case "z":
        if (infoCamera.proximoPlaneta === 0) {
          infoCamera.proximoPlaneta = 7;
        }
        else {
          infoCamera.proximoPlaneta--;
        }

        if (!infoCamera.cameraSolta) {
          cameraParaPlaneta();
        }
        break;
      
      case "x":
        if (infoCamera.proximoPlaneta === 7) {
          infoCamera.proximoPlaneta = 0;
        }
        else {
          infoCamera.proximoPlaneta++;
        }

        if (!infoCamera.cameraSolta) {
          cameraParaPlaneta();
        }
        break;

      case "c":
        console.log("Apertou C!")
        console.log(infoCamera.cameraSolta);
        infoCamera.cameraSolta = (!infoCamera.cameraSolta);
        console.log(infoCamera.cameraSolta);
        break;
    }

    teclasAtivas[event.key] = true; // Marca a tecla como ativa
  }
});

window.addEventListener("keyup", function(event) {
  switch (event.key) {
    case "w":
      movendoParaFrente = false;
      break;
    case "a":
      movendoParaEsquerda = false;
      break;
    case "s":
      movendoParaTras = false;
      break;
    case "d":
      movendoParaDireita = false;
      break;
    case " ":
      movendoParaCima = false;
      break;
    case "Shift":
      movendoParaBaixo = false;
      break;
  }

  teclasAtivas[event.key] = false; 
});

window.addEventListener("wheel", function(event) {

  // verifica se a tecla é o control
  if (event.deltaY < 0) {
    infoCamera.velocidade++;
  }

  else if (infoCamera.velocidade > 0) {
    infoCamera.velocidade--;
  }
});



let arrastandoMouse = false;
let ultimoX = 0;
let ultimoY = 0;

canvas.addEventListener("mousedown", function(event) {
  if (event.button === 0) {
    arrastandoMouse = true;
    ultimoX = event.clientX;
    ultimoY = event.clientY;
  }
});

window.addEventListener("mouseup", function() {
  arrastandoMouse = false;
});

var yawGraus = 180; // ângulo horizontal
var pitchGraus = 0; // ângulo vertical

canvas.addEventListener("mousemove", function(event) {
  if (!arrastandoMouse) return;

  const deltaX = event.clientX - ultimoX;
  const deltaY = event.clientY - ultimoY;

  const sensibilidade = 0.2; // pode ajustar

  // Apenas atualiza os ângulos, não mexe na câmera aqui!
  yawGraus += deltaX * sensibilidade;
  pitchGraus += -deltaY * sensibilidade;

  // Limita a rotação vertical (pitch)
  pitchGraus = Math.max(-89, Math.min(89, pitchGraus));

  ultimoX = event.clientX;
  ultimoY = event.clientY;
});



// Loop de movimentação contínua
setInterval(function() {

  var cameraSolta = infoCamera.cameraSolta;

  if (!cameraSolta) {
    cameraParaPlaneta();
  }
  else {

    if (movendoParaFrente) {
      infoCamera.x += infoCamera.lookDir[0] * (10 * infoCamera.velocidade);
      infoCamera.y += infoCamera.lookDir[1] * (10 * infoCamera.velocidade);
      infoCamera.z += infoCamera.lookDir[2] * (10 * infoCamera.velocidade);
    }

    if (movendoParaEsquerda) {
      infoCamera.x -= infoCamera.leftDir[0] * (10 * infoCamera.velocidade);
      infoCamera.y -= infoCamera.leftDir[1] * (10 * infoCamera.velocidade);
      infoCamera.z -= infoCamera.leftDir[2] * (10 * infoCamera.velocidade);
    }

    if (movendoParaDireita) {
      infoCamera.x += infoCamera.leftDir[0] * (10 * infoCamera.velocidade);
      infoCamera.y += infoCamera.leftDir[1] * (10 * infoCamera.velocidade);
      infoCamera.z += infoCamera.leftDir[2] * (10 * infoCamera.velocidade);
    }

    if (movendoParaTras) {
      infoCamera.x -= infoCamera.lookDir[0] * (10 * infoCamera.velocidade);
      infoCamera.y -= infoCamera.lookDir[1] * (10 * infoCamera.velocidade);
      infoCamera.z -= infoCamera.lookDir[2] * (10 * infoCamera.velocidade);
    }

    if (movendoParaCima) {
      infoCamera.x += infoCamera.upDir[0] * (10 * infoCamera.velocidade);
      infoCamera.y += infoCamera.upDir[1] * (10 * infoCamera.velocidade);
      infoCamera.z += infoCamera.upDir[2] * (10 * infoCamera.velocidade);
    }

    if (movendoParaBaixo) {
      infoCamera.x -= infoCamera.upDir[0] * (10 * infoCamera.velocidade);
      infoCamera.y -= infoCamera.upDir[1] * (10 * infoCamera.velocidade);
      infoCamera.z -= infoCamera.upDir[2] * (10 * infoCamera.velocidade);
    }
  }


  if (arrastandoMouse) {

      // Atualiza ângulos em radianos
    const grausParaRadianos = g => g * Math.PI / 180;
    infoCamera.yaw = grausParaRadianos(yawGraus);
    infoCamera.pitch = grausParaRadianos(pitchGraus);

    const cosPitch = Math.cos(infoCamera.pitch);
    const sinPitch = Math.sin(infoCamera.pitch);
    const cosYaw = Math.cos(infoCamera.yaw);
    const sinYaw = Math.sin(infoCamera.yaw);


    infoCamera.lookDir = [
      arredondado(cosPitch * cosYaw),
      arredondado(sinPitch),
      arredondado(cosPitch * sinYaw)
    ];


    infoCamera.leftDir = [
      arredondado(-sinYaw),
      arredondado(0),
      arredondado(cosYaw)
    ];

    infoCamera.upDir = [
      infoCamera.leftDir[1] * infoCamera.lookDir[2] - infoCamera.leftDir[2] * infoCamera.lookDir[1],
      infoCamera.leftDir[2] * infoCamera.lookDir[0] - infoCamera.leftDir[0] * infoCamera.lookDir[2],
      infoCamera.leftDir[0] * infoCamera.lookDir[1] - infoCamera.leftDir[1] * infoCamera.lookDir[0]
    ];
  }


  if (infoMundo.tempoPercorrido > infoMundo.tempoMax) {
    infoMundo.tempoPercorrido = 0;
    console.log("Resetando o tempo!!");
  }
  else {
    infoMundo.tempoPercorrido += 1;
  }


  // ------ DEBUGGING -------- \\

  if (!infoCamera.cameraSolta) {
    console.log("Seguindo o planeta ", infoCamera.proximoPlaneta);
  }

}, 18); // 1000ms é 1 segundo
        // 1000 / 20 = 66.6 FPS
