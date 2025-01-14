/*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
//|| Sonata.js :: Utils :: Log
//|| Make some pretty little messages for the console
//||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Class
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/    

      export default class Log {

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Constructor
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/    

            constructor(message : string | string[], level : string, e?:any) { 
                  switch(level) {
                        case 'info'     : this.echo(message, 'INFO', 'fgGray');     break;
                        case 'route'    : this.echo(message, 'INFO', 'fgMagenta');     break;
                        case 'warn'     : this.echo(message, 'WARN', 'fgYellow');   break;
                        case 'ttl'      : this.echo(message, 'INFO', 'fgGreen');     break;
                        case 'error'    : this.echo(message, 'ERR ', 'fgRed');      break;
                        case 'debug'    : this.echo(message, 'DBUG', 'fgGreen');    break;
                        case 'success'  : this.echo(message, '   ►', 'fgBlue');     break;
                        case 'timer'    : this.echo(message, '   ∞', 'fgCyan');     break;
                        case 'question' : this.question(message); break;
                        case 'head'     : this.head(message); break;
                        case 'break'    : 
                              this.head(message, 'bgRed');
                              throw new Error(e);
                              break;
                  }
            }

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Info
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/    

            echo(message : string | string[], level : string, color : string) {
                  const lines = (typeof(message) == 'string')  ? [message] : message;
                  for (const line of lines) {
                        console.log(this.color(color) + '['+level.toUpperCase()+'] - ' + new Date().toLocaleTimeString() + ' - ' + line + this.color('reset') + ' [PID:' + process.pid + ']');
                  }
            }

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Head
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/    

            head(message : string | string[], color : string = 'bgBlue') {
                  const width = 120;
                  console.log('');
                  console.log(this.color(color) + this.color('fgWhite') + ' '.padEnd(width) + this.color('reset'));
                  const lines = (typeof(message) == 'string')  ? [message] : message;
                  for (const line of lines) {
                        const indent = '  ' + line + ' '.padEnd(width - line.length - 2);
                        console.log(this.color(color) + this.color('fgWhite') + indent + this.color('reset'));
                  }
                  console.log(this.color(color) + this.color('fgWhite') + ' '.padEnd(width) + this.color('reset'));
                  console.log('');
            }

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Head
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/    

            question(message : string | string[], color : string = 'bgYellow') {
                  const width = 120;
                  console.log('');
                  console.log(this.color(color) + this.color('fgBlack') + ' '.padEnd(width) + this.color('reset'));
                  const lines = (typeof(message) == 'string')  ? [message] : message;
                  for (const line of lines) {
                        const indent = '  ' + line + ' '.padEnd(width - line.length - 2);
                        console.log(this.color(color) + this.color('fgBlack') + indent + this.color('reset'));
                  }
                  console.log(this.color(color) + this.color('fgWhite') + ' '.padEnd(width) + this.color('reset'));
                  console.log('');
            }                             
                                    
            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Color
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/    
            
            color(c: string): string {
                  const colors: { [key: string]: string } = {
                        reset: "\x1b[0m",
                        blink: "\x1b[5m",
                        fgBlack: "\x1b[30m",
                        fgRed: "\x1b[31m",
                        fgGreen: "\x1b[32m",
                        fgGray: "\x1b[90m",
                        fgYellow: "\x1b[33m",
                        fgBlue: "\x1b[34m",
                        fgMagenta: "\x1b[35m",
                        fgCyan: "\x1b[36m",
                        fgWhite: "\x1b[37m",
                        bgBlack: "\x1b[40m",
                        bgRed: "\x1b[41m",
                        bgYellow: "\x1b[43m",
                        bgBlue: "\x1b[44m",
                        bgMagenta: "\x1b[45m",
                        bgCyan: "\x1b[46m",
                        bgWhite: "\x1b[47m"
                  };
                  return colors[c];
            }            

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| EOC
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/    

      }

