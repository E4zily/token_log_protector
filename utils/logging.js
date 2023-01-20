module.exports = (client) => {
    return {
        get_severity(severity) {
            var colors = client.requires.colors;
            switch (severity)
            {
                case "error":
                    return colors.red('[error]');
                case "auth":
                    return colors.cyan('[auth]');
                case "input":
                    return colors.brightGreen('[input]');
                case "warning":
                    return colors.yellow('[warning]');
                case "debug":
                    return colors.brightBlue('[debug]');
                case "info":
                    return colors.brightMagenta('[info]');
                case "done":
                    return colors.brightGreen('[done]');
            }
        },

        format(severity, text) {
            var time = new Date().toLocaleTimeString('en-GB');
            
            var colors = client.requires.colors;

            return ' ' + (colors.gray("[" + time + "] > ") + severity + colors.reset(" ") + colors.brightWhite(text));
        }
    };
};
