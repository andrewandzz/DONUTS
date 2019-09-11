import WebFontLoader from 'webfontloader';

class Preload extends Phaser.State {
	preload() {
		this.stage.backgroundColor = '#fff';

		// assets for main menu
		this.game.load.image('background', './assets/images/backgrounds/background.jpg');
		this.game.load.image('transparent', './assets/images/transparent.gif');
		this.game.load.image('logo', './assets/images/donuts_logo.png');
		this.game.load.image('btn-play', './assets/images/btn-play.png');
		this.game.load.image('btn-play-active', './assets/images/btn-play-active.png');
		this.game.load.image('btn-sound', './assets/images/btn-sfx.png');
		this.game.load.image('btn-sound-muted', './assets/images/btn-sfx-muted.png');
		this.game.load.image('big-donut-shadow', './assets/images/big-shadow.png');
		this.game.load.image('big-donut', './assets/images/donut.png');
		this.game.load.audio('background', './assets/audio/background.mp3');
		this.game.load.audio('kill', './assets/audio/kill.mp3');
		this.game.load.audio('select', './assets/audio/select-1.mp3');

		// assets for play mode
		this.game.load.image('score-board', './assets/images/bg-score.png');
		this.game.load.image('time-board', './assets/images/bg-time.png');
		this.game.load.image('gem-0', './assets/images/game/gem-0.png');
		this.game.load.image('gem-1', './assets/images/game/gem-1.png');
		this.game.load.image('gem-2', './assets/images/game/gem-2.png');
		this.game.load.image('gem-3', './assets/images/game/gem-3.png');
		this.game.load.image('gem-4', './assets/images/game/gem-4.png');
		this.game.load.image('gem-5', './assets/images/game/gem-5.png');
		this.game.load.image('gem-6', './assets/images/game/gem-6.png');
		this.game.load.image('gem-7', './assets/images/game/gem-7.png');
		this.game.load.image('gem-8', './assets/images/game/gem-8.png');
		this.game.load.image('gem-9', './assets/images/game/gem-9.png');
		this.game.load.image('gem-a', './assets/images/game/gem-a.png');
		this.game.load.image('gem-b', './assets/images/game/gem-b.png');
		this.game.load.image('gem-shadow', './assets/images/game/shadow.png');
		this.game.load.image('hand', './assets/images/game/hand.png');
		this.game.load.image('text-timeup', './assets/images/text-timeup.png');
		this.game.load.image('particle-0', './assets/images/particles/particle-0.png');
		this.game.load.image('particle-1', './assets/images/particles/particle-1.png');
		this.game.load.image('particle-2', './assets/images/particles/particle-2.png');
		this.game.load.image('particle-3', './assets/images/particles/particle-3.png');
		this.game.load.image('particle-4', './assets/images/particles/particle-4.png');
		this.game.load.image('particle-5', './assets/images/particles/particle-5.png');
		this.game.load.image('particle_ex-1', './assets/images/particles/particle_ex1.png');
		this.game.load.image('particle_ex-2', './assets/images/particles/particle_ex2.png');
		this.game.load.image('particle_ex-3', './assets/images/particles/particle_ex3.png');

		WebFontLoader.load({
			google: {
				families: ['Fredoka One']
			},
			active: this.fontsLoaded
		});

		this.physics.startSystem(Phaser.Physics.ARCADE);
	}

	create() {
		this.state.start('MainMenu');
	}
}

export default Preload;