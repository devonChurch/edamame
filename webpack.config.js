var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    context: __dirname + '/src/js',
    devtool: 'source-map',
    entry: './entry.js',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js'
    },
    plugins: [
        new CopyWebpackPlugin([
            { from:  '../index.html', to: 'index.html' },
            { from:  '../font', to: 'font' }
        ]),
        new ExtractTextPlugin('style.css')
    ],
    module: {
        loaders: [
            { test: /\.scss$/, loader: ExtractTextPlugin.extract('style', 'css?sourceMap!autoprefixer?browsers=last 2 versions!sass') },
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel!eslint'}, // Automatically generates source maps without the sourceMaps config
            { test: require.resolve('snapsvg'), loader: 'imports?this=>window,fix=>module.exports=0' }
        ]
    },
    eslint: {
        failOnWarning: false,
        failOnError: false
    }
};
