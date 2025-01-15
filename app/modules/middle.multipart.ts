//*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
//|| Sonata :: Core Classes
//|| Module  : Middle Multipart, Parses Request Data
//||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Import
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      import app                                                        from '../app.js';
      import { parse as parseUrl, UrlWithParsedQuery }                  from 'url';
      import { parse as parseQueryString }                              from 'querystring';
      import { parse as parseCookie }                                   from 'cookie';
      import { RequestData }                                            from './.interfaces.js';
      import { UploadFile }                                             from "./.interfaces.js";

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Class
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      export default class MultipartParser {
      
            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Var
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            private boundary: string | null = null;
            private maximumFileSize: number = 1024 * 1024 * 100; // 100MB

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Constructor
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            constructor(contentTypeHeader: string | undefined) {
                  if (contentTypeHeader && contentTypeHeader.includes('boundary=')) {
                        const boundaryPrefix    = 'boundary=';
                        const boundaryIndex     = contentTypeHeader.indexOf(boundaryPrefix) + boundaryPrefix.length;
                        this.boundary           = contentTypeHeader.slice(boundaryIndex);
                  }
            }

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Parse Request
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/
            
            public async parseRequest(request: any, response: any): Promise<RequestData | undefined> {
                  const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
                  console.log(request.url);
                  if (request.url === '//') return undefined;
                  const urlDetails: UrlWithParsedQuery = parseUrl(request.url, true);
                  /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
                  //|| Process query parameters to ensure they are all strings
                  //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/
                  const params: Record<string, string> = {};
                  Object.entries(urlDetails.query).forEach(([key, value]) => {
                        params[key] = Array.isArray(value) ? value.join(', ') : (value ?? '');
                  });
                  /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
                  //|| Parse the URL and extract the pathname
                  //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/
                  const fullUrl = new URL(request.url, `http://${request.headers.host}`); // Ensure to handle https as well if needed
                  /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
                  //|| Put the Request Data together
                  //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/
                  const result: RequestData = {
                        method            : request.method as "POST" | "GET" | "PUT" | "OPTIONS" | "SOCKET",
                        url               : fullUrl.pathname,  // Use only the pathname which excludes the query string
                        ip                : ip,
                        headers           : request.headers,
                        cookies           : parseCookie(request.headers.cookie || ''),
                        params            : params,
                        post              : {},
                        files             : [],
                        status            : "PENDING",
                        error             : "None"
                  };
                  /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
                  //|| Check if we're doing a multipart form data request
                  //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/
                  if (this.boundary && request.headers['content-type']?.includes('multipart/form-data')) {
                        return new Promise((resolve, reject) => {
                              let requestBody = Buffer.alloc(0);
                              let size = 0;                              
                              request.on('data', (chunk: Buffer) => {
                                    size += chunk.length;
                                    requestBody = Buffer.concat([requestBody, chunk]);
                                    if (size > this.maximumFileSize) {
                                          if (!response.headersSent) {
                                                response.writeHead(413, { 'Content-Type': 'text/plain' });
                                                response.end("CHP002");
                                          }
                                          result.status = "FAILED";
                                          result.error  = "File too large";
                                    }
                              });
                              request.on('end', () => {
                                    const parts = this.splitBufferByBoundary(requestBody, `--${this.boundary}`);

                                    parts.forEach(part => {
                                          const parsedPart = this.parsePart(part);
                                          if (parsedPart.filename) {
                                                const file: UploadFile = {
                                                      name: parsedPart.filename,
                                                      type: parsedPart.contentType,
                                                      size: parsedPart.content.length,
                                                      data: parsedPart.content
                                                };
                                                result.files.push(file);
                                          } else {
                                                result.post[parsedPart.name] = parsedPart.value;
                                          }
                                    });
                                    result.status = "PARSED";
                                    resolve(result);
                              });
                        });
                  } else if (request.headers['content-type']?.includes('application/json')) {
                        return new Promise(resolve => {
                              let bodyData = '';
                              request.on('data', (chunk: Buffer) => {
                                    bodyData += chunk.toString(); // Convert Buffer to string
                              });
                              request.on('end', () => {
                                    try {
                                          result.post = JSON.parse(bodyData);
                                          result.status = "PARSED";
                                    } catch (error) {
                                          result.status = "FAILED";
                                          result.error  = "Bad JSON";
                                          resolve(result);
                                    }
                                    result.status = "PARSED";
                                    resolve(result);
                              });
                        });
                  } else {
                        return new Promise(resolve => {
                              let bodyData = '';
                              request.on('data', (chunk: Buffer) => {
                                    bodyData += chunk.toString(); // Convert Buffer to string
                              });
                              request.on('end', () => {
                                    const parsedBody = parseQueryString(bodyData);
                                    Object.keys(parsedBody).forEach(key => {
                                          const value = parsedBody[key];
                                          result.post[key] = Array.isArray(value) ? value.join(', ') : (value ?? '');
                                    });
                                    result.status = "PARSED";
                                    resolve(result);
                              });
                        });
                  }
            }

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Parse Part
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            private parsePart(partBuffer: Buffer): any {
                  const headersEndIndex = partBuffer.indexOf('\r\n\r\n');
                  const headersBuffer = partBuffer.slice(0, headersEndIndex);
                  let bodyBuffer = this.trimBufferEnd(partBuffer.slice(headersEndIndex + 4));
                  
                  const headers : { [key: string]: string } = headersBuffer.toString().split('\r\n').reduce((acc : {[key: string]: string} , headerLine) => {
                        const separatorIndex = headerLine.indexOf(':');
                        if (separatorIndex !== -1) {
                              const key = headerLine.substring(0, separatorIndex).trim();
                              const value = headerLine.substring(separatorIndex + 1).trim();
                              acc[key] = value;
                        }
                        return acc;
                  }, {});
              
                  const contentDisposition = headers['Content-Disposition'];
                  if (contentDisposition && contentDisposition.includes('filename="')) {
                        const nameMatch = /name="([^"]*)"/.exec(contentDisposition);
                        const filenameMatch = /filename="([^"]*)"/.exec(contentDisposition);
                        return {
                              name: nameMatch ? nameMatch[1] : null,
                              filename: filenameMatch ? filenameMatch[1] : null,
                              contentType: headers['Content-Type'],
                              content: bodyBuffer
                        };
                  } else {
                        const nameMatch = /name="([^"]*)"/.exec(contentDisposition);
                        return {
                              name: nameMatch ? nameMatch[1] : null,
                              value: bodyBuffer.toString()
                        };
                  }
            }              

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Split Buffer By Boundary
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            private splitBufferByBoundary(buffer: Buffer, boundary: string): Buffer[] {
                  const boundaryBuffer = Buffer.from(boundary, 'utf-8');
                  const boundaryLength = boundaryBuffer.length;
                  const parts: Buffer[] = [];
                  let lastBoundaryIndex = 0;
                  for (let i = 0; i + boundaryLength < buffer.length; i++) {
                        if (buffer.slice(i, i + boundaryLength).equals(boundaryBuffer)) {
                              parts.push(buffer.slice(lastBoundaryIndex, i));
                              lastBoundaryIndex = i + boundaryLength + 2; // Skip past the boundary and the following CRLF
                              i += boundaryLength + 1; // Move index past the boundary
                        }
                  }
                  if (lastBoundaryIndex < buffer.length - 1) {
                        parts.push(buffer.slice(lastBoundaryIndex, -2)); // Exclude the final CRLF
                  }
                  return parts.filter(part => part.length > 0);
            }

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Trum Buffer End
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            private trimBufferEnd(buffer: Buffer): Buffer {
                  let end = buffer.length;
                  while (end > 0 && (buffer[end - 1] === 10 || buffer[end - 1] === 13)) {
                        end--; // Reduce end position to exclude CR (13) and LF (10)
                  }
                  return buffer.slice(0, end); // Return the trimmed buffer
            }
              
            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| EOC
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      }
