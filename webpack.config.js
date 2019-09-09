const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: [
		'@babel/polyfill',
		'./src/index.js'
	],
	output: {
		filename: 'game.js',
		path: path.resolve(__dirname, 'build')
	},
	devServer: {
		contentBase: './build',
		overlay: true,
		port: 3000
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: './index.html'
		})
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: '/node_modules/',
				loader: 'babel-loader'
			}
		]
	}
};