//*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
//|| Sonata.js :: Core Classes
//|| Database Wrapper for MYSQL Database
//||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

        /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
        //|| Import
        //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

        import { library, IconDefinition, icon }                from '@fortawesome/fontawesome-svg-core';
        import * as solidIcons                                  from '@fortawesome/free-solid-svg-icons';
        import * as brandIcons                                  from '@fortawesome/free-brands-svg-icons';
        import { JSDOM }                                        from 'jsdom';

        /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
        //|| Set all Keys to an Array and add them to the library
        //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

        Object.keys({...solidIcons, ...brandIcons}) // Combine both sets of icons
        .filter(key => key.startsWith('fa'))
        .forEach(key => {
            const iconKey = key as keyof typeof solidIcons & keyof typeof brandIcons;
            const iconDef: IconDefinition = (solidIcons[iconKey] || brandIcons[iconKey]) as IconDefinition;
            library.add(iconDef);
        });

        /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
        //|| Fontawesome Class
        //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

        class FontAwesome {

                /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
                //|| Return the Icon
                //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

                static icon(iconName: string): string {
                        const formattedIconName = iconName.startsWith('fa') ? iconName.charAt(2).toUpperCase() + iconName.slice(3) : iconName.charAt(0).toUpperCase() + iconName.slice(1);
                        const iconKey = `fa${formattedIconName}` as keyof typeof solidIcons & keyof typeof brandIcons;                
                        const iconDef: IconDefinition | undefined = (solidIcons[iconKey] as IconDefinition) || (brandIcons[iconKey] as IconDefinition);
                        if (!iconDef) {
                            console.error(`Icon ${iconName} not found. Transformed key: ${iconKey}`);
                            return '';
                        }
                        return icon(iconDef).html.join('');
                }

                /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
                //|| Process HTML String
                //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

                static async parseHTML(htmlString: string): Promise<string> {
                        htmlString                      = htmlString.replace(/<FontAwesomeIcon([^>]*)\/>/g, '<FontAwesomeIcon$1></FontAwesomeIcon>');
                        const dom                       = new JSDOM(htmlString);
                        const document                  = dom.window.document;                
                        const fontAwesomeIconElements   = document.querySelectorAll('FontAwesomeIcon');
                        for (const element of fontAwesomeIconElements) {
                                const iconName = element.getAttribute('icon');
                                if (iconName) {
                                        const iconHtml          = await this.icon(iconName);
                                        element.outerHTML       = `<i class="fa">${iconHtml}</i>`;
                                }
                        }
                        return dom.window.document.body.innerHTML;
                }                
        }

        /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
        //|| Export FontAwesome
        //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

        export default FontAwesome;
