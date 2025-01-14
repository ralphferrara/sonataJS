/*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
//|| Sonata :: Core Classes
//|| JSON Validator Class 
//||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

import * as fs          from 'fs';
import path             from 'path';

/*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
//|| JVal - JSON Validator
//||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

export default class JSONInspector {

      public errors     : string[] = [];
      private actual    : Record<string, any>;
      private promises  : Promise<void>[] = [];

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Constructor
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      constructor() {
           this.errors   = [];
           this.actual   = {};
           this.promises = [];            
      }      

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Init
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      async init(structure: Record<string, any>, actual: Record<string, any>): Promise<void> {
            this.actual = actual;
            await this.processor(structure, [], true);
            await Promise.all(this.promises);
      }
      
      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Process Object
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      private async processor(structure :any, parents:any[], root = false): Promise<void> {
            const vkeys = Object.keys(structure);
            vkeys.forEach((key) => {
                /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
                //|| Are we doing a type check?
                //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/
                if (this.isMatch(key) !== false) return this.matchCheck(key, parents, structure[key]);
                if (typeof structure[key] === 'object') {
                    if (key.startsWith('!') && typeof this.getActualData(key, parents) === 'undefined') return undefined;
                    this.promises.unshift(this.processor(structure[key], parents.concat(key)));
                } else {
                    this.validate(key, structure[key], this.getActualData(key, parents), parents);
                }
                return undefined;
            });
            // Add a return statement at the end of the function
            return undefined;
      }

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Handle the Field Validation
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      validate(key:any, compareType:any, checkValue:any, parents:any[]):boolean {
            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| It's ok if it's not defined (!) 
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/
            if (key.startsWith('!') && checkValue === undefined) return true;
            if (compareType.startsWith('string['))  return this.stringCheck(compareType, checkValue, parents);
            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Handle Type
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/
            switch(compareType) { 
                  case 'object': 
                        if (typeof checkValue !== 'object') return this.fail(key, compareType, checkValue, parents);
                        return true;
                        break;
                  case 'string': 
                        if (typeof checkValue !== 'string') return this.fail(key, compareType, checkValue, parents);
                        return true;
                        break;
                  case 'array': 
                        if (!Array.isArray(checkValue)) return this.fail(key, compareType, checkValue, parents);
                        return true;
                        break;
                  case 'number': 
                        try { 
                              const x = parseInt(checkValue);
                              if (isNaN(x)) return this.fail(key, compareType, checkValue, parents);
                              return true;                                               
                        } catch(e) {
                              return this.fail(key, compareType, checkValue, parents);
                        }                                                            
                        break;
                  case 'boolean': 
                        if (typeof checkValue !== 'boolean') return this.fail(key, compareType, checkValue, parents);
                        return true;
                        break;
                  case 'email': 
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (checkValue !== undefined && emailRegex.test(checkValue)) return true;
                        return this.fail(key, compareType, checkValue, parents);
                        break;
                  case 'phone': 
                        const phoneRegex = /^(\+\d{1,2}\s?)?(\(\d{1,4}\)\s?)?(\d{1,})[-.\s]?(\d{1,})[-.\s]?(\d{1,})$/;
                        if (checkValue !== undefined && phoneRegex.test(checkValue)) return true;
                        return this.fail(key, compareType, checkValue, parents);
                        break;
                  case 'database': 
                        if (!this.actual['databases'][checkValue]) return this.fail(key, compareType, checkValue, parents);
                        return true;
                        break;
                  case 'file': 
                        if (typeof(checkValue) !== 'string') return this.fail(key, compareType + " is undefined", checkValue, parents);
                        if (!fs.existsSync(path.join(process.cwd(), checkValue))) return this.fail(key, compareType + '" but doesnt exist', checkValue, parents);
                        return true;
                        break;
                  case 'path': 
                        if (typeof(checkValue) !== 'string') return this.fail(key, compareType + " is undefined", checkValue, parents);
                        try { 
                              if (!fs.statSync(path.join(process.cwd(), checkValue))) return this.fail(key, compareType + '" but doesnt exist', checkValue, parents);
                              return true;
                        } catch(e) {
                              return this.fail(key, compareType + '" (catch) but doesnt exist', checkValue, parents);
                        }
                        return true;
                        break;
                  default:
                        if (compareType.includes('in[')) return this.inCheck(key, compareType, checkValue, parents);
                        return this.fail(key, "[UNKNOWN-TYPE]" + compareType, checkValue, parents);
            }
            throw new Error("[UNSPECIFIED-TYPE]->" + compareType + '->'+ checkValue);
      }

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Check if a string matches the :match[term] format
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      private stringCheck(key:any, checkValue : any, parents:any[]):boolean {
            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Straight String Check
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/
            if (key === 'string' && typeof(checkValue) === 'string') return true;
            let param = key.replace('string[', '').replace(']', '');
            try { 
                  let paramNum = parseInt(param);
                  if (!isNaN(paramNum)) { 
                        if (checkValue.length !== paramNum) return this.fail(key, "stringcheck:exact["+paramNum+"] Actual = ["+checkValue.length+"]", checkValue, parents);
                        return true;
                  }
            } catch(e) {
            }
            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Minimum 
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/
            if (param.includes('min:')) {
                  try { 
                        const minLength = parseInt(param.replace('min:', ''));
                        if (checkValue.length < minLength) return this.fail(key, "stringcheck:min["+minLength+"] Actual = ["+checkValue.length+"]", checkValue, parents);
                  } catch(e) {}
                  return true;
            }            
            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Maximum
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/
            if (param.includes('max:')) {
                  try { 
                        const  maxLength = parseInt(param.replace('max:', ''));
                        if (checkValue.length > maxLength) return this.fail(key, "stringcheck:max["+maxLength+"] Actual = ["+checkValue.length+"]", checkValue, parents);
                  } catch(e) {}
                  return true;
            }
            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Shouldn't be here
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/
            return false;
      }

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Check if a string matches the :match[term] format
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      private inCheck(key:any, compareType : any, checkValue : any, parents:any[]):boolean {
            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Straight String Check
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/
            const values = compareType.replace('in[', '').replace(']', '').split('|'); 
            if (values.includes(checkValue)) return true;
            return this.fail(key, compareType, checkValue, parents);
      }      

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Check if a subitem matches the :match[term] format
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      private async matchCheck(key:any, parents:any[], fields :{}): Promise<void> {
            var actualItems = this.getParentItems(parents);
            var match         = this.isMatch(key);                  
            if (match === false) return;
            var actualKeys    = Object.keys(actualItems);
            for(key in actualKeys) {
                  var sectionKey   = actualKeys[key];
                  if (sectionKey === undefined) return console.error('JSON.inspector : sectionKey is undefined');
                  if (match.term && actualItems[sectionKey][match.term] && actualItems[sectionKey][match.term] === match.value) {
                        this.matchFields(actualItems[sectionKey], fields, parents);
                  }
            }
      }

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Check the Subitems of a :type[match] request
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      private matchFields(items: Record<string, any>, fields: Record<string, any>, parents : any[]): void {
            var fieldKeys = Object.keys(fields);
            for(let key in fieldKeys) {
                  let cleanName = this.cleanExpressions(fieldKeys[key] || '');
                  this.validate(fieldKeys[key], fields[fieldKeys[key] || ''], (typeof(fields[fieldKeys[key] || ''])=== 'undefined') ? undefined : items[cleanName], parents);
            }
      }

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Is match a :type[match] request? If so, return the term and value. Otherwise, return false.
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      private isMatch(matchKey:string):{term:string | undefined,value:string | undefined} | false { 
            const regex = /:(\w+)\[([^\]]+)\]/;
            const match = matchKey.match(regex);                  
            if (match) {
                  const propertyName  = match[1];
                  const propertyValue = match[2];                        
                  return {'term' : propertyName, 'value' : propertyValue};
            } else {
                  return false;
            }                  
      } 

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Get all Items from the parent object
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      private getParentItems(parents:string[]): Record<string, any> {
            var actualData = this.actual;
            for(var i=0; i<parents.length; i++) {
                  if (parents[i] !== undefined) {
                        let keyName = this.cleanExpressions(parents[i]!);
                        actualData = actualData[keyName];
                  }
            }
            return actualData;
      }

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Get the Actual Data
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      private getActualData(key:string, parents:string[]): Record<string, any> {
            var cleanName = this.cleanExpressions(key);
            if (parents.length == 0) return this.actual[cleanName];
            var actualData = this.actual;
            for(var i=0; i<parents.length; i++) {
                  if (parents[i] !== undefined) {
                        let keyName = this.cleanExpressions(parents[i]!);
                        if (typeof(actualData[keyName]) === 'undefined') return {};
                        actualData = actualData[keyName];
                  }
            }
            return actualData[cleanName];
      }                              

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Get Variable Name
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/
      
      private cleanExpressions(inputString:string): string {
            return inputString.replace(/!|:type\[|\]/g, '');
      }

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Fail Function
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      private fail(key:string, checkType:string, value:string, parents:any[]): boolean {
            let parentStr = "";
            for(var i=0; i<parents.length; i++) {
                  let cleanName = this.cleanExpressions(parents[i]);
                  parentStr += "=>" + cleanName;
            }
            var errMsg = '(MISMATCH)::' + parentStr + '[' + key + '] = "' + value + '" should be "'+checkType+'"';
            this.errors.push(errMsg);
            return false;
      }

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| EOC
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/
}


