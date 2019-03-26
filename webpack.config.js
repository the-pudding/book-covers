const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
	  contentBase: path.join(__dirname, "dist"),
	  compress: true,
	  port: 8080
	},
	module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          'file-loader',
            {
		      loader: 'image-webpack-loader',
		      options: {
		        bypassOnDebug: true, // webpack@1.x
		        disable: true, // webpack@2.x and newer
		    },
          },
        ]
    }
    ]
  }
};