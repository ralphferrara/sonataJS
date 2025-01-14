/*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
//|| server/base/locales.ts
//|| Handles the International Language Support
//||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Import Redis
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      import chokidar from 'chokidar';

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Import Redis
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      import Global from "./global.ts";
      import Log from "./log.ts";
      import Path from "./path.ts";

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| FWO
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      export interface FileWatcherObject {
            relative: string,
            absolute: string;
            isFile: boolean;
            watcher: any;
            contents: Buffer | null;
      }

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Redis Class
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      class Locales {

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Connect
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            public languages: string[] = [];
            public sections: string[] = [];
            public localeRoot: string = "/app/locales/.compiled";
            public watcher: any;

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Connect
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            async init() {
                  new Log("Locales Loader", "head");
                  /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
                  //|| Connect if not
                  //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/
                  this.languages    = Global.config.locales.supported || [];
                  this.sections     = Global.config.locales.sections || [];
                  if (process.env.NODE_ENV !== 'production') await this.watch();
                  /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
                  //|| Handle Scan
                  //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/
                  await this.scan();
            };

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Scan
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            async watch() {
                  new Log(`Locales :: Watch Enabled (${new Path(this.localeRoot).resolve()})`, "info");
                  this.watcher = chokidar.watch(new Path(this.localeRoot).resolve(), {
                        persistent: true,
                        ignoreInitial: true,
                        usePolling: true, // Enable polling for compatibility
                        interval: 100,    // Polling interval in milliseconds
                        awaitWriteFinish: {
                              stabilityThreshold: 200,
                              pollInterval: 100,
                        },
                  });
                  this.watcher
                        .on('add', async () => await this.scan())
                        .on('change', async () => await this.scan())
                        .on('unlink', async () => await this.scan())
                        .on('addDir', async () => await this.scan())
                        .on('unlinkDir', async () => await this.scan());
            }

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Scan
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            async scan() {
                  new Log("Reloading Locale Files...", "reload");
                  const localeData: Record<string, any> = {};
                  const promises = this.languages.map(async (lang) => {
                        localeData[lang] = {};
                        await Promise.all(
                              this.sections.map(async (section) => {
                                    const resolvedPath = await new Path(`${this.localeRoot}/locales/${lang}/${section}.json`).resolve();
                                    const localJSON = await new Path(`${this.localeRoot}/locales/${lang}/${section}.json`).json()
                                    localeData[lang][section] = localJSON;
                              })
                        );
                  });
                  await Promise.all(promises);
                  console.log(localeData);
                  Global.locales = localeData;
            }

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| EOC
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      }

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Export
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      export default Locales;