class ScoreBoard {
	constructor(game) {
		this.game = game;
		this.scoreBoard;
		this.floorForScoreBoard;
		this.scoreText;

		this._init();
	}

	_init() {
		const SCORE_BOARD_MAX_HEIGHT = this.game.world.height / window.devicePixelRatio / 7;
		const SCORE_BOARD_MARGIN_TOP = .05; // relatively to its height

		// SCORE BOARD
		const scoreBoard = this.scoreBoard = this.game.add.sprite(this.game.world.centerX, 0, 'score-board');

		if (scoreBoard.height > SCORE_BOARD_MAX_HEIGHT) {
			const scoreBoardScale = SCORE_BOARD_MAX_HEIGHT / scoreBoard.height;
			scoreBoard.scale.setTo(scoreBoardScale);
		}

		scoreBoard.anchor.setTo(.5);
		scoreBoard.bottom = 0;
		// physics
		this.game.physics.arcade.enable(scoreBoard);
		scoreBoard.body.gravity.y = 2000;
		scoreBoard.body.bounce.y = .2;
		scoreBoard.angle = -.5;
		scoreBoard.body.allowGravity = false;


		// FLOOR FOR SCORE BOARD
		const floorForScoreBoard = this.floorForScoreBoard = this.game.add.sprite(this.game.world.centerX,
			scoreBoard.height + scoreBoard.height * SCORE_BOARD_MARGIN_TOP,
			'transparent');
		// physics
		this.game.physics.arcade.enable(floorForScoreBoard);
		floorForScoreBoard.body.immovable = true;


		// SCORE TEXT
		const scoreText = this.scoreText = this.game.add.text(
			0, 0, '0');
		scoreText.font = 'Fredoka One';
		scoreText.fontSize = scoreBoard.height / 7 * 4 * window.devicePixelRatio;
		scoreText.fill = '#fff';
		scoreText.align = 'center';
		scoreText.anchor.setTo(.5);
		scoreBoard.addChild(scoreText);


		// EXPORT to Game
		this.game.scoreBoard = this.scoreBoard;
		this.game.floorForScoreBoard = this.floorForScoreBoard;
		this.game.scoreText = this.scoreText;
	}


	open() {
		this.scoreBoard.body.allowGravity = true;
	}


	updateScore(numberToAdd) {
		const curScore = this.game.SCORE,
			  newScore = curScore + numberToAdd,
			  distance = newScore - curScore,
			  DURATION = 200; // duration of animation

		const startTime = performance.now();
		let progress = 0, newNumber;

		const animate = curTime => {
			progress = (curTime - startTime) / DURATION;
			if (progress > 1) progress = 1;

			newNumber = Math.ceil(distance * progress);

			this.scoreText.text = this._formatScore(curScore + newNumber);

			if (progress < 1) {
				requestAnimationFrame(animate);
			}
		}

		requestAnimationFrame(animate);

		this.game.SCORE += numberToAdd;
	}


	shiftUp() {
		this.scoreBoard.body.allowGravity = false;
		this.game.shiftUpScoreBoard = true;
	}


	_formatScore(number) {
		// Rule of formatting: 25,234
		if (number < 1000) return number;

		const reverse = number.toString().split('').reverse().join('');
		const withCommas = reverse.match(/\d{1,3}/g).join(',');
		const result = withCommas.split('').reverse().join('');
		
		return result;
	}


	kill() {
		this.scoreBoard.kill();
		this.floorForScoreBoard.kill();
		this.scoreText.kill();
	}
}

export default ScoreBoard;