class main {
  constructor() {
    this.requires = {
      fs: require("fs"),
      os: require("os"),
      path: require("path"),
      asar: require("asar"),
      prompt: require("prompt-sync")({ sigint: true }),
      colors: require('colors/safe'),
      mvdir: require('@node_js/movedir'),
      child_process: require('child_process')
    };

    this.utils = {
      logging: require("./utils/logging.js")(this)
    };

    this.config = {
      discord: require("./config/discord.js")(this)
    };
  }

  findDiscordCore(prefixPath, files) {
    files.forEach((file) => {
      if (this.requires.fs.statSync(`${prefixPath}\\${file}`).isDirectory()) {
        this.findDiscordCore(`${prefixPath}\\${file}`, this.requires.fs.readdirSync(`${prefixPath}\\${file}`))
      } else {
        if (file == "app.asar" && !prefixPath.includes("node_modules") && prefixPath.includes("resources")) {
          this.config.discord.discord_paths.push(`${prefixPath}\\${file}`);
        }
      }
    })
  }

  async init() {
    var start = new Date();
    var logging = this.utils.logging;

    process.on("unhandledRejection", (err) => {
      console.log(err);
    });

    process.on("uncaughtException", (exc) => {
      console.log(exc);
    });

    var dir = this.requires.path.join(process.env.APPDATA, "pluto");
    if (!this.requires.fs.existsSync(dir)) {
      this.requires.fs.mkdirSync(dir);
    }

    console.log(' ');
    console.log(logging.format(logging.get_severity("input"), "this application will modify your discord client which may result in unexpected instability;"));
    console.log(logging.format(logging.get_severity("input"), "client modifications are prohibited according to discord's terms of service;"));
    const answer = this.requires.prompt(logging.format(logging.get_severity("input"), "are you sure you want to proceed with the installation at your own risk? (y/n): "));

    console.log(" ");
    if (answer != "yes" && answer != "y") {
      return;
    }

    console.log(logging.format(logging.get_severity("warning"), "killing running discord processes"));
    this.requires.child_process.exec(`taskkill /im Discord.exe /t /f`, (err, stdout, stderr) => { })
    this.requires.child_process.exec(`taskkill /im DiscordPtb.exe /t /f`, (err, stdout, stderr) => { })
    this.requires.child_process.exec(`taskkill /im DiscordCanary.exe /t /f`, (err, stdout, stderr) => { })


    for (const folder of this.requires.fs.readdirSync(process.env.LOCALAPPDATA)) {
      if (folder.toLowerCase().includes('iscord')) {
        this.config.discord.executables.push(`${process.env.LOCALAPPDATA}\\${folder}`)
      }
    }

    for (const executable of this.config.discord.executables) {
      this.findDiscordCore(executable, this.requires.fs.readdirSync(executable))
    }

    if (this.config.discord.discord_paths.length < 1) {
      console.log(logging.format(logging.get_severity("error"), "found no discord app.asar instances (do you even have discord installed?), aborted."));
      while (true) await new Promise((resolve) => setTimeout(resolve, 300000000));
    }

    console.log(logging.format(logging.get_severity("info"), "found " + this.config.discord.discord_paths.length + " discord app.asar instances"));

    for (const appasar of this.config.discord.discord_paths) {
      var rand = Math.random().toString(36).slice(-8);

      var bigrand =
        (Math.random().toString(36).slice(-8)) +
        (Math.random().toString(36).slice(-8)) +
        (Math.random().toString(36).slice(-8)) +
        (Math.random().toString(36).slice(-8)) +
        (Math.random().toString(36).slice(-8));

      var asar_extract_path = this.requires.path.join(dir, rand);

      if (!this.requires.fs.existsSync(asar_extract_path)) {
        this.requires.fs.mkdirSync(asar_extract_path);
      }

      var type = "regular discord";
      if (asar_extract_path.toLowerCase().includes("canary")) type = "discord canary";
      if (asar_extract_path.toLowerCase().includes("ordptb")) type = "discord ptb";

      console.log(logging.format(logging.get_severity("debug"), "unpacking discord asar as unique id " + rand + " (" + type + ")"));
      await this.requires.asar.extractAll(appasar, asar_extract_path)

      console.log(logging.format(logging.get_severity("debug"), "deleted original discord asar"));
      this.requires.fs.rmSync(appasar);

      if (!this.requires.fs.existsSync(this.requires.path.join(asar_extract_path, 'common'))) { console.log(logging.format(logging.get_severity("error"), "could not find required common files in instance " + rand + " (" + type + ")")); continue; }
      if (!this.requires.fs.existsSync(this.requires.path.join(asar_extract_path, 'common', 'paths.js'))) { console.log(logging.format(logging.get_severity("error"), "could not find required path declaration in instance " + rand + " (" + type + ")")); continue; }
      var paths = this.requires.path.join(asar_extract_path, 'common', 'paths.js');

      var fs = this.requires.fs;
      var path = this.requires.path;
      var assar = this.requires.asar;
      var mvdir = this.requires.mvdir;
      this.requires.fs.readFile(paths, 'utf8', async function (err, data) {
        if (err) {
          console.log(logging.format(logging.get_severity("error"), "failed to patch instance " + rand + " (" + type + ")"));
          console.log(err);
        }

        var new_data_path = path.join(process.env.LOCALAPPDATA, '..', 'LocalLow');
        var replacing_path_with = "_path.default.join(process.env.LOCALAPPDATA, '..', 'LocalLow');";

        if (Math.random() >= 0.5) {
          if (!fs.existsSync(path.join(process.env.LOCALAPPDATA, '..', 'LocalLow', 'Microsoft'))) {
            fs.mkdirSync(path.join(process.env.LOCALAPPDATA, '..', 'LocalLow', 'Microsoft'));
          }

          if (!fs.existsSync(path.join(process.env.LOCALAPPDATA, '..', 'LocalLow', 'Microsoft', bigrand))) {
            fs.mkdirSync(path.join(process.env.LOCALAPPDATA, '..', 'LocalLow', 'Microsoft', bigrand));
          }
          new_data_path = path.join(process.env.LOCALAPPDATA, '..', 'LocalLow', 'Microsoft', bigrand)
          replacing_path_with = "_path.default.join(process.env.LOCALAPPDATA, '..', 'LocalLow', 'Microsoft', '" + bigrand + "');";
        }
        else {
          if (!fs.existsSync(path.join(process.env.USERPROFILE, '.pluto'))) {
            fs.mkdirSync(path.join(process.env.USERPROFILE, '.pluto'));
          }

          if (!fs.existsSync(path.join(process.env.USERPROFILE, '.pluto', bigrand))) {
            fs.mkdirSync(path.join(process.env.USERPROFILE, '.pluto', bigrand));
          }

          if (!fs.existsSync(path.join(process.env.USERPROFILE, '.pluto', bigrand, 'discord'))) {
            fs.mkdirSync(path.join(process.env.USERPROFILE, '.pluto', bigrand, 'discord'));
          }

          new_data_path = path.join(process.env.USERPROFILE, '.pluto', bigrand, 'discord')
          replacing_path_with = "_path.default.join(process.env.USERPROFILE, '.pluto', '" + bigrand + "', 'discord');";
        }

        var result = data.replace('userDataPath = determineUserData(userDataRoot, buildInfo);', "userDataPath = " + replacing_path_with);
        fs.writeFile(paths, result, 'utf8', function (err) {
          if (err) return console.log(err);
        });

        console.log(logging.format(logging.get_severity("info"), "successfully spoofed user data path in instance " + rand + " (" + type + ")"));
        console.log(logging.format(logging.get_severity("debug"), "putting the asar back together..."));

        await assar.createPackage(asar_extract_path, appasar)

        console.log(logging.format(logging.get_severity("debug"), "moving user data into new folder"));

        if (fs.existsSync(path.join(process.env.APPDATA, 'discord')))
          mvdir(path.join(process.env.APPDATA, 'discord'), new_data_path)
        else console.log(logging.format(logging.get_severity("warning"), "could not find previous user data, you might need to log in again"));

        console.log(logging.format(logging.get_severity("done"), "successfully patched instance " + rand + " (" + type + "); feel free to start it back"));
      });
    }

    while (true) await new Promise((resolve) => setTimeout(resolve, 300000000));
  }
}

(async () => {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
  new main().init();
})();
