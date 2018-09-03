module.exports = {
	mode: 'development',
	entry: "./index.js",
	output: {
		 filename: "bundle.js", // string
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			}
		]
	}
}