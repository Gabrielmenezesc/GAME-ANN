/**
 * CARDS DATABASE - CATEGORIZED CHALLENGES & QUESTIONS
 * 
 * COMENTÁRIO PARA O GABRIEL:
 * Se você quiser expandir a lista de perguntas ou desafios do casal, basta adicionar novos objetos
 * aos arrays correspondentes no objeto CHALLENGE_CARDS abaixo. Cada objeto deve seguir o padrão:
 * { id: N, question: "Sua pergunta personalizada aqui", penalty: "Consequência caso erre" }
 */

export const CHALLENGE_CARDS = {
    RED: [
        { id: 1, question: "Anny, onde foi o primeiro beijo do casal? Se errar, recue 1 casa!", penalty: "Recue 1 casa" },
        { id: 2, question: "Gabriel, qual é a data exata do aniversário de namoro de vocês? Se errar, recue 1 casa!", penalty: "Recue 1 casa" },
        { id: 3, question: "Quem disse 'Eu te amo' primeiro? Qual foi a reação da outra pessoa?", penalty: "Recue 1 casa" },
        { id: 4, question: "Qual foi o passeio ou viagem mais marcante que fizeram juntos até hoje? Contem os detalhes!", penalty: "Recue 1 casa" },
        { id: 5, question: "Qual é a comida favorita que o seu parceiro ama escolher para pedir no final de semana?", penalty: "Recue 1 casa" },
        { id: 6, question: "Qual peça de roupa seu amor usou no primeiro encontro de vocês? Puxe pela memória!", penalty: "Recue 1 casa" },
        { id: 7, question: "Quem dorme mais fácil assistindo uma série ou filme juntinhos?", penalty: "Recue 1 casa" },
        { id: 8, question: "Qual foi o primeiro presente físico memorável que vocês deram um ao outro?", penalty: "Recue 1 casa" }
    ],
    YELLOW: [
        { id: 1, question: "Faça uma massagem rápida de 1 minuto nas costas ou ombros do seu amor!", penalty: "Não fez: Recue 1 casa" },
        { id: 2, question: "Imite o seu parceiro em uma reação engraçada do dia-a-dia (ex: bravo, com sono ou com fome)!", penalty: "Não fez: Recue 1 casa" },
        { id: 3, question: "Fale 3 qualidades ou trejeitos únicos que fazem você se apaixonar mais pelo outro todos os dias!", penalty: "Ficou sem palavras: Recue 1 casa" },
        { id: 4, question: "Fique de mãos dadas com seu co-piloto até a sua próxima rodada de dados!", penalty: "Soltou: Recue 1 casa" },
        { id: 5, question: "Faça uma declaração de amor super dramática e cômica digna de uma novela clássica!", penalty: "Recue 1 casa" },
        { id: 6, question: "Dê 5 beijinhos carinhosos e estalados nas bochechas do seu parceiro!", penalty: "Não fez: Recue 1 casa" },
        { id: 7, question: "Imite o ruído de um motor de Fórmula 1 acelerando alto nas curvas e termine com um elogio fofo!", penalty: "Recue 1 casa" }
    ],
    BLUE: [
        { id: 1, question: "Cante ou cantarole o refrão de uma canção romântica que lembra intensamente o seu parceiro!", penalty: "Desafinou ou esqueceu: Recue 1 casa" },
        { id: 2, question: "Modo Rádio de Equipe! Faça efeito estático de rádio 'Kshhh' e anuncie: 'Box, Box! Reportando muito amor na curva 3!'", penalty: "Recue 1 casa" },
        { id: 3, question: "Cochiche um segredo romântico ou uma frase fofinha pertinho do ouvido do seu co-piloto!", penalty: "Ficou tímido: Recue 1 casa" },
        { id: 4, question: "Faça uma dancinha engraçada de vitória para celebrar a boa performance de vocês na corrida do amor!", penalty: "Recue 1 casa" },
        { id: 5, question: "Diga 5 apelidos fofos que vocês costumam usar um com o outro em menos de 8 segundos cronometrados!", penalty: "Recue 1 casa" }
    ],
    PURPLE: [ // Asas do DRS / Sonhos conjuntos
        { id: 1, question: "Se vocês pudessem pegar o carro da F1 e viajar amanhã para qualquer lugar do mundo, qual seria o destino?", penalty: "Sem acordo: Recue 1 casa" },
        { id: 2, question: "Qual é o maior objetivo ou sonho que vocês querem realizar lado a lado no próximo ano?", penalty: "Sem DRS: Recue 1 casa" },
        { id: 3, question: "Como você projeta o dia de vocês daqui a exatamente 10 anos? Detalhe uma rotina fofa das manhãs.", penalty: "Recue 1 casa" },
        { id: 4, question: "Se vocês adotassem um pet (cão/gato) no futuro, qual seria o nome mais engraçado que gostariam de dar a ele?", penalty: "Recue 1 casa" },
        { id: 5, question: "Diga uma brincadeira interna ou hábito de vocês dois que você deseja que nunca mude com o passar do tempo.", penalty: "Recue 1 casa" }
    ]
};

export const TILE_TYPES = {
    0: { color: 0xff3344, label: 'História do Casal', icon: 'fa-history', styleClass: 'card-class-red', cat: 'RED' },
    1: { color: 0xffcc00, label: 'Pit Stop (Prenda)', icon: 'fa-tools', styleClass: 'card-class-yellow', cat: 'YELLOW' },
    2: { color: 0x0088ff, label: 'Rádio da Equipe', icon: 'fa-walkie-talkie', styleClass: 'card-class-blue', cat: 'BLUE' },
    3: { color: 0xaf40ff, label: 'Asa Móvel DRS (Futuro)', icon: 'fa-forward-fast', styleClass: 'card-class-purple', cat: 'PURPLE' }
};
