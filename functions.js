


async function carregarDadosPlaneta(nomeArquivo) {
  try {
    const resposta = await fetch(nomeArquivo);
    const texto = await resposta.text();
    const linhas = texto.trim().split("\n");

    const planeta = {
      diametro: parseFloat(linhas[0]),          // km
      periodoRotacao: parseFloat(linhas[1]),    // horas
      distanciaSol: parseFloat(linhas[2]),      // x * 10^6 km
      periodoOrbital: parseFloat(linhas[3]),    // dias
      velocidadeOrbital: parseFloat(linhas[4]), // km/s
      inclinacaoOrbital: parseFloat(linhas[5]), // graus
      obliquidadeOrbital: parseFloat(linhas[6]) // graus
    };

    console.log("Dados de:", nomeArquivo);
    console.log(planeta);
    return planeta;

  } catch (erro) {
    console.error("Erro ao carregar o arquivo:", erro);
  }
}


// isso aqui é uma gambiarra... no momento que eu clicava no canvas,
// estava mexendo no valor do lookDir. Depois de muito investigar,
// cheguei nessa gambiarra, que parece não trazer problemas pro código.
function arredondado(valor) {
  const fator = Math.pow(10, 6);
  return Math.round(valor * fator) / fator;
}


// essa função é utilizada pra aplicar as translações de forma dinâmica.
function getOrbitNode(planeta) {
  
  const dias = infoMundo.tempoPercorrido;
  const ciclo = planeta.periodoOrbital;
  const inclinacao = planeta.inclinacaoOrbital;

  const fracaoOrbital = (dias % ciclo) / ciclo;
  const anguloOrbital = fracaoOrbital * 2 * Math.PI;       // radianos
  const amplitudeY = Math.sin(inclinacao * Math.PI / 180);

  var raio = planeta.distanciaSol;   // x * 10^6 km
  raio = raio * 100000;              // km
  raio = raio * infoMundo.escala;

  // posições do planeta ao redor do sol
  var x = Math.cos(anguloOrbital) * raio;
  var y = Math.sin(anguloOrbital * 2) * amplitudeY * raio;
  var z = Math.sin(anguloOrbital) * raio;

  return { x, y, z }
}
