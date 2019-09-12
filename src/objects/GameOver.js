class GameOver {
	constructor(game) {
		this.game = game;
		this.textTimeUp;
		this.floorForTextTimeUp;
		this.textGameOver;
		this.floorForTextGameOver;
		this.yourScoreText;
		this.highestScoreText;
		this.tapToContinueText;

		this._init();
	}


	_init() {
		const TEXT_TIME_UP_MAX_HEIGHT = this.game.world.height / window.devicePixelRatio / 8;

		// TEXT 'TIME UP'
		const textTimeUp = this.textTimeUp = this.game.add.sprite(this.game.world.centerX, 0, 'text-timeup');
		textTimeUp.anchor.setTo(.5, 1);
		textTimeUp.y = 0;
		if (textTimeUp.height > TEXT_TIME_UP_MAX_HEIGHT) {
			const textTimeUpScale = TEXT_TIME_UP_MAX_HEIGHT / textTimeUp.height;
			textTimeUp.scale.setTo(textTimeUpScale);
		}
		// physics
		this.game.physics.arcade.enable(textTimeUp);
		textTimeUp.body.gravity.y = 2000;
		textTimeUp.body.bounce.y = .2;
		textTimeUp.body.allowGravity = false;


		// FLOOR FOR TEXT 'TIME UP'
		const floorForTextTimeUp = this.floorForTextTimeUp = this.game.add.sprite(this.game.world.centerX, this.game.world.height * .75, 'transparent');
		// physics
		this.game.physics.arcade.enable(floorForTextTimeUp);
		floorForTextTimeUp.body.immovable = true;


		// TEXT 'GAME OVER'
		const textGameOver = this.textGameOver = this.game.add.text(this.game.world.centerX, 0, 'GAME OVER');
		textGameOver.font = 'Fredoka One';
		textGameOver.fontSize = this.game.world.height / window.devicePixelRatio / 11;
		textGameOver.fill = '#ff5050';
		textGameOver.align = 'center';
		textGameOver.anchor.setTo(.5, 1);
		textGameOver.stroke = '#fff';
		textGameOver.strokeThickness = this.game.world.height / window.devicePixelRatio * .03;
		textGameOver.setShadow(2, this.game.world.height / window.devicePixelRatio * .01, 'rgba(78, 46, 90, .6)', 2, true, false);
		this.game.physics.arcade.enable(textGameOver);
		textGameOver.body.gravity.y = 2000;
		textGameOver.body.bounce.y = .2;
		textGameOver.body.allowGravity = false;


		// FLOOR FOR TEXT 'GAME OVER'
		const floorForTextGameOver = this.floorForTextGameOver = this.game.add.sprite(this.game.world.centerX, this.game.world.height * .75, 'transparent');
		// physics
		this.game.physics.arcade.enable(floorForTextGameOver);
		floorForTextGameOver.body.immovable = true;


		// EXPORT to Game
		this.game.textTimeUp = this.textTimeUp;
		this.game.floorForTextTimeUp = this.floorForTextTimeUp;
		this.game.textGameOver = this.textGameOver;
		this.game.floorForTextGameOver = this.floorForTextGameOver;
	}


	timeUp() {
		this.game.IS_GAME_OVER = true;
		this._saveHighestScore();
		this.textTimeUp.body.allowGravity = true;
		this.game.Gems.explodeAll();

		this.game.time.events.add(Phaser.Timer.SECOND * 2, () => { 
			this.game.moveDownTextTimeUp = true;
			this.game.TimeBoard.shiftUp();
		});
		this.game.time.events.add(Phaser.Timer.SECOND * 2.1, () => {
			this.game.ScoreBoard.shiftUp();
		});
		this.game.time.events.add(Phaser.Timer.SECOND * 2.2, () => {
			this._showUserScore();
		});
	}


	noTurns() {
		this.game.IS_GAME_OVER = true;
		this._saveHighestScore();
		this.textGameOver.body.allowGravity = true;
		this.game.time.events.add(Phaser.Timer.SECOND, () => { this.game.Gems.explodeAll(); });
		this.game.time.events.add(Phaser.Timer.SECOND * 2, () => {
			this.game.moveDownTextGameOver = true;
			this.game.TimeBoard.shiftUp();
		}, this);
		this.game.time.events.add(Phaser.Timer.SECOND * 2.1, () => {
			this.game.ScoreBoard.shiftUp();
		});
		this.game.time.events.add(Phaser.Timer.SECOND * 2.2, () => {
			this._showUserScore();
		});
	}


	_saveHighestScore() {
		const prevHighestScore = window.localStorage.getItem('highestScore');

		if (!prevHighestScore) {
			window.localStorage.setItem('highestScore', this.game.SCORE);

		} else {
			if (prevHighestScore < this.game.SCORE) {
				window.localStorage.setItem('highestScore', this.game.SCORE);
			}
		}
	}


	_showUserScore() {
		const highestScore = window.localStorage.getItem('highestScore');

		// TEXT 'YOUR SCORE'
		const yourScoreText = this.yourScoreText = this.game.add.text(0, 0, 'YOUR SCORE:  ' + this.game.ScoreBoard._formatScore(this.game.SCORE));
		yourScoreText.font = 'Fredoka One';
		yourScoreText.fontSize = this.game.world.height / window.devicePixelRatio / 11;
		yourScoreText.fill = '#ff5050';
		yourScoreText.align = 'center';
		yourScoreText.anchor.setTo(.5, 1);
		yourScoreText.x = this.game.world.centerX;
		yourScoreText.y = this.game.world.centerY;
		yourScoreText.angle = -.3;
		yourScoreText.alpha = 0;
		yourScoreText.scale.setTo(.4);
		yourScoreText.stroke = '#fff';
		yourScoreText.strokeThickness = this.game.world.height / window.devicePixelRatio * .03;
		yourScoreText.setShadow(2, this.game.world.height / window.devicePixelRatio * .01, 'rgba(78, 46, 90, .6)', 2, true, false);
		// SHOW
		this.game.add.tween(yourScoreText.scale).to({x: 1, y: 1}, 300, Phaser.Easing.Back.Out, true);
		this.game.add.tween(yourScoreText).to({alpha: 1}, 100, Phaser.Easing.Linear.None, true);

		// TEXT 'HIGHEST SCORE'
		const highestScoreText = this.highestScoreText = this.game.add.text(0, 0, 'HIGHEST SCORE:  ' + this.game.ScoreBoard._formatScore(highestScore));
		highestScoreText.font = 'Fredoka One';
		highestScoreText.fontSize = this.game.world.height / window.devicePixelRatio / 11;
		highestScoreText.fill = '#ff5050';
		highestScoreText.align = 'center';
		highestScoreText.anchor.setTo(.5, 0);
		highestScoreText.x = this.game.world.centerX;
		highestScoreText.y = this.game.world.centerY;
		highestScoreText.angle = .4;
		highestScoreText.alpha = 0;
		highestScoreText.scale.setTo(.4);
		highestScoreText.stroke = '#fff';
		highestScoreText.strokeThickness = this.game.world.height / window.devicePixelRatio * .03;
		highestScoreText.setShadow(2, this.game.world.height / window.devicePixelRatio * .01, 'rgba(78, 46, 90, .6)', 2, true, false);
		// SHOW
		this.game.add.tween(highestScoreText.scale).to({x: 1, y: 1}, 300, Phaser.Easing.Back.Out, true);
		this.game.add.tween(highestScoreText).to({alpha: 1}, 100, Phaser.Easing.Linear.None, true);

		// TEXT 'TAP TO CONTINUE'
		const tapToContinueText = this.tapToContinueText = this.game.add.text(0, 0, 'Tap to continue...');
		tapToContinueText.font = 'Fredoka One';
		tapToContinueText.fontSize = this.game.world.height / window.devicePixelRatio / 15;
		tapToContinueText.fill = '#fff';
		tapToContinueText.align = 'center';
		tapToContinueText.alpha = 0;
		tapToContinueText.anchor.setTo(.5, 1);
		tapToContinueText.x = this.game.world.centerX;
		tapToContinueText.y = this.game.world.height - tapToContinueText.height;
		tapToContinueText.setShadow(2, tapToContinueText.height * .04, 'rgba(78, 46, 90, .6)', tapToContinueText.height * .01);

		this.game.time.events.loop(Phaser.Timer.SECOND, () => { this._blinkText(); });
		this.game.time.events.add(Phaser.Timer.SECOND, () => { this._allowTap(); });
	}


	_blinkText() {
		if (this.tapToContinueText.alpha === 0) {
			this.tapToContinueText.alpha = 1;
		} else {
			this.tapToContinueText.alpha = 0;
		}
	}


	_allowTap() {
		this.game.input.onTap.add(() => {
			this.game.input.onTap.removeAll();
			this._rollDonut();
		});
	}


	_rollDonut() {
		this.game.world.swap(this.game.bigDonut, this.yourScoreText);
		this.game.world.swap(this.game.donutShadow, this.yourScoreText);
		this.game.world.swap(this.game.bigDonut, this.highestScoreText);
		this.game.world.swap(this.game.donutShadow, this.highestScoreText);
		this.game.world.swap(this.game.bigDonut, this.tapToContinueText);
		this.game.world.swap(this.game.donutShadow, this.tapToContinueText);
		this.game.rollDonut = true;
	}


	kill() {
		this.textTimeUp.kill();
		this.floorForTextTimeUp.kill();
		this.textGameOver.kill();
		this.floorForTextGameOver.kill();
		this.yourScoreText.kill();
		this.highestScoreText.kill();
		this.tapToContinueText.kill();
	}
}

export default GameOver;