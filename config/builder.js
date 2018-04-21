const webpack = require('webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const getPrimaryWebpackConfig = require('./getPrimaryWebpackConfig');
const ENVIRONMENT = require('./Environments');

const COLORS = {
    GREEN: '\033[0;32m',
    NONE: '\033[0m',
    RED: '\033[0;31m',
    YELLOW: '\033[0;33m'
};

const NODE_ENV = function () {
    return process.env.NODE_ENV === ENVIRONMENT.WATCH
        ? ENVIRONMENT.WATCH
        : ENVIRONMENT.PROD;
}();


const webpackConfig = getPrimaryWebpackConfig(NODE_ENV);

if ([ENVIRONMENT.WATCH].includes(NODE_ENV)) {
    webpackConfig.devtool = 'source-map';
}

if (NODE_ENV === ENVIRONMENT.PROD) {
    webpackConfig.plugins.push(...[
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css$/,
            cssProcessor: require('cssnano'),
            cssProcessorOptions: { discardComments: { removeAll: true } },
            canPrint: true
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: true,
                collapse_vars: false
            },
            sourceMap: false
        })
    ]);
}

if (NODE_ENV === ENVIRONMENT.WATCH) {
    const compiler = webpack(webpackConfig);
    compiler.watch({}, (error, stats) => {
        if (!stats) {
            printError(error);
            return;
        }

        print(new Date().toLocaleString() + ' Compiled after watch ' + ((stats.endTime - stats.startTime) / 1000) + ' sec.');
        if (stats.compilation.errors.length) {
            printError(`${stats.compilation.errors.length} error(s):`);
            stats.compilation.errors.forEach(z => {
                let message = z.rawMessage ? z.rawMessage : z;
                if(z.module && z.module.issuer) {
                    message += ` in ${z.module.issuer.userRequest}`;
                }
                if(z.location){
                    message += ` line ${z.location.line} character ${z.location.character}`;
                }
                printError(message);
            });
        }
    });
} else {
    webpack(webpackConfig, (error, stats) => {
        let hasErrors = false;

        if(error) {
            hasErrors = true;
            printError(error.error);
        }

        if(stats) {
            const info = stats.toJson();

            if (stats.hasWarnings()) {
                printWarning(info.warnings);
            }

            if (stats.hasErrors()) {
                hasErrors = true;
                printError(info.errors);
            }
        }

        if(hasErrors) {
            printError('BUILD FAILED');
            process.exit(1);
        }
        print('Build done ' + ((stats.endTime - stats.startTime) / 1000) + ' sec.');
    });
}


function print(message) {
    console.log(COLORS.GREEN + message + COLORS.NONE); // NOSONAR
}

function printError(message) {
    console.log(COLORS.RED + message + COLORS.NONE); // NOSONAR
}

function printWarning(message) {
    console.log(COLORS.YELLOW + message + COLORS.NONE); // NOSONAR
}