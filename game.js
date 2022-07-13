var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: { // Precisamos avisar que vamos precisar de física no jogo
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

function preload () // É onde carregamos todas as coisas que vamos utilizar na cena (imagens, sons, etc)
{
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
}

function create () 
// É onde adicionamos os elementos na posição inicial
// A ordem importa. Elementos colocados primeiro irão aparecer por baixo
{
    this.add.image(400, 300, 'sky'); // 400 e 300 são as coordenadas da imagem (centro da tela de 800 e 600)
    // this.add.image(0, 0, 'sky').setOrigin(0, 0) => troca a origem para o conto superior esquerdo

    // ======= Criando as plataformas ========

    platforms = this.physics.add.staticGroup(); // Está criando um grupo (tipo um vetor) de objetos estáticos
    // Obejtos estáticos não são afetados pela gravidade e não possuem velocidade ou aceleração

    platforms.create(400, 568, 'ground').setScale(2).refreshBody(); // o refreshy body é pra avisar que fizemos uma modificação

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // ======= Criando o bonequinho e seus movimentos =======

    player = this.physics.add.sprite(100, 450, 'dude'); // adiciona física ao sprite

    player.setBounce(0.2);
    player.setCollideWorldBounds(true); // N]ao deixa passar da borda do jogo
    //player.body.setGravityY(300)

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}), // cria uma animação
        frameRate: 10,
        repeat: -1
    })

    this.anims.create({
        key: 'turn',
        frames: [{key:'dude', frame: 4}],
        frameRate: 20
    })

    this.anims.create({
        key:'right',
        frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
        frameRate: 10,
        repeat: -1
    })

    this.physics.add.collider(player, platforms); // adiciona contato entre a plataforma e o bonequinho
    
    // ======= Adicionando as teclas de movimento =======

    cursors = this.input.keyboard.createCursorKeys();

    // ======= Adicionando as estrelas =======

    stars = this.physics.add.group({
        key: 'star',
        repeat: 1,
        setXY: { x: 400, y: 300, stepX: 70 }
    });
    
    stars.children.iterate(function (child) { // Percorre o grupo definindo um valor aleatório de bounce para cada um
    
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    
    });

    this.physics.add.collider(stars, platforms); // Adicionando contato entre as estrelas e a plataforma
    this.physics.add.overlap(player, stars, collectStar, null, this); // se tiver colisão entre estrela e bonequinho, 
                                                                      // essa informação é enviada para a função collectStar

    // ======= Adicionando o Score =======

    scoreText = this.add.text(16,16, 'score: 0', {fonteSize: '32px', fill: '#000'});

    // ======= Adicionando as bombas =======

    bombs = this.physics.add.group();

    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

}

function update () // É um loop que atualiza a cena de acordo com as ações realizadas
{
    if(gameOver){
        return;
    }

    // ======= Verifica se alguma tecla foi apertada =======
    if (cursors.left.isDown){
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown){
            player.setVelocityX(160);

            player.anims.play('right', true);
        }
    else{
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down){
        player.setVelocityY(-400);
    }
}

// ======= Funções auxiliares =======

function collectStar (player, star){
    star.disableBody(true, true); // "desliga" a estrela, faz ela sumir

    score += 10;
    scoreText.setText('Score: ' + score);

    if(stars.countActive(true) === 0){
        stars.children.iterate(function(child){
            child.enableBody(true, child.x, 0, true, true);
        })

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
    }
}

function hitBomb(player, bombs){
    this.physics.pause(); // Para a física do jogo
    player.setTint(0xff0000);
    player.anims.play('turn');

    gameOver = true;
}