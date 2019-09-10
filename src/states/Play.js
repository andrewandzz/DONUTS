import Matrix from '../objects/Matrix';
import Gems from '../objects/Gems';
import Hand from '../objects/Hand';
import Hint from '../objects/Hint';
import PopupText from '../objects/PopupText';

class Play extends Phaser.State {
	create() {
		const SIDE_MARGIN = this.world.width / 7;
		const BOTTOM_MARGIN = (this.world.height - this.game.scoreBoard.bottom) / 10;
		const GEM_SIZE = 100; // in pixels
		const TIME = 60; // in seconds
		const COLS = Math.floor((this.world.width - SIDE_MARGIN * 2) / GEM_SIZE);
		const ROWS = Math.floor((this.world.height - this.game.scoreBoard.bottom - BOTTOM_MARGIN * 1.3) / GEM_SIZE);
		const WALL_LEFT = (this.world.width - (COLS * GEM_SIZE)) / 2;
		const WALL_RIGHT = this.world.width - WALL_LEFT;
		const WALL_BOTTOM = this.world.height - BOTTOM_MARGIN;
		const SCORE_TEXT_HEIGHT = this.game.scoreBoard.height / 7 * 3;
		const SCOTE_TEXT_MARGIN_TOP = this.game.scoreBoard.height / 3;
		const TIME_BOARD_MAX_HEIGHT = this.world.height / window.devicePixelRatio / 9;
		const TIME_BOARD_MARGIN = .1;
		const TEXT_TIME_UP_MAX_HEIGHT = this.world.height / window.devicePixelRatio / 8;



		// make some variables global
		this.matrix = new Matrix(COLS, ROWS, this);
		this.hand = new Hand(this.game, this.matrix);
		this.hint = new Hint(this.game, this.matrix);
		this.popupText = new PopupText(this.game, this.matrix);
		this.game.SCORE = 0;
		this.game.TIME = TIME;
		this.SHOW_HINT_COUNTDOWN_TIME = 7; // in seconds
		this.ROTATE_GEMS_COUNTDOWN_TIME = 8; // in seconds
		this.TUTORIAL_IS_SHOWN = this.checkTutorialIsShown();
		this.game.GEM_SIZE = GEM_SIZE;
		this.game.COLS = COLS;
		this.game.ROWS = ROWS;
		this.game.WALL_LEFT = WALL_LEFT;
		this.game.WALL_BOTTOM = WALL_BOTTOM;
		this.game.gemsOverlap = false;
		this.game.updateScore = this.updateScore;
		this.game.rollDonut = false;
		this.game.shiftUpTimeBoard = false;
		this.game.shiftUpScoreBoard = false;
		this.game.moveDownTextTimeUp = false;
		this.game.moveDownTextGameOver = false;
		this.game.IS_GAME_OVER = false;
		this.game.BIAS = 30;
		this.game.logoIsOpened = false;
		this.game.btnPlayIsOpened = false;
		this.game.SHADOW_MARGIN = 4;
		this.game.notRotateNumbers = ['7', '8', '9', 'a', 'b']; // gem numbers, that we CAN'T rotate
		this.game.doublePoints = false;
		this.game.isExploading = false;


		this.matrix.generateMatrix();
		this.game.gems = new Gems(this.game, this.matrix);
		this.game.gems.render();
		
		
		if (!this.TUTORIAL_IS_SHOWN) {
			this.showTutorial();
		} else {
			this.startGameTimeLoops();
		}
		


		// TIME BOARD
		const timeBoard = this.game.timeBoard = this.game.add.sprite(0, 0, 'time-board');
		if (timeBoard.height > TIME_BOARD_MAX_HEIGHT) {
			const timeBoardScale = TIME_BOARD_MAX_HEIGHT / timeBoard.height;
			timeBoard.scale.setTo(timeBoardScale);
		}
		timeBoard.angle = .5;
		timeBoard.anchor.setTo(.5);
		timeBoard.left = timeBoard.width * TIME_BOARD_MARGIN;
		timeBoard.bottom = 0;
		// physics
		this.game.physics.arcade.enable(timeBoard);
		timeBoard.body.gravity.y = 2000;
		timeBoard.body.bounce.y = .2;


		// FLOOR FOR TIME BOARD
		const floorForTimeBoard = this.game.floorForTimeBoard = this.game.add.sprite(timeBoard.width / 2,
			timeBoard.height + timeBoard.height * TIME_BOARD_MARGIN,
			'transparent');
		// physics
		this.game.physics.arcade.enable(floorForTimeBoard);
		floorForTimeBoard.body.immovable = true;


		// TIMER TEXT
		const timerText = this.game.timerText = this.game.add.text(0, 0, this.formatTime(this.game.TIME));
		timerText.font = 'Fredoka One';
		timerText.fontSize = timeBoard.height / 2 * window.devicePixelRatio;
		timerText.align = 'center';
		timerText.fill = '#fff';
		timerText.anchor.setTo(.5);
		timeBoard.addChild(timerText);


		// TEXT TIME UP
		const textTimeUp = this.game.textTimeUp = this.game.add.sprite(this.world.centerX, 0, 'text-timeup');
		textTimeUp.anchor.setTo(.5, 1);
		textTimeUp.y = 0;
		if (textTimeUp.height > TEXT_TIME_UP_MAX_HEIGHT) {
			this.game.TEXT_TIME_UP_SCALE = TEXT_TIME_UP_MAX_HEIGHT / textTimeUp.height;
			textTimeUp.scale.setTo(this.game.TEXT_TIME_UP_SCALE);
		}
		// physics
		this.game.physics.arcade.enable(textTimeUp);
		textTimeUp.body.gravity.y = 2000;
		textTimeUp.body.bounce.y = .2;
		textTimeUp.body.allowGravity = false;


		// FLOOR FOR TEXT TIME UP
		const floorForTextTimeUp = this.game.floorForTextTimeUp = this.game.add.sprite(this.world.centerX, this.world.height * .75, 'transparent');
		// physics
		this.game.physics.arcade.enable(floorForTextTimeUp);
		floorForTextTimeUp.body.immovable = true;


		// 'GAME OVER' text
		const textGameOver = this.game.textGameOver = this.game.add.text(this.world.centerX, 0, 'GAME OVER');
		textGameOver.font = 'Fredoka One';
		textGameOver.fontSize = this.world.height / window.devicePixelRatio / 11;
		textGameOver.fill = '#ff5050';
		textGameOver.align = 'center';
		textGameOver.anchor.setTo(.5, 1);
		textGameOver.stroke = '#fff';
		textGameOver.strokeThickness = this.world.height / window.devicePixelRatio * .03;
		textGameOver.setShadow(2, this.world.height / window.devicePixelRatio * .01, 'rgba(78, 46, 90, .6)', 2, true, false);
		this.game.physics.arcade.enable(textGameOver);
		textGameOver.body.gravity.y = 2000;
		textGameOver.body.bounce.y = .2;
		textGameOver.body.allowGravity = false;


		// FLOOR FOR 'GAME OVER' text
		const floorForTextGameOver = this.game.floorForTextGameOver = this.game.add.sprite(this.world.centerX, this.world.height * .75, 'transparent');
		// physics
		this.game.physics.arcade.enable(floorForTextGameOver);
		floorForTextGameOver.body.immovable = true;


		// SOUND KILL
		this.game.soundKill = this.game.sound.add('kill');
		this.game.soundKill.volume = .5;
		this.game.soundKill.loop = false;
	}


