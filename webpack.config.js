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
      test: /\.(?:png|jpg|svg)$/,
      loader: 'url-loader',
      query: {
        // Inline images smaller than 10kb as data URIs
        limit: 10000
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