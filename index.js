let baralho = [];
let maoJogador = [];
let maoDealer = [];
let pontuacaoJogador = 0;
let pontuacaoDealer = 0;
let dinheiro = 500;
let aposta = 0;
let apostaDobrada = false;
let jogoEmAndamento = false;

function criarBaralho() {
    const naipes = ['Copas', 'Ouros', 'Paus', 'Espadas'];
    const valores = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    for (let naipe of naipes) {
        for (let valor of valores) {
            baralho.push({ naipe, valor, imagem: `img/${valor}_of_${naipe}.png`, virada: false });
        }
    }
}

function embaralharBaralho() {
    baralho = baralho.sort(() => Math.random() - 0.5);
}

function limparMesa() {
    document.getElementById('player-hand').innerHTML = '';
    document.getElementById('dealer-hand').innerHTML = '';
}

function iniciarJogo() {
    if (aposta > 0 && !jogoEmAndamento) {
        jogoEmAndamento = true;
        maoJogador = [];
        maoDealer = [];
        pontuacaoJogador = 0;
        pontuacaoDealer = 0;

        limparMesa(); 
       
        criarBaralho();
        embaralharBaralho();
       
        maoDealer.push(receberCarta(true));
        maoJogador.push(receberCarta());
        maoDealer.push(receberCarta());
        maoJogador.push(receberCarta());
       
        atualizarTela();
    } else if (jogoEmAndamento) {
        alert("O jogo já está em andamento. Termine a rodada atual antes de iniciar uma nova.");
    } else {
        alert("Faça uma aposta antes de iniciar o jogo.");
    }
}

function receberCarta(virada = false) {
    const carta = baralho.pop();
    carta.virada = virada;
    return carta;
}

function atualizarTela() {
    document.getElementById('player-hand').innerHTML = exibirMao(maoJogador);
    document.getElementById('dealer-hand').innerHTML = exibirMao(maoDealer);
    document.getElementById('resultado').innerText = `Jogador: ${calcularPontuacao(maoJogador)} | Dealer: ${calcularPontuacao(maoDealer)}`;
    document.getElementById('aposta').value = aposta;
    document.getElementById('bet').innerText = dinheiro;
}

function exibirMao(mao) {
    return mao.map(carta => `<img src="${carta.virada ? './img/carta.png' : carta.imagem}" alt="${carta.valor} de ${carta.naipe}" class="card">`).join('');
}

function calcularPontuacao(mao) {
    let pontuacao = 0;
    let quantidadeAces = 0;

    for (let carta of mao) {
        if (!carta.virada) {
            if (carta.valor === 'A') {
                quantidadeAces++;
                pontuacao += 11;
            } else if (['K', 'Q', 'J'].includes(carta.valor)) {
                pontuacao += 10;
            } else {
                pontuacao += parseInt(carta.valor);
            }
        }
    }

    while (quantidadeAces > 0 && pontuacao > 21) {
        pontuacao -= 10;
        quantidadeAces--;
    }

    return pontuacao;
}

function pedirCarta() {
    if (jogoEmAndamento) {
        maoJogador.push(receberCarta());
        atualizarTela();

        if (calcularPontuacao(maoJogador) > 21) {
            finalizarJogo();
        }
    }
}

function manterCartas() {
    if (jogoEmAndamento) {
        while (calcularPontuacao(maoDealer) < 17 && pontuacaoDealer <= 21) {
            maoDealer.push(receberCarta());
        }

        verificarResultado();
    }
}

function dobrarAposta() {
    if (jogoEmAndamento && !apostaDobrada) {
        const apostaOriginal = aposta;

        if (dinheiro >= apostaOriginal) {
            aposta *= 2;
            dinheiro -= apostaOriginal;
            apostaDobrada = true;

            maoJogador.push(receberCarta());
            atualizarTela();

            if (calcularPontuacao(maoJogador) > 21) {
                finalizarJogo();
            }
        } else {
            alert("Saldo insuficiente para dobrar a aposta.");
        }
    } else if (apostaDobrada) {
        alert("Você já dobrou a aposta. Aguarde o fim do jogo.");
    } else {
        alert("Aposta inválida para dobrar.");
    }
}

function verificarResultado() {
    let mensagemResultado = '';

    while (calcularPontuacao(maoDealer) < 17) {
        maoDealer.push(receberCarta());
    }

    atualizarTela();

    if (calcularPontuacao(maoJogador) > 21) {
        mensagemResultado = 'Jogador Estourou! Dealer Vence.';
    } else if (calcularPontuacao(maoDealer) > 21) {
        const ganho = aposta * 2;
        dinheiro += ganho;
        mensagemResultado = `Jogador Vence! Ganhou ${ganho} fichas.`;
    } else if (calcularPontuacao(maoDealer) > calcularPontuacao(maoJogador) && calcularPontuacao(maoDealer) <= 21) {
        mensagemResultado = `Dealer Vence. Perdeu ${aposta} fichas.`;
    } else if (calcularPontuacao(maoJogador) === calcularPontuacao(maoDealer)) {
        dinheiro += aposta;
        mensagemResultado = `É um Empate! Recupere ${aposta} fichas.`;
    } else {
        const ganho = aposta * 2;
        dinheiro += ganho;
        mensagemResultado = `Jogador Vence! Ganhou ${ganho} fichas.`;
    }

    aposta = 0;
    apostaDobrada = false;
    document.getElementById('aposta').value = aposta;
    document.getElementById('bet').innerText = dinheiro;
    document.getElementById('resultado').innerText = mensagemResultado;
    document.getElementById('aposta').disabled = false; 
    jogoEmAndamento = false;

    revelarCartaReal();
}

function adicionarFicha(valor) {
    if (jogoEmAndamento) {
        alert("Aguarde o final do jogo para fazer uma nova aposta.");
        return;
    }

    if (apostaDobrada) {
        alert("Você já dobrou a aposta. Aguarde o fim do jogo.");
        return;
    }

    if (valor > dinheiro) {
        alert("Saldo insuficiente para adicionar essa ficha.");
        return;
    }

    aposta += valor;
    dinheiro -= valor;
    atualizarTela();
    revelarCartaHidden();
    limparMesa();
}

function revelarCartaHidden() {
    maoDealer[0].virada = false;
    atualizarTela();
}


criarBaralho();