	update() {
		this.game.physics.arcade.collide(this.game.scoreBoard, this.game.floorForScoreBoard);
		this.game.physics.arcade.collide(this.game.timeBoard, this.game.floorForTimeBoard);

		// for not checking for overlapping after game is over
		if (!this.game.IS_GAME_OVER) {
			// if already overlapped, then don't check second time
			if (!this.game.gemsOverlap) {
				this.game.physics.arcade.overlap(this.game.gemsGroup, this.game.gemsGroup, null, this.onGemsOverlap, this);
			}
		}


		// move down 'Time Up' text
		if (!this.game.moveDownTextTimeUp) {
			this.game.physics.arcade.collide(this.game.textTimeUp, this.game.floorForTextTimeUp);
		}
		

		// BIG DONUT ANIMATION
		if (this.game.rollDonut) {
			this.game.bigDonut.x += 30 / window.devicePixelRatio;
			this.game.bigDonut.angle += 4;
			this.game.donutShadow.x += 30 / window.devicePixelRatio;
		}

		// donut is on center
		if (this.game.bigDonut.x > this.world.centerX - this.game.BIAS
			&& this.game.bigDonut.x < this.world.centerX + this.game.BIAS) {
			this.clearScreen();
		}

		// donut is behind the screen
		if (this.game.bigDonut.x >= this.world.width + this.game.bigDonut.width) {
			this.gotoMainMenu();
		}

		// shift time board
		if (this.game.shiftUpTimeBoard && this.game.timeBoard.bottom > 0) {
			this.game.timeBoard.y -= 5;
		}

		// shift score board
		if (this.game.shiftUpScoreBoard && this.game.scoreBoard.bottom > 0) {
			this.game.scoreBoard.y -= 5;
		}

		if (this.game.IS_GAME_OVER && !this.game.moveDownTextGameOver) {
			this.game.physics.arcade.collide(this.game.textGameOver, this.game.floorForTextGameOver);
		}
	}


