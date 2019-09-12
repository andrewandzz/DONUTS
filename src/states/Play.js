import Matrix from '../objects/Matrix';
import Gems from '../objects/Gems';
import ScoreBoard from '../objects/ScoreBoard';
import TimeBoard from '../objects/TimeBoard';
import Hand from '../objects/Hand';
import Hint from '../objects/Hint';
import PopupText from '../objects/PopupText';
import GameOver from '../objects/GameOver';

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



		// make some variables global
		this.game.SCORE = 0;
		this.game.TIME = TIME;
		this.game.Matrix = new Matrix(COLS, ROWS);
		this.game.TimeBoard = new TimeBoard(this.game);
		this.game.Hand = new Hand(this.game);
		this.game.Hint = new Hint(this.game);
		this.game.PopupText = new PopupText(this.game);

		this.SHOW_HINT_COUNTDOWN_TIME = 7; // in seconds
		this.ROTATE_GEMS_INTERVAL = 8; // in seconds
		this.TUTORIAL_IS_SHOWN = this.checkTutorialIsShown();
		this.game.GEM_SIZE = GEM_SIZE;
		this.game.COLS = COLS;
		this.game.ROWS = ROWS;
		this.game.WALL_LEFT = WALL_LEFT;
		this.game.WALL_BOTTOM = WALL_BOTTOM;
		this.ignoreCollision = false;
		this.game.gemsOverlap = false;
		this.game.rollDonut = false;
		this.game.shiftUpTimeBoard = false;
		this.game.shiftUpScoreBoard = false;
		this.game.moveDownTextTimeUp = false;
		this.game.moveDownTextGameOver = false;
		this.game.IS_GAME_OVER = false;
		this.BIAS = 30;
		this.doublePoints = false;


		this.game.Matrix.generateMatrix();

		this.game.Gems = new Gems(this.game);
		this.game.Gems.render();
		
		if (!this.TUTORIAL_IS_SHOWN) {
			this.showTutorial();
		} else {
			this.startGameTimerEvents();
		}

		this.game.GameOver = new GameOver(this.game);


		// SOUND KILL
		this.game.soundKill = this.game.sound.add('kill');
		this.game.soundKill.volume = .5;
		this.game.soundKill.loop = false;
	}


	update() {
		this.game.physics.arcade.collide(this.game.scoreBoard, this.game.floorForScoreBoard);
		this.game.physics.arcade.collide(this.game.timeBoard, this.game.floorForTimeBoard);
		this.game.physics.arcade.overlap(this.game.gemsGroup, this.game.gemsGroup, this.onGemsOverlap, () => !this.ignoreCollision, this);
		this.game.physics.arcade.collide(this.game.textTimeUp, this.game.floorForTextTimeUp, null, () => !this.game.moveDownTextTimeUp);
		this.game.physics.arcade.collide(this.game.textGameOver, this.game.floorForTextGameOver, null, () => !this.game.moveDownTextGameOver);


		// BIG DONUT ANIMATION
		if (this.game.rollDonut) {
			this.game.bigDonut.x += 30 / window.devicePixelRatio;
			this.game.bigDonut.angle += 4;
			this.game.donutShadow.x += 30 / window.devicePixelRatio;
		}
		// donut is on center
		if (this.game.bigDonut.x > this.world.centerX - this.BIAS
			&& this.game.bigDonut.x < this.world.centerX + this.BIAS) {
			this.clearScreen();
		}
		// donut is behind the screen
		if (this.game.bigDonut.x >= this.world.width + this.game.bigDonut.width) {
			this.gotoMainMenu();
		}

		// shift TIME BOARD
		if (this.game.shiftUpTimeBoard && this.game.timeBoard.bottom > 0) {
			this.game.timeBoard.y -= 5;
		}
		// shift SCORE BOARD
		if (this.game.shiftUpScoreBoard && this.game.scoreBoard.bottom > 0) {
			this.game.scoreBoard.y -= 5;
		}
	}


	async onGemsOverlap(gem1, gem2) {
		this.ignoreCollision = true;
		gem1.input.disableDrag();
		gem2.input.disableDrag();
		this.game.gemsGroup.setAll('inputEnabled', false);

		if (!this.TUTORIAL_IS_SHOWN) {
			this.TUTORIAL_IS_SHOWN = true;
			this.removeTutorial();
		}

		await this.game.Gems.swap(gem1, gem2);

		if (!this.game.Matrix.checkForMatches()) {
			this.processSwapBack(gem1, gem2);
			return;
		}

		// if we are here, so we have some matches
		while (true) {
			const matchedIDs = this.game.Matrix.checkForMatches();

			if (!matchedIDs) {
				// no more matches after loop
				this.game.gemsGroup.setAll('inputEnabled', true);
				this.ignoreCollision = false;
				gem1.input.enableDrag(false);
				gem2.input.enableDrag(false);
				this.checkForPosibles();
				break;
			}

			await this.processMatched(matchedIDs);
		}
	}


	async processMatched(matchedIDs) {
		this.countDownToHint();
		this.calculatePoints(this.game.Matrix.getMatchedIDsArrays());
		this.game.Matrix.removeMatchedGems();
		await this.game.Gems.explode(matchedIDs);
		await this.game.Gems.moveDownRest();
		this.game.Matrix.addNewGems();
		await this.game.Gems.render();
	}


	async processSwapBack(gem1, gem2) {
		await this.game.Gems.swap(gem1, gem2);
		this.ignoreCollision = false;
		this.game.gemsGroup.setAll('inputEnabled', true);
		gem1.input.enableDrag(false);
		gem2.input.enableDrag(false);
		this.countDownToHint();
	}


	checkForPosibles() {
		if (this.game.Matrix.checkForPosibles()) return;

		this.game.time.events.add(Phaser.Timer.SECOND, () => {
			this.ignoreCollision = true;
			this.game.gemsGroup.setAll('inputEnabled', false);
			this.game.GameOver.noTurns();
		});
	}


	calculatePoints(matchedIDsArrays) {
		const NUM_OF_GROUPS_FOR_BONUS = 1;
		const TIME_TO_ADD = 5; // in seconds
		const numberOfGroups = matchedIDsArrays.length;

		matchedIDsArrays.forEach(group => {
			this.checkForTimeOrDouble(group);
			this.addPoints(group);
			this.game.TimeBoard.addSeconds((group.length - 3) * TIME_TO_ADD, group);
			this.game.TimeBoard.addSeconds((numberOfGroups - 1) * TIME_TO_ADD);
		});

		if (numberOfGroups === NUM_OF_GROUPS_FOR_BONUS) {
			this.game.Matrix.getBonus = true;
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
			default:
				points = 150;
		}

		let pointsToAdd = numberOfGemsInGroup * points;

		if (this.doublePoints) {
			pointsToAdd *= 2;
			this.doublePoints = false;
		}

		this.game.ScoreBoard.updateScore(pointsToAdd);
		this.game.PopupText.show(group, pointsToAdd);
	}


	checkForTimeOrDouble(groupOfIDs) {
		groupOfIDs.forEach(id => {
			const gemNumber = this.game.Matrix.getGemDataByID(id).number;

			if (gemNumber === 'a') this.game.TimeBoard.addSeconds(5, groupOfIDs);
			if (gemNumber === 'b') this.doublePoints = true;
		});
	}


	checkTutorialIsShown() {
		const isShown = window.sessionStorage.getItem('isTutorialShown');
		if (!isShown)
			return false;
		else
			return true;
	}


	showTutorial() {
		this.game.Hand.show();
	}


	async removeTutorial() {
		await this.game.Hand.remove();
		window.sessionStorage.setItem('isTutorialShown', 'true');
		this.startGameTimerEvents();
	}


	startGameTimerEvents() {
		this.game.time.events.loop(Phaser.Timer.SECOND, () => { this.game.TimeBoard.updateTime(); });

		this.game.time.events.loop(Phaser.Timer.SECOND * this.ROTATE_GEMS_INTERVAL, () => { this.game.Gems.rotate(); });

		this.countDownToHint();
	}


	countDownToHint() {
		this.game.time.events.remove(this.hintTimer);
		this.hintTimer = this.game.time.events.loop(Phaser.Timer.SECOND * this.SHOW_HINT_COUNTDOWN_TIME, () => {
			this.game.Hint.show();
		});
	}


	clearScreen() {
		this.game.GameOver.kill();
		this.game.ScoreBoard.kill();
		this.game.TimeBoard.kill();
		this.game.time.events.removeAll();
	}


	gotoMainMenu() {
		this.state.start('MainMenu', true, false, true);
	}
}

export default Play;