const path = require('path');

module.exports = {
    mode: 'development',
    entry: './practice/app.ts',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'practice', 'dist')
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    }
}