module.exports = {
	output: {
		filename: "[name].js"
	},
	module:{
		loaders: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: "babel-loader",
				query: {
					presets: ["es2015"]
				}
			}
		]
	},
	worker: {
		output: {
			filename: "[name].worker.js"
		}
	}
}
