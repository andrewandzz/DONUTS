import PIXI from 'expose-loader?PIXI!phaser-ce/build/custom/pixi.js';
import p2 from 'expose-loader?p2!phaser-ce/build/custom/p2.js';
import Phaser from 'expose-loader?Phaser!phaser-ce/build/custom/phaser-split.js';
import Preload from './states/Preload';
import MainMenu from './states/MainMenu';
import Play from './states/Play';


const config = {
	width: window.innerWidth,
	height: window.innerHeight,
	renderer: Phaser.AUTO,
	parent: ''
};

class Game extends Phaser.Game {
	constructor() {
		super(config);

		this.state.add('Preload', Preload, false);
		this.state.add('MainMenu', MainMenu, false);
		this.state.add('Play', Play, false);

		this.state.start('Preload');
	}
}

new Game();