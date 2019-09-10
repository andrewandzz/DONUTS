class Hint {
	constructor(game, matrix) {
		this.game = game;
		this.matrix = matrix;
	}

	show() {
		const ID 		= this.matrix.getGemHint().id;
		
		if (!ID) return;

		const direction = this.matrix.getGemHint().direction;
		const gem 		= this.game.gemsGroup.getByName(ID);
		const shadow 	= this.game.shadowsGroup.getByName(ID);

		if (!gem || !shadow) return;

		const JUMP_DIST		= gem.height * .07,
			  JUMP_DUR 		= 100, // duration in ms
			  JUMP_TIMES	= 1; // plus one default time

		if (direction === 'up') {
			this.game.add.tween(gem).to({y: gem.y - JUMP_DIST}, JUMP_DUR, Phaser.Easing.Linear.None, true, 0, JUMP_TIMES, true);
			this.game.add.tween(shadow).to({y: shadow.y - JUMP_DIST}, JUMP_DUR, Phaser.Easing.Linear.None, true, 0, JUMP_TIMES, true);

		} else if (direction === 'down') {
			this.game.add.tween(gem).to({y: gem.y + JUMP_DIST}, JUMP_DUR, Phaser.Easing.Linear.None, true, 0, JUMP_TIMES, true);
			this.game.add.tween(shadow).to({y: shadow.y + JUMP_DIST}, JUMP_DUR, Phaser.Easing.Linear.None, true, 0, JUMP_TIMES, true);

		} else if (direction === 'left') {
			this.game.add.tween(gem).to({x: gem.x - JUMP_DIST}, JUMP_DUR, Phaser.Easing.Linear.None, true, 0, JUMP_TIMES, true);
			this.game.add.tween(shadow).to({x: shadow.x - JUMP_DIST}, JUMP_DUR, Phaser.Easing.Linear.None, true, 0, JUMP_TIMES, true);

		} else if (direction === 'right') {
			this.game.add.tween(gem).to({x: gem.x + JUMP_DIST}, JUMP_DUR, Phaser.Easing.Linear.None, true, 0, JUMP_TIMES, true);
			this.game.add.tween(shadow).to({x: shadow.x + JUMP_DIST}, JUMP_DUR, Phaser.Easing.Linear.None, true, 0, JUMP_TIMES, true);
		}
	}
}

export default Hint;