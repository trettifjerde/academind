const path = require('path');

module.exports = {
    mode: 'production',
    entry: './replays/replays.js',
    output: {
        filename: 'replays.min.js',
        path: path.resolve(__dirname, 'replays', 'dist')
    },
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