	async onGemsOverlap(gem1, gem2) {
		// to prevent second call
		if (this.game.gemsOverlap) return;

		this.game.gemsOverlap = true;
		gem1.input.disableDrag();

		if (!this.TUTORIAL_IS_SHOWN) {
			this.TUTORIAL_IS_SHOWN = true;
			this.removeTutorial();
		}

		try {
			await this.game.gems.swap(gem1, gem2);

			if (await this.checkForMatches() === false) {
				// swap gems back
				this.game.gemsOverlap = true;
				gem1.input.disableDrag();
				this.game.gems.swap(gem1, gem2);
			}

		} catch(e) { console.log(e); }	
	}


	async checkForMatches() {
		const matchedIDs = this.matrix.checkForMatches();

		if (matchedIDs) {
			this.game.gemsOverlap = true; // TRUE to prevent listening for overlapping
			this.game.gemsGroup.setAll('inputEnabled', false);
			this.calculatePoints(this.matrix.getMatchedIDsArrays());
			this.game.isExploading = true;
			this.matrix.removeMatchedGems();

			try {
				await this.game.gems.explode(matchedIDs);
			} catch(e) { console.log(e); }

			await this.game.gems.moveDownRest();
			this.matrix.addNewGems();
			await this.game.gems.render();
			this.checkForMatches();
			return true;

		} else {
			// no more matches
			if (!this.matrix.checkForPosibles()) {

				this.gameOverTimer = window.setTimeout(() => {
					window.clearTimeout(this.gameOverTimer);
					this.gameOver('no-turns');
				}, 3000);

				return false;
			}

			this.game.gemsGroup.setAll('inputEnabled', true);
			this.game.isExploading = false;
			this.countDownToHint();
			return false;
		}
	}


	calculatePoints(matchedIDsArrays) {
		const NUM_OF_GROUPS_FOR_BONUS = 1;
		const TIME_TO_ADD = 10; // in seconds
		const numberOfGroups = matchedIDsArrays.length;

		matchedIDsArrays.forEach(group => {
			this.checkForTimeOrDouble(group);
			this.addPoints(group);
			this.addTime((group.length - 3) * TIME_TO_ADD, group);
			this.addTime((numberOfGroups - 1) * TIME_TO_ADD, group);
		});

		if (numberOfGroups === NUM_OF_GROUPS_FOR_BONUS) {
			this.matrix.getBonus = true;
		}
	}


