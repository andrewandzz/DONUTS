class TimeBoard {
	constructor(game) {
		this.game = game;
		this.timeBoard;
		this.floorForTimeBoard;
		this.timerText;

		this._init();
	}


	_init() {
		const TIME_BOARD_MAX_HEIGHT = this.game.world.height / window.devicePixelRatio / 9;
		const TIME_BOARD_MARGIN = .1; // relatively to its height

		// TIME BOARD
		const timeBoard = this.timeBoard = this.game.add.sprite(0, 0, 'time-board');
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
		const floorForTimeBoard = this.floorForTimeBoard = this.game.add.sprite(timeBoard.width / 2,
			timeBoard.height + timeBoard.height * TIME_BOARD_MARGIN,
			'transparent');
		// physics
		this.game.physics.arcade.enable(floorForTimeBoard);
		floorForTimeBoard.body.immovable = true;


		// TIMER TEXT
		const timerText = this.timerText = this.game.add.text(0, 0, this._formatTime(this.game.TIME));
		timerText.font = 'Fredoka One';
		timerText.fontSize = timeBoard.height / 2 * window.devicePixelRatio;
		timerText.align = 'center';
		timerText.fill = '#fff';
		timerText.anchor.setTo(.5);

		timeBoard.addChild(timerText);


		// EXPORT timeBoard and floorForTimeBoard in Game
		this.game.timeBoard = timeBoard;
		this.game.floorForTimeBoard = floorForTimeBoard;
		this.game.timerText = timerText;
	}


	updateTime() {
		const timerText = this.timerText;
		timerText.alpha = 1;

		if (this.game.TIME > 0) {
			this.game.TIME -= 1;
		}

		if (this.game.TIME === 0) {
			this.game.time.events.removeAll();
			this.game.GameOver.timeUp();
		}

		// fill timer text with another color
		if (this.game.TIME <= 10) {
			timerText.fill = '#ff5106';

			if (this.game.TIME <= 5 && this.game.TIME > 0) {
				this._blink();
			}

		} else {
			timerText.fill = '#fff';
		}

		timerText.text = this._formatTime(this.game.TIME);
	}


	addSeconds(secondsToAdd, group) {
		if (secondsToAdd === 0) return;

		const curSeconds = this.game.TIME;
		const newSeconds = curSeconds + secondsToAdd;
		const distance = newSeconds - curSeconds;
		const DURATION = 200; // duration of animation

		const startTime = performance.now();
		let progress = 0, newNumber;

		const animate = curTime => {
			progress = (curTime - startTime) / DURATION;
			if (progress > 1) progress = 1;

			newNumber = Math.floor(distance * progress);

			this.timerText.text = this._formatTime(curSeconds + newNumber);

			if (progress < 1) {
				requestAnimationFrame(animate);
			}
		}

		requestAnimationFrame(animate);

		this.game.TIME += secondsToAdd;

		this.game.PopupText.show(group, secondsToAdd + 's');
	}


	shiftUp() {
		this.timeBoard.body.allowGravity = false;
		this.game.shiftUpTimeBoard = true;
	}


	_formatTime(secs) {
		const minutes = Math.floor(secs / 60);
		const seconds = secs % 60;

		const mm = (minutes < 10) ? '0' + minutes : minutes;
		const ss = (seconds < 10) ? '0' + seconds : seconds;
			
		return mm + ':' + ss;
	}


	_blink() {
		const DELAY = 500; // in ms

		this.timerText.alpha = 1;
		this.game.add.tween(this.timerText).to({alpha: 0}, 1, Phaser.Easing.Linear.None, true, DELAY);
	}


	kill() {
		this.timeBoard.kill();
		this.floorForTimeBoard.kill();
		this.timerText.kill();
	}
}

export default TimeBoard;