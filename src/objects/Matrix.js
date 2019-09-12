class Matrix {
	constructor(COLS, CELLS) {
		this.COLS = COLS;
		this.CELLS = CELLS;
		this.gemHintID = null;
		this.gemHintDirection = null;
		this.matchedIDsArrays = [];

		const gemIDGenerator = () => {
			let id = 0;

			return () => {
				return ++id;
			}
		}

		this.createGemID = gemIDGenerator();
	}

	generateMatrix() {
		const MATRIX = this.MATRIX = new Array(this.COLS);

		for (let col = 0; col < MATRIX.length; col++) {
			MATRIX[col] = new Array(this.CELLS);

			for (let cell = 0; cell < MATRIX[col].length; cell++) {
				MATRIX[col][cell] = {
					id: this.createGemID(),
					number: this.getRandomGemNumber()
				}
			}
		}

		if (this.checkForMatches()) {
			// if after generating there are matches already,
			// thne do it again
			return this.generateMatrix();
		}

		if (!this.checkForPosibles()) {
			// if after generating we don't have possible turns
			// generate again
			return this.generateMatrix();
		}
	}


	checkForPosibles() {
		let FOUND = false;
		this.gemHintID = null;
		this.gemHintDirection = null;
		/* here we have several cases
			1. 44x4,    22x2, or 3x33, 1x11, or 61x1, 2x62 etc.

			2. 44x, or    2
		       4        22x

		    3. 3x3
		        3
		*/
		const stringsVertical = this.getStringsVertical();
		const stringsHorizontal = this.getStringsHorizontal();

		// 1st case
		const matches1Vertical = [
			// we NEED () here to know what number we can swap
			'(0).0[06]', '(1).1[16]', '(2).2[26]', '(3).3[36]', '(4).4[46]', '(5).5[56]',

			'(0).[0678ab]0', '(1).[1678ab]1', '(2).[2678ab]2', '(3).[3678ab]3', '(4).[4678ab]4', '(5).[5678ab]5',

			'(6).00', '(6).11', '(6).22', '(6).33', '(6).44', '(6).55',

			'([78ab])00', '([78ab])11', '([78ab])22', '([78ab])33', '([78ab])44', '([78ab])55'
		].join('|');

		const re1Vertical = new RegExp(matches1Vertical);

		stringsVertical.forEach((str, col) => {
			const result = re1Vertical.exec(str);
			if (result) {
				// get col and cell of gem
				const filteredResult = result.filter((el => el !== undefined));
				const hintGemNumber = filteredResult[1];
				this.gemHintID = this.getGemID(col, result.index);
				this.gemHintDirection = 'up';
				FOUND = true;
				return;
			}
		});
		// stop checking
		if (FOUND) return true;


		const matches1Horizontal = [
			'(0).0[06]', '(1).1[16]', '(2).2[26]', '(3).3[36]', '(4).4[46]', '(5).5[56]',

			'(0).[0679ab]0', '(1).[1679ab]1', '(2).[2679ab]2', '(3).[3679ab]3', '(4).[4679ab]4', '(5).[5679ab]5',

			'(6).00', '(6).11', '(6).22', '(6).33', '(6).44', '(6).55',

			'([79ab])00', '([79ab])11', '([79ab])22', '([79ab])33', '([79ab])44', '([79ab])55'
		].join('|');

		const re1Horizontal = new RegExp(matches1Horizontal);

		stringsHorizontal.forEach((str, row) => {
			const result = re1Horizontal.exec(str);
			if (result) {
				// get col and cell of gem
				const filteredResult = result.filter((el => el !== undefined));
				const hintGemNumber = filteredResult[1];
				this.gemHintID = this.getGemID(result.index, row);
				this.gemHintDirection = 'right';
				FOUND = true;
				return;
			}
		});
		// stop checking
		if (FOUND) return true;


		// REVERSE STRINGS AND REPEAT CHECKING
		const reversedStringsVertical = this.reverseStrings(stringsVertical);
		reversedStringsVertical.forEach((str, col) => {
			const result = re1Vertical.exec(str);
			if (result) {
				// get col and cell of gem
				const filteredResult = result.filter((el => el !== undefined));
				const hintGemNumber = filteredResult[1];
				const cell = result.input.length - 1 - result.index;
				this.gemHintID = this.getGemID(col, cell);
				this.gemHintDirection = 'down';
				FOUND = true;
				return;
			}
		});
		// stop checking
		if (FOUND) return true;


		const reversedStringsHorizontal = this.reverseStrings(stringsHorizontal);
		reversedStringsHorizontal.forEach((str, row, arr) => {
			const result = re1Horizontal.exec(str);

			if (result) {
				// get col and cell of gem
				const filteredResult = result.filter((el => el !== undefined));
				const hintGemNumber = filteredResult[1];
				const col = result.input.length - 1 - result.index;
				this.gemHintID = this.getGemID(col, row);
				this.gemHintDirection = 'left';
				FOUND = true;
				return;
			}
		});
		// stop checking
		if (FOUND) return true;




		// // 2nd case
		const matches2Vertical = [
			// find xx3
			//      33x
			//      xx3
			// we NEED () here to know what number to look for in neigbours
			'[06](0)', '[16](1)', '[26](2)', '[36](3)', '[46](4)', '[56](5)',
			'(0)[06]', '(1)[16]', '(2)[26]', '(3)[36]', '(4)[46]', '(5)[56]',

			// find xx1
			//      17x
			//      xx1
			'(0)[78ab]', '(1)[78ab]', '(2)[78ab]', '(3)[78ab]', '(4)[78ab]', '(5)[78ab]'
		].join('|');
		const re2Vertical = new RegExp(matches2Vertical);

		stringsVertical.forEach((str, col, arr) => {
			const result = re2Vertical.exec(str);
			if (result) {
				const found = checkLastInNeighbours(result, col, arr);

				if (found) {
					if (found === 'prev') {
						this.gemHintID = this.getGemID(col - 1, result.index + 2);
						this.gemHintDirection = 'right';
					} else if (found === 'next') {
						this.gemHintID = this.getGemID(col + 1, result.index + 2);
						this.gemHintDirection = 'left';
					}
					
					FOUND = true;
					return;
				}
			}
		});
		// stop checking
		if (FOUND) return true;


		const matches2Horizontal = [
			// find xx2
			//      22x
			//      xx2
			// we NEED () here to know what number to look for in neigbours
			'[06](0)', '[16](1)', '[26](2)', '[36](3)', '[46](4)', '[56](5)',
			'(0)[06]', '(1)[16]', '(2)[26]', '(3)[36]', '(4)[46]', '(5)[56]',

			// find xx1
			//      19x
			//      xx1
			'(0)[79ab]', '(1)[79ab]', '(2)[79ab]', '(3)[79ab]', '(4)[79ab]', '(5)[79ab]'
		].join('|');
		const re2Horizontal = new RegExp(matches2Horizontal);

		stringsHorizontal.forEach((str, row, arr) => {
			const result = re2Horizontal.exec(str);
			if (result) {
				const found = checkLastInNeighbours(result, row, arr);

				if (found) {
					if (found === 'prev') {
						this.gemHintID = this.getGemID(result.index + 2, row - 1);
						this.gemHintDirection = 'up';
					} else if (found === 'next') {
						this.gemHintID = this.getGemID(result.index + 2, row + 1);
						this.gemHintDirection = 'down';
					}

					FOUND = true;
					return;
				}
			}
		});
		// stop checking
		if (FOUND) return true;


		// REVERSE
		reversedStringsVertical.forEach((str, col, arr) => {
			const result = re2Vertical.exec(str);

			if (result) {
				const found = checkLastInNeighbours(result, col, arr);

				if (found) {
					const cell = result.input.length - 1 - result.index;
					if (found === 'prev') {
						this.gemHintID = this.getGemID(col - 1, cell - 2);
						this.gemHintDirection = 'right';
					} else if (found === 'next') {
						this.gemHintID = this.getGemID(col + 1, cell - 2);
						this.gemHintDirection = 'left';
					}

					FOUND = true;
					return;
				}
			}
		});
		// stop checking
		if (FOUND) return true;


		reversedStringsHorizontal.forEach((str, row, arr) => {
			const result = re2Horizontal.exec(str);

			if (result) {
				const found = checkLastInNeighbours(result, row, arr);

				if (found) {
					const col = result.input.length - 1 - result.index;
					if (found === 'prev') {
						this.gemHintID = this.getGemID(col - 2, row - 1);
						this.gemHintDirection = 'up';
					} else if (found === 'next') {
						this.gemHintID = this.getGemID(col - 2, row + 1);
						this.gemHintDirection = 'down';
					}

					FOUND = true;
					return;
				}
			}
		});
		// stop checking
		if (FOUND) return true;



		// // 3rd case
		const matches3 = [
			'(0).0', '(1).1', '(2).2', '(3).3', '(4).4', '(5).5'
		].join('|');

		const re3 = new RegExp(matches3);

		stringsVertical.forEach((str, col, arr) => {
			const result = re3.exec(str);

			if (result) {
				const found = checkMiddleInNeighbours(result, col, arr, 'ver');

				if (found) {
					if (found === 'prev') {
						this.gemHintID = this.getGemID(col - 1, result.index + 1);
						this.gemHintDirection = 'right';
					} else if (found === 'next') {
						this.gemHintID = this.getGemID(col + 1, result.index + 1);
						this.gemHintDirection = 'left';
					}

					FOUND = true;
					return;
				}
			}
		});
		// stop checking
		if (FOUND) return true;


		stringsHorizontal.forEach((str, row, arr) => {
			const result = re3.exec(str);

			if (result) {
				const found = checkMiddleInNeighbours(result, row, arr, 'hor');

				if (found) {
					if (found === 'prev') {
						this.gemHintID = this.getGemID(result.index + 1, row - 1);
						this.gemHintDirection = 'up';
					} else if (found === 'next') {
						this.gemHintID = this.getGemID(result.index + 1, row + 1);
						this.gemHintDirection = 'down';
					}

					FOUND = true;
					return;
				}
			}
		});
		
		if (FOUND) return true;
		else return false;



		function checkLastInNeighbours(result, colOrRowIndex, strings) {
			/*
				  5			   1x1
				55x      OR     1 
				  5				1
			*/
			const index = result.index;
			const filteredResult = result.filter((el => el !== undefined));
			const numberToFind = filteredResult[1];


			// '6' is our bonus gem
			const prev = strings[colOrRowIndex - 1];
			if (prev && (prev[index + 2] === numberToFind 
				|| prev[index + 2] === '6')) {
				return 'prev';
			}

			const next = strings[colOrRowIndex + 1];
			if (next && (next[index + 2] === numberToFind 
				|| next[index + 2] === '6')) {
				return 'next';
			}

			return false;
		}



		function checkMiddleInNeighbours(result, colOrRowIndex, strings, type) {
			/*
				 1				 5
				1x1 	OR 		5x
								 5
			*/
			const index = result.index;
			const filteredResult = result.filter((el => el !== undefined));
			const numberToFind = filteredResult[1];

			let re;
			if (type === 'ver') {
				re = new RegExp(`[${numberToFind}678ab]`);
			} else if (type === 'hor') {
				re = new RegExp(`[${numberToFind}679ab]`);
			}

			const prev = strings[colOrRowIndex - 1];
			if (prev && re.test(prev[index + 1])) {
				return 'prev';
			}

			const next = strings[colOrRowIndex + 1];
			if (next && re.test(next[index + 1])) {
				return 'next';
			}

			return false;
		}
	}


	reverseStrings(stringsArr) {
		// copy original array
		const newArr = [...stringsArr];

		 return newArr.map(str => {
			return str.split('').reverse().join('');
		});
	}


	getRandomGemNumber() {
		if (this.getBonus) {
			this.getBonus = false;

			// we need from 0 to 11
			const number = Math.ceil(Math.random() * 12) - 1;

			if (number === 10) {
				return 'a';
			} else if (number === 11) {
				return 'b';
			} else {
				return number;
			}
		}

		// we need from 0 to 5
		return Math.ceil(Math.random() * 6) - 1;
	}


	getMatrix() {
		return this.MATRIX;
	}


	getGemCell(id) {
		let gemCell = {};

		this.MATRIX.forEach((colArr, colIndex) => {

			const cell = colArr.findIndex(gemData => {
				return gemData.id === id;
			});

			if (cell !== -1) {
				gemCell.col = colIndex;
				gemCell.cell = cell;
				return;
			}
		});

		return gemCell;
	}


	swapGems(id1, id2) {
		const gem1Cell = this.getGemCell(id1);
		const gem2Cell = this.getGemCell(id2);

		let gem1Data = this.MATRIX[gem1Cell.col][gem1Cell.cell];
		let gem2Data = this.MATRIX[gem2Cell.col][gem2Cell.cell];

		const temp1 = Object.assign(gem1Data);
		const temp2 = Object.assign(gem2Data);

		delete this.MATRIX[gem1Cell.col][gem1Cell.cell];
		delete this.MATRIX[gem2Cell.col][gem2Cell.cell];

		// switch them
		this.MATRIX[gem1Cell.col][gem1Cell.cell] = Object.assign(temp2);
		this.MATRIX[gem2Cell.col][gem2Cell.cell] = Object.assign(temp1);
	}


	checkForMatches() {
		this.matchedIDs = [];

		this.matchedIDs = [...this.findVerticalMatches(), ...this.findHorizontalalMatches()];

		this.matchedIDsArrays = [...this.matchedIDs];

		// make the array flat
		this.matchedIDs = this.matchedIDs.reduce((arr1, arr2) => {
			return arr1.concat(arr2);
		}, []);

		// remove all doublings
		this.matchedIDs = [...new Set(this.matchedIDs)];

		return (this.matchedIDs.length > 0) ? [...this.matchedIDs] : false;
	}


	findVerticalMatches() {
		const matched = [];

		const stringsArr = this.getStringsVertical();

		const matches = [
			// 000, 111, 222, 33333, 4444
			'0{3,}', '1{3,}', '2{3,}', '3{3,}', '4{3,}', '5{3,}',

			// 262, 3373, 57555, 2a2, 282, 3383, 58555, 33b3, 5b555
			'0+[678ab]0+', '1+[678ab]1+', '2+[678ab]2+', '3+[678ab]3+',
			'4+[678ab]4+', '5+[678ab]5+',

			// 611, 6333, 655555
			'60{2,}', '61{2,}', '62{2,}', '63{2,}',
			'64{2,}', '65{2,}',

			// 116, 44446, 2226
			'0{2,}6', '1{2,}6', '2{2,}6', '3{2,}6',
			'4{2,}6', '5{2,}6'
		].join('|');


		const re = new RegExp(matches);

		// 3 matches only
		stringsArr.forEach((str, colIndex) => {
			const result = re.exec(str);
			if (result) {
				matched.push(this.getMatchedIDs(colIndex, result.index, result[0].length));
			}
		});

		return matched;
	}


	findHorizontalalMatches() {
		const matched = [];

		// generate horizontal strings
		const stringsArr = this.getStringsHorizontal();

		const matches = [
			// 444, 2222, 55555, 0000
			'0{3,}', '1{3,}', '2{3,}', '3{3,}', '4{3,}', '5{3,}',

			// 272, 3373, 56555, 2a2, 292, 3393, 59555, 33b3, 5b555
			'0+[679ab]0+', '1+[679ab]1+', '2+[679ab]2+', '3+[679ab]3+',
			'4+[679ab]4+', '5+[679ab]5+',

			// 611, 6333, 655555
			'60{2,}', '61{2,}', '62{2,}', '63{2,}',
			'64{2,}', '65{2,}',

			// 116, 44446, 2226
			'0{2,}6', '1{2,}6', '2{2,}6', '3{2,}6',
			'4{2,}6', '5{2,}6'
		].join('|');

		const re = new RegExp(matches);


		// 3 matches only
		stringsArr.forEach((str, cellIndex) => {
			const result = re.exec(str);
			if (result) {
				matched.push(this.getMatchedIDsHorizontal(cellIndex, result.index, result[0].length));
			}
		});

		return matched;
	}


	getStringsVertical() {
		const stringsArr = this.MATRIX.map(colArr => {
			// join all gems numbers in a string
			return joinArr(colArr);
		});

		function joinArr(arr) {
			const string = arr.map(gemData => {
				return gemData.number;
			}).join('');

			return string;
		}

		return stringsArr;
	}


	getStringsHorizontal() {
		const stringsArr = [];

		for (let cell = 0; cell < this.CELLS; cell++) {
			let str = '';
			for (let col = 0; col < this.COLS; col++) {
				str += this.MATRIX[col][cell].number;
			}
			stringsArr.push(str);
		}

		return stringsArr;
	}


	getMatchedIDs(colIndex, cellIndex, length) {
		const IDs = [];
		for (let cell = cellIndex; cell < cellIndex + length; cell++) {
			IDs.push(this.getGemID(colIndex, cell));
		}
		return IDs;
	}


	getMatchedIDsHorizontal(cellIndex, colIndex, length) {
		const IDs = [];
		for (let col = colIndex; col < colIndex + length; col++) {
			IDs.push(this.getGemID(col, cellIndex));
		}
		return IDs;
	}


	removeMatchedGems() {
		this.matchedIDs.forEach(id => {
			this.removeFromMatrix(id);
		});
	}


	getGemID(colIndex, cellIndex) {
		return this.MATRIX[colIndex][cellIndex].id;
	}


	getGemDataByID(id) {
		let result = null;

		this.MATRIX.forEach((colArr, colIndex) => {
			const gemData = colArr.find(gemObj => {
				return gemObj.id === id;
			});

			if (gemData) {
				return result = gemData;
			}
		});

		return result;
	}


	removeFromMatrix(id) {
		const gemCell = this.getGemCell(id);
		if (!gemCell) return;
		if (!this.MATRIX[gemCell.col]) return;
		this.MATRIX[gemCell.col].splice(gemCell.cell, 1);
	}


	addNewGems() {
		// add lacking gems
		this.MATRIX.forEach((colArr, colIndex) => {
			const lack = this.CELLS - colArr.length;
			if (lack > 0) {
				for (let cellIndex = colArr.length; cellIndex < this.CELLS; cellIndex++) {
					this.createGem(colIndex, cellIndex);
				}
			}
		});
	}


	createGem(colIndex, cellIndex) {
		this.MATRIX[colIndex][cellIndex] = {
			id: this.createGemID(),
			number: this.getRandomGemNumber()
		};
	}


	getMatchedIDsArrays() {
		return [...this.matchedIDsArrays];
	}

	getGemHint() {
		if (!this.gemHintID || !this.gemHintDirection) return false;

		return {
			id: this.gemHintID,
			direction: this.gemHintDirection
		};
	}
}

export default Matrix;