	addPoints(group) {
		const numberOfGemsInGroup = group.length;
		let points;

		switch (numberOfGemsInGroup) {
			case 3:
				points = 10;
				break;
			case 4:
				points = 15;
				break;
			case 5:
				points = 25;
				break;
			case 6:
				points = 40;
				break;
			case 7:
				points = 70;
				break;
			case 8:
				points = 100;
				break;
		}

		let pointsToAdd = numberOfGemsInGroup * points;

		if (this.game.doublePoints) {
			pointsToAdd *= 2;
			this.game.doublePoints = false;
		}

		this.updateScore(pointsToAdd);
		this.popupText.show(group, pointsToAdd);
	}


	addTime(secondsToAdd, group) {
		if (secondsToAdd === 0) return;

		const curSeconds = this.game.TIME;
		const newSeconds = curSeconds + secondsToAdd;
		const distance = newSeconds - curSeconds;
		const DURATION = 200;

		const startTime = performance.now();
		let progress = 0, newNumber;

		const animate = curTime => {
			progress = (curTime - startTime) / DURATION;
			if (progress > 1) progress = 1;

			newNumber = Math.floor(distance * progress);

			this.game.timerText.text = this.formatTime(curSeconds + newNumber);

			if (progress < 1) {
				requestAnimationFrame(animate);
			}
		}

		requestAnimationFrame(animate);

		this.game.TIME += secondsToAdd;

		this.popupText.show(group, secondsToAdd + 's');
	}


	checkForTimeOrDouble(groupOfIDs) {
		groupOfIDs.forEach(id => {
			const gemNumber = this.matrix.getGemDataByID(id).number;

			if (gemNumber === 'a') this.addTime(5, groupOfIDs);
			if (gemNumber === 'b') this.game.doublePoints = true;
		});
	}


	updateScore(numberToAdd) {
		const curScore = this.game.SCORE,
			  newScore = curScore + numberToAdd,
			  distance = newScore - curScore,
			  DURATION = 200;

		const startTime = performance.now();
		let progress = 0, newNumber;

		const animate = curTime => {
			progress = (curTime - startTime) / DURATION;
			if (progress > 1) progress = 1;

			newNumber = Math.ceil(distance * progress);

			this.game.scoreText.text = this.formatScore(curScore + newNumber);

			if (progress < 1) {
				requestAnimationFrame(animate);
			}
		}

		requestAnimationFrame(animate);

		this.game.SCORE += numberToAdd;
	}


	formatTime(secs) {
		const minutes = Math.floor(secs / 60);
		const seconds = secs % 60;

		const mm = (minutes < 10) ? '0' + minutes : minutes;
		const ss = (seconds < 10) ? '0' + seconds : seconds;
			
		return mm + ':' + ss;
	}


	formatScore(number) {
		// Rule of formatting: 25,234
		if (number < 1000) return number;

		const reverse = number.toString().split('').reverse().join('');
		const withCommas = reverse.match(/\d{1,3}/g).join(',');
		const result = withCommas.split('').reverse().join('');
		
		return result;
	}


	updateTime() {
		const timerText = this.game.timerText;
		timerText.alpha = 1;

		if (this.game.TIME > 0) {
			this.game.TIME -= 1;
		}

		if (this.game.TIME === 0) {
			// wait until all explosions end
			if (this.game.isExploading) return;
			this.gameOver('time-up');
		}

		// fill timer text with another color
		if (this.game.TIME <= 10) {
			timerText.fill = '#ff5106';

			if (this.game.TIME <= 5 && this.game.TIME > 0) {
				this.blinkTimerText();
			}

		} else {
			timerText.fill = '#fff';
		}

		timerText.text = this.formatTime(this.game.TIME);
	}


	gameOver(why) {
		this.game.time.events.remove(this.game.gameTimer);
		window.clearInterval(this.rotateGemsTimer);
		this.game.IS_GAME_OVER = true;
		this.saveHighestScore();

		if (why === 'time-up') {
			this.game.textTimeUp.body.allowGravity = true;
			this.game.time.events.add(Phaser.Timer.SECOND * 2, this.moveDownTextTimeUp, this);
			this.game.gems.explodeAll();

		} else if (why === 'no-turns') {
			this.game.textGameOver.body.allowGravity = true;
			this.game.time.events.add(Phaser.Timer.SECOND, () => {
				this.game.gems.explodeAll();
			}, this);
			this.game.time.events.add(Phaser.Timer.SECOND * 2, this.moveDownTextGameOver, this);
		}
		
		this.game.time.events.add(Phaser.Timer.SECOND * 2, this.shiftUpTimeBoard, this);
		this.game.time.events.add(Phaser.Timer.SECOND * 2.1, this.shiftUpScoreBoard, this);
		this.game.time.events.add(Phaser.Timer.SECOND * 2.2, this.showUserScore, this);
	}


