const path = require( 'path' ),
	miniCSSExtract = require( 'mini-css-extract-plugin' ),
	cssMinimizer = require( 'css-minimizer-webpack-plugin' ),
	ignoreEmit = require( 'ignore-emit-webpack-plugin' ),
	{ CleanWebpackPlugin } = require( 'clean-webpack-plugin' ),
	terser = require( 'terser-webpack-plugin' );

module.exports = {
	context: path.resolve( __dirname, './assets/src' ),
	entry: {
		scripts: './scripts.js',
		styles: './styles.scss',
	},
	output: {
		path: path.resolve( __dirname, 'assets' ),
		filename: '[name].js',
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [ 'babel-loader' ],
			},
			{
				test: /\.(scss|css)$/,
				use: [
					miniCSSExtract.loader,
					'css-loader',
					'postcss-loader',
					'sass-loader',
				],
			},
		],
	},
	optimization: {
		minimizer: [
			new terser({
				terserOptions: {
					format: {
						comments: false,
					},
				},
				extractComments: false,
			}),
			'...',
			new cssMinimizer(),
		],
	},
	plugins: [
		new miniCSSExtract({
			filename: '[name].css',
		}),
		new CleanWebpackPlugin({
			verbose: true,
			cleanOnceBeforeBuildPatterns: [
				'**/*',
				'!index.php',
				'!src/**',
				'!vendor/**',
				'!images/**',
			],
		}),
		new ignoreEmit( [
			'styles.js',
		] ),
	],
};
