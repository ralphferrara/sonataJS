//*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
//|| Sonata.js :: Google Cloud
//|| Wrapper   :: Translate
//||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

        /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
        //|| Depend
        //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

        import https from 'https';

        /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
        //|| Class
        //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

        import  app                                     from "../../app.js"
   
        /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
        //|| Class
        //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

        export default class TranslateGoogle {


                /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
                //|| Translate
                //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

                static async translate(texts: string | string[], fromLanguage: string, toLanguage: string): Promise<string> {
                        if (!app("config", "cloud") || !app("config", "cloud").google.private) return app.log("Google Cloud not configured", "break");
                        const textArray = Array.isArray(texts) ? texts : [texts];
                        return new Promise<string>(async (resolve, reject) => {
                                try {
                                        const apiKey = app("config", "cloud").google.private;
                                        const url: string = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&source=${fromLanguage}&target=${toLanguage}&${textArray.map(text => `q=${encodeURIComponent(text)}`).join('&')}`;
                                        const response = await new Promise<string>((resolve, reject) => {
                                                https.get(url, (resp) => {
                                                        let data: string = '';
                                                        resp.on('data', (chunk: Buffer) => { data += chunk.toString(); });
                                                        resp.on('end', () => {
                                                            console.log("ERROR RETRIEVING GOOGLE TRANSLATION");
                                                            console.log(data);      
                                                            resolve(data);
                                                        });
                                                }).on("error", (err: Error) => {
                                                      console.log("ERROR RETRIEVING GOOGLE TRANSLATION");
                                                      console.log(err);
                                                        reject(err);
                                                });
                                        });
                                        const translateResponse: any = JSON.parse(response);
                                        if (translateResponse.data && translateResponse.data.translations) {
                                                resolve(translateResponse.data.translations[0].translatedText);
                                        } else {
                                                app.log("Error with Google Translation API on [" + textArray.join(",") + "]", "break");
                                                reject(null);
                                        }
                                } catch (error) {
                                        app.log("Error retrieving Google Translation on [" + textArray.join(",") + "]", "break");
                                        reject(null);
                                }
                        });
                }

                /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
                //|| EOC
                //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/
        }

