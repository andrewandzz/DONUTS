import ScoreBoard from '../objects/ScoreBoard';

class MainMenu extends Phaser.State {
	init(fromPlayMode) {
		// are we back from play mode, then don't replay the music
		this.fromPlayMode = fromPlayMode;
	}

	create() {
		const LOGO_MAX_HEIGHT = this.world.height / window.devicePixelRatio / 4;
		const LOGO_MARGIN_TOP = .2;
		const BTN_PLAY_MAX_HEIGHT = this.world.height / window.devicePixelRatio / 4.5;
		const BTN_PLAY_MARGIN_BOTTOM = this.world.height * .85;
		const BTN_SOUND_MAX_HEIGHT = this.world.height / window.devicePixelRatio / 10;


		this.BIAS = 30; // it will be used as +- bias when catching big donut on some position
		this.BTN_PLAY_SCALE = 1;
		this.rollLogoBack = false;
		this.rollDonut = false;
		this.logoStopRollAngle = 3;


		// BACKGROUND
		const background = this.background = this.game.add.image(0, 0, 'background');
		const backgroundScale = Math.max(this.world.width / background.width, this.world.height / background.height);
		background.scale.setTo(backgroundScale);


		// LOGO
		const logo = this.game.logo = this.game.add.sprite(this.world.centerX, 0, 'logo');
		if (logo.height > LOGO_MAX_HEIGHT) {
			const logoScale = LOGO_MAX_HEIGHT / logo.height;
			logo.scale.setTo(logoScale);
		}
		logo.anchor.setTo(.5, 1);
		logo.y = -logo.height;
		logo.angle = -2;
		// physics
		this.game.physics.arcade.enable(logo);
		logo.body.gravity.y = 2000;
		logo.body.bounce.y = .2;
		

		// FLOOR FOR LOGO
		const floorForLogo = this.game.floorForLogo = this.game.add.sprite(
			this.world.centerX,
			logo.height + logo.height * LOGO_MARGIN_TOP,
			'transparent');
		// physics
		this.game.physics.arcade.enable(floorForLogo);
		floorForLogo.body.immovable = true;


		// BUTTON PLAY
		const btnPlay = this.game.btnPlay = this.game.add.sprite(this.world.centerX, BTN_PLAY_MARGIN_BOTTOM, 'btn-play');
		btnPlay.anchor.setTo(.5, 1);

		if (btnPlay.height > BTN_PLAY_MAX_HEIGHT) {
			this.BTN_PLAY_SCALE = BTN_PLAY_MAX_HEIGHT / btnPlay.height;
		}

		btnPlay.alpha = 0;
		btnPlay.scale.setTo(this.BTN_PLAY_SCALE / 2);
		// physics
		this.physics.arcade.enable(btnPlay);
		btnPlay.body.gravity.y = 500;
		btnPlay.body.bounce.y = .4;
		btnPlay.inputEnabled = true;
		this.game.time.events.add(200, this.popUpBtnPlay, this);
		btnPlay.events.onInputOver.add(this.btnPlayOver, this);
		btnPlay.events.onInputOut.add(this.btnPlayOut, this);
		btnPlay.events.onInputDown.add(this.btnPlayDown, this);


		// FLOOR FOR BUTTON PLAY
		const floorForBtnPlay = this.game.floorForBtnPlay = this.game.add.sprite(this.world.centerX, BTN_PLAY_MARGIN_BOTTOM, 'transparent');
		// physics
		this.game.physics.arcade.enable(floorForBtnPlay);
		floorForBtnPlay.body.immovable = true;


		// BUTTON SOUND
		const btnSoundTexture = (this.isMutedStateSaved()) ? 'btn-sound-muted' : 'btn-sound';
		const btnSound = this.game.btnSound = this.game.add.sprite(0, 0, btnSoundTexture);

		if (btnSound.height > BTN_SOUND_MAX_HEIGHT) {
			const btnSoundScale = BTN_SOUND_MAX_HEIGHT / btnSound.height;
			btnSound.scale.setTo(btnSoundScale);
		}

		btnSound.right = this.world.width - btnSound.width / 2;
		btnSound.bottom = this.world.height - btnSound.height / 2;
		btnSound.inputEnabled = true;
		btnSound.events.onInputDown.add(this.toggleSound, this);


		// BIG DONUT SHADOW & DONUT 
		const shadowShift = 30;
		const donutShadow = this.game.donutShadow = this.game.add.sprite(0, this.world.centerY + shadowShift, 'big-donut-shadow');

		const bigDonut = this.game.bigDonut = this.game.add.sprite(0, this.world.centerY, 'big-donut');
		const bigDonutScale = this.world.height / bigDonut.height;
		bigDonut.scale.setTo(bigDonutScale);
		bigDonut.x = this.world.width + bigDonut.width / 2;
		bigDonut.anchor.setTo(.5);

		donutShadow.scale.setTo(bigDonutScale);
		donutShadow.x = bigDonut.x + shadowShift;
		donutShadow.anchor.setTo(.5);


		// MUSIC
		const bgMusic = this.game.add.audio('background');
		bgMusic.volume = .7;
		bgMusic.loop = true;
		this.game.sound.mute = this.isMutedStateSaved();

		if (!this.fromPlayMode) {
			bgMusic.play();
		}

		// SCORE BOARD
		this.game.ScoreBoard = new ScoreBoard(this.game);


		// SELECT SOUND
		this.game.soundSelect = this.game.sound.add('select');
		this.game.soundSelect.volume = .5;
		this.game.soundSelect.loop = false;


		this.game.time.events.loop(Phaser.Timer.SECOND * 5, this.jumpLogo, this);
		this.game.time.events.loop(Phaser.Timer.SECOND * 3, this.jumpBtnPlay, this);
	}