	saveHighestScore() {
		const prevHighestScore = window.localStorage.getItem('highestScore');

		if (!prevHighestScore) {
			window.localStorage.setItem('highestScore', this.game.SCORE);
		} else {

			if (prevHighestScore < this.game.SCORE) {
				window.localStorage.setItem('highestScore', this.game.SCORE);
			}
		}
	}


	shiftUpTimeBoard() {
		this.game.timeBoard.body.allowGravity = false;
		this.game.shiftUpTimeBoard = true;
	}


	shiftUpScoreBoard() {
		this.game.scoreBoard.body.allowGravity = false;
		this.game.shiftUpScoreBoard = true;
	}


	moveDownTextTimeUp() {
		this.game.moveDownTextTimeUp = true;
	}


	moveDownTextGameOver() {
		this.game.moveDownTextGameOver = true;
	}


	blinkTimerText() {
		const BLINK_TIME = 500; // in ms

		this.game.timerText.alpha = 1;

		const blinkTimer = window.setTimeout(() => {
			window.clearTimeout(blinkTimer);
			this.game.timerText.alpha = 0;
		}, BLINK_TIME);
	}


	startGameTimeLoops() {
		this.game.gameTimer = this.game.time.events.loop(Phaser.Timer.SECOND, this.updateTime, this);

		this.rotateGemsTimer = window.setInterval(() => {
			this.game.gems.rotate();
		}, this.ROTATE_GEMS_COUNTDOWN_TIME * 1000);

		this.countDownToHint();
	}


	checkTutorialIsShown() {
		const isShown = window.sessionStorage.getItem('isTutorialShown');
		if (!isShown)
			return false;
		else
			return true;
	}


	showTutorial() {
		const WAIT_BEFORE_SHOW_HAND = 600;
		this.waitBeforeShowHandTimer = window.setTimeout(() => {
			this.hand.show();
		}, WAIT_BEFORE_SHOW_HAND);
	}


	async removeTutorial() {
		try {
			await this.hand.remove();

		} catch(e) { console.log(e); }

		window.sessionStorage.setItem('isTutorialShown', 'true');
		this.startGameTimeLoops();
	}


	countDownToHint() {
		window.clearInterval(this.hintCountDownTimer);

		this.hintCountDownTimer = window.setInterval(() => {
			this.hint.show();
		}, this.SHOW_HINT_COUNTDOWN_TIME * 1000);
	}


	removeTimeBoard() {
		this.game.timeBoard.kill();
		this.game.timerText.kill();
	}


