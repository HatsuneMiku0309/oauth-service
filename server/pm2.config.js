module.exports = {
    apps: [{
        name: 'oauth-master-3000',
        script: './dist/index.js',
        // instances: 5,
        autorestart: true,
        watch: false,
        max_memory_restart: '2500M',
        // interpreter: './tools/node.exe',
        env: {
        },
        env_test: { // --env test
        },
        env_production: { // --env production
        },
        node_args: "--max_old_space_size=3000", // v8 3G ram
        exec_mode: 'fork'
    }]
};