	update() {
		this.game.physics.arcade.collide(this.game.logo, this.game.floorForLogo);
		this.game.physics.arcade.collide(this.game.btnPlay, this.game.floorForBtnPlay);
		this.game.physics.arcade.collide(this.game.scoreBoard, this.game.floorForScoreBoard);

		this.waveLogo();

		if (this.rollDonut) {
			this.game.bigDonut.x -= 30 / window.devicePixelRatio;
			this.game.bigDonut.angle -= 4;
			this.game.donutShadow.x -= 30 / window.devicePixelRatio;
		}

		// donut in on center
		if (this.game.bigDonut.x > this.world.centerX - this.BIAS
			&& this.game.bigDonut.x < this.world.centerX + this.BIAS) {
			this.clearMenuScreen();
		}

		// donut is touching the left side of the screen
		if (this.game.bigDonut.x > 0 - this.BIAS
			&& this.game.bigDonut.x < 0 + this.BIAS) {
			this.game.ScoreBoard.open();
		}

		// donut is behind the screen
		if (this.game.bigDonut.x <= -this.game.bigDonut.width) {
			this.startPlayMode();
		}
	}


	popUpBtnPlay() {
		this.game.add.tween(this.game.btnPlay.scale).to({x: this.BTN_PLAY_SCALE, y: this.BTN_PLAY_SCALE}, 300, Phaser.Easing.Back.Out, true);
		this.game.add.tween(this.game.btnPlay).to({alpha: 1}, 100, Phaser.Easing.Linear.None, true);
	}


	waveLogo() {
		if (this.game.logo.angle >= this.logoStopRollAngle)
			this.rollLogoBack = true;
		else if (this.game.logo.angle <= -this.logoStopRollAngle)
			this.rollLogoBack = false;
		
		if (this.rollLogoBack)
			this.game.logo.angle -= .01;
		else
			this.game.logo.angle += .01;
	}


	btnPlayOver(btnPlay) {
		btnPlay.loadTexture('btn-play-active');
	}


	btnPlayOut(btnPlay) {
		btnPlay.loadTexture('btn-play');
	}


	btnPlayDown() {
		this.game.soundSelect.play();
		this.rollDonut = true;
	}


	toggleSound(btnSound) {
		if (this.game.sound.mute === false) {
			this.game.sound.mute = true;
			btnSound.loadTexture('btn-sound-muted');
			btnSound.alpha = .8;
			this.game.add.tween(btnSound).to({y: btnSound.y + btnSound.height * .03}, 60, Phaser.Easing.Linear.None, true, 0, 0, true);
			window.sessionStorage.setItem('isSoundMuted', 'true');
			
		} else {
			this.game.sound.mute = false;
			btnSound.loadTexture('btn-sound');
			btnSound.alpha = 1;
			this.game.add.tween(btnSound).to({y: btnSound.y + btnSound.height * .03}, 60, Phaser.Easing.Linear.None, true, 0, 0, true);
			window.sessionStorage.setItem('isSoundMuted', 'false');
		}
	}


	jumpLogo() {
		this.game.logo.body.gravity.y = 3;
		this.game.logo.body.bounce.y = 0;
		if (this.game.logo.body.touching.down)
			this.game.logo.body.velocity.y = -8;
	}

	
	jumpBtnPlay() {
		this.game.btnPlay.body.velocity.y = -100;
	}


	clearMenuScreen() {
		this.game.logo.kill();
		this.game.floorForLogo.kill();
		this.game.btnPlay.kill();
		this.game.floorForBtnPlay.kill();
		this.game.time.events.removeAll();
	}


	isMutedStateSaved() {
		const state = window.sessionStorage.getItem('isSoundMuted');
		if (!state) {
			return false;
		} else {
			return (state == 'true') ? true : false;
		}
	}


	startPlayMode() {
		this.state.start('Play', false, false);
	}
}

export default MainMenu;