	showUserScore() {
		const highestScore = window.localStorage.getItem('highestScore');

		// 'YOUR SCORE' text
		const yourScoreText = this.yourScoreText = this.game.add.text(0, 0, 'YOUR SCORE:  ' + this.formatScore(this.game.SCORE));
		yourScoreText.font = 'Fredoka One';
		yourScoreText.fontSize = this.world.height / window.devicePixelRatio / 11;
		yourScoreText.fill = '#ff5050';
		yourScoreText.align = 'center';
		yourScoreText.anchor.setTo(.5, 1);
		yourScoreText.x = this.world.centerX;
		yourScoreText.y = this.world.centerY;
		yourScoreText.angle = -.3;
		yourScoreText.alpha = 0;
		yourScoreText.scale.setTo(.4);
		yourScoreText.stroke = '#fff';
		yourScoreText.strokeThickness = this.world.height / window.devicePixelRatio * .03;
		yourScoreText.setShadow(2, this.world.height / window.devicePixelRatio * .01, 'rgba(78, 46, 90, .6)', 2, true, false);
		this.game.add.tween(yourScoreText.scale).to({x: 1, y: 1}, 300, Phaser.Easing.Back.Out, true);
		this.game.add.tween(yourScoreText).to({alpha: 1}, 100, Phaser.Easing.Linear.None, true);

		// 'HIGHEST SCORE' text
		const highestScoreText = this.game.highestScoreText = this.game.add.text(0, 0, 'HIGHEST SCORE:  ' + this.formatScore(highestScore));
		highestScoreText.font = 'Fredoka One';
		highestScoreText.fontSize = this.world.height / window.devicePixelRatio / 11;
		highestScoreText.fill = '#ff5050';
		highestScoreText.align = 'center';
		highestScoreText.anchor.setTo(.5, 0);
		highestScoreText.x = this.world.centerX;
		highestScoreText.y = this.world.centerY;
		highestScoreText.angle = .4;
		highestScoreText.alpha = 0;
		highestScoreText.scale.setTo(.4);
		highestScoreText.stroke = '#fff';
		highestScoreText.strokeThickness = this.world.height / window.devicePixelRatio * .03;
		highestScoreText.setShadow(2, this.world.height / window.devicePixelRatio * .01, 'rgba(78, 46, 90, .6)', 2, true, false);
		this.game.add.tween(highestScoreText.scale).to({x: 1, y: 1}, 300, Phaser.Easing.Back.Out, true);
		this.game.add.tween(highestScoreText).to({alpha: 1}, 100, Phaser.Easing.Linear.None, true);

		// 'TAP TO CONTINUE' text
		const tapToContinueText = this.game.tapToContinueText = this.game.add.text(0, 0, 'Tap to continue...');
		tapToContinueText.font = 'Fredoka One';
		tapToContinueText.fontSize = this.world.height / window.devicePixelRatio / 15;
		tapToContinueText.fill = '#fff';
		tapToContinueText.align = 'center';
		tapToContinueText.alpha = 0;
		tapToContinueText.anchor.setTo(.5, 1);
		tapToContinueText.x = this.world.centerX;
		tapToContinueText.y = this.world.height - tapToContinueText.height;
		tapToContinueText.setShadow(2, tapToContinueText.height * .04, 'rgba(78, 46, 90, .6)', tapToContinueText.height * .01);

		this.game.time.events.loop(Phaser.Timer.SECOND, this.blinkTapToContinueText, this);
		this.game.time.events.add(Phaser.Timer.SECOND, this.allowTap, this);
	}


	blinkTapToContinueText() {
		if (this.game.tapToContinueText.alpha === 0) {
			this.game.tapToContinueText.alpha = 1;
		} else {
			this.game.tapToContinueText.alpha = 0;
		}
	}


	allowTap() {
		this.game.input.onTap.add(this.rollDonut, this);
	}


	rollDonut() {
		this.world.swap(this.game.bigDonut, this.yourScoreText);
		this.world.swap(this.game.donutShadow, this.yourScoreText);
		this.world.swap(this.game.bigDonut, this.game.highestScoreText);
		this.world.swap(this.game.donutShadow, this.game.highestScoreText);
		this.world.swap(this.game.bigDonut, this.game.tapToContinueText);
		this.world.swap(this.game.donutShadow, this.game.tapToContinueText);
		this.game.rollDonut = true;
	}


	clearScreen() {
		window.clearInterval(this.rotateGemsTimer);
		this.yourScoreText.kill();
		this.game.highestScoreText.kill();
		this.game.tapToContinueText.kill();
		this.game.time.events.removeAll();
		this.game.scoreBoard.kill();
		this.game.floorForScoreBoard.kill();
		this.game.scoreText.kill();
		this.game.timeBoard.kill();
		this.game.floorForTimeBoard.kill();
		this.game.timerText.kill();
		this.game.textTimeUp.kill();
		this.game.floorForTextTimeUp.kill();
		this.game.textGameOver.kill();
		this.game.floorForTextGameOver.kill();
	}


	gotoMainMenu() {
		this.state.start('MainMenu', true, false, true);
	}
}

export default